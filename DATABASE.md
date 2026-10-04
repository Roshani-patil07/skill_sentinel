# SKILL-SENTINEL: Database & Relational Schema

SKILL-SENTINEL uses SQLAlchemy ORM with native support for both **PostgreSQL 16** (production) and **SQLite 3** (local zero-dependency development and automated CI testing).

---

## 1. Entity Relationship Overview

```
[ State ] ──< [ District ] ──< [ TrainingCentre ]
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [ TrainingBatch ]            [ CameraDevice ]                [ Asset ]
          │                           │                           │
          ▼                           ▼                           ▼
[ AttendanceRecord ]           [ CameraStream ]               [ QRCode ]
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                      ▼
                        [ AttendanceAnomaly ]
                        [ InfrastructureAnomaly ]
                                      │
                                      ▼
                               [ RiskScore ]
                                      │
                                      ▼
                              [ Intervention ]
                                      │
                                      ▼
                                [ Inspection ]
                                      │
                                      ▼
                            [ InspectionEvidence ]
```

---

## 2. Table Specifications & Indexes

### `training_centres`
- `id` (VARCHAR PK)
- `centre_code` (VARCHAR Unique Index) - e.g., `Pune-047`, `DEL-OKHLA-01`
- `name` (VARCHAR)
- `district_id` (FK -> `districts.id`)
- `latitude`, `longitude` (FLOAT)
- `current_risk_score` (FLOAT, Index)
- `current_risk_level` (VARCHAR: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`)

### `assets`
- `id` (VARCHAR PK)
- `centre_id` (FK -> `training_centres.id`, Index)
- `category_id` (FK -> `asset_categories.id`)
- `serial_number` (VARCHAR)
- `model_name` (VARCHAR)
- `status` (VARCHAR: `OPERATIONAL`, `MAINTENANCE_REQUIRED`, `MISSING`, `DAMAGED`)
- `last_verified_at` (TIMESTAMP)

### `risk_scores`
- `id` (VARCHAR PK)
- `centre_id` (FK -> `training_centres.id`, Index)
- `composite_score` (FLOAT)
- `attendance_factor` (FLOAT)
- `infrastructure_factor` (FLOAT)
- `repeat_anomaly_multiplier` (FLOAT)
- `explainability_json` (TEXT)
- `calculated_at` (TIMESTAMP, Index)

### `interventions`
- `id` (VARCHAR PK)
- `centre_id` (FK -> `training_centres.id`, Index)
- `intervention_type` (VARCHAR: `TARGETED_INSPECTION`, `SHOW_CAUSE_NOTICE`, `BIOMETRIC_RECALIBRATION`)
- `status` (VARCHAR: `OPEN`, `IN_PROGRESS`, `EVIDENCE_SUBMITTED`, `RESOLVED`, `CLOSED`)
- `created_at` (TIMESTAMP)
- `resolved_at` (TIMESTAMP)

---

## 3. Seed Dataset Distribution (SIH Demo Target)

The database includes a realistic national dataset across **10 States** and **30 Districts**:
- **Total Training Centres**: 120
- **Healthy (Low Risk, Score < 40)**: 103 centres
- **Watchlist (Moderate Risk, Score 40–69)**: 11 centres (including `Pune-047` at 54.0)
- **High Risk (Score 70–84)**: 4 centres (including `DEL-OKHLA-01` at 78.5)
- **Critical (Score >= 85)**: 2 centres (`Patna-012` at 88.0 and `Guwahati-005` at 91.0)

To re-seed the database at any time:
```bash
python scripts/seed.py
```
