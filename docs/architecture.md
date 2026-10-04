# SKILL-SENTINEL: System Architecture Document
**SIH 2026 Problem Statement 26245**  
**"From Periodic Inspection to Continuous Compliance Intelligence"**

---

## 1. Architectural Overview

SKILL-SENTINEL transitions government training centre compliance from reactive, manual, periodic inspections into an **automated, continuous early-warning intelligence platform**.

### High-Level Topology
```
 [Training Centre Cameras / RTSP]
                │
                ▼
      ┌──────────────────┐
      │   AI-Engine      │ ── (Aggregate YOLO Person Counter + Equipment Detect)
      │  (Edge / Cloud)  │ ── (Privacy Preserving: No Facial Recognition)
      └─────────┬────────┘
                │ Raw Vision Telemetry Events (MQTT / HTTP POST)
                ▼
      ┌────────────────────────────────────────────────────────┐
      │                FastAPI Backend Core                    │
      │  • Ingestion Gateway                                   │
      │  • Attendance Integrity Analyzer                       │
      │  • Continuous Risk Calculation Engine                  │
      │  • Automated Preventive Intervention Generator         │
      │  • WhatsApp Notification Dispatcher                    │
      └───────┬────────────────────────────┬───────────────────┘
              │                            │
              ▼                            ▼
      ┌──────────────────┐       ┌──────────────────┐
      │   PostgreSQL     │       │   Redis Cache    │
      │   + PostGIS      │       │   & Pub/Sub      │
      └──────────────────┘       └─────────┬────────┘
                                           │ WebSocket Realtime Stream
                                           ▼
                                 ┌──────────────────┐
                                 │ React Dashboard  │ (Role-based Views)
                                 │ (Vite + Tailwind)│ SuperAdmin, National,
                                 │                  │ State, District, Officer
                                 └──────────────────┘
```

---

## 2. Real-Time Event Pipeline

```
Camera Stream
   │
   ▼
Vision Processor (Edge/Worker)
   │  Emits: `OCCUPANCY_CHANGED` {centre_id, room_id, count: 12, timestamp}
   ▼
API Gateway (/api/v1/vision/events)
   │
   ▼
Backend Attendance Cross-Referencer
   │  Fetches: `Sanctioned_Batch_Attendance` {reported_count: 28}
   │  Computes: `Discrepancy` = 28 - 12 = 16 (-57.1% phantom presence)
   ▼
Anomaly Engine
   │  Triggers: `ATTENDANCE_ANOMALY` (Severity: HIGH)
   ▼
Continuous Risk Scoring Engine
   │  Recalculates Composite Risk Score (0 - 100):
   │  Score = (0.45 * AttendanceDiscrepancy) + (0.25 * AssetDeficit) + 
   │          (0.15 * HistoricalTrend) + (0.15 * StreamDowntime)
   ▼
Broadcaster & Dispatcher
   ├── WebSocket broadcast to Active Officer Dashboards
   └── WhatsApp Alert dispatched via Twilio/Meta Business API to District Officer
```

---

## 3. Core Component Modules

### 3.1 AI Vision & Intelligence Engine (`/ai-engine`)
- **11-Stage Pipeline**:
  `VIDEO -> OBJECT DETECTION -> OBJECT TRACKING -> AGGREGATE PRESENCE -> ACTIVITY SIGNALS -> ATTENDANCE COMPARISON -> INFRASTRUCTURE VERIFICATION -> DUAL QR CHECK -> ANOMALY DETECTION -> RISK FACTORS -> PREVENTIVE INTERVENTION`
- **Zero Facial Recognition**: Face detection and recognition embeddings are strictly prohibited. Tracks only non-biometric class `person` centroids and bounding boxes.
- **Activity & Kinematics**: Computes kinetic motion energy, stationary vs moving ratio, spatial zone occupancy (Workstations, Podium, Collaboration, Entrance/Exit), and engagement indices.
- **Dual QR + Vision Verification**: Cross-references physical equipment QR scans with active camera vision detection, maintenance due dates, and centre geo-fencing.
- **Longitudinal Temporal Intelligence**: Analyzes 5m, 15m, 1h, 1d, 7d, 30d sliding windows; flags repeated multi-day deviations with a compounding risk multiplier.
- **Configurable 6-Pillar Risk Engine**:
  `Risk = 0.30 Attendance + 0.25 Infrastructure + 0.15 Activity + 0.15 Historical + 0.10 Camera + 0.05 Inspection`
- **Edge-First Low-Bandwidth Mode**: Runs locally on edge NVR / Jetson / mini-PC, streaming lightweight ~1.5 KB JSON packets and uploading privacy-blurred snapshots only during verified anomalies.

### 3.2 Backend Service Layer (`/backend`)
- **Framework**: FastAPI (Python 3.12) with asynchronous non-blocking request pipelines.
- **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL 16 and SQLite fallback for local developer velocity.
- **Authentication**: JWT access & refresh tokens with bcrypt password hashing and strictly enforced RBAC.
- **WebSocket Hub**: Real-time pub/sub manager dispatching telemetry deltas without polling.

### 3.3 Frontend Command Center (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite.
- **Design System**: Dark-mode glassmorphic interface inspired by national aerospace and defense mission control rooms.
- **Data Visualization**: Recharts for comparative state/district compliance curves and risk radars.
- **RBAC Switcher**: Instant multi-persona preview (Super Admin down to Inspection Officer and Centre Admin).

---

## 4. Key Questions Answered by System
1. **"What is happening at this training centre right now?"**
   - Real-time aggregate occupancy, active batch schedules, camera uptime, and current risk index.
2. **"Is reported attendance consistent with observed activity?"**
   - Live visual comparison between biometric portal submissions and AI camera headcount.
3. **"Are sanctioned assets actually present?"**
   - Dynamic QR verification status, missing asset alerts, and inspection audit logs.
4. **"Which centres are becoming risky?"**
   - Early warning rankings highlighting centres crossing moderate (40-69) and critical (70-100) risk thresholds.
5. **"Why is a centre risky?"**
   - Explainable breakdown of risk drivers (e.g. Phantom Attendance: 45 pts, Camera Tampering: 20 pts, Missing Equipment: 15 pts).
6. **"What action should the officer take?"**
   - Automated preventive recommendations (e.g. "Trigger Surprise Physical Inspection", "Issue Show Cause Notice", "Pause Next Subsidy Tranche").
