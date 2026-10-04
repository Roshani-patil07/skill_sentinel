# SKILL-SENTINEL AI Intelligence Layer

**SIH 2026 Problem Statement 26245**  
*"From Periodic Inspection to Continuous Compliance Intelligence"*

---

## 1. Core Mission & Pipeline Architecture

SKILL-SENTINEL replaces superficial, static object detection (`camera -> YOLO -> bounding boxes`) with an end-to-end, multi-stage compliance intelligence pipeline:

```
VIDEO STREAM
     │
     ▼
[1] OBJECT DETECTION (YOLO-Compatible Architecture: person, chair, computer, machine, tool, kiosk)
     │
     ▼
[2] OBJECT TRACKING (Spatial Centroid Kalman/IoU Tracking, Velocity, Dwell Times)
     │
     ▼
[3] AGGREGATE PRESENCE (Non-Biometric Headcount, Room Occupancy, Spatial Zone Partitioning)
     │
     ▼
[4] ACTIVITY SIGNALS (Kinetic Motion Energy, Stationary vs Moving Ratio, Engagement Index)
     │
     ▼
[5] ATTENDANCE COMPARISON (Reported Portal Claims vs Observed Physical Headcount)
     │
     ▼
[6] INFRASTRUCTURE VERIFICATION (Sanctioned Asset Quotas vs Vision-Detected Physical Assets)
     │
     ▼
[7] DUAL QR + VISION CROSS-CHECK (Asset Tag Registration + Geo-Fence + Maintenance Check + Room Vision)
     │
     ▼
[8] ANOMALY DETECTION ENGINE (9 Standard Compliance Deviations with Confidence & Evidence Hash)
     │
     ▼
[9] TEMPORAL INTELLIGENCE (5m, 15m, 1h, 1d, 7d, 30d Windows with Multi-Day Repeat Penalty)
     │
     ▼
[10] EXPLAINABLE RISK SCORING (Configurable 6-Pillar Formula: 0-100 Score with Top Factor Breakdown)
     │
     ▼
[11] PREVENTIVE INTERVENTION (Show-Cause Notices, Subsidies Suspension, Automated WhatsApp Alerts)
```

---

## 2. Component Inventory

| Module | File | Core Functionality |
| :--- | :--- | :--- |
| **Detector** | [`detector.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/detector.py) | YOLO-compatible inference interface returning normalized bounding boxes for `person`, `chair`, `computer`, `machine`, `tool`, `vehicle`, and `biometric_kiosk`. |
| **Tracker** | [`tracker.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/tracker.py) | Multi-target spatial centroid tracker computing velocities, dwell times, and allocating tracks into designated zones (`WORKSTATION_ZONE`, `INSTRUCTOR_PODIUM`, `ENTRANCE_EXIT`, `COLLABORATION_AREA`). |
| **Activity Analyzer** | [`activity_analyzer.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/activity_analyzer.py) | Calculates aggregate presence, density index, kinetic motion energy (optical flow approximation), stationary vs moving count, engagement index, and flags `LOW_ACTIVITY`. |
| **Attendance Analyzer** | [`attendance_analyzer.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/attendance_analyzer.py) | Compares claimed portal logs with vision headcount. Employs non-judgmental wording (`"Potential attendance discrepancy"`), produces SHA-256 evidence hashes. |
| **Infrastructure Verifier**| [`infrastructure_verifier.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/infrastructure_verifier.py) | Compares sanctioned asset counts against detected physical inventory. Computes `asset_presence_rate` (%), `asset_compliance_score`, `missing_asset_count`, and `unknown_asset_count`. |
| **Dual QR Verifier** | [`qr_verifier.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/qr_verifier.py) | Cross-checks physical QR scan against National Asset Registry, geo-fenced centre assignment, maintenance schedules, and cross-references with active room camera detection. |
| **Anomaly Engine** | [`anomaly_engine.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/anomaly_engine.py) | Detects all 9 required anomaly types: `ATTENDANCE_MISMATCH`, `LOW_OCCUPANCY`, `MISSING_ASSET`, `UNEXPECTED_ASSET`, `LOW_ACTIVITY`, `CAMERA_OFFLINE`, `REPEATED_ANOMALY`, `SUDDEN_OCCUPANCY_DROP`, `INFRASTRUCTURE_DEVIATION`. |
| **Temporal Engine** | [`temporal_engine.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/temporal_engine.py) | Multi-window trend analysis (5m, 15m, 1h, 1d, 7d, 30d). Tracks longitudinal repeat failures across consecutive calendar days and applies a compounding risk multiplier (up to 2.0x). |
| **Risk Scorer** | [`risk_scorer.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/risk_scorer.py) | Implements configurable 6-pillar risk scoring: `0.30 Attendance + 0.25 Infrastructure + 0.15 Activity + 0.15 Historical + 0.10 Camera + 0.05 Inspection`. Produces top contributing factors with exact points and timestamps. |
| **Edge Client** | [`edge_client.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/edge_client.py) | Low-bandwidth edge transmission dispatcher supporting `LOCAL`, `EDGE`, and `SERVER` modes. Sends lightweight JSON metadata (~1.5 KB); transmits snapshots with Gaussian blur filter *only* when anomalies trigger. |
| **Scenario Simulator**| [`simulation_scenarios.py`](file:///c:/Users/ASUS/Downloads/project/ai-engine/simulation_scenarios.py) | Zero-hardware simulation mode covering `NORMAL`, `ATTENDANCE_MISMATCH`, `MISSING_ASSET`, `LOW_ACTIVITY`, `REPEATED_ANOMALY`, and `HIGH_RISK`. |

---

## 3. Configurable Multi-Pillar Risk Engine

The system strictly avoids black-box labels. Risk scores are explainable down to the exact point contributions:

$$\text{Composite Risk} = w_{\text{att}} \cdot S_{\text{att}} + w_{\text{inf}} \cdot S_{\text{inf}} + w_{\text{act}} \cdot S_{\text{act}} + w_{\text{hist}} \cdot S_{\text{hist}} + w_{\text{cam}} \cdot S_{\text{cam}} + w_{\text{insp}} \cdot S_{\text{insp}}$$

Default Configured Weights:
- **Attendance Discrepancy**: $0.30$
- **Infrastructure Compliance**: $0.25$
- **Classroom Activity / Engagement**: $0.15$
- **Historical / Longitudinal Anomalies**: $0.15$
- **Camera Device Reliability**: $0.10$
- **Field Inspection Status**: $0.05$

Weights can be overridden at runtime via `POST /api/v1/risk/calculate`.

---

## 4. Privacy & Ethical Standards

1. **Strictly Non-Biometric**: Facial recognition, facial landmarks, and biometric identity matching are physically barred from the code.
2. **Class-Level Detection**: Only class `person` centroids and bounding boxes are computed.
3. **Respectful Regulatory Language**: The engine strictly emits `"Potential attendance discrepancy"` and `"Discrepancy identified"` rather than accusatory or judgmental terms like `"Fraud detected"`.
4. **Bandwidth Optimization**: Under normal compliant operation, video stays at the local edge device. Only a ~1.5 KB JSON telemetry packet is sent to the central cloud.
