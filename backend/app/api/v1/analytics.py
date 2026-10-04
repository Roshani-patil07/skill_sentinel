from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import TrainingCentre, State, District, AttendanceAnomaly, Asset, CameraDevice

router = APIRouter(prefix="/analytics", tags=["National & State Analytics"])

@router.get("/overview")
def get_national_overview(db: Session = Depends(get_db)):
    total_centres = db.query(TrainingCentre).count()
    critical_centres = db.query(TrainingCentre).filter(TrainingCentre.current_risk_level == "CRITICAL").count()
    high_centres = db.query(TrainingCentre).filter(TrainingCentre.current_risk_level == "HIGH").count()
    moderate_centres = db.query(TrainingCentre).filter(TrainingCentre.current_risk_level == "MODERATE").count()
    low_centres = db.query(TrainingCentre).filter(TrainingCentre.current_risk_level == "LOW").count()

    total_cameras = db.query(CameraDevice).count()
    online_cameras = db.query(CameraDevice).filter(CameraDevice.status == "ONLINE").count()

    total_anomalies = db.query(AttendanceAnomaly).count()
    open_anomalies = db.query(AttendanceAnomaly).filter(AttendanceAnomaly.status == "OPEN").count()

    states = db.query(State).all()
    state_rankings = []
    for s in states:
        dist_ids = [d.id for d in db.query(District).filter(District.state_id == s.id).all()]
        c_list = db.query(TrainingCentre).filter(TrainingCentre.district_id.in_(dist_ids)).all() if dist_ids else []
        avg_risk = round(sum(c.current_risk_score for c in c_list) / len(c_list), 1) if c_list else 0.0
        
        state_rankings.append({
            "state_id": s.id,
            "state_name": s.name,
            "centres_count": len(c_list),
            "average_risk_score": avg_risk,
            "critical_centres": len([c for c in c_list if c.current_risk_level == "CRITICAL"])
        })

    # Overall national compliance index = 100 - average risk
    all_centres = db.query(TrainingCentre).all()
    avg_national_risk = sum(c.current_risk_score for c in all_centres) / len(all_centres) if all_centres else 0
    national_compliance_index = round(100.0 - avg_national_risk, 1)

    return {
        "national_compliance_index": national_compliance_index,
        "total_monitored_centres": total_centres,
        "critical_centres": critical_centres,
        "high_risk_centres": high_centres,
        "moderate_risk_centres": moderate_centres,
        "compliant_centres": low_centres,
        "camera_uptime_rate": round((online_cameras / total_cameras * 100), 1) if total_cameras else 100.0,
        "open_anomalies_count": open_anomalies,
        "total_anomalies_recorded": total_anomalies,
        "state_rankings": sorted(state_rankings, key=lambda x: x["average_risk_score"], reverse=True)
    }
