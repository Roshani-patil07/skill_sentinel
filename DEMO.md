# SKILL-SENTINEL: SIH 2026 Presentation & Demonstration Script

> **Problem Statement 26245**  
> **Duration**: Exactly 4 to 5 minutes  
> **Target Centre**: `Pune-047` (PMKK Pune Precision Engineering Centre)

---

## 🎬 Minute-by-Minute Demonstration Flow

### Minute 0:00 – 1:00 | The Problem & National Command Grid
1. **Open National Dashboard**:
   - Point out the national headline metrics:
     - **120 Centres** monitored in real-time across 10 States & 30 Districts.
     - **103 Healthy** (Green, compliance > 90%).
     - **11 Watchlist** (Amber, emerging risk).
     - **4 High Risk** (Orange, targeted checks dispatched).
     - **2 Critical** (Red, immediate fund freeze pending).
2. **Explain the Innovation**:
   - *"Traditional schemes rely on once-a-quarter scheduled visits where centres hire temporary proxy students and borrow machines. SKILL-SENTINEL replaces this with continuous compliance intelligence, completely without facial recognition."*

---

### Minute 1:00 – 2:00 | AI Detection: Attendance Mismatch
1. **Locate Centre Pune-047**:
   - Initial state: Risk score is **54.0** (Watchlist).
2. **Trigger Stage 1** (Click **`1: Attendance (→72)`** on the top controller):
   - **What happens**:
     - Central biometric portal claims: **28 trainees** checked in.
     - CCTV camera AI aggregate headcount: only **9 persons** observed in the CNC workshop.
     - Discrepancy: **67.8%** ghost attendance.
   - **Result**:
     - System updates risk score dynamically from **54.0 to 72.0 (High Risk)**.
     - Toast alert pops up with audio alert chime.
     - Pune-047 turns Orange on the national map.

---

### Minute 2:00 – 3:00 | Compounding Anomaly: Missing Capital Asset
1. **Trigger Stage 2** (Click **`2: Missing Asset (→86)`** on the top controller):
   - **What happens**:
     - Workstation Camera 02 detects that the sanctioned **CNC Machining Trainer 3-Axis** is absent from its designated physical zone.
   - **Result**:
     - Compound risk engine computes cross-violation penalty: risk escalates to **86.0 (Critical)**.
     - **Explainability Drawer** opens:
       1. *Attendance discrepancy (28 claimed vs 9 observed)*
       2. *Missing sanctioned asset (CNC Machining Trainer)*
       3. *Repeated low occupancy over rolling 4-day window*
     - **System Automated Recommendation**:
       > *"Schedule targeted inspection and dispatch Inspection Officer to PMKK Pune."*

---

### Minute 3:00 – 4:00 | Field Officer Inspection & Cryptographic QR/AR
1. **Open Field Inspection Module**:
   - Demonstrate the Inspection Officer view on mobile/tablet viewport.
2. **Trigger Stage 3** (Click **`3: QR Scan (Overdue)`**):
   - **Cryptographic QR Validation**:
     - Scan QR `PUN-CNC-2026-001`.
     - HMAC verification confirms: **Asset registered to this sanctioned centre**.
   - **AI Double-Verification**:
     - Computer vision confirms asset was moved to the maintenance bay.
     - System flags: **Maintenance: OVERDUE (Calibrated 184 days ago; limit is 90 days)**.

---

### Minute 4:00 – 5:00 | Resolution, Recalculation & Re-Audit
1. **Trigger Stage 4** (Click **`4: Resolve (→36)`**):
   - **What happens**:
     - Officer uploads field inspection report, technician calibration certificate, and photographic geotagged proof.
     - Intervention status transitions to **RESOLVED**.
   - **Result**:
     - Dynamic risk score recalculates from **86.0 down to 36.0 (Healthy / Low Risk)**.
     - Centre returns to Healthy status on the National Command Grid.
2. **Closing Punchline**:
   - *"In under five minutes, SKILL-SENTINEL detected ghost trainees, flagged missing capital equipment, dispatched a targeted inspection, verified asset cryptographic provenance, and resolved the risk—protecting public funds with zero biometric privacy violations."*

---

## 🛡️ Demo Safety Fallbacks
- If internet is slow: All telemetry and AI simulations run locally from the FastAPI core.
- If camera is unavailable: Synthetic edge telemetry generates realistic frame counts automatically.
- If live WhatsApp API is down: Built-in Mock Gateway logs and displays outgoing messages instantly in the audit viewer.
