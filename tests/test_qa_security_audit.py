import os
import sys
import pytest
from datetime import datetime
from httpx import ASGITransport, AsyncClient
from sqlalchemy.exc import IntegrityError
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.entities import (
    User, TrainingCentre, Asset, Intervention, Inspection, QRCode,
    InspectionEvidence, AttendanceAnomaly
)

@pytest.mark.anyio
async def test_flow_1_login_to_intervention():
    """
    FLOW 1: Login -> Dashboard -> Centre -> Risk -> Evidence -> Intervention -> Assign Officer
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login with seeded credentials
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "admin@skillsentinel.gov.in",
            "password": "password123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Dashboard / Analytics Overview
        dash_res = await client.get("/api/v1/analytics/overview", headers=headers)
        assert dash_res.status_code == 200
        overview = dash_res.json()
        assert "national_compliance_index" in overview
        assert overview["total_monitored_centres"] >= 1

        # 3. Centre Details
        centre_res = await client.get("/api/v1/centres/tc-del-042", headers=headers)
        assert centre_res.status_code == 200
        centre = centre_res.json()
        assert centre["centre_code"] in ["TC-DEL-042", "DEL-OKH-042"]


        # 4. Risk Radar & Factors
        risk_res = await client.get("/api/v1/risk/centres/tc-del-042/explain", headers=headers)
        assert risk_res.status_code == 200
        risk_data = risk_res.json()
        assert "factors" in risk_data
        assert "current_risk_score" in risk_data

        # 5. Evidence Verification
        anom_res = await client.get("/api/v1/attendance/discrepancies", headers=headers)
        assert anom_res.status_code == 200

        # 6. Trigger Preventive Intervention
        trigger_res = await client.post("/api/v1/interventions/trigger", json={
            "centre_id": "tc-del-042",
            "type": "SHOW_CAUSE_NOTICE",
            "recommended_action": "Explain persistent ghost attendance anomalies observed over past 48 hours.",
            "send_whatsapp": True,
            "officer_phone": "+91-9811554433"
        }, headers=headers)
        assert trigger_res.status_code == 200
        it_data = trigger_res.json()
        it_id = it_data["intervention_id"]
        assert it_data["status"] == "ISSUED"

        # 7. Update / Assign Officer
        patch_res = await client.patch(f"/api/v1/interventions/{it_id}/status", json={
            "status": "IN_PROGRESS",
            "assigned_to_user_id": "usr-insp-delhi",
            "notes": "District Inspection Officer assigned to conduct physical validation."
        }, headers=headers)
        assert patch_res.status_code == 200
        assert patch_res.json()["current_status"] == "IN_PROGRESS"

@pytest.mark.anyio
async def test_flow_2_officer_inspection_and_qr_verification():
    """
    FLOW 2: Officer Login -> Inspection -> QR Scan -> Asset Verification -> Evidence -> Submit Report
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Officer Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "inspector.delhi@skillsentinel.gov.in",
            "password": "password123"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. View Inspection Queue
        insp_list_res = await client.get("/api/v1/inspections", headers=headers)
        assert insp_list_res.status_code == 200

        # Schedule or find inspection
        create_insp_res = await client.post("/api/v1/inspections", json={
            "centre_id": "tc-del-042",
            "inspection_type": "SURPRISE_AUDIT",
            "officer_findings": "Initial dispatch to verify lab equipment inventory."
        }, headers=headers)
        assert create_insp_res.status_code == 200
        insp_id = create_insp_res.json()["id"]

        # 3. QR Scan & Asset Cryptographic Verification (Using Asset Tag)
        qr_verify_res = await client.post("/api/v1/qr/verify", json={
            "asset_id": "OKH-PC-2026-004",
            "qr_signature": "SIG-OKH-PC-2026-004-VERIFIED-HASH",
            "latitude": 28.5355,
            "longitude": 77.2750,
            "inspection_id": insp_id,
            "notes": "Verified Dell workstation operational in Lab 1."
        }, headers=headers)
        assert qr_verify_res.status_code == 200
        qr_data = qr_verify_res.json()
        assert qr_data["verified"] is True
        assert qr_data["status"] == "VERIFIED_PRESENT"
        assert "new_centre_risk" in qr_data

        # 4. Submit Inspection Report with Masked Evidence
        report_res = await client.post(f"/api/v1/inspections/{insp_id}/report", json={
            "officer_findings": "Physical verification completed. 20 workstations present and operational. No unauthorized equipment detected.",
            "status": "COMPLETED",
            "evidence_urls": [
                "https://storage.skill-sentinel.gov.in/evidence/del042/lab1_masked_audit_01.jpg",
                "https://storage.skill-sentinel.gov.in/evidence/del042/qr_pc04_verified.jpg"
            ]
        }, headers=headers)
        assert report_res.status_code == 200
        report_data = report_res.json()
        assert report_data["inspection_status"] == "COMPLETED"
        assert report_data["evidence_saved_count"] == 2

