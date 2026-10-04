import os
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal, get_db
from backend.app.services.seed_data import seed_database
from backend.app.services.websocket_manager import ws_manager
from backend.app.services.risk_engine import evaluate_centre_risk
from backend.app.models.entities import TrainingCentre, AttendanceAnomaly, Asset, CameraDevice

# Import routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router
from backend.app.api.v1.centres import router as centres_router
from backend.app.api.v1.attendance import router as attendance_router
from backend.app.api.v1.assets import router as assets_router
from backend.app.api.v1.qr import router as qr_router
from backend.app.api.v1.vision import router as vision_router
from backend.app.api.v1.risk import router as risk_router
from backend.app.api.v1.interventions import router as interventions_router
from backend.app.api.v1.inspections import router as inspections_router
from backend.app.api.v1.notifications import router as notifications_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.demo import router as demo_router
import time
import uuid
import logging
from fastapi import Request
from sqlalchemy import text

logger = logging.getLogger("sentinel.api")

metrics_data = {
    "total_requests": 0,
    "total_errors": 0,
    "total_latency_ms": 0.0,
    "start_time": time.time(),
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    description="SIH 2026 Problem Statement 26245: AI-Based Real-Time Monitoring of Training Centres for Attendance and Infrastructure Compliance",
    version="1.0.0",
    lifespan=lifespan
)

# Observability Middleware: Request-ID, Structured Logging & Latency Tracking
@app.middleware("http")
async def add_observability_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.perf_counter()
    metrics_data["total_requests"] += 1

    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        metrics_data["total_latency_ms"] += duration_ms
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time-MS"] = f"{duration_ms:.2f}"
        return response
    except Exception as exc:
        metrics_data["total_errors"] += 1
        duration_ms = (time.perf_counter() - start_time) * 1000.0
        logger.error(f'{{"request_id": "{req_id}", "path": "{request.url.path}", "error": "{str(exc)}", "latency_ms": {duration_ms:.2f}}}')
        raise

# CORS - compliant with Starlette credentials spec
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1 = "/api/v1"
app.include_router(auth_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)
app.include_router(centres_router, prefix=api_v1)
app.include_router(attendance_router, prefix=api_v1)
app.include_router(assets_router, prefix=api_v1)
app.include_router(qr_router, prefix=api_v1)
app.include_router(vision_router, prefix=api_v1)
app.include_router(risk_router, prefix=api_v1)
app.include_router(interventions_router, prefix=api_v1)
app.include_router(inspections_router, prefix=api_v1)
app.include_router(notifications_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)
app.include_router(demo_router, prefix=api_v1)

# Real-Time WebSocket Endpoint
@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

# Liveness Health Check
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "app": settings.APP_NAME,
        "tagline": "From Periodic Inspection to Continuous Compliance Intelligence",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Readiness Check (Verifies DB & WebSockets)
@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "CONNECTED"
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

    return {
        "status": "READY",
        "database": db_status,
        "database_type": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        "active_websockets": len(ws_manager.active_connections),
        "uptime_seconds": round(time.time() - metrics_data["start_time"], 1),
        "version": "1.0.0"
    }

# Observability Metrics Endpoint
@app.get("/metrics")
def get_metrics():
    req_count = max(1, metrics_data["total_requests"])
    avg_latency = metrics_data["total_latency_ms"] / req_count
    return {
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "uptime_seconds": round(time.time() - metrics_data["start_time"], 1),
        "requests_total": metrics_data["total_requests"],
        "errors_total": metrics_data["total_errors"],
        "average_api_latency_ms": round(avg_latency, 2),
        "active_websocket_connections": len(ws_manager.active_connections),
        "whatsapp_gateway_status": settings.WHATSAPP_PROVIDER
    }


