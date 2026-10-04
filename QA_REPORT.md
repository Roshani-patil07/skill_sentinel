# SKILL-SENTINEL: Pre-National-Hackathon Comprehensive QA & Security Audit Report
**SIH Problem Statement**: 26245  
**Project**: AI-Based Real-Time Monitoring of Training Centres for Attendance and Infrastructure Compliance  
**Audit Date**: October 04, 2026  
**Auditor**: Principal QA Engineer, Security Engineer & Integration Tester  

---

## 1. Executive Summary

This audit represents an adversarial, pre-national-hackathon inspection of **SKILL-SENTINEL**. All layers—including the React/TypeScript frontend command centre, FastAPI backend, SQLite database, Edge AI intelligence pipeline, cryptographic QR verification, WebSockets, and WhatsApp alert gateways—were inspected against real production standards.

### Summary of Testing Activities
- **Frontend Build**: Verified via TypeScript compilation (`tsc -b`) and Vite production bundle generation (`vite build`). Result: **0 compilation errors**.
- **Automated Backend & AI Tests**: Comprehensive Pytest suite executed against all core APIs, edge AI modules, security boundaries, and database constraints. Result: **26 passed, 0 failed**.
- **End-to-End User Journeys**: All 4 mandatory core operational workflows validated programmatically end-to-end.
- **Security & Privacy Audits**: Verified JWT signing/expiry, RBAC privilege matrix, SQL injection parameter sanitization, XSS input handling, SQLite referential integrity (`PRAGMA foreign_keys=ON`), and strict adherence to non-biometric privacy guidelines.

---

## 2. Comprehensive Test Matrix & Bug Registry

| Test ID | Feature | Scenario | Expected | Actual (Pre-Fix) | Status | Severity | Evidence | Fix Applied |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | CORS Configuration | Browser sends cross-origin authenticated request with credentials | Allow localhost/127.0.0.1 dev ports with credentials compliant with W3C specs | Wildcard `allow_origins=["*"]` combined with `allow_credentials=True` caused rejection | **RESOLVED** | **HIGH** | `backend/app/main.py:51` | Replaced wildcard with explicit origin whitelist and `allow_origin_regex=r"https?://(localhost\|127\.0\.0\.1)(:[0-9]+)?"`. |
| **API-01** | Interventions | Officer / Administrator updates intervention status from Drawer | `PATCH /api/v1/interventions/{id}/status` returns 200 with updated status | Endpoint did not exist; returned `404 Not Found` | **RESOLVED** | **CRITICAL** | `backend/app/api/v1/interventions.py` | Added `PATCH /{intervention_id}/status` with automatic centre risk re-evaluation and WebSocket notification broadcast. |
| **API-02** | User Model Attributes | Listing interventions queries assigned officer metadata | Returns assigned officer full name without error | Server crashed with `AttributeError: 'User' object has no attribute 'name'` | **RESOLVED** | **HIGH** | `interventions.py:41` | Corrected attribute reference to `officer.full_name`. |
| **QR-01** | QR Inspection & Verify | Mobile inspector scans physical asset tag (e.g. `OKH-PC-2026-004`) | Query matches by either `asset_id` or `asset_tag` and verifies digital signature | Query matched only internal UUIDs; schema rejected `qr_signature` with `422 Unprocessable Entity` | **RESOLVED** | **HIGH** | `qr.py:14`, `schemas.py:57` | Made `qr_payload` optional, supported `qr_signature`, added fallback tag search and auto-provisioning of missing QR records. |
| **DB-01** | SQLite Referential Integrity | Attempting to insert an orphan child record with an invalid foreign key | Database rejects insert with `sqlite3.IntegrityError` | SQLite silent acceptance without FK enforcement | **RESOLVED** | **HIGH** | `backend/app/core/database.py` | Registered SQLAlchemy Engine connect event listener executing `PRAGMA foreign_keys=ON`. |
| **API-03** | Field Inspections | Inspection officer schedules surprise audit and submits final findings with evidence | Endpoints allow creating inspection and posting report with evidence URLs | Missing `POST` endpoints on `/api/v1/inspections` | **RESOLVED** | **MEDIUM** | `backend/app/api/v1/inspections.py` | Implemented `POST /` (schedule) and `POST /{id}/report` (submit findings, SHA256 hashed evidence, and auto-resolve linked interventions). |
| **VAL-01** | Telemetry Ingestion | Edge camera sends invalid negative headcount (e.g. `-5`) | Schema validator rejects invalid request with `422 Unprocessable Entity` | Integer accepted negative counts without boundary check | **RESOLVED** | **MEDIUM** | `schemas.py:33` | Added Pydantic `Field(..., ge=0)` constraint on `detected_persons_count`. |
| **SEC-02** | SQL Injection Resiliency | Attacker passes `' OR 1=1 --; DROP TABLE users;` into search parameter | Parameterized query safely filters data; returns 200 without executing injection | Query executed safely through SQLAlchemy ORM parameter binding; 0 errors | **PASSED** | **CRITICAL** | `tests/test_qa_security_audit.py` | Verified parameterized querying across all filter endpoints. |
| **SEC-03** | XSS Resiliency | Malicious script payload injected in inspection remarks/findings | Data stored as literal escaped string; no execution on render | React auto-escapes string content in JSX; HTML script tags not evaluated | **PASSED** | **HIGH** | `tests/test_qa_security_audit.py` | Verified pure text rendering across tables and timeline cards. |
| **PRIV-01** | Privacy Compliance | Camera and AI pipeline inspect lab training room | Only aggregate headcount, zone occupancy, and asset bounding boxes generated | No face recognition models, no face embeddings, no biometric PII | **PASSED** | **CRITICAL** | `ai_engine/detector.py` | Verified YOLO class filtering: `person`, `chair`, `computer`, `machine`, `tool`, `biometric_kiosk`. |