@pytest.mark.anyio
async def test_flow_3_camera_telemetry_to_anomaly_and_risk():
    """
    FLOW 3: Camera Event -> AI Detection -> Anomaly -> Risk Update -> WebSocket Alert
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Send synthetic telemetry with ghost attendance (e.g. 4 persons detected when 30 reported)
        res = await client.post(
            "/api/v1/vision/process?centre_id=tc-del-042&synthetic_scenario=GHOST_ATTENDANCE"
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "PROCESSED"
        assert data["presence_telemetry"]["person_count"] == 4
        assert len(data["anomalies"]) >= 1
        assert data["recomputed_risk_score"] >= 30.0


@pytest.mark.anyio
async def test_flow_4_high_risk_resolution_workflow():
    """
    FLOW 4: High Risk -> Intervention -> Officer Assignment -> Inspection -> Resolution -> Risk Recalculation
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Trigger high-risk intervention
        it_res = await client.post("/api/v1/interventions/trigger", json={
            "centre_id": "tc-del-042",
            "type": "SUBSIDY_HOLD",
            "recommended_action": "Freeze upcoming disbursement until equipment shortfall rectified.",
            "send_whatsapp": False
        })
        assert it_res.status_code == 200
        it_id = it_res.json()["intervention_id"]

        # 2. Schedule Inspection linked to this intervention
        insp_res = await client.post("/api/v1/inspections", json={
            "centre_id": "tc-del-042",
            "intervention_id": it_id,
            "inspection_type": "SUBSIDY_CLEARANCE_AUDIT",
            "officer_findings": "Verification of equipment procurement receipts and lab installation."
        })
        assert insp_res.status_code == 200
        insp_id = insp_res.json()["id"]

        # 3. Complete Inspection Report -> Automatically resolves intervention & recomputes risk
        report_res = await client.post(f"/api/v1/inspections/{insp_id}/report", json={
            "officer_findings": "All required CNC machinery and workstations installed and operational. Subsidy hold cleared.",
            "status": "COMPLETED",
            "evidence_urls": ["https://storage.skill-sentinel.gov.in/evidence/del042/clearance_proof.jpg"]
        })
        assert report_res.status_code == 200

        # 4. Verify intervention is now marked RESOLVED
        list_it_res = await client.get("/api/v1/interventions?centre_id=tc-del-042")
        assert list_it_res.status_code == 200
        interventions = list_it_res.json()
        target_it = next((x for x in interventions if x["id"] == it_id), None)
        assert target_it is not None
        assert target_it["status"] == "RESOLVED"

@pytest.mark.anyio
async def test_api_status_codes_and_validation():
    """
    API TESTING: 400, 401, 403, 404, 422 handling
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 401 Unauthorized: Invalid credentials
        res_401 = await client.post("/api/v1/auth/login", json={
            "email": "invalid.user@gov.in",
            "password": "WrongPassword999!"
        })
        assert res_401.status_code == 401

        # 404 Not Found: Non-existent Centre
        res_404 = await client.get("/api/v1/centres/non-existent-centre-id-99999")
        assert res_404.status_code == 404

        # 404 Not Found: Non-existent Asset in QR verify
        res_asset_404 = await client.post("/api/v1/qr/verify", json={
            "asset_id": "GHOST-ASSET-NON-EXISTENT",
            "digital_signature": "TEST-SIG"
        })
        assert res_asset_404.status_code == 404

        # 422 Unprocessable Entity: Negative person count
        res_422 = await client.post("/api/v1/vision/events", json={
            "camera_id": "CAM-01",
            "centre_id": "tc-del-042",
            "room_id": "ROOM-101",
            "detected_persons_count": -5 # Invalid negative count
        })
        assert res_422.status_code == 422

        # 422 Unprocessable Entity: Malformed email in login
        res_bad_email = await client.post("/api/v1/auth/login", json={
            "email": "not-an-email",
            "password": "Password123!"
        })
        assert res_bad_email.status_code == 422

@pytest.mark.anyio
async def test_security_injection_sanitization():
    """
    SECURITY TEST: SQL Injection & XSS string resiliency
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # SQL Injection attempt in search param
        sql_payload = "' OR 1=1 --; DROP TABLE users;"
        res_sqli = await client.get(f"/api/v1/centres?search={sql_payload}")
        # Must return clean 200 with filtered results or 0 results, never 500
        assert res_sqli.status_code == 200

        # XSS attempt in remarks / findings
        xss_payload = "<script>alert('XSS_BREACH')</script><img src=x onerror=alert(1)>"
        res_xss = await client.post("/api/v1/inspections", json={
            "centre_id": "tc-del-042",
            "inspection_type": "SURPRISE_AUDIT",
            "officer_findings": xss_payload
        })
        assert res_xss.status_code == 200
        insp_id = res_xss.json()["id"]

        # Fetch and verify safely stored as text without executing
        list_res = await client.get("/api/v1/inspections")
        assert list_res.status_code == 200
        item = next((i for i in list_res.json() if i["id"] == insp_id), None)
        assert item is not None
        assert xss_payload in item["findings"]

def test_database_foreign_key_enforcement():
    """
    DATABASE TEST: Verify SQLite PRAGMA foreign_keys=ON rejects orphan records
    """
    db = SessionLocal()
    try:
        # Attempt to insert an Asset linked to a non-existent training centre
        orphan_asset = Asset(
            id="orphan-test-999",
            centre_id="tc-completely-invalid-fk-id",
            category_id="cat-invalid-999",
            asset_tag="FAKE-TAG-999",
            status="MISSING"
        )
        db.add(orphan_asset)
        with pytest.raises(IntegrityError):
            db.commit()
    finally:
        db.rollback()
        db.close()


def test_privacy_non_biometric_guarantee():
    """
    PRIVACY TEST: Ensure architecture prohibits individual facial recognition vectors
    """
    from ai_engine.detector import YOLODetector
    detector = YOLODetector()
    detections = detector.detect()
    # Confirm detections contain only bounding boxes, aggregate categories, and counts
    for det in detections:
        assert det.class_name in ["person", "chair", "computer", "machine", "tool", "biometric_kiosk"]
        # Ensure no facial embedding, biometric template, or individual identity data
        assert not hasattr(det, "facial_embedding")
        assert not hasattr(det, "biometric_template")
        assert not hasattr(det, "face_id")
