from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import TrainingCentre, RiskScore, RiskFactor, AttendanceAnomaly, Asset
from backend.app.services.risk_engine import evaluate_centre_risk

# Import AI Engine Risk Scorer and Temporal Engine
try:
    from risk_scorer import MultiPillarRiskScorer, RiskWeights, ExplainableRiskResult
    from temporal_engine import TemporalEngine, DayLog
except ImportError:
    from ai_engine.risk_scorer import MultiPillarRiskScorer, RiskWeights, ExplainableRiskResult
    from ai_engine.temporal_engine import TemporalEngine, DayLog

router = APIRouter(prefix="/risk", tags=["Risk Intelligence"])

_risk_scorer = MultiPillarRiskScorer()
_temporal_engine = TemporalEngine()

class CalculateRiskRequest(BaseModel):
    centre_id: str
    attendance_gap_pct: float = 71.4
    missing_assets_count: int = 3
    total_sanctioned_assets: int = 15
    activity_score: float = 0.42
    consecutive_anomaly_days: int = 3
    camera_uptime_rate: float = 98.0
    inspection_overdue_days: int = 45
    weights: Optional[Dict[str, float]] = None

@router.get("/radar")
def get_risk_radar(db: Session = Depends(get_db)):
    centres = db.query(TrainingCentre).all()
    distribution = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "CRITICAL": 0}
    for c in centres:
        distribution[c.current_risk_level] = distribution.get(c.current_risk_level, 0) + 1

    top_risky = sorted(centres, key=lambda x: x.current_risk_score, reverse=True)[:5]

    return {
        "total_monitored_centres": len(centres),
        "distribution": distribution,
        "critical_centres_count": distribution.get("CRITICAL", 0),
        "high_risk_centres_count": distribution.get("HIGH", 0),
        "top_at_risk": [
            {
                "id": c.id,
                "centre_code": c.centre_code,
                "name": c.name,
                "risk_score": c.current_risk_score,
                "risk_level": c.current_risk_level
            } for c in top_risky
        ]
    }

@router.post("/calculate")
def calculate_configurable_risk(req: CalculateRiskRequest, db: Session = Depends(get_db)):
    """
    Computes explainable composite risk score using configurable weights:
    Risk = 0.30 Attendance + 0.25 Infrastructure + 0.15 Activity + 0.15 Historical + 0.10 Camera + 0.05 Inspection
    """
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == req.centre_id).first()
    code = centre.centre_code if centre else req.centre_id

    custom_w = None
    if req.weights:
        custom_w = RiskWeights(
            w_attendance=req.weights.get("attendance", 0.30),
            w_infrastructure=req.weights.get("infrastructure", 0.25),
            w_activity=req.weights.get("activity", 0.15),
            w_historical=req.weights.get("historical", 0.15),
            w_camera=req.weights.get("camera", 0.10),
            w_inspection=req.weights.get("inspection", 0.05),
        )

    result = _risk_scorer.compute(
        centre_id=req.centre_id,
        centre_code=code,
        attendance_gap_pct=req.attendance_gap_pct,
        missing_assets_count=req.missing_assets_count,
        total_sanctioned_assets=req.total_sanctioned_assets,
        activity_score=req.activity_score,
        consecutive_anomaly_days=req.consecutive_anomaly_days,
        camera_uptime_rate=req.camera_uptime_rate,
        inspection_overdue_days=req.inspection_overdue_days,
        custom_weights=custom_w
    )

    return result.dict()

@router.get("/history")
def get_risk_and_temporal_history(centre_id: str = "tc-del-042", db: Session = Depends(get_db)):
    """
    Returns 7-day longitudinal history and repeated anomaly pattern analysis.
    """
    temporal_res = _temporal_engine.analyze_trend(centre_id=centre_id)
    return temporal_res.dict()

@router.get("/centres/{centre_id}/explain")
def explain_centre_risk(centre_id: str, db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Training centre not found")

    score, level, factors, recommendation = evaluate_centre_risk(db, centre_id)

    return {
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "centre_name": centre.name,
        "current_risk_score": score,
        "current_risk_level": level,
        "factors": factors,
        "recommended_intervention": recommendation
    }

@router.post("/centres/{centre_id}/recalculate")
def recalculate_centre_risk(centre_id: str, db: Session = Depends(get_db)):
    score, level, factors, recommendation = evaluate_centre_risk(db, centre_id)
    return {
        "centre_id": centre_id,
        "new_risk_score": score,
        "risk_level": level,
        "factors": factors,
        "recommendation": recommendation
    }