# Live Interactive Scenario Simulator Endpoint
@app.post("/api/v1/simulation/trigger-scenario")
async def trigger_simulation_scenario(
    centre_id: str = "tc-del-042",
    scenario: str = "GHOST_ATTENDANCE",
    db: Session = Depends(get_db)
):
    """
    Triggers simulated edge event and pushes live updates through the entire pipeline:
    VIDEO -> OBJECT DETECTION -> OBJECT TRACKING -> AGGREGATE PRESENCE ->
    ACTIVITY SIGNALS -> ATTENDANCE COMPARISON -> INFRASTRUCTURE VERIFICATION ->
    ANOMALY DETECTION -> RISK FACTORS -> WEBSOCKET BROADCAST
    """
    centre = db.query(TrainingCentre).filter(TrainingCentre.id == centre_id).first()
    if not centre:
        return {"error": "Centre not found"}

    scen = scenario.upper()

    if scen in ["GHOST_ATTENDANCE", "ATTENDANCE_MISMATCH"]:
        anom = AttendanceAnomaly(
            centre_id=centre.id,
            batch_id="batch-okhla-iot-morning",
            reported_attendance=32,
            observed_headcount=11,
            discrepancy_percentage=-65.6,
            severity="CRITICAL",
            status="OPEN"
        )
        db.add(anom)
        db.commit()
        score, level, factors, rec = evaluate_centre_risk(db, centre.id)
        
        event = {
            "event": "ANOMALY_TRIGGERED",
            "type": "ATTENDANCE_MISMATCH",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "reported": 32,
            "observed": 11,
            "discrepancy_pct": -65.6,
            "new_risk_score": score,
            "risk_level": level,
            "recommendation": rec
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    elif scen in ["ASSET_REMOVAL", "MISSING_ASSET"]:
        ast = db.query(Asset).filter(Asset.centre_id == centre.id, Asset.status == "VERIFIED_PRESENT").first()
        if ast:
            ast.status = "MISSING"
            db.commit()
        score, level, factors, rec = evaluate_centre_risk(db, centre.id)
        event = {
            "event": "INFRASTRUCTURE_ANOMALY",
            "type": "MISSING_ASSET",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "asset_tag": ast.asset_tag if ast else "OKH-PC-2026-004",
            "status": "MISSING",
            "new_risk_score": score,
            "risk_level": level,
            "recommendation": rec
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    elif scen == "LOW_ACTIVITY":
        event = {
            "event": "ACTIVITY_SIGNAL",
            "type": "LOW_ACTIVITY",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "activity_score": 0.06,
            "stationary_count": 19,
            "moving_count": 1,
            "status": "DISENGAGEMENT_DETECTED",
            "explanation": "Low activity detected: Room static with engagement index under 10% during active practical hours."
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    elif scen == "REPEATED_ANOMALY":
        event = {
            "event": "TEMPORAL_ANOMALY",
            "type": "REPEATED_ANOMALY",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "consecutive_days": 4,
            "severity": "CRITICAL",
            "multiplier": 1.75,
            "explanation": "Chronic compliance failure: Discrepancy patterns repeated across 4 consecutive days."
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    elif scen == "HIGH_RISK":
        anom = AttendanceAnomaly(
            centre_id=centre.id,
            batch_id="batch-okhla-iot-morning",
            reported_attendance=35,
            observed_headcount=3,
            discrepancy_percentage=-91.4,
            severity="CRITICAL",
            status="OPEN"
        )
        db.add(anom)
        for ast in db.query(Asset).filter(Asset.centre_id == centre.id).limit(4):
            ast.status = "MISSING"
        db.commit()
        score, level, factors, rec = evaluate_centre_risk(db, centre.id)
        event = {
            "event": "HIGH_RISK_TRIGGERED",
            "type": "CRITICAL_COMPOUND_FAILURE",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "new_risk_score": 88.5,
            "risk_level": "CRITICAL",
            "recommendation": "Execute immediate physical audit and suspend subsidy disbursements."
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    elif scen in ["NORMAL", "FULL_ATTENDANCE_RESTORATION"]:
        anomalies = db.query(AttendanceAnomaly).filter(AttendanceAnomaly.centre_id == centre.id).all()
        for a in anomalies:
            a.status = "RESOLVED"
        assets = db.query(Asset).filter(Asset.centre_id == centre.id).all()
        for a in assets:
            a.status = "VERIFIED_PRESENT"
        db.commit()
        score, level, factors, rec = evaluate_centre_risk(db, centre.id)
        event = {
            "event": "COMPLIANCE_RESTORED",
            "centre_id": centre.id,
            "centre_name": centre.name,
            "new_risk_score": score,
            "risk_level": level,
            "recommendation": rec
        }
        await ws_manager.broadcast(event)
        return {"status": "SUCCESS", "scenario": scen, "event": event}

    return {"status": "UNKNOWN_SCENARIO"}
