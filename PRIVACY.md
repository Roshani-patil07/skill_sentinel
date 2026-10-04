# SKILL-SENTINEL: Privacy Architecture & DPDP Act 2023 Compliance

---

## 1. Core Privacy Mandate

SKILL-SENTINEL was engineered from Day One around **Privacy-by-Design** principles. 

Unlike traditional surveillance systems that employ biometric facial recognition, SKILL-SENTINEL **strictly rejects individual facial indexing, personal biometric storage, and facial vector comparison.**

---

## 2. Non-Biometric Compliance Pillars

1. **Zero Facial Biometrics**:
   - The YOLO detector is trained solely on generic class labels (`person`, `chair`, `computer`, `machine`).
   - No landmark detection, face recognition embeddings (e.g. ArcFace, FaceNet), or age/gender estimation models exist in the codebase.
2. **Edge-Processed Aggregate Telemetry**:
   - Video frames are sampled and analyzed in volatile memory on the edge device.
   - Raw video feeds are **never uploaded to central cloud servers**, preserving the personal privacy of young trainees and instructors.
   - Only anonymous telemetry strings are transmitted (e.g., `{"person_count": 9, "active_chairs": 12}`).
3. **No Personal Identifiers in Anomaly Records**:
   - Anomalies report aggregate statistical deviations (e.g. `28 claimed vs 9 observed`).
   - Trainee names, photos, or personal demographic records are never associated with computer vision detections.

---

## 3. Statutory Alignment: DPDP Act 2023 (India)

| Requirement | Implementation in SKILL-SENTINEL | Status |
| :--- | :--- | :--- |
| **Purpose Limitation** | Vision analytics restricted strictly to aggregate classroom occupancy and equipment presence. | Compliant |
| **Data Minimisation** | No raw video saved. Only numerical counts and spatial bounding box coordinates retained. | Compliant |
| **Storage Limitation** | Ephemeral frame buffers discarded immediately after inference (< 100ms). | Compliant |
| **Child & Student Protection** | Non-invasive observation prevents any biometric profiling of adolescent vocational trainees. | Compliant |
