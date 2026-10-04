from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import TrainingCentre, District, State, CameraDevice, TrainingBatch, Asset

router = APIRouter(prefix="/centres", tags=["Training Centres"])

@router.get("")
def list_centres(
    state_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TrainingCentre)
    if risk_level and risk_level != "ALL":
        query = query.filter(TrainingCentre.current_risk_level == risk_level)
    
    centres = query.all()
    results = []
    for c in centres:
        # Search filter
        if search:
            s = search.lower()
            if s not in c.name.lower() and s not in c.centre_code.lower():
                continue

        dist = db.query(District).filter(District.id == c.district_id).first()
        state = db.query(State).filter(State.id == dist.state_id).first() if dist else None

        active_cams = db.query(CameraDevice).filter(CameraDevice.centre_id == c.id, CameraDevice.status == "ONLINE").count()
        batches_count = db.query(TrainingBatch).filter(TrainingBatch.centre_id == c.id, TrainingBatch.is_active == True).count()
        assets_count = db.query(Asset).filter(Asset.centre_id == c.id).count()

        results.append({
            "id": c.id,
            "centre_code": c.centre_code,
            "name": c.name,
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "district_name": dist.name if dist else "N/A",
            "state_name": state.name if state else "N/A",
            "current_risk_score": c.current_risk_score,
            "current_risk_level": c.current_risk_level,
            "active_cameras": active_cams,
            "active_batches": batches_count,
            "total_assets": assets_count
        })
    return results

@router.get("/{centre_id}")
def get_centre_details(centre_id: str, db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Training centre not found")

    dist = db.query(District).filter(District.id == centre.district_id).first()
    state = db.query(State).filter(State.id == dist.state_id).first() if dist else None
    cameras = db.query(CameraDevice).filter(CameraDevice.centre_id == centre.id).all()
    batches = db.query(TrainingBatch).filter(TrainingBatch.centre_id == centre.id).all()
    assets = db.query(Asset).filter(Asset.centre_id == centre.id).all()

    return {
        "id": centre.id,
        "centre_code": centre.centre_code,
        "name": centre.name,
        "address": centre.address,
        "district": dist.name if dist else "N/A",
        "state": state.name if state else "N/A",
        "contact_email": centre.contact_email,
        "contact_phone": centre.contact_phone,
        "current_risk_score": centre.current_risk_score,
        "current_risk_level": centre.current_risk_level,
        "cameras": [
            {
                "id": cam.id,
                "name": cam.device_name,
                "room_type": cam.room_type,
                "status": cam.status,
                "stream_url": cam.stream_url
            } for cam in cameras
        ],
        "batches": [
            {
                "id": b.id,
                "batch_code": b.batch_code,
                "sanctioned_strength": b.sanctioned_strength,
                "scheduled_start": b.scheduled_start_time,
                "scheduled_end": b.scheduled_end_time,
                "classroom": b.classroom_id
            } for b in batches
        ],
        "total_assets": len(assets),
        "verified_assets": len([a for a in assets if a.status == "VERIFIED_PRESENT"]),
        "missing_assets": len([a for a in assets if a.status == "MISSING"]),
    }
