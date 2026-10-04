# SKILL-SENTINEL: Versioned REST & WebSocket API Specification

Base URL: `/api/v1`

---

## 1. Authentication & RBAC (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Body**: `{ "email": "officer@skillsentinel.gov.in", "password": "securePassword123" }`
- **Response 200**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "refresh_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": "u-01",
      "email": "officer@skillsentinel.gov.in",
      "full_name": "Dr. Rajesh Sharma",
      "role": "NATIONAL_OFFICER",
      "permissions": ["view:national_dashboard", "trigger:interventions"]
    }
  }
  ```

### `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response 200**: Current user profile, role, and jurisdiction assignments.

---

## 2. Centres & Geographies (`/api/v1/centres`)

### `GET /api/v1/centres`
- **Query Params**: `state_id`, `district_id`, `risk_level`, `search`, `page`, `limit`
- **Response 200**: Paginated list of training centres with live metrics, current risk score, active cameras, and batch counts.

### `GET /api/v1/centres/{centre_id}`
- **Response 200**: Complete deep dive of training centre:
  - Live occupancy and camera status
  - Active batches and timetable
  - Verified vs sanctioned equipment count
  - Historical risk timeline
  - Open interventions and pending inspections

---

## 3. Attendance & Integrity Analysis (`/api/v1/attendance`)

### `GET /api/v1/attendance/discrepancies`
- **Query Params**: `centre_id`, `date`, `severity`
- **Response 200**:
  ```json
  [
    {
      "batch_id": "b-102",
      "batch_name": "IoT Technician Morning",
      "centre_id": "tc-del-01",
      "sanctioned_strength": 30,
      "biometric_reported": 28,
      "vision_observed_headcount": 12,
      "discrepancy_count": -16,
      "discrepancy_percentage": -57.1,
      "anomaly_severity": "CRITICAL",
      "detected_at": "2026-10-04T10:15:00Z"
    }
  ]
  ```

### `POST /api/v1/attendance/submit`
- Used by Centre Admins to submit daily attendance logs (cross-verified automatically against vision telemetry).

---

## 4. Vision Telemetry & Edge Events (`/api/v1/vision`)

### `POST /api/v1/vision/events`
- **Payload**:
  ```json
  {
    "camera_id": "cam-101",
    "centre_id": "tc-del-01",
    "room_id": "lab-01",
    "timestamp": "2026-10-04T10:20:00Z",
    "detected_persons_count": 14,
    "confidence_average": 0.94,
    "bounding_boxes_summary": {
      "cluster_density": "MODERATE",
      "active_workstations": 12
    }
  }
  ```
- **Response 202**: `{ "status": "INGESTED", "anomaly_triggered": true, "recomputed_risk": 74.2 }`

### `POST /api/v1/vision/process`
- Full-pipeline video analysis endpoint: executes detection, tracking, activity kinematics, infrastructure check, attendance comparison, anomaly evaluation, and real-time WebSocket broadcast.
- **Payload**: `{ "centre_id": "tc-del-042", "camera_id": "CAM-01", "room_id": "ROOM-101", "synthetic_scenario": "ATTENDANCE_MISMATCH" }`

### `GET /api/v1/vision/occupancy`
- Real-time room occupancy, density index, and spatial zone breakdown (`WORKSTATION_ZONE`, `INSTRUCTOR_PODIUM`, `ENTRANCE_EXIT`, `COLLABORATION_AREA`).

### `GET /api/v1/vision/assets`
- Returns sanctioned equipment requirements vs vision detected equipment, presence rate %, and missing/unknown count.

### `GET /api/v1/vision/anomalies`
- Returns explainable anomalies across 9 types with confidence scores, severity, evidence hashes, and timestamps.

---

## 5. Assets & Dual QR Verification (`/api/v1/assets`, `/api/v1/qr`)

### `GET /api/v1/assets`
- List assets with verification state (`VERIFIED_PRESENT`, `MISSING`, `TAMPERED`).

### `POST /api/v1/qr/verify`
- Dual QR + Vision verification: checks registration in National Registry, centre geo-fence, overdue maintenance, and room camera vision match.

---

## 6. Risk Scoring & Predictive Intelligence (`/api/v1/risk`)

### `POST /api/v1/risk/calculate`
- Computes explainable composite risk score (0-100) using configurable 6-pillar weights:
  `Risk = 0.30 Attendance + 0.25 Infrastructure + 0.15 Activity + 0.15 Historical + 0.10 Camera + 0.05 Inspection`
- Returns ranked top 4 contributing factors with exact points and evidence timestamps.

### `GET /api/v1/risk/history`
- Returns 7-day longitudinal history and repeated multi-day anomaly pattern analysis with risk multipliers.

### `GET /api/v1/risk/radar`
- Returns national/state level risk distribution (Low, Moderate, High, Critical).

### `GET /api/v1/risk/centres/{centre_id}/explain`
- Explainable AI breakdown with plain-language findings, factor weights, and targeted preventive interventions.

---

## 7. Interventions & WhatsApp Dispatch (`/api/v1/interventions`)

### `POST /api/v1/interventions/trigger`
- Trigger action: `SURPRISE_INSPECTION`, `SHOW_CAUSE_NOTICE`, `SUBSIDY_HOLD`.
- Optionally sends immediate WhatsApp alert to the designated District Officer.

---

## 8. Real-Time WebSocket (`/api/v1/ws`)

### `ws://localhost:8000/api/v1/ws?token=<jwt_token>`
- Server pushes live events:
  - `PERSON_COUNT_CHANGED`
  - `ANOMALY_DETECTED`
  - `RISK_SCORE_UPDATED`
  - `INTERVENTION_TRIGGERED`
  - `QR_ASSET_VERIFIED`
