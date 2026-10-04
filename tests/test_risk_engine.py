import os
import sys
sys.path.insert(0, os.path.abspath("."))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base
from backend.app.models.entities import TrainingCentre, AttendanceAnomaly, Asset, CameraDevice, InfrastructureAnomaly
from backend.app.services.risk_engine import evaluate_centre_risk

from backend.app.models.entities import State, District, AssetCategory, Course, TrainingBatch

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Seed mandatory foreign key references
    st = State(id="s1", name="Delhi", code="DL")
    dt = District(id="d1", state_id="s1", name="South", code="S")
    ac = AssetCategory(id="c1", name="Computer", code="PC")
    cr = Course(id="cr1", course_code="C1", title="Computing", sector="IT")
    session.add_all([st, dt, ac, cr])
    session.commit()
    
    yield session
    session.close()



def test_compliant_centre_risk(db_session):
    # Setup compliant centre with 0 anomalies and verified assets
    tc = TrainingCentre(id="tc-clean", centre_code="TC-CLEAN-01", name="Clean Centre", district_id="d1")
    db_session.add(tc)
    
    # 10 verified assets
    for i in range(10):
        db_session.add(Asset(id=f"a-{i}", centre_id="tc-clean", category_id="c1", asset_tag=f"TAG-{i}", status="VERIFIED_PRESENT"))
    
    # 2 online cameras
    for i in range(2):
        db_session.add(CameraDevice(id=f"cam-{i}", centre_id="tc-clean", device_name=f"Cam {i}", status="ONLINE"))
        
    db_session.commit()

    score, level, factors, rec = evaluate_centre_risk(db_session, "tc-clean")
    assert score < 25.0
    assert level == "LOW"
    assert "Good Standing" in rec

def test_critical_phantom_attendance_risk(db_session):
    # Setup centre with critical phantom attendance (-75% deficit)
    tc = TrainingCentre(id="tc-risky", centre_code="TC-RISKY-01", name="Risky Centre", district_id="d1")
    db_session.add(tc)
    db_session.commit()

    batch = TrainingBatch(id="b1", centre_id="tc-risky", course_id="cr1", batch_code="B-RISK", sanctioned_strength=30)
    db_session.add(batch)
    db_session.commit()

    # Add severe attendance anomaly
    anom = AttendanceAnomaly(
        id="anom-1",
        centre_id="tc-risky",
        batch_id="b1",
        reported_attendance=30,
        observed_headcount=5,
        discrepancy_percentage=-83.3,
        severity="CRITICAL",
        status="OPEN"
    )
    db_session.add(anom)

    
    # Half of assets missing
    for i in range(10):
        status = "MISSING" if i < 5 else "VERIFIED_PRESENT"
        db_session.add(Asset(id=f"a-r-{i}", centre_id="tc-risky", category_id="c1", asset_tag=f"R-TAG-{i}", status=status))

    db_session.commit()

    score, level, factors, rec = evaluate_centre_risk(db_session, "tc-risky")
    assert score >= 45.0
    assert level in ["HIGH", "CRITICAL"]
    assert any(f["factor_type"] == "ATTENDANCE_INTEGRITY" and f["score_contribution"] > 0 for f in factors)
