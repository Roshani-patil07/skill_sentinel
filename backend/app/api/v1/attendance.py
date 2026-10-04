from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import AttendanceAnomaly, TrainingBatch, TrainingCentre, Course
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/attendance", tags=["Attendance Integrity"])

@router.get("/discrepancies")
def list_discrepancies(
    centre_id: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AttendanceAnomaly)
    if centre_id:
        query = query.filter(AttendanceAnomaly.centre_id == centre_id)
    if severity and severity != "ALL":
        query = query.filter(AttendanceAnomaly.severity == severity)

    anomalies = query.order_by(AttendanceAnomaly.detected_at.desc()).all()
    results = []
    for a in anomalies:
        centre = db.query(TrainingCentre).filter(TrainingCentre.id == a.centre_id).first()
        batch = db.query(TrainingBatch).filter(TrainingBatch.id == a.batch_id).first()
        course = db.query(Course).filter(Course.id == batch.course_id).first() if batch else None

        results.append({
            "id": a.id,
            "centre_id": a.centre_id,
            "centre_code": centre.centre_code if centre else "N/A",
            "centre_name": centre.name if centre else "N/A",
            "batch_code": batch.batch_code if batch else "N/A",
            "course_title": course.title if course else "Skill Course",
            "sanctioned_strength": batch.sanctioned_strength if batch else 30,
            "reported_attendance": a.reported_attendance,
            "observed_headcount": a.observed_headcount,
            "discrepancy_percentage": a.discrepancy_percentage,
            "severity": a.severity,
            "status": a.status,
            "detected_at": a.detected_at.isoformat()
        })
    return results
