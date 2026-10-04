# SKILL-SENTINEL: Complete API Reference

All endpoints are prefixed with `/api/v1` except system probes `/health`, `/ready`, and `/metrics`.

---

## 1. System Probes & Observability

### `GET /health`
Liveness probe for orchestration platforms (Kubernetes / Render / AWS ECS).
- **Response**:
```json
{
  "status": "HEALTHY",
  "app": "SKILL-SENTINEL",
  "version": "1.0.0",
  "timestamp": "2026-10-04T12:00:00.000Z"
}
```

### `GET /ready`
Readiness probe verifying database connectivity and active WebSocket pool.
- **Response**:
```json
{
  "status": "READY",
  "database": "CONNECTED",
  "database_type": "sqlite",
  "active_websockets": 2,
  "uptime_seconds": 124.5,
  "version": "1.0.0"
}
```

### `GET /metrics`
Operational metrics tracking latency, request volume, error rates, and connection count.
- **Response**:
```json
{
  "app": "SKILL-SENTINEL",
  "environment": "development",
  "uptime_seconds": 124.5,
  "requests_total": 42,
  "errors_total": 0,
  "average_api_latency_ms": 1.25,
  "active_websocket_connections": 2,
  "whatsapp_gateway_status": "MOCK_GATEWAY"
}
```

---

## 2. Authentication & RBAC

### `POST /api/v1/auth/login`
- **Request**:
```json
{
  "email": "national@sentinel.gov.in",
  "password": "Officer@12345"
}
```
- **Response**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "usr-002",
    "name": "Dr. Sunita Sharma",
    "role": "NATIONAL_OFFICER"
  }
}
```

---

## 3. Training Centres & National Grid

### `GET /api/v1/centres`
Returns all registered centres across the 10 states and 30 districts with current risk scores.
- **Query params**: `state_id` (optional), `district_id` (optional), `risk_level` (optional).

### `GET /api/v1/centres/{centre_id}`
Returns granular telemetry for a specific training centre including active cameras, assigned batches, and asset inventory.

---

## 4. SIH 2026 5-Minute Demonstration Controller

### `GET /api/v1/demo/status`
Returns current compliance and risk state of demo centre **Pune-047**.

### `POST /api/v1/demo/reset`
Resets Centre Pune-047 back to baseline state: **Risk = 54.0 (Watchlist)**.

### `POST /api/v1/demo/stage-1-attendance`
Simulates AI attendance mismatch (28 claimed vs 9 observed). Escalates risk to **72.0 (High Risk)** and broadcasts WebSocket event.

### `POST /api/v1/demo/stage-2-missing-asset`
Simulates missing sanctioned CNC trainer. Escalates risk to **86.0 (Critical)**, sets recommendation to *"Schedule targeted inspection"*, and opens intervention.

### `POST /api/v1/demo/stage-3-qr-ar-scan`
Simulates officer field QR scan of `PUN-CNC-2026-001`. Confirms registered asset, verifies physical presence in toolroom, and flags maintenance as **OVERDUE**.

### `POST /api/v1/demo/stage-4-resolve`
Submits calibration proof. Marks intervention **RESOLVED**. Recalculates risk score down to **36.0 (Healthy)**.

---

## 5. Risk Intelligence & Explainability

### `GET /api/v1/risk/centres/{centre_id}/explain`
Returns transparent breakdown of the 4 risk pillars with exact point deductions and actionable recommendations.

### `GET /api/v1/risk/radar`
Returns comparative risk distribution, highest-risk state rankings, and national compliance score.

---

## 6. Field Inspection, QR & AR Verification

### `POST /api/v1/qr/verify`
- **Request**:
```json
{
  "centre_id": "tc-pune-047",
  "qr_payload": "SENTINEL-PUN-CNC-2026-001-HMAC8f7b",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```
- **Response**:
```json
{
  "verified": true,
  "asset_id": "ast-pune-001",
  "asset_name": "CNC Machining Trainer 3-Axis",
  "maintenance_status": "OVERDUE",
  "tampering_detected": false
}
```

---

## 7. Realtime WebSocket Stream

### `ws://<host>:<port>/api/v1/ws`
- **Heartbeat**: Send `"ping"` every 25s, receives `{"event": "pong"}`.
- **Broadcast Events**:
  - `{"event": "RISK_UPDATED", "centre_id": "tc-pune-047", "new_risk_score": 72.0, "risk_level": "HIGH"}`
  - `{"event": "ANOMALY_DETECTED", "type": "ATTENDANCE_MISMATCH", "severity": "WARNING"}`
  - `{"event": "INTERVENTION_RESOLVED", "centre_id": "tc-pune-047", "new_risk_score": 36.0}`
