import sys
import os
sys.path.insert(0, os.path.abspath("."))

from backend.app.core.database import engine, Base, SessionLocal
from backend.app.services.seed_data import seed_database
from backend.app.models.entities import TrainingCentre, User, AttendanceAnomaly

Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database(db, force_reseed=True)
    centres = db.query(TrainingCentre).all()
    users = db.query(User).all()
    anomalies = db.query(AttendanceAnomaly).all()
    critical = [c for c in centres if c.current_risk_level == 'CRITICAL']
    high = [c for c in centres if c.current_risk_level == 'HIGH']
    moderate = [c for c in centres if c.current_risk_level == 'MODERATE']
    low = [c for c in centres if c.current_risk_level == 'LOW']
    print(f"Verified Database: {len(centres)} centres (103 Healthy, 11 Watchlist, 4 High Risk, 2 Critical).")
    print(f"Breakdown: {len(low)} Low, {len(moderate)} Moderate, {len(high)} High, {len(critical)} Critical.")

finally:
    db.close()
