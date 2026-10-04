# SKILL-SENTINEL: AI Perception & Anomaly Intelligence

---

## 1. Vision Intelligence Pipeline

```
[ Camera Stream / Frame Buffer ]
               │
               ▼
[ YOLOv8 Object Detection ] ── (person, chair, computer, machine, kiosk)
               │
               ▼
[ ByteTrack Association ] ──── (Persistent track IDs; eliminates double-counting)
               │
               ▼
[ Aggregate Density & Kinetic Vectors ]
  - Headcount = Count(Unique Active Person Tracks in ROI)
  - Activity Index = StdDev(Optical Flow & Centroid Velocities)
               │
               ▼
[ Cross-Referencing Engine ]
  - Claimed Trainees (Biometric Portal) vs Observed Trainees (AI)
  - Sanctioned Assets vs Detected Objects in Camera Viewport
               │
               ▼
[ Anomaly & Risk Event Broadcast ]
```

---

## 2. Hardware Acceleration & Graceful Fallback Matrix

| Hardware Profile | Acceleration Backend | Model Precision | Average FPS | Failover Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **NVIDIA GPU (CUDA)** | TensorRT / PyTorch CUDA | FP16 / INT8 | 45–60 FPS | Falls back to CPU if OOM |
| **Intel / AMD CPU** | OpenVINO / ONNX Runtime | FP32 | 15–20 FPS | Frame sampling (1 FPS) |
| **Low-End Edge (RPi 5)** | Edge Client / Lightweight | N/A | 5–10 FPS | Samples keyframe bursts |
| **Offline / No Camera** | Synthetic Simulator | Math Engine | 60 FPS | Zero-crash synthetic stream |

The AI engine **never crashes** if cameras, RTSP streams, or GPUs are unavailable. It automatically transitions into simulation mode with zero user intervention.

---

## 3. Anomaly Detection Formulas

### A. Attendance Discrepancy Index
$$\text{Discrepancy} = \frac{|\text{Claimed Attendance} - \text{Observed Headcount}|}{\max(\text{Claimed Attendance}, 1)}$$
- If $\text{Discrepancy} > 25\%$ for $> 15\text{ minutes}$, trigger `ATTENDANCE_MISMATCH`.
- If $\text{Observed Headcount} == 0$ while $\text{Claimed} > 15$, trigger `GHOST_TRAINEES_CRITICAL`.

### B. Chronic Anomaly Multiplier
Repeated infractions within a rolling 7-day window compound geometrically:
$$\text{Multiplier} = 1.0 + (0.25 \times \text{Previous Infractions})$$
Maximum cap = $2.0\times$.
