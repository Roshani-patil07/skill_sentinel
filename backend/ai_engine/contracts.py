"""
AI-Engine Contract Specifications
Defines the telemetry payload schemas between Camera Edge Processors and the SKILL-SENTINEL Backend.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class BoundingBox(BaseModel):
    """Anonymous bounding box coordinates (Normalized 0.0 - 1.0)"""
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    confidence: float
    tracking_id: int

class AggregateDetectionEvent(BaseModel):
    """Edge Vision Event Payload. Strictly anonymous aggregate presence."""
    camera_id: str
    centre_id: str
    room_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    person_count: int
    detected_boxes: List[BoundingBox] = []
    average_confidence: float = 0.92
    equipment_detected: Dict[str, int] = Field(
        default_factory=lambda: {"computer_workstations": 15, "biometric_kiosks": 1, "projectors": 1}
    )
    ambient_tampering_detected: bool = False
    metadata: Dict[str, Any] = {}

class AttendanceIntegrityCheck(BaseModel):
    centre_id: str
    batch_id: str
    scheduled_start: str
    scheduled_end: str
    sanctioned_strength: int
    reported_portal_attendance: int
    observed_vision_headcount: int
    discrepancy: int
    discrepancy_percentage: float
    is_anomaly: bool
    risk_increment: float
