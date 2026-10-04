import os
import sys
sys.path.insert(0, os.path.abspath("."))

import pytest
from ai_engine.detector import YOLODetector
from ai_engine.tracker import SpatialTracker
from ai_engine.activity_analyzer import ActivityAnalyzer
from ai_engine.attendance_analyzer import AttendanceIntegrityAnalyzer
from ai_engine.infrastructure_verifier import InfrastructureVerifier
from ai_engine.qr_verifier import DualAssetVerifier, AssetRecord
from ai_engine.anomaly_engine import AnomalyEngine
from ai_engine.temporal_engine import TemporalEngine, DayLog
from ai_engine.risk_scorer import MultiPillarRiskScorer, RiskWeights
from ai_engine.edge_client import EdgeSentinelClient
from ai_engine.simulation_scenarios import SimulationEngine

def test_yolo_detector():
    detector = YOLODetector()
    detections = detector.detect(synthetic_context={"person_count": 15, "computer_count": 20, "machine_count": 4})
    persons = [d for d in detections if d.class_name == "person"]
    computers = [d for d in detections if d.class_name == "computer"]
    machines = [d for d in detections if d.class_name == "machine"]
    
    assert len(persons) == 15
    assert len(computers) == 20
    assert len(machines) == 4
    for p in persons:
        assert p.confidence >= 0.85
        assert len(p.bbox) == 4

def test_spatial_tracker():
    detector = YOLODetector()
    tracker = SpatialTracker()
    detections = detector.detect(synthetic_context={"person_count": 10})
    
    # First update: tracks created
    tracks1 = tracker.update(detections, delta_time=1.0)
    assert len(tracks1) == 10
    assert all(t.track_id > 0 for t in tracks1)
    assert all(t.dwell_time_seconds == 1.0 for t in tracks1)

    # Second update: tracks persisted and dwell time incremented
    tracks2 = tracker.update(detections, delta_time=1.0)
    assert len(tracks2) == 10
    assert all(t.dwell_time_seconds == 2.0 for t in tracks2)

def test_activity_analyzer():
    detector = YOLODetector()
    tracker = SpatialTracker()
    analyzer = ActivityAnalyzer(room_capacity=30)
    
    detections = detector.detect(synthetic_context={"person_count": 21})
    tracks = tracker.update(detections)
    
    # Force some motion
    tracks[0].is_stationary = False
    tracks[0].velocity_vector = [0.15, 0.12]
    
    telemetry = analyzer.analyze(tracks, expected_batch_active=True)
    assert telemetry.person_count == 21
    assert telemetry.occupancy_rate == 0.7
    assert telemetry.zone_occupancy["WORKSTATION_ZONE"] > 0
    assert telemetry.moving_count == 1
    assert telemetry.stationary_count == 20

def test_attendance_integrity_analyzer():
    analyzer = AttendanceIntegrityAnalyzer(tolerance_gap_ratio=0.15)
    
    # Normal case: 25 reported, 24 observed
    normal_res = analyzer.compare("tc-1", "b-1", reported_attendance=25, observed_presence=24)
    assert normal_res.severity == "COMPLIANT"
    assert normal_res.attendance_gap == 1
    assert "conforms" in normal_res.finding_statement

    # Discrepancy case: 32 reported, 12 observed (62.5% gap)
    gap_res = analyzer.compare("tc-1", "b-1", reported_attendance=32, observed_presence=12)
    assert gap_res.severity == "CRITICAL"
    assert gap_res.attendance_gap == 20
    assert gap_res.gap_percentage == 62.5
    assert "potential attendance discrepancy" in gap_res.finding_statement.lower()
    assert len(gap_res.evidence_hash) == 64

def test_infrastructure_verifier():
    verifier = InfrastructureVerifier()
    sanctioned = {"computer": 20, "cnc_machine": 4, "welding_machine": 2}
    detected = {"computer": 18, "cnc_machine": 3, "welding_machine": 1}
    
    result = verifier.verify("tc-1", sanctioned, detected)
    assert result.total_required_assets == 26
    assert result.missing_asset_count == 4
    assert result.asset_presence_rate < 100.0
    assert result.is_compliant is False
    assert len(result.categories_breakdown) == 3

