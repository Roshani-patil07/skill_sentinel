from datetime import datetime
import hashlib
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import Inspection, TrainingCentre, InspectionEvidence, Intervention
from backend.app.services.websocket_manager import ws_manager
from backend.app.services.risk_engine import evaluate_centre_risk

router = APIRouter(prefix="/inspections", tags=["Field Inspections"])

class InspectionCreateRequest(BaseModel):
    centre_id: str
    inspection_type: Optional[str] = "SURPRISE_AUDIT"
    intervention_id: Optional[str] = None
    officer_findings: Optional[str] = None

class InspectionReportSubmit(BaseModel):
    officer_findings: str
    status: Optional[str] = "COMPLETED"
    evidence_urls: Optional[List[str]] = None

@router.get("")
def list_inspections(db: Session = Depends(get_db)):
    inspections = db.query(Inspection).all()
    results = []
    for insp in inspections:
        centre = db.query(TrainingCentre).filter(TrainingCentre.id == insp.centre_id).first()
        results.append({
            "id": insp.id,
            "centre_id": insp.centre_id,
            "centre_code": centre.centre_code if centre else "N/A",
            "centre_name": centre.name if centre else "N/A",
            "inspection_type": insp.inspection_type,
            "status": insp.status,
            "scheduled_date": insp.scheduled_date.isoformat() if insp.scheduled_date else None,
            "findings": insp.officer_findings
        })
    return results

@router.post("")
def create_inspection(req: InspectionCreateRequest, db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == req.centre_id) | (TrainingCentre.centre_code == req.centre_id)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Centre not found")

    insp = Inspection(
        centre_id=centre.id,
        intervention_id=req.intervention_id,
        inspection_type=req.inspection_type or "SURPRISE_AUDIT",
        status="ASSIGNED",
        scheduled_date=datetime.utcnow().date(),
        officer_findings=req.officer_findings
    )
    db.add(insp)
    db.commit()
    db.refresh(insp)
    return {
        "id": insp.id,
        "centre_code": centre.centre_code,
        "status": insp.status,
        "inspection_type": insp.inspection_type
    }

@router.post("/{inspection_id}/report")
async def submit_inspection_report(
    inspection_id: str,
    payload: InspectionReportSubmit,
    db: Session = Depends(get_db)
):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail=f"Inspection {inspection_id} not found")

    insp.officer_findings = payload.officer_findings
    insp.status = payload.status or "COMPLETED"
    insp.completed_at = datetime.utcnow()

    # Save evidence if provided
    evidence_ids = []
    if payload.evidence_urls:
        for url in payload.evidence_urls:
            sha = hashlib.sha256(url.encode()).hexdigest()
            ev = InspectionEvidence(
                inspection_id=insp.id,
                evidence_type="IMAGE_PRIVACY_MASKED",
                file_url=url,
                hash_sha256=sha,
                uploaded_at=datetime.utcnow()
            )
            db.add(ev)
            evidence_ids.append(ev.id)

    # If linked to an intervention, resolve it
    if insp.intervention_id:
        it = db.query(Intervention).filter(Intervention.id == insp.intervention_id).first()
        if it:
            it.status = "RESOLVED"
            it.resolved_at = datetime.utcnow()

    db.commit()

    # Recalculate centre risk
    score, level, _, _ = evaluate_centre_risk(db, insp.centre_id)

    # Broadcast event
    await ws_manager.broadcast({
        "event": "INSPECTION_COMPLETED",
        "inspection_id": insp.id,
        "centre_id": insp.centre_id,
        "status": insp.status,
        "new_centre_risk": score,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "SUCCESS",
        "inspection_id": insp.id,
        "inspection_status": insp.status,
        "evidence_saved_count": len(evidence_ids),
        "recomputed_risk_score": score
    }

