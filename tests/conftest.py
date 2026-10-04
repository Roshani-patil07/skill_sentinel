import os
import pytest
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.services.seed_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Session-level autouse fixture.
    Guarantees all database tables are created and seeded before any pytest test executes,
    ensuring 100% reliability in CI/CD environments (GitHub Actions) and fresh test databases.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, force_reseed=True)
    finally:
        db.close()
    yield
