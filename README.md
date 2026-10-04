# SKILL-SENTINEL

> **SIH 2026 Problem Statement 26245**  
> **Title:** AI-Based Real-Time Monitoring of Training Centres for Attendance and Infrastructure Compliance  
> **Tagline:** *"From Periodic Inspection to Continuous Compliance Intelligence."*

---

## 🌟 Executive Overview

**SKILL-SENTINEL** transforms vocational and skill development training centre audits from vulnerable, periodic human inspections into a continuous, real-time AI compliance and early-warning intelligence grid. 

Designed specifically for schemes such as **PMKVY (Pradhan Mantri Kaushal Vikas Yojana)**, **DDU-GKY**, and State Skill Development Missions, SKILL-SENTINEL continuously cross-verifies:
1. **Attendance Integrity**: Compares registered biometrics/claims against real-time AI aggregate headcounts to eliminate ghost trainees and proxy attendance.
2. **Infrastructure Compliance**: Verifies mandatory laboratory machines, computers, biometric kiosks, and safety equipment using CCTV spatial detection and tamper-evident cryptographic QR/AR field audits.
3. **Evidence-Backed Dynamic Risk Scoring**: Generates explainable 0–100 risk scores with automatic targeted inspection dispatch, instant WhatsApp compliance alerts, and immutable audit trails.
4. **Privacy-Preserving Edge Architecture**: Strictly **non-biometric**—no individual facial recognition databases or personal biometric vectors are stored, guaranteeing full DPDP Act 2023 compliance.

---

## 🏛️ System Architecture

```
                                  [ CCTV / IP Cameras ]
                                            │
                                            ▼
                             [ Edge AI Inference / Fallback ]
                       (YOLOv8 Class Detection + ByteTrack + Headcount)
                                            │
                                  JSON Telemetry Stream
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SKILL-SENTINEL CORE                             │
│                                                                             │
│  FastAPI Production Engine  ◄──►  Redis State Cache  ◄──►  PostgreSQL DB     │
│   ├── Anomaly Engine              ├── Realtime Pub/Sub     ├── 120 Centres  │
│   ├── Dynamic Risk Scorer (0-100) └── Heartbeat Monitor    ├── Assets & QR  │
│   ├── WhatsApp Alerts (Twilio/Mock)                        └── Audit Logs   │
│   └── WebSocket Broadcaster (Push Telemetry)                                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         Secure WebSockets & HTTPS REST
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NATIONAL COMMAND & MOBILE AUDIT UI                       │
│                                                                             │
│   National Grid Dashboard  ───  Live Video Telemetry  ───  Risk Radar       │
│   Field QR/AR Verification  ─── WhatsApp Audit Stream  ─── 5-Min SIH Runner │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.11+**
- **Node.js 20+ & npm**
- *(Optional)* Docker & Docker Compose

### 1. Clone & Setup Environment
```bash
# Copy environment configuration
cp .env.example .env
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv backend/venv
# Windows:
backend\venv\Scripts\activate
# Linux/macOS:
source backend/venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with 120 realistic centres (103 Healthy, 11 Watchlist, 4 High Risk, 2 Critical)
python scripts/seed.py

# Launch the FastAPI production server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```
- **API Health:** `http://127.0.0.1:8001/health`
- **Readiness:** `http://127.0.0.1:8001/ready`
- **Metrics:** `http://127.0.0.1:8001/metrics`
- **Interactive Swagger Docs:** `http://127.0.0.1:8001/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open browser at: **`http://localhost:5173`**

---

## 🐳 Docker Deployment

To launch the complete containerized stack (PostgreSQL, Redis, Backend, and Frontend):
```bash
docker compose up --build -d
```
- **Frontend App:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **Postgres:** `localhost:5432`
- **Redis:** `localhost:6379`

---

## 🎯 5-Minute SIH Demo Flow

A dedicated demonstration controller is embedded directly at the top of the interface:

1. **National Baseline:**  
   National dashboard displays **120 centres**: **103 Healthy**, **11 Watchlist**, **4 High Risk**, **2 Critical**. Centre **Pune-047** starts in Watchlist at **Risk = 54.0**.
2. **Stage 1 (AI Attendance Mismatch):**  
   AI vision registers 9 persons in lab vs 28 claimed in biometric portal. Risk recalculates to **72.0 (High Risk)**.
3. **Stage 2 (Missing Asset & Explainability):**  
   Sanctioned CNC Lathe missing from workstation camera. Risk escalates to **86.0 (Critical)**. System recommends: *"Schedule targeted inspection"*.
4. **Stage 3 (Field Officer QR/AR Inspection):**  
   Officer scans asset QR `PUN-CNC-2026-001`. AI confirms physical presence in toolroom; flags maintenance as **OVERDUE**.
5. **Stage 4 (Evidence & Resolution):**  
   Officer uploads calibration certificate. Intervention marked **RESOLVED**. Risk score drops to **36.0 (Healthy)**.

---

## 👥 Demo Credentials & Roles

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@sentinel.gov.in` | `Admin@12345` | Complete national authority, configuration, users |
| **National Officer** | `national@sentinel.gov.in` | `Officer@12345` | All 10 states, national radar, state comparisons |
| **State Officer (MH)**| `maharashtra.officer@sentinel.gov.in` | `Officer@12345` | Maharashtra centres (Pune, Mumbai, Nagpur) |
| **District Officer** | `pune.officer@sentinel.gov.in` | `Officer@12345` | Pune precision & automotive clusters |
| **Inspection Officer**| `inspector.patil@sentinel.gov.in` | `Officer@12345` | Field audit execution, QR/AR scanning, evidence upload |
| **Centre Admin** | `admin.pune047@pmkk.edu.in` | `Officer@12345` | Pune-047 internal telemetry and batch rosters |

---

## 📚 Documentation Index

- [ARCHITECTURE.md](ARCHITECTURE.md) - Deep architectural patterns, data pipelines, and telemetry contracts
- [DEPLOYMENT.md](DEPLOYMENT.md) - Cloud deployment runbook (Vercel, Render, Fly.io, AWS, Docker)
- [API.md](API.md) - Full REST and WebSocket API specifications
- [DATABASE.md](DATABASE.md) - Schema, relational integrity, migrations, and indexing strategy
- [AI.md](AI.md) - Computer vision pipelines, ByteTrack, spatial counting, and CPU fallbacks
- [PRIVACY.md](PRIVACY.md) - Non-biometric design principles and DPDP Act 2023 compliance
- [SECURITY.md](SECURITY.md) - RBAC matrices, HMAC QR verification, rate limiting, and audit logging
- [TESTING.md](TESTING.md) - 26 automated tests, edge scenarios, and regression test suites
- [DEMO.md](DEMO.md) - Step-by-step judge presentation script with backup fallbacks
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Operations, recovery, and diagnosis runbook
