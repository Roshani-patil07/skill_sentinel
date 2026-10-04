# SKILL-SENTINEL Privacy by Design Architecture

## Executive Summary
**SKILL-SENTINEL** ("From Periodic Inspection to Continuous Compliance Intelligence") is engineered strictly as an **aggregate intelligence platform**, not a surveillance or mass facial-recognition system. Its mission under SIH 2026 Problem Statement 26245 is to monitor government-funded skill development training centres for attendance integrity and infrastructure compliance while actively protecting the constitutional privacy rights of students, trainees, and staff.

---

## 1. Core Architectural Privacy Principles

### 1.1 Non-Identifiable Aggregate Presence (Zero Facial Identification)
- **Principle**: The system computes **headcounts and spatial density**, never individual facial identity.
- **Implementation**:
  - Edge/Vision pipeline uses YOLO-based bounding box detection specifically for the class `person`.
  - Facial features, biometric landmarks, or facial embeddings are **neither extracted, processed, nor stored**.
  - Bounding boxes are tagged with ephemeral integer tracking IDs (e.g. `Tracker #12`) solely for multi-frame deduplication and dwell-time calculation within a 60-second temporal sliding window.

### 1.2 Ephemeral Video Streams & Edge Processing
- **Principle**: Raw continuous CCTV video streams are processed at or near the edge and **never stored in persistent cloud archives**.
- **Implementation**:
  - Live RTSP/WebRTC feeds remain strictly inside memory buffers during inference.
  - Video frames are discarded immediately after computing spatial metadata (`occupancy_count`, `centroid_x`, `centroid_y`, `confidence`).
  - Network bandwidth requirements are reduced by 99% because only structured telemetry JSON events (`vision_events`) are dispatched upstream.

### 1.3 Event-Based Evidence Capture (Privacy Masking)
- **Principle**: Visual evidence is captured **only when a validated high-severity compliance anomaly triggers**.
- **Implementation**:
  - When an anomaly (e.g., severe phantom attendance: 40 reported present on portal vs 2 observed by vision) is sustained for > 15 minutes, a 5-second low-resolution snippet or blurred still frame is packaged as `inspection_evidence`.
  - All human faces in the evidence snapshot are automatically subjected to a Gaussian blur filter prior to storage encryption, ensuring trainee anonymity while preserving verifiable room-level physical proof for adjudicating officers.

### 1.4 Cryptographic QR Asset Verification vs Biometrics
- **Principle**: Equipment verification uses cryptographically signed QR codes and geo-fenced timestamps rather than personal biometric scans.
- **Implementation**:
  - Assets (e.g., computer workstations, CNC simulators, sewing machines, smart boards) are tracked via dynamic HMAC-SHA256 encrypted QR codes.
  - Inspection officers verify assets on-site using GPS location boundaries without recording personal trainee information.

### 1.5 Role-Based Data Minimization (RBAC)
- Trainee personally identifiable information (PII) such as Aadhaar numbers or personal contact numbers are hashed or masked at the database level.
- Officers view anonymized cohort metrics (e.g., `Batch B102: Sanctioned: 30, Portal Attendance: 28, Vision Headcount: 14, Delta: -50%`).

---

## 2. Data Lifecycle & Retention

| Data Type | Persistence | Encryption | Retention Period | Automatic Purge Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Raw CCTV Stream** | RAM-only (volatile) | TLS 1.3 in-transit | 0 seconds (instantly dropped) | Dropped post-inference |
| **Aggregate Counts** | PostgreSQL | AES-256 at rest | 180 Days (Aggregated to daily after 30d) | Automated cron aggregation |
| **Anomaly Evidence Snippets** | Encrypted S3 bucket | AES-256-GCM / KMS | 90 Days post-adjudication | Hard deletion |
| **Audit Logs** | Immutable Log Vault | HMAC signed | 365 Days | Retained for statutory compliance |

---

## 3. Regulatory Compliance
- **Digital Personal Data Protection (DPDP) Act, 2023 (India)**: Complies with consent minimization, purposeful processing, and non-retention mandates.
- **ISO/IEC 27701 & 27001**: Adheres to Privacy Information Management System standards.

---
*SKILL-SENTINEL: Integrity without Intrusion.*
