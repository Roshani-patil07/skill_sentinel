from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Centre schemas
class CentreListItem(BaseModel):
    id: str
    centre_code: str
    name: str
    district_name: str
    state_name: str
    current_risk_score: float
    current_risk_level: str
    active_cameras: int
    active_batches: int
    total_assets: int

# Vision Telemetry Ingestion
class VisionTelemetryIngest(BaseModel):
    camera_id: str
    centre_id: str
    room_id: str
    detected_persons_count: int = Field(..., ge=0, description="Observed headcount cannot be negative")
    confidence_score: float = Field(0.92, ge=0.0, le=1.0)
    equipment_detected: Optional[Dict[str, int]] = None
    ambient_tampering_detected: bool = False
    metadata: Optional[Dict[str, Any]] = None

# Attendance Integrity
class AttendanceDiscrepancyItem(BaseModel):
    id: str
    centre_code: str
    centre_name: str
    batch_code: str
    course_title: str
    sanctioned_strength: int
    reported_attendance: int
    observed_headcount: int
    discrepancy_percentage: float
    severity: str
    detected_at: datetime
    status: str

# Asset Verification & QR
class QRVerificationRequest(BaseModel):
    asset_id: str
    qr_payload: Optional[str] = None
    digital_signature: Optional[str] = None
    qr_signature: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    inspection_id: Optional[str] = None
    notes: Optional[str] = None
    condition: Optional[str] = "OPERATIONAL"

# Risk Explanation
class RiskFactorSchema(BaseModel):
    factor_type: str
    weight: float
    score_contribution: float
    explanation: str

class RiskExplainResponse(BaseModel):
    centre_id: str
    centre_code: str
    centre_name: str
    current_risk_score: float
    current_risk_level: str
    factors: List[RiskFactorSchema]
    recommended_intervention: str

# Intervention Trigger & Status Update
class InterventionTriggerRequest(BaseModel):
    centre_id: str
    type: str # PHYSICAL_INSPECTION, SHOW_CAUSE_NOTICE, SUBSIDY_HOLD
    recommended_action: str
    send_whatsapp: bool = True
    officer_phone: Optional[str] = None

class InterventionStatusUpdateRequest(BaseModel):
    status: str # RECOMMENDED, ISSUED, IN_PROGRESS, RESOLVED
    assigned_to_user_id: Optional[str] = None
    notes: Optional[str] = None

