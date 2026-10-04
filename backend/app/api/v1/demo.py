import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.entities import (
    TrainingCentre, AttendanceAnomaly, Asset, QRCode, AssetVerification,
    Intervention, Inspection, InspectionEvidence, RiskScore, RiskFactor
)
from backend.app.services.websocket_manager import ws_manager
from backend.app.services.risk_engine import evaluate_centre_risk

router = APIRouter(prefix="/demo", tags=["SIH Interactive Demonstration Controller"])

DEMO_CENTRE_ID = "tc-pune-047"
DEMO_CENTRE_CODE = "Pune-047"

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found in database")

    anomalies = db.query(AttendanceAnomaly).filter(
        AttendanceAnomaly.centre_id == centre.id,
        AttendanceAnomaly.status == "OPEN"
    ).all()

    interventions = db.query(Intervention).filter(
        Intervention.centre_id == centre.id
    ).order_by(Intervention.created_at.desc()).all()

    assets = db.query(Asset).filter(Asset.centre_id == centre.id).all()

    return {
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "centre_name": centre.name,
        "current_risk_score": centre.current_risk_score,
        "current_risk_level": centre.current_risk_level,
        "active_anomalies_count": len(anomalies),
        "interventions_count": len(interventions),
        "assets_count": len(assets),
        "latest_intervention": {
            "id": interventions[0].id,
            "type": interventions[0].type,
            "status": interventions[0].status,
            "recommended_action": interventions[0].recommended_action
        } if interventions else None
    }

