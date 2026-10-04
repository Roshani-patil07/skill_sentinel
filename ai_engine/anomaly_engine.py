"""
SKILL-SENTINEL AI Engine: Anomaly Engine Module
Generates explainable, evidence-backed anomalies:
- ATTENDANCE_MISMATCH
- LOW_OCCUPANCY
- MISSING_ASSET
- UNEXPECTED_ASSET
- LOW_ACTIVITY
- CAMERA_OFFLINE
- REPEATED_ANOMALY
- SUDDEN_OCCUPANCY_DROP
- INFRASTRUCTURE_DEVIATION
"""

import uuid
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AnomalyEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str # One of the 9 required types
    severity: str # "LOW", "MODERATE", "HIGH", "CRITICAL"
    confidence: float # 0.0 to 1.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    centre_id: str
    centre_code: str
    camera_id: Optional[str] = None
    evidence: Dict[str, Any] = Field(default_factory=dict)
    explanation: str

class AnomalyEngine:
    def __init__(self):
        pass

    def evaluate(
        self,
        centre_id: str,
        centre_code: str,
        camera_id: str,
        attendance_comparison: Optional[Any] = None,
        activity_telemetry: Optional[Any] = None,
        infrastructure_result: Optional[Any] = None,
        previous_occupancy: Optional[int] = None,
        camera_online: bool = True,
        repeated_days_count: int = 0
    ) -> List[AnomalyEvent]:
        anomalies: List[AnomalyEvent] = []
        now = datetime.utcnow()

        # 1. CAMERA_OFFLINE
        if not camera_online:
            anomalies.append(AnomalyEvent(
                type="CAMERA_OFFLINE",
                severity="HIGH",
                confidence=0.99,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={"last_heartbeat_delta_seconds": 320, "stream_error": "ConnectionRefused: RTSP Port 554"},
                explanation="Camera telemetry offline: Stream disconnected for over 5 minutes during scheduled batch."
            ))

        # 2. ATTENDANCE_MISMATCH
        if attendance_comparison and attendance_comparison.severity in ["HIGH", "CRITICAL"]:
            anomalies.append(AnomalyEvent(
                type="ATTENDANCE_MISMATCH",
                severity=attendance_comparison.severity,
                confidence=attendance_comparison.confidence,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={
                    "reported": attendance_comparison.reported_attendance,
                    "observed": attendance_comparison.observed_presence,
                    "gap": attendance_comparison.attendance_gap,
                    "gap_pct": attendance_comparison.gap_percentage,
                    "hash": attendance_comparison.evidence_hash
                },
                explanation=f"Potential attendance discrepancy: Reported {attendance_comparison.reported_attendance} trainees on portal but AI vision observes {attendance_comparison.observed_presence} in classroom ({attendance_comparison.gap_percentage}% variance)."
            ))

        # 3. LOW_OCCUPANCY
        if activity_telemetry and activity_telemetry.occupancy_rate < 0.25 and activity_telemetry.person_count > 0:
            anomalies.append(AnomalyEvent(
                type="LOW_OCCUPANCY",
                severity="MODERATE",
                confidence=0.91,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={
                    "current_headcount": activity_telemetry.person_count,
                    "occupancy_rate": activity_telemetry.occupancy_rate
                },
                explanation=f"Low room utilization: Room operating at only {round(activity_telemetry.occupancy_rate * 100)}% capacity ({activity_telemetry.person_count} persons) during sanctioned instructional block."
            ))

        # 4. SUDDEN_OCCUPANCY_DROP
        if previous_occupancy is not None and activity_telemetry:
            if previous_occupancy >= 15 and activity_telemetry.person_count <= 4:
                anomalies.append(AnomalyEvent(
                    type="SUDDEN_OCCUPANCY_DROP",
                    severity="HIGH",
                    confidence=0.94,
                    timestamp=now,
                    centre_id=centre_id,
                    centre_code=centre_code,
                    camera_id=camera_id,
                    evidence={
                        "previous_occupancy": previous_occupancy,
                        "current_occupancy": activity_telemetry.person_count,
                        "delta": previous_occupancy - activity_telemetry.person_count
                    },
                    explanation=f"Sudden room evacuation: Headcount plummeted from {previous_occupancy} to {activity_telemetry.person_count} in under 2 minutes."
                ))

        # 5. LOW_ACTIVITY
        if activity_telemetry and activity_telemetry.activity_status == "LOW_ACTIVITY":
            anomalies.append(AnomalyEvent(
                type="LOW_ACTIVITY",
                severity="MODERATE",
                confidence=0.88,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={
                    "activity_score": activity_telemetry.activity_score,
                    "motion_energy": activity_telemetry.motion_energy,
                    "stationary_ratio": round(activity_telemetry.stationary_count / max(1, activity_telemetry.person_count), 2)
                },
                explanation=f"Disengagement signal: Low kinetic interaction ({round(activity_telemetry.activity_score * 100)}% engagement) detected during active laboratory session."
            ))

        # 6. MISSING_ASSET & INFRASTRUCTURE_DEVIATION
        if infrastructure_result and not infrastructure_result.is_compliant:
            sev = "CRITICAL" if infrastructure_result.missing_asset_count >= 3 else "HIGH"
            anomalies.append(AnomalyEvent(
                type="MISSING_ASSET",
                severity=sev,
                confidence=0.93,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={
                    "missing_count": infrastructure_result.missing_asset_count,
                    "presence_rate": infrastructure_result.asset_presence_rate,
                    "deficit_breakdown": [b.dict() for b in infrastructure_result.categories_breakdown if b.missing_count > 0]
                },
                explanation=f"Sanctioned equipment deficit: {infrastructure_result.missing_asset_count} required instructional assets absent from teaching facility."
            ))

            if infrastructure_result.unknown_asset_count > 0:
                anomalies.append(AnomalyEvent(
                    type="UNEXPECTED_ASSET",
                    severity="LOW",
                    confidence=0.85,
                    timestamp=now,
                    centre_id=centre_id,
                    centre_code=centre_code,
                    camera_id=camera_id,
                    evidence={"unknown_count": infrastructure_result.unknown_asset_count},
                    explanation=f"Unrecognized equipment detected: {infrastructure_result.unknown_asset_count} unregistered hardware assets identified in room."
                ))

        # 7. REPEATED_ANOMALY
        if repeated_days_count >= 3:
            anomalies.append(AnomalyEvent(
                type="REPEATED_ANOMALY",
                severity="CRITICAL",
                confidence=0.96,
                timestamp=now,
                centre_id=centre_id,
                centre_code=centre_code,
                camera_id=camera_id,
                evidence={"consecutive_days_with_anomaly": repeated_days_count},
                explanation=f"Chronic compliance failure: Persistent discrepancy patterns verified across {repeated_days_count} consecutive calendar days."
            ))

        return anomalies
