"""
SKILL-SENTINEL AI Engine: Explainable Multi-Pillar Risk Scorer
Configurable 6-pillar continuous compliance risk formula:
Risk =
  (W_attendance * AttendanceRisk)
+ (W_infrastructure * InfrastructureRisk)
+ (W_activity * ActivityRisk)
+ (W_historical * HistoricalRisk)
+ (W_camera * CameraRisk)
+ (W_inspection * InspectionRisk)

Defaults: 0.30, 0.25, 0.15, 0.15, 0.10, 0.05.
Always outputs explainable contributing factors with points and evidence timestamps.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class RiskWeights(BaseModel):
    w_attendance: float = 0.30
    w_infrastructure: float = 0.25
    w_activity: float = 0.15
    w_historical: float = 0.15
    w_camera: float = 0.10
    w_inspection: float = 0.05

class ContributingFactor(BaseModel):
    rank: int
    name: str
    factor_type: str
    points: float
    weight: float
    evidence_timestamp: str
    explanation: str

class ExplainableRiskResult(BaseModel):
    centre_id: str
    centre_code: str
    composite_risk_score: float # 0.0 to 100.0
    risk_level: str # "LOW", "MODERATE", "HIGH", "CRITICAL"
    top_factors: List[ContributingFactor]
    configured_weights: Dict[str, float]
    recommended_intervention: str
    computed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class MultiPillarRiskScorer:
    def __init__(self, weights: Optional[RiskWeights] = None):
        self.weights = weights or RiskWeights()

    def compute(
        self,
        centre_id: str,
        centre_code: str,
        attendance_gap_pct: float = 0.0, # e.g. 71.4%
        missing_assets_count: int = 0,   # e.g. 3
        total_sanctioned_assets: int = 15,
        activity_score: float = 0.8,     # 0.0 to 1.0
        consecutive_anomaly_days: int = 0, # e.g. 3
        camera_uptime_rate: float = 100.0, # 0 to 100%
        inspection_overdue_days: int = 0, # e.g. 90
        custom_weights: Optional[RiskWeights] = None
    ) -> ExplainableRiskResult:
        w = custom_weights or self.weights
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Attendance Component (Raw 0 - 100 scaled by w_attendance)
        raw_att = min(100.0, max(0.0, (attendance_gap_pct / 80.0) * 100.0))
        att_points = round(raw_att * w.w_attendance, 1)

        # 2. Infrastructure Component (Raw 0 - 100 scaled by w_infrastructure)
        asset_deficit_ratio = (missing_assets_count / float(max(1, total_sanctioned_assets)))
        raw_infra = min(100.0, asset_deficit_ratio * 100.0 * 2.5)
        infra_points = round(raw_infra * w.w_infrastructure, 1)

        # 3. Activity Consistency (Raw 0 - 100 scaled by w_activity)
        raw_act = max(0.0, (1.0 - activity_score) * 100.0)
        act_points = round(raw_act * w.w_activity, 1)

        # 4. Historical Repeated Anomalies (Raw 0 - 100 scaled by w_historical)
        raw_hist = min(100.0, consecutive_anomaly_days * 30.0)
        hist_points = round(raw_hist * w.w_historical, 1)

        # 5. Camera Telemetry Reliability (Raw 0 - 100 scaled by w_camera)
        raw_cam = max(0.0, 100.0 - camera_uptime_rate)
        cam_points = round(raw_cam * w.w_camera, 1)

        # 6. Inspection Overdue (Raw 0 - 100 scaled by w_inspection)
        raw_insp = min(100.0, (inspection_overdue_days / 60.0) * 100.0)
        insp_points = round(raw_insp * w.w_inspection, 1)

        # Total Composite Risk
        total_score = min(100.0, round(
            att_points + infra_points + act_points + hist_points + cam_points + insp_points, 1
        ))

        # Classify Level
        if total_score >= 70.0:
            level = "CRITICAL"
            rec = "Execute Immediate Surprise Physical Inspection & Freeze Pending Subsidy Disbursement."
        elif total_score >= 45.0:
            level = "HIGH"
            rec = "Issue Digital Show-Cause Notice & Schedule Mandatory Officer Video Verification."
        elif total_score >= 25.0:
            level = "MODERATE"
            rec = "Request Centre Administrator to Re-verify Assets and Biometric Calibration."
        else:
            level = "LOW"
            rec = "Centre in Good Standing. Maintain Routine Continuous Monitoring."

        # Rank Factors
        factor_candidates = [
            {
                "name": "Potential attendance discrepancy",
                "factor_type": "ATTENDANCE_INTEGRITY",
                "points": att_points,
                "weight": w.w_attendance,
                "evidence_timestamp": now_str,
                "explanation": f"{round(attendance_gap_pct, 1)}% variance between portal claims and camera headcount"
            },
            {
                "name": "Missing sanctioned equipment",
                "factor_type": "INFRASTRUCTURE_DEFICIT",
                "points": infra_points,
                "weight": w.w_infrastructure,
                "evidence_timestamp": now_str,
                "explanation": f"{missing_assets_count} of {total_sanctioned_assets} mandatory workstations/machines absent"
            },
            {
                "name": "Repeated multi-day low occupancy",
                "factor_type": "HISTORICAL_PERSISTENCE",
                "points": hist_points,
                "weight": w.w_historical,
                "evidence_timestamp": now_str,
                "explanation": f"{consecutive_anomaly_days} consecutive calendar days with verified discrepancies"
            },
            {
                "name": "Low laboratory kinetic activity",
                "factor_type": "ACTIVITY_SIGNAL",
                "points": act_points,
                "weight": w.w_activity,
                "evidence_timestamp": now_str,
                "explanation": f"Engagement score at {round(activity_score * 100)}% during active training session"
            },
            {
                "name": "Camera stream intermittency",
                "factor_type": "TELEMETRY_HEALTH",
                "points": cam_points,
                "weight": w.w_camera,
                "evidence_timestamp": now_str,
                "explanation": f"Uptime rate at {camera_uptime_rate}%"
            },
            {
                "name": "Physical inspection overdue",
                "factor_type": "INSPECTION_HISTORY",
                "points": insp_points,
                "weight": w.w_inspection,
                "evidence_timestamp": now_str,
                "explanation": f"Last field audit occurred {inspection_overdue_days} days ago"
            }
        ]

        # Sort descending by points
        factor_candidates.sort(key=lambda x: x["points"], reverse=True)
        top_factors: List[ContributingFactor] = []
        for i, fc in enumerate(factor_candidates[:4]):
            top_factors.append(ContributingFactor(
                rank=i + 1,
                name=fc["name"],
                factor_type=fc["factor_type"],
                points=fc["points"],
                weight=fc["weight"],
                evidence_timestamp=fc["evidence_timestamp"],
                explanation=fc["explanation"]
            ))

        return ExplainableRiskResult(
            centre_id=centre_id,
            centre_code=centre_code,
            composite_risk_score=total_score,
            risk_level=level,
            top_factors=top_factors,
            configured_weights={
                "attendance": w.w_attendance,
                "infrastructure": w.w_infrastructure,
                "activity": w.w_activity,
                "historical": w.w_historical,
                "camera": w.w_camera,
                "inspection": w.w_inspection
            },
            recommended_intervention=rec
        )