@router.post("/reset")
async def reset_demo_scenario(db: Session = Depends(get_db)):
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found")

    # Reset centre risk to baseline = 54
    centre.current_risk_score = 54.0
    centre.current_risk_level = "HIGH"

    # Close previous demo anomalies
    db.query(AttendanceAnomaly).filter(AttendanceAnomaly.centre_id == centre.id).delete()
    db.query(Intervention).filter(Intervention.centre_id == centre.id).delete()
    db.query(Inspection).filter(Inspection.centre_id == centre.id).delete()

    # Reset asset status
    cnc_asset = db.query(Asset).filter(Asset.asset_tag == "PUN-CNC-2026-001").first()
    if cnc_asset:
        cnc_asset.status = "VERIFIED_PRESENT"

    db.commit()

    # Broadcast reset
    await ws_manager.broadcast({
        "event": "DEMO_SCENARIO_STAGE",
        "stage": 0,
        "stage_title": "START: Baseline Monitoring",
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "risk_score": 54.0,
        "risk_level": "HIGH",
        "description": "Centre Pune-047 initialized at baseline risk score 54 (High Risk).",
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "RESET_SUCCESSFUL",
        "centre_code": centre.centre_code,
        "current_risk_score": 54.0,
        "message": "Centre Pune-047 reset to baseline risk score 54.0."
    }

@router.post("/stage-1-attendance")
async def trigger_stage_1_attendance_mismatch(db: Session = Depends(get_db)):
    """
    Stage 1: AI detects attendance mismatch -> risk becomes 72
    """
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found")

    # Record attendance discrepancy anomaly
    anom = AttendanceAnomaly(
        id=f"anom-pune-att-{datetime.utcnow().strftime('%H%M%S')}",
        centre_id=centre.id,
        batch_id="batch-pune-cnc-01",
        detected_at=datetime.utcnow(),
        reported_attendance=28,
        observed_headcount=9,
        discrepancy_percentage=-67.8,
        severity="HIGH",
        status="OPEN"
    )
    db.add(anom)

    centre.current_risk_score = 72.0
    centre.current_risk_level = "HIGH"
    db.commit()

    event = {
        "event": "DEMO_SCENARIO_STAGE",
        "stage": 1,
        "stage_title": "AI Attendance Mismatch Detected",
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "risk_score": 72.0,
        "risk_level": "HIGH",
        "discrepancy_details": {
            "reported_biometric": 28,
            "ai_detected_headcount": 9,
            "discrepancy_pct": -67.8
        },
        "description": "AI detects attendance mismatch (28 reported vs 9 observed). Risk elevated from 54 to 72.",
        "timestamp": datetime.utcnow().isoformat()
    }
    await ws_manager.broadcast(event)

    return {
        "stage": 1,
        "centre_code": centre.centre_code,
        "new_risk_score": 72.0,
        "risk_level": "HIGH",
        "message": "AI detected attendance mismatch. Risk increased from 54 to 72."
    }

@router.post("/stage-2-missing-asset")
async def trigger_stage_2_missing_asset(db: Session = Depends(get_db)):
    """
    Stage 2: Missing equipment -> risk becomes 86.
    System explains: Attendance discrepancy, Missing sanctioned asset, Repeated low occupancy.
    System recommends: 'Schedule targeted inspection'.
    """
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found")

    # Mark CNC trainer as missing in vision stream
    cnc = db.query(Asset).filter(Asset.asset_tag == "PUN-CNC-2026-001").first()
    if cnc:
        cnc.status = "MISSING"

    centre.current_risk_score = 86.0
    centre.current_risk_level = "CRITICAL"

    # Create preventive intervention
    interv = Intervention(
        id=f"int-pune-sih-{datetime.utcnow().strftime('%H%M%S')}",
        centre_id=centre.id,
        type="TARGETED_PHYSICAL_INSPECTION",
        status="RECOMMENDED",
        recommended_action="Schedule targeted inspection: Verify physical presence of CNC Milling Trainer and validate attendance roster.",
        created_at=datetime.utcnow()
    )
    db.add(interv)
    db.commit()

    event = {
        "event": "DEMO_SCENARIO_STAGE",
        "stage": 2,
        "stage_title": "Missing Sanctioned Equipment Detected",
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "risk_score": 86.0,
        "risk_level": "CRITICAL",
        "missing_assets": ["PUN-CNC-2026-001: Haas VF-2 CNC Milling Trainer"],
        "explainability": [
            "Attendance discrepancy (67.8% headcount shortfall)",
            "Missing sanctioned asset (Haas CNC Milling Trainer)",
            "Repeated low occupancy in active lab hours"
        ],
        "recommendation": "Schedule targeted inspection",
        "intervention_id": interv.id,
        "description": "Missing equipment detected. Risk increased from 72 to 86 (CRITICAL). Recommended: 'Schedule targeted inspection'.",
        "timestamp": datetime.utcnow().isoformat()
    }
    await ws_manager.broadcast(event)

    return {
        "stage": 2,
        "centre_code": centre.centre_code,
        "new_risk_score": 86.0,
        "risk_level": "CRITICAL",
        "explainability": [
            "Attendance discrepancy",
            "Missing sanctioned asset",
            "Repeated low occupancy"
        ],
        "recommendation": "Schedule targeted inspection",
        "intervention_id": interv.id
    }

@router.post("/stage-3-qr-ar-scan")
async def trigger_stage_3_qr_scan(db: Session = Depends(get_db)):
    """
    Stage 3: Officer opens intervention -> scans QR.
    QR confirms: Asset registered.
    AI vision verifies: Asset physically present.
    Maintenance: OVERDUE.
    """
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found")

    cnc = db.query(Asset).filter(Asset.asset_tag == "PUN-CNC-2026-001").first()
    if cnc:
        cnc.status = "VERIFIED_PRESENT"

    # Create verification record with OVERDUE maintenance note
    verif = AssetVerification(
        asset_id=cnc.id if cnc else "asset-pune-cnc-01",
        verification_method="QR_SCAN_AND_AR_SPATIAL",
        latitude=18.5204,
        longitude=73.8567,
        is_verified=True,
        notes="Asset registered in National Registry. AI Vision confirms machine physically present in Lab 1. Notice: Annual calibration and maintenance is OVERDUE (184 days since last service).",
        verified_at=datetime.utcnow()
    )
    db.add(verif)

    # Update latest intervention status to IN_PROGRESS
    latest_int = db.query(Intervention).filter(
        Intervention.centre_id == centre.id
    ).order_by(Intervention.created_at.desc()).first()
    if latest_int:
        latest_int.status = "IN_PROGRESS"
        latest_int.assigned_to_user_id = "usr-insp-pune"

    db.commit()

    event = {
        "event": "DEMO_SCENARIO_STAGE",
        "stage": 3,
        "stage_title": "Field QR Scan & AR Spatial Verification",
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "asset_tag": "PUN-CNC-2026-001",
        "qr_status": "Asset registered: Haas VF-2 CNC Milling Trainer (Serial: HS-99214)",
        "ai_vision_status": "Asset physically present in Lab 1",
        "maintenance_status": "OVERDUE (Service required)",
        "assigned_officer": "Inspector Anand Patil",
        "description": "Officer scanned QR. QR confirms: Asset registered. AI vision verifies: Asset physically present. Maintenance: OVERDUE.",
        "timestamp": datetime.utcnow().isoformat()
    }
    await ws_manager.broadcast(event)

    return {
        "stage": 3,
        "qr_verification": "Asset registered.",
        "ai_vision_verification": "Asset physically present.",
        "maintenance": "OVERDUE",
        "asset_tag": "PUN-CNC-2026-001",
        "message": "QR confirms asset registered. AI vision verifies asset physically present. Maintenance status: OVERDUE."
    }

@router.post("/stage-4-resolve")
async def trigger_stage_4_resolve(db: Session = Depends(get_db)):
    """
    Stage 4: Officer submits evidence -> Intervention status: RESOLVED -> Risk recalculates.
    """
    centre = db.query(TrainingCentre).filter(
        (TrainingCentre.id == DEMO_CENTRE_ID) | (TrainingCentre.centre_code == DEMO_CENTRE_CODE)
    ).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Demo Centre Pune-047 not found")

    # Resolve latest intervention
    latest_int = db.query(Intervention).filter(
        Intervention.centre_id == centre.id
    ).order_by(Intervention.created_at.desc()).first()
    if latest_int:
        latest_int.status = "RESOLVED"
        latest_int.resolved_at = datetime.utcnow()

    # Close anomalies
    db.query(AttendanceAnomaly).filter(AttendanceAnomaly.centre_id == centre.id).update({"status": "RESOLVED"})

    # Recalculate risk score down
    recomputed_risk = 36.0
    centre.current_risk_score = recomputed_risk
    centre.current_risk_level = "MODERATE"
    db.commit()

    event = {
        "event": "DEMO_SCENARIO_STAGE",
        "stage": 4,
        "stage_title": "Inspection Evidence Submitted & Remediation Complete",
        "centre_id": centre.id,
        "centre_code": centre.centre_code,
        "intervention_status": "RESOLVED",
        "new_risk_score": 36.0,
        "risk_level": "MODERATE",
        "description": "Officer submitted evidence report. Intervention marked RESOLVED. Risk recomputed from 86 down to 36.",
        "timestamp": datetime.utcnow().isoformat()
    }
    await ws_manager.broadcast(event)

    return {
        "stage": 4,
        "centre_code": centre.centre_code,
        "intervention_status": "RESOLVED",
        "recomputed_risk_score": 36.0,
        "risk_level": "MODERATE",
        "message": "Officer submitted evidence. Intervention RESOLVED. Risk score recalculated down to 36.0."
    }
