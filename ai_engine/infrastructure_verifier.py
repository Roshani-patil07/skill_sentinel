"""
SKILL-SENTINEL AI Engine: Infrastructure Compliance Module
Evaluates sanctioned equipment requirements against vision-detected assets:
- Computes asset_presence_rate
- Computes asset_compliance_score
- Computes missing_asset_count and unknown_asset_count
- Emits INFRASTRUCTURE_DEVIATION and MISSING_ASSET alerts
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class AssetCategoryAudit(BaseModel):
    category_name: str
    required_count: int
    detected_count: int
    missing_count: int
    compliance_rate: float
    status: str # "VERIFIED_COMPLIANT", "DEFICIT_FLAGGED", "SURPLUS"

class InfrastructureComplianceResult(BaseModel):
    centre_id: str
    total_required_assets: int
    total_detected_assets: int
    asset_presence_rate: float
    asset_compliance_score: float # 0.0 to 100.0
    missing_asset_count: int
    unknown_asset_count: int
    categories_breakdown: List[AssetCategoryAudit]
    is_compliant: bool
    deviation_summary: str

class InfrastructureVerifier:
    def verify(
        self,
        centre_id: str,
        sanctioned_requirements: Dict[str, int],
        vision_detected_assets: Dict[str, int],
        unknown_detected: int = 0
    ) -> InfrastructureComplianceResult:
        """
        Example input:
        sanctioned_requirements = {"computers": 20, "cnc_machines": 4, "welding_machines": 2}
        vision_detected_assets  = {"computers": 18, "cnc_machines": 3, "welding_machines": 1}
        """
        total_req = sum(sanctioned_requirements.values())
        total_det = 0
        total_missing = 0
        breakdown: List[AssetCategoryAudit] = []

        for category, req_qty in sanctioned_requirements.items():
            det_qty = vision_detected_assets.get(category, 0)
            missing = max(0, req_qty - det_qty)
            total_missing += missing
            total_det += min(req_qty, det_qty) # Cap detected at required for baseline presence calculation

            rate = round(min(1.0, det_qty / float(max(1, req_qty))), 3)
            status = "VERIFIED_COMPLIANT" if det_qty >= req_qty else "DEFICIT_FLAGGED"

            breakdown.append(AssetCategoryAudit(
                category_name=category,
                required_count=req_qty,
                detected_count=det_qty,
                missing_count=missing,
                compliance_rate=rate,
                status=status
            ))

        presence_rate = round((total_det / float(max(1, total_req))) * 100.0, 1)
        # Compliance score penalizes missing high-value lab gear
        compliance_score = max(0.0, round(presence_rate - (unknown_detected * 5.0), 1))
        is_compliant = total_missing == 0 and unknown_detected == 0

        if is_compliant:
            summary = "All sanctioned lab and instructional assets verified present by AI vision."
        else:
            summary = f"Infrastructure deficit detected: {total_missing} mandated assets not present in monitored teaching space."

        return InfrastructureComplianceResult(
            centre_id=centre_id,
            total_required_assets=total_req,
            total_detected_assets=sum(vision_detected_assets.values()),
            asset_presence_rate=presence_rate,
            asset_compliance_score=compliance_score,
            missing_asset_count=total_missing,
            unknown_asset_count=unknown_detected,
            categories_breakdown=breakdown,
            is_compliant=is_compliant,
            deviation_summary=summary
        )
