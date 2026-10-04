import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Date, Time, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

# 1. Geographic Hierarchy
class State(Base):
    __tablename__ = "states"
    id = Column(String(10), primary_key=True) # e.g. 'IN-MH'
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    districts = relationship("District", back_populates="state")

class District(Base):
    __tablename__ = "districts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    state_id = Column(String(10), ForeignKey("states.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    state = relationship("State", back_populates="districts")
    centres = relationship("TrainingCentre", back_populates="district")

class TrainingCentre(Base):
    __tablename__ = "training_centres"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    current_risk_score = Column(Float, default=15.0)
    current_risk_level = Column(String(20), default="LOW") # LOW, MODERATE, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    district = relationship("District", back_populates="centres")
    batches = relationship("TrainingBatch", back_populates="centre")
    cameras = relationship("CameraDevice", back_populates="centre")
    assets = relationship("Asset", back_populates="centre")
    risk_scores = relationship("RiskScore", back_populates="centre")
    interventions = relationship("Intervention", back_populates="centre")
    inspections = relationship("Inspection", back_populates="centre")

# 2. RBAC & Users
class Role(Base):
    __tablename__ = "roles"
    id = Column(String(50), primary_key=True) # SUPER_ADMIN, NATIONAL_OFFICER, etc.
    description = Column(String(255), nullable=True)
    level = Column(Integer, default=1)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(100), unique=True, nullable=False)
    module = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(String(50), ForeignKey("roles.id"), nullable=False)
    state_id = Column(String(10), ForeignKey("states.id"), nullable=True)
    district_id = Column(String(36), ForeignKey("districts.id"), nullable=True)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=True)
    phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 3. Academic & Attendance
class Course(Base):
    __tablename__ = "courses"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_code = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=True)
    duration_hours = Column(Integer, default=120)

class TrainingBatch(Base):
    __tablename__ = "training_batches"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    batch_code = Column(String(50), nullable=False)
    sanctioned_strength = Column(Integer, nullable=False, default=30)
    scheduled_start_time = Column(String(10), default="09:00")
    scheduled_end_time = Column(String(10), default="13:00")
    classroom_id = Column(String(50), default="ROOM-101")
    is_active = Column(Boolean, default=True)

    centre = relationship("TrainingCentre", back_populates="batches")
    attendance_records = relationship("AttendanceRecord", back_populates="batch")

class Trainee(Base):
    __tablename__ = "trainees"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    batch_id = Column(String(36), ForeignKey("training_batches.id"), nullable=False)
    enrolment_number = Column(String(100), unique=True, nullable=False)
    anonymized_hash_id = Column(String(64), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    batch_id = Column(String(36), ForeignKey("training_batches.id"), nullable=False)
    date = Column(Date, default=datetime.utcnow().date)
    source = Column(String(30), default="BIOMETRIC_PORTAL")
    reported_present_count = Column(Integer, nullable=False)
    reported_absent_count = Column(Integer, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("TrainingBatch", back_populates="attendance_records")

# 4. Camera & Vision Telemetry
class CameraDevice(Base):
    __tablename__ = "camera_devices"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    device_name = Column(String(100), nullable=False)
    room_type = Column(String(50), default="CLASSROOM") # CLASSROOM, LAB, WORKSHOP
    ip_address = Column(String(45), nullable=True)
    stream_url = Column(String(255), nullable=True)
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, TAMPERED
    last_heartbeat_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("TrainingCentre", back_populates="cameras")

class CameraStream(Base):
    __tablename__ = "camera_streams"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey("camera_devices.id"), nullable=False)
    protocol = Column(String(20), default="RTSP")
    resolution = Column(String(20), default="1080p")
    fps = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)

class VisionEvent(Base):
    __tablename__ = "vision_events"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey("camera_devices.id"), nullable=False)
    event_type = Column(String(50), default="AGGREGATE_DETECTION")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    detected_persons_count = Column(Integer, nullable=False)
    confidence_score = Column(Float, default=0.92)
    metadata_json = Column(JSON, nullable=True)

class OccupancyEvent(Base):
    __tablename__ = "occupancy_events"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    room_identifier = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    headcount = Column(Integer, nullable=False)
    density_index = Column(Float, default=0.65)

# 5. Assets & QR Verification
class AssetCategory(Base):
    __tablename__ = "asset_categories"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    minimum_required_per_batch = Column(Integer, default=1)