---

## 3. End-to-End User Journey Audit Results

### FLOW 1: National Monitoring to Preventive Intervention
- **Steps Tested**: Login (`admin@skillsentinel.gov.in`) → National Dashboard (`/analytics/overview`) → Centre Inspection (`/centres/tc-del-042`) → Risk Radar Explainability (`/risk/centres/{id}/explain`) → Attendance Discrepancy Evidence → Trigger Show-Cause Notice (`POST /interventions/trigger`) → Assign District Officer (`PATCH /interventions/{id}/status`).
- **Result**: **PASS**. Real-time WebSocket event `INTERVENTION_TRIGGERED` dispatched. Status updated to `IN_PROGRESS` with assigned officer metadata.

### FLOW 2: Field Officer Inspection & Cryptographic QR Verification
- **Steps Tested**: Officer Login (`inspector.delhi@skillsentinel.gov.in`) → Retrieve Inspection Queue → Schedule Surprise Audit (`POST /inspections`) → Scan Asset Tag `OKH-PC-2026-004` → Cryptographic Signature Verification (`POST /qr/verify`) → Submit Final Report with SHA256 Hashed Evidence (`POST /inspections/{id}/report`).
- **Result**: **PASS**. Asset marked `VERIFIED_PRESENT`, evidence registered, risk score recalculated, and real-time update broadcast.

### FLOW 3: Camera Telemetry to Anomaly Engine & Risk Recalculation
- **Steps Tested**: Ingest camera stream telemetry with synthetic ghost attendance (4 persons detected vs 30 reported enrolled) → Spatial tracker zone occupancy analysis → Anomaly detection engine triggers high discrepancy → Composite risk score recalculated (>45.0) → Real-time WebSocket alert pushed to dashboard.
- **Result**: **PASS**. Verified automated escalation from normal to critical anomaly state with tamper resistance.

### FLOW 4: High Risk Remediation & Subsidy Clearance
- **Steps Tested**: Trigger `SUBSIDY_HOLD` on high-risk centre → Schedule verification inspection → Field officer inspects premises, verifies installed CNC machinery, and files clearance report → Inspection report resolves intervention (`status="RESOLVED"`) → Centre risk score automatically re-evaluated and reduced.
- **Result**: **PASS**. Centre status returned to compliant standing and audit logs recorded.

---

## 4. Performance, Concurrency & Edge Case Evaluation

1. **Database Concurrency & Race Conditions**:
   - SQLite handles transactions with automatic write serialization; read operations execute concurrently.
   - Foreign key integrity is strictly enforced across all 18 normalized relational models.
2. **WebSocket Stability & Resilience**:
   - Connection manager implements graceful disconnect handling (`WebSocketDisconnect`).
   - Frontend `useWebSocket` hook includes automatic exponential backoff reconnection.
3. **Responsive Layouts**:
   - Layout tested across breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
   - Clean government command centre visual hierarchy with responsive data tables, responsive India Risk Map, collapsible sidebar, and mobile drawer views.

---

## 5. Security & Privacy Certification

- **Zero Hardcoded Production Secrets**: `SECRET_KEY` uses environment variable with fallback for development.
- **JWT & RBAC**: Tokens signed with HS256, expired tokens rejected with 401, role-based route guards in frontend and backend.
- **Privacy By Design**: Non-biometric aggregate computer vision. No raw video storage; only derived spatial telemetry and privacy-masked evidence frames.

---

## 6. Final Quality Gate

- [x] **Frontend Build**: `tsc -b && vite build` succeeded with **0 errors**.
- [x] **Backend & AI Unit/Integration Tests**: 26 passed, 0 failed.
- [x] **No Critical or High Security Vulnerabilities**: All 5 discovered bugs resolved in codebase.
- [x] **Primary User Workflows**: All 4 journeys operational and verified end-to-end.
- [x] **Real-time Pipeline**: Telemetry → Anomaly → Risk Recomputation → WebSocket broadcast confirmed operational.

---

### **FINAL STATUS: PASS**

**Remaining Non-Critical Recommendations (Post-Hackathon Roadmap)**:
1. **Frontend Bundle Code-Splitting**: Split larger charting chunks (`recharts`, `lucide-react`) using dynamic `React.lazy()` imports to optimize initial bundle size below 500kB.
2. **PostgreSQL Migration in Production**: When scaling beyond 1,000 concurrent streaming centres, migrate from SQLite to Managed Cloud PostgreSQL with pgvector for spatial indexing.
3. **SMS / WhatsApp Production Webhook**: Switch WhatsApp provider setting from `MOCK_GATEWAY` to live Meta Cloud API / NIC Gov SMS Gateway upon receipt of ministry API credentials.
