from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import Intervention, TrainingCentre, WhatsAppMessage, User
from backend.app.schemas.schemas import InterventionTriggerRequest, InterventionStatusUpdateRequest
from backend.app.services.whatsapp_service import send_officer_whatsapp_alert
from backend.app.services.websocket_manager import ws_manager
from backend.app.services.risk_engine import evaluate_centre_risk

router = APIRouter(prefix="/interventions", tags=["Preventive Interventions"])

@router.get("")
def list_interventions(centre_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Intervention)
    if centre_id:
        query = query.filter(Intervention.centre_id == centre_id)
    interventions = query.order_by(Intervention.created_at.desc()).all()
    results = []
    for it in interventions:
        centre = db.query(TrainingCentre).filter(TrainingCentre.id == it.centre_id).first()
        officer = db.query(User).filter(User.id == it.assigned_to_user_id).first() if it.assigned_to_user_id else None
        
        # Determine priority
        if it.type == "SUBSIDY_HOLD":
            priority = "CRITICAL"
        elif it.type == "SHOW_CAUSE_NOTICE":
            priority = "HIGH"
        else:
            priority = "MEDIUM"

        results.append({
            "id": it.id,
            "centre_id": it.centre_id,
            "centre_code": centre.centre_code if centre else "N/A",
            "centre_name": centre.name if centre else "N/A",
            "type": it.type,
            "priority": priority,
            "status": it.status,
            "recommended_action": it.recommended_action,
            "assigned_officer": officer.full_name if officer else "Unassigned",
            "assigned_to_user_id": it.assigned_to_user_id,

            "created_at": it.created_at.isoformat() if it.created_at else None,
            "resolved_at": it.resolved_at.isoformat() if it.resolved_at else None
        })
    return results

@router.post("/trigger")
async def trigger_intervention(req: InterventionTriggerRequest, db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == req.centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Centre not found")

    intervention = Intervention(
        centre_id=centre.id,
        type=req.type,
        status="ISSUED",
        recommended_action=req.recommended_action,
        created_at=datetime.utcnow()
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    whatsapp_msg_id = None
    if req.send_whatsapp:
        phone = req.officer_phone or "+91-9811554433" # Default South Delhi District Officer
        msg = send_officer_whatsapp_alert(
            db=db,
            centre_id=centre.id,
            recipient_phone=phone,
            anomaly_title=f"{req.type}: {req.recommended_action[:60]}...",
            severity="CRITICAL"
        )
        whatsapp_msg_id = msg.id

    # Broadcast event
    await ws_manager.broadcast({
        "event": "INTERVENTION_TRIGGERED",
        "centre_id": centre.id,
        "centre_name": centre.name,
        "type": req.type,
        "action": req.recommended_action,
        "whatsapp_dispatched": req.send_whatsapp,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "ISSUED",
        "intervention_id": intervention.id,
        "centre_code": centre.centre_code,
        "type": req.type,
        "whatsapp_dispatched": req.send_whatsapp,
        "whatsapp_msg_id": whatsapp_msg_id
    }

@router.patch("/{intervention_id}/status")
async def update_intervention_status(
    intervention_id: str,
    payload: InterventionStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail=f"Intervention {intervention_id} not found")

    old_status = it.status
    it.status = payload.status
    if payload.assigned_to_user_id:
        it.assigned_to_user_id = payload.assigned_to_user_id

    recomputed_risk = None
    if payload.status == "RESOLVED":
        it.resolved_at = datetime.utcnow()
        # Recalculate centre risk
        score, level, factors, recommendation = evaluate_centre_risk(db, it.centre_id)
        recomputed_risk = {
            "score": score,
            "level": level,
            "recommendation": recommendation
        }

    db.commit()
    db.refresh(it)

    # Broadcast status change via WebSocket
    await ws_manager.broadcast({
        "event": "INTERVENTION_STATUS_UPDATED",
        "intervention_id": it.id,
        "centre_id": it.centre_id,
        "old_status": old_status,
        "new_status": it.status,
        "recomputed_risk": recomputed_risk,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "SUCCESS",
        "intervention_id": it.id,
        "current_status": it.status,
        "recomputed_risk": recomputed_risk
    }