class Asset(Base):
    __tablename__ = "assets"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("asset_categories.id"), nullable=False)
    asset_tag = Column(String(100), unique=True, nullable=False, index=True)
    serial_number = Column(String(100), nullable=True)
    model_name = Column(String(100), nullable=True)
    status = Column(String(30), default="VERIFIED_PRESENT") # VERIFIED_PRESENT, MISSING, DEFECTIVE
    specifications = Column(JSON, nullable=True)

    centre = relationship("TrainingCentre", back_populates="assets")
    qr_code = relationship("QRCode", back_populates="asset", uselist=False)

class QRCode(Base):
    __tablename__ = "qr_codes"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(36), ForeignKey("assets.id"), unique=True, nullable=False)
    qr_payload = Column(Text, nullable=False)
    digital_signature = Column(String(255), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset", back_populates="qr_code")

class AssetVerification(Base):
    __tablename__ = "asset_verifications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=False)
    verified_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    verification_method = Column(String(30), default="QR_SCAN")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

# 6. Anomalies & Risk Intelligence
class AttendanceAnomaly(Base):
    __tablename__ = "attendance_anomalies"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    batch_id = Column(String(36), ForeignKey("training_batches.id"), nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    reported_attendance = Column(Integer, nullable=False)
    observed_headcount = Column(Integer, nullable=False)
    discrepancy_percentage = Column(Float, nullable=False)
    severity = Column(String(20), default="HIGH") # LOW, MODERATE, HIGH, CRITICAL
    status = Column(String(30), default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED

class InfrastructureAnomaly(Base):
    __tablename__ = "infrastructure_anomalies"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    anomaly_type = Column(String(50), default="ASSET_MISSING") # ASSET_MISSING, CAMERA_OFFLINE
    severity = Column(String(20), default="MODERATE")
    details = Column(Text, nullable=True)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False, index=True)
    computed_at = Column(DateTime, default=datetime.utcnow, index=True)
    overall_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    trend = Column(String(20), default="STABLE")

    centre = relationship("TrainingCentre", back_populates="risk_scores")
    factors = relationship("RiskFactor", back_populates="risk_score")

class RiskFactor(Base):
    __tablename__ = "risk_factors"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    risk_score_id = Column(String(36), ForeignKey("risk_scores.id"), nullable=False)
    factor_type = Column(String(50), nullable=False)
    weight = Column(Float, default=0.25)
    score_contribution = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)

    risk_score = relationship("RiskScore", back_populates="factors")

# 7. Interventions, Inspections & Evidence
class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    risk_score_id = Column(String(36), ForeignKey("risk_scores.id"), nullable=True)
    type = Column(String(50), nullable=False) # PHYSICAL_INSPECTION, SHOW_CAUSE_NOTICE, SUBSIDY_HOLD
    status = Column(String(30), default="RECOMMENDED") # RECOMMENDED, ISSUED, IN_PROGRESS, RESOLVED
    recommended_action = Column(Text, nullable=False)
    assigned_to_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    centre = relationship("TrainingCentre", back_populates="interventions")

class Inspection(Base):
    __tablename__ = "inspections"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=False)
    intervention_id = Column(String(36), ForeignKey("interventions.id"), nullable=True)
    inspection_type = Column(String(50), default="SURPRISE_AUDIT")
    status = Column(String(30), default="ASSIGNED") # ASSIGNED, IN_PROGRESS, COMPLETED
    scheduled_date = Column(Date, default=datetime.utcnow().date)
    completed_at = Column(DateTime, nullable=True)
    officer_findings = Column(Text, nullable=True)

    centre = relationship("TrainingCentre", back_populates="inspections")
    evidence = relationship("InspectionEvidence", back_populates="inspection")

class InspectionAssignment(Base):
    __tablename__ = "inspection_assignments"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    officer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

class InspectionEvidence(Base):
    __tablename__ = "inspection_evidence"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    evidence_type = Column(String(30), default="IMAGE_PRIVACY_MASKED")
    file_url = Column(String(500), nullable=False)
    hash_sha256 = Column(String(64), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    inspection = relationship("Inspection", back_populates="evidence")

# 8. Notifications, WhatsApp & Audit Logs
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String(20), default="INFO") # INFO, WARNING, CRITICAL
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_phone = Column(String(20), nullable=False)
    message_body = Column(Text, nullable=False)
    centre_id = Column(String(36), ForeignKey("training_centres.id"), nullable=True)
    status = Column(String(20), default="SENT")
    dispatched_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    details = Column(JSON, nullable=True)

class SystemAlert(Base):
    __tablename__ = "system_alerts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="WARNING")
    message = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey("camera_devices.id"), nullable=True)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=True)
    issue_description = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING")
    logged_at = Column(DateTime, default=datetime.utcnow)
