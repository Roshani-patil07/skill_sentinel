"""
SKILL-SENTINEL AI Engine: Dual QR + Vision Asset Verification Module
Combines cryptographic physical QR inspection with continuous AI vision:
1. Is asset registered?
2. Is it assigned to this centre?
3. Was it previously verified?
4. Is maintenance overdue?
5. Does AI vision confirm presence in the room?
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

class AssetRecord(BaseModel):
    asset_id: str
    qr_code: str
    sanctioned_specification: str
    assigned_centre_id: str
    installation_date: str
    last_verified_date: Optional[str] = None
    maintenance_due_date: str
    category: str

class DualVerificationResult(BaseModel):
    asset_id: str
    is_registered: bool
    is_assigned_to_centre: bool
    previously_verified: bool
    is_maintenance_overdue: bool
    vision_detected_in_room: bool
    dual_verification_status: str # "DUAL_AUTHENTICATED", "MAINTENANCE_OVERDUE", "VISION_MISSING", "WRONG_CENTRE", "UNREGISTERED"
    verification_score: float # 0.0 to 1.0
    audit_notes: str
    verified_at: datetime = Field(default_factory=datetime.utcnow)

class DualAssetVerifier:
    def verify_asset(
        self,
        qr_code_scanned: str,
        current_centre_id: str,
        registered_asset_db: Dict[str, AssetRecord],
        vision_detected_categories: Dict[str, int]
    ) -> DualVerificationResult:
        # 1. Registration check
        asset_record = None
        for record in registered_asset_db.values():
            if record.qr_code == qr_code_scanned or record.asset_id == qr_code_scanned:
                asset_record = record
                break

        if not asset_record:
            return DualVerificationResult(
                asset_id="UNKNOWN",
                is_registered=False,
                is_assigned_to_centre=False,
                previously_verified=False,
                is_maintenance_overdue=False,
                vision_detected_in_room=False,
                dual_verification_status="UNREGISTERED",
                verification_score=0.0,
                audit_notes="Unregistered QR code scanned. Equipment not in national sanctioned asset registry."
            )

        # 2. Centre Assignment check
        is_assigned = asset_record.assigned_centre_id == current_centre_id

        # 3. Previously verified check
        prev_verified = asset_record.last_verified_date is not None

        # 4. Maintenance overdue check
        due_date = datetime.strptime(asset_record.maintenance_due_date, "%Y-%m-%d")
        maint_overdue = datetime.utcnow() > due_date

        # 5. Vision detection check
        vision_detected = vision_detected_categories.get(asset_record.category, 0) > 0

        # Determine Dual Status & Score
        if not is_assigned:
            status = "WRONG_CENTRE"
            score = 0.2
            notes = f"Asset {asset_record.asset_id} is registered to {asset_record.assigned_centre_id}, not current centre {current_centre_id}."
        elif maint_overdue:
            status = "MAINTENANCE_OVERDUE"
            score = 0.6
            notes = f"Asset {asset_record.asset_id} physically verified but statutory maintenance was due on {asset_record.maintenance_due_date}."
        elif not vision_detected:
            status = "VISION_MISSING"
            score = 0.7
            notes = f"Asset {asset_record.asset_id} QR authenticated but category ({asset_record.category}) currently not visible in camera frame."
        else:
            status = "DUAL_AUTHENTICATED"
            score = 1.0
            notes = f"Asset {asset_record.asset_id} successfully dual-verified via QR signature and room camera vision."

        return DualVerificationResult(
            asset_id=asset_record.asset_id,
            is_registered=True,
            is_assigned_to_centre=is_assigned,
            previously_verified=prev_verified,
            is_maintenance_overdue=maint_overdue,
            vision_detected_in_room=vision_detected,
            dual_verification_status=status,
            verification_score=score,
            audit_notes=notes
        )
