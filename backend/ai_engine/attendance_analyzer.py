"""
SKILL-SENTINEL AI Engine: Attendance Integrity Module
Evaluates discrepancies between reported portal biometric attendance
and observed physical vision presence.
Uses calibrated objective wording: "Potential attendance discrepancy".
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import hashlib
from datetime import datetime

class AttendanceComparisonResult(BaseModel):
    centre_id: str
    batch_id: str
    reported_attendance: int
    observed_presence: int
    attendance_gap: int
    gap_percentage: float
    attendance_consistency_score: float = Field(..., description="1.0 is full match, 0.0 is total mismatch")
    confidence: float
    severity: str # "COMPLIANT", "LOW", "MODERATE", "HIGH", "CRITICAL"
    finding_statement: str
    evidence_hash: str
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)

class AttendanceIntegrityAnalyzer:
    def __init__(self, tolerance_gap_ratio: float = 0.15):
        """
        tolerance_gap_ratio: Allowable variance (e.g. 15% due to restroom/movement)
        before flagging potential attendance discrepancy.
        """
        self.tolerance_gap_ratio = tolerance_gap_ratio

    def compare(
        self,
        centre_id: str,
        batch_id: str,
        reported_attendance: int,
        observed_presence: int,
        camera_confidence: float = 0.92
    ) -> AttendanceComparisonResult:
        if reported_attendance <= 0:
            consistency = 1.0 if observed_presence == 0 else 0.8
            gap = 0
            gap_pct = 0.0
            severity = "COMPLIANT"
            finding = "No active batch attendance claimed on portal."
        else:
            gap = reported_attendance - observed_presence
            gap_pct = round((gap / float(reported_attendance)) * 100.0, 1)
            consistency = max(0.0, min(1.0, round(observed_presence / float(reported_attendance), 3)))

            # Evaluate severity without judgmental bias
            if gap <= int(reported_attendance * self.tolerance_gap_ratio):
                severity = "COMPLIANT"
                finding = f"Observed physical presence ({observed_presence}) conforms to reported attendance ({reported_attendance})."
            elif gap_pct < 30.0:
                severity = "MODERATE"
                finding = f"Minor potential attendance discrepancy: {gap} fewer trainees observed than reported ({gap_pct}% variance)."
            elif gap_pct < 55.0:
                severity = "HIGH"
                finding = f"Potential attendance discrepancy identified: {gap} trainee variance observed ({gap_pct}% gap)."
            else:
                severity = "CRITICAL"
                finding = f"Significant potential attendance discrepancy: {gap} fewer trainees observed ({gap_pct}% gap against claimed portal log)."

        # Evidence signature: deterministic hash of parameters and timestamp
        evidence_raw = f"{centre_id}:{batch_id}:{reported_attendance}:{observed_presence}:{gap}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}"
        evidence_hash = hashlib.sha256(evidence_raw.encode()).hexdigest()

        # Compute confidence based on camera visibility and detection score
        final_conf = round(min(0.99, max(0.75, camera_confidence)), 2)

        return AttendanceComparisonResult(
            centre_id=centre_id,
            batch_id=batch_id,
            reported_attendance=reported_attendance,
            observed_presence=observed_presence,
            attendance_gap=gap,
            gap_percentage=gap_pct,
            attendance_consistency_score=consistency,
            confidence=final_conf,
            severity=severity,
            finding_statement=finding,
            evidence_hash=evidence_hash
        )
