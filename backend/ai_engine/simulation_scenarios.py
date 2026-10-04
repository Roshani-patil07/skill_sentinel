"""
SKILL-SENTINEL AI Engine: Simulation Scenarios Module
Provides high-fidelity scenario simulations for demonstration without physical CCTV hardware:
1. NORMAL
2. ATTENDANCE_MISMATCH
3. MISSING_ASSET
4. LOW_ACTIVITY
5. REPEATED_ANOMALY
6. HIGH_RISK
"""

from typing import Dict, Any, List
from .edge_client import EdgeSentinelClient, EdgeTelemetryPacket
from .risk_scorer import MultiPillarRiskScorer, ExplainableRiskResult
from .temporal_engine import TemporalEngine, DayLog

class SimulationEngine:
    def __init__(self, centre_id: str = "tc-del-042", centre_code: str = "TC-DEL-042"):
        self.centre_id = centre_id
        self.centre_code = centre_code
        self.edge_client = EdgeSentinelClient(
            edge_device_id=f"CAM-{centre_code}-01",
            centre_id=centre_id,
            centre_code=centre_code,
            room_id="ROOM-101",
            operating_mode="EDGE"
        )
        self.risk_scorer = MultiPillarRiskScorer()
        self.temporal_engine = TemporalEngine()

    def run_scenario(self, scenario_name: str) -> Dict[str, Any]:
        scenario = scenario_name.upper()

        if scenario == "NORMAL":
            context = {"person_count": 24, "computer_count": 20, "machine_count": 4, "kiosk_count": 1}
            packet = self.edge_client.process_cycle(
                reported_attendance=25,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            # Add subtle motion
            packet.presence_telemetry.activity_score = 0.82
            packet.presence_telemetry.activity_status = "NORMAL_ENGAGEMENT"
            packet.anomalies = [] # No anomalies

            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=4.0,
                missing_assets_count=0,
                total_sanctioned_assets=25,
                activity_score=0.82,
                consecutive_anomaly_days=0,
                camera_uptime_rate=99.8,
                inspection_overdue_days=14
            )
            temporal = self.temporal_engine.analyze_trend(
                centre_id=self.centre_id,
                recent_day_records=[
                    DayLog(date_str="2026-09-30", day_name="Wednesday", has_attendance_mismatch=False, has_equipment_deficit=False, average_headcount=24, status="COMPLIANT"),
                    DayLog(date_str="2026-10-01", day_name="Thursday", has_attendance_mismatch=False, has_equipment_deficit=False, average_headcount=25, status="COMPLIANT"),
                    DayLog(date_str="2026-10-02", day_name="Friday", has_attendance_mismatch=False, has_equipment_deficit=False, average_headcount=24, status="COMPLIANT"),
                ]
            )

        elif scenario == "ATTENDANCE_MISMATCH":
            context = {"person_count": 11, "computer_count": 20, "machine_count": 4, "kiosk_count": 1}
            packet = self.edge_client.process_cycle(
                reported_attendance=32,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=65.6,
                missing_assets_count=0,
                total_sanctioned_assets=25,
                activity_score=0.65,
                consecutive_anomaly_days=1,
                camera_uptime_rate=98.5,
                inspection_overdue_days=30
            )
            temporal = self.temporal_engine.analyze_trend(centre_id=self.centre_id)

        elif scenario == "MISSING_ASSET":
            context = {"person_count": 22, "computer_count": 14, "machine_count": 1, "kiosk_count": 1}
            packet = self.edge_client.process_cycle(
                reported_attendance=24,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=8.3,
                missing_assets_count=9, # 6 PCs + 3 machines missing
                total_sanctioned_assets=25,
                activity_score=0.75,
                consecutive_anomaly_days=1,
                camera_uptime_rate=99.0,
                inspection_overdue_days=45
            )
            temporal = self.temporal_engine.analyze_trend(centre_id=self.centre_id)

        elif scenario == "LOW_ACTIVITY":
            context = {"person_count": 20, "computer_count": 20, "machine_count": 4, "kiosk_count": 1}
            packet = self.edge_client.process_cycle(
                reported_attendance=22,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            # Force low activity engagement
            packet.presence_telemetry.activity_score = 0.06
            packet.presence_telemetry.activity_status = "LOW_ACTIVITY"
            packet.presence_telemetry.stationary_count = 19
            packet.presence_telemetry.moving_count = 1

            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=9.1,
                missing_assets_count=0,
                total_sanctioned_assets=25,
                activity_score=0.06,
                consecutive_anomaly_days=0,
                camera_uptime_rate=99.5,
                inspection_overdue_days=20
            )
            temporal = self.temporal_engine.analyze_trend(centre_id=self.centre_id)

        elif scenario == "REPEATED_ANOMALY":
            context = {"person_count": 9, "computer_count": 18, "machine_count": 4, "kiosk_count": 1}
            packet = self.edge_client.process_cycle(
                reported_attendance=30,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            temporal = self.temporal_engine.analyze_trend(
                centre_id=self.centre_id,
                recent_day_records=[
                    DayLog(date_str="2026-09-29", day_name="Tuesday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=10, status="FLAGGED"),
                    DayLog(date_str="2026-09-30", day_name="Wednesday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=8, status="FLAGGED"),
                    DayLog(date_str="2026-10-01", day_name="Thursday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=9, status="FLAGGED"),
                    DayLog(date_str="2026-10-02", day_name="Friday", has_attendance_mismatch=True, has_equipment_deficit=False, average_headcount=9, status="FLAGGED"),
                ]
            )
            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=70.0,
                missing_assets_count=2,
                total_sanctioned_assets=25,
                activity_score=0.55,
                consecutive_anomaly_days=4,
                camera_uptime_rate=97.0,
                inspection_overdue_days=60
            )

        elif scenario == "HIGH_RISK":
            # Compound failure: 32 reported vs 4 observed, 8 missing assets, 4 repeated days
            context = {"person_count": 4, "computer_count": 12, "machine_count": 1, "kiosk_count": 0}
            packet = self.edge_client.process_cycle(
                reported_attendance=32,
                sanctioned_equipment={"computer": 20, "machine": 4, "biometric_kiosk": 1},
                synthetic_scenario_context=context
            )
            temporal = self.temporal_engine.analyze_trend(centre_id=self.centre_id)
            risk = self.risk_scorer.compute(
                centre_id=self.centre_id,
                centre_code=self.centre_code,
                attendance_gap_pct=87.5,
                missing_assets_count=12,
                total_sanctioned_assets=25,
                activity_score=0.15,
                consecutive_anomaly_days=5,
                camera_uptime_rate=82.0,
                inspection_overdue_days=95
            )

        else:
            raise ValueError(f"Unknown simulation scenario: {scenario_name}")

        return {
            "scenario": scenario,
            "telemetry_packet": packet.dict(),
            "risk_evaluation": risk.dict(),
            "temporal_intelligence": temporal.dict()
        }
