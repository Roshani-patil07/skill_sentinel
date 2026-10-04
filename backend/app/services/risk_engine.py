"""
Continuous Compliance Risk Engine
Calculates explainable composite risk scores (0.0 to 100.0) based on:
1. Attendance Integrity & Discrepancy (Weight: 45%)
2. Infrastructure & Equipment Deficit (Weight: 25%)
3. Camera Telemetry Uptime & Tamper Flags (Weight: 15%)
4. Historical Anomaly Persistence (Weight: 15%)
"""

from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    TrainingCentre, AttendanceAnomaly, InfrastructureAnomaly,
    CameraDevice, Asset, RiskScore, RiskFactor
)

def evaluate_centre_risk(db: Session, centre_id: str) -> Tuple[float, str, List[Dict[str, Any]], str]:
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == centre_id).first()
    if not centre:
        return 0.0, "LOW", [], "No action required."

    factors = []
    
    # 1. Attendance Integrity Factor (0 - 45 points)
    open_anomalies = db.query(AttendanceAnomaly).filter(
        AttendanceAnomaly.centre_id == centre_id,
        AttendanceAnomaly.status == "OPEN"
    ).all()
    
    attendance_score = 0.0
    if open_anomalies:
        avg_discrepancy = sum(abs(a.discrepancy_percentage) for a in open_anomalies) / len(open_anomalies)
        # Scale to max 45 points
        attendance_score = min(45.0, (avg_discrepancy / 100.0) * 45.0 + len(open_anomalies) * 5.0)
        explanation = f"{len(open_anomalies)} active attendance discrepancies (avg discrepancy {avg_discrepancy:.1f}%)."
    else:
        explanation = "Observed camera headcounts closely align with portal biometric records."
    
    factors.append({
        "factor_type": "ATTENDANCE_INTEGRITY",
        "weight": 0.45,
        "score_contribution": round(attendance_score, 1),
        "explanation": explanation
    })

    # 2. Asset & Equipment Deficit (0 - 25 points)
    total_assets = db.query(Asset).filter(Asset.centre_id == centre_id).count()
    missing_assets = db.query(Asset).filter(
        Asset.centre_id == centre_id,
        Asset.status.in_(["MISSING", "DEFECTIVE"])
    ).count()
    
    asset_score = 0.0
    if total_assets > 0:
        missing_ratio = missing_assets / total_assets
        asset_score = min(25.0, missing_ratio * 25.0 * 2.5)
        asset_expl = f"{missing_assets} out of {total_assets} sanctioned assets missing or unverified."
    else:
        asset_expl = "All sanctioned lab and IT equipment verified present on premises."
    
    factors.append({
        "factor_type": "EQUIPMENT_COMPLIANCE",
        "weight": 0.25,
        "score_contribution": round(asset_score, 1),
        "explanation": asset_expl
    })

    # 3. Camera Health & Tampering (0 - 15 points)
    cameras = db.query(CameraDevice).filter(CameraDevice.centre_id == centre_id).all()
    offline_cameras = [c for c in cameras if c.status in ["OFFLINE", "TAMPERED"]]
    
    camera_score = 0.0
    if cameras:
        offline_ratio = len(offline_cameras) / len(cameras)
        camera_score = min(15.0, offline_ratio * 15.0)
        cam_expl = f"{len(offline_cameras)} of {len(cameras)} CCTV cameras offline or obstructed."
    else:
        cam_expl = "All mandated CCTV streams streaming continuous telemetry."
        
    factors.append({
        "factor_type": "TELEMETRY_HEALTH",
        "weight": 0.15,
        "score_contribution": round(camera_score, 1),
        "explanation": cam_expl
    })

    # 4. Historical Anomaly Persistence (0 - 15 points)
    infra_anomalies = db.query(InfrastructureAnomaly).filter(
        InfrastructureAnomaly.centre_id == centre_id
    ).count()
    history_score = min(15.0, infra_anomalies * 5.0)
    history_expl = f"{infra_anomalies} historical infrastructure compliance flags recorded."
    
    factors.append({
        "factor_type": "PERSISTENCE_TREND",
        "weight": 0.15,
        "score_contribution": round(history_score, 1),
        "explanation": history_expl
    })

    # Total Composite Risk
    composite_score = min(100.0, round(attendance_score + asset_score + camera_score + history_score, 1))

    # Risk Level Categorization
    if composite_score >= 70.0:
        level = "CRITICAL"
        recommendation = "Execute Immediate Surprise Physical Inspection & Freeze Pending Subsidy Disbursement."
    elif composite_score >= 45.0:
        level = "HIGH"
        recommendation = "Issue Digital Show-Cause Notice & Schedule Mandatory Officer Video Verification."
    elif composite_score >= 25.0:
        level = "MODERATE"
        recommendation = "Request Centre Administrator to Re-verify Assets and Biometric Calibration."
    else:
        level = "LOW"
        recommendation = "Centre in Good Standing. Maintain Routine Continuous Monitoring."

    # Update Centre cache in DB
    centre.current_risk_score = composite_score
    centre.current_risk_level = level
    db.commit()

    return composite_score, level, factors, recommendation