def test_dual_qr_verifier():
    verifier = DualAssetVerifier()
    db = {
        "OKH-PC-01": AssetRecord(
            asset_id="OKH-PC-01",
            qr_code="QR-OKH-PC-01",
            sanctioned_specification="Dell OptiPlex 7090",
            assigned_centre_id="tc-del-042",
            installation_date="2025-01-10",
            maintenance_due_date="2026-12-31",
            category="computer"
        )
    }
    
    # Dual authenticated (QR matches + vision detects computer)
    res_auth = verifier.verify_asset(
        qr_code_scanned="QR-OKH-PC-01",
        current_centre_id="tc-del-042",
        registered_asset_db=db,
        vision_detected_categories={"computer": 15}
    )
    assert res_auth.dual_verification_status == "DUAL_AUTHENTICATED"
    assert res_auth.verification_score == 1.0

    # Wrong centre scan
    res_wrong = verifier.verify_asset(
        qr_code_scanned="QR-OKH-PC-01",
        current_centre_id="tc-mum-108",
        registered_asset_db=db,
        vision_detected_categories={"computer": 15}
    )
    assert res_wrong.dual_verification_status == "WRONG_CENTRE"

def test_anomaly_engine():
    engine = AnomalyEngine()
    
    # Sudden occupancy drop test
    activity_mock = type("MockActivity", (), {
        "person_count": 2,
        "occupancy_rate": 0.06,
        "activity_status": "NORMAL_ENGAGEMENT"
    })()
    
    anomalies = engine.evaluate(
        centre_id="tc-1",
        centre_code="TC-01",
        camera_id="cam-1",
        activity_telemetry=activity_mock,
        previous_occupancy=25,
        camera_online=True,
        repeated_days_count=4
    )
    
    anomaly_types = [a.type for a in anomalies]
    assert "SUDDEN_OCCUPANCY_DROP" in anomaly_types
    assert "LOW_OCCUPANCY" in anomaly_types
    assert "REPEATED_ANOMALY" in anomaly_types
    for a in anomalies:
        assert a.confidence >= 0.85
        assert len(a.explanation) > 10

def test_temporal_engine():
    temporal = TemporalEngine(repeat_threshold_days=3)
    history = [
        DayLog(date_str="2026-09-30", day_name="Wednesday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=10, status="FLAGGED"),
        DayLog(date_str="2026-10-01", day_name="Thursday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=9, status="FLAGGED"),
        DayLog(date_str="2026-10-02", day_name="Friday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=8, status="FLAGGED"),
    ]
    res = temporal.analyze_trend("tc-del-042", recent_day_records=history)
    assert res.consecutive_mismatch_days == 3
    assert res.is_repeated_pattern is True
    assert res.temporal_risk_multiplier >= 1.75
    assert res.weekly_trajectory == "DEGRADING"

def test_multi_pillar_risk_scorer():
    scorer = MultiPillarRiskScorer()
    
    # Test explainability: never produces risk score without factors
    result = scorer.compute(
        centre_id="tc-1",
        centre_code="TC-01",
        attendance_gap_pct=70.0,
        missing_assets_count=3,
        total_sanctioned_assets=15,
        activity_score=0.40,
        consecutive_anomaly_days=3,
        camera_uptime_rate=95.0,
        inspection_overdue_days=60
    )
    
    assert 0 <= result.composite_risk_score <= 100
    assert result.risk_level in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert len(result.top_factors) == 4
    assert result.top_factors[0].rank == 1
    assert result.top_factors[0].points >= result.top_factors[1].points
    assert len(result.top_factors[0].evidence_timestamp) > 0
    assert len(result.recommended_intervention) > 0

def test_simulation_scenarios():
    sim = SimulationEngine()
    scenarios = ["NORMAL", "ATTENDANCE_MISMATCH", "MISSING_ASSET", "LOW_ACTIVITY", "REPEATED_ANOMALY", "HIGH_RISK"]
    
    for s in scenarios:
        res = sim.run_scenario(s)
        assert res["scenario"] == s
        assert "telemetry_packet" in res
        assert "risk_evaluation" in res
        assert "temporal_intelligence" in res
        
        if s == "HIGH_RISK":
            assert res["risk_evaluation"]["composite_risk_score"] >= 80.0
            assert res["risk_evaluation"]["risk_level"] == "CRITICAL"
        elif s == "NORMAL":
            assert res["risk_evaluation"]["composite_risk_score"] < 25.0
            assert res["risk_evaluation"]["risk_level"] == "LOW"
