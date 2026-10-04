"""
Telemetry Generator & Scenario Simulator for SKILL-SENTINEL
Generates realistic edge camera events for stress-testing and demonstration.
"""

import time
import random
from datetime import datetime
from .contracts import AggregateDetectionEvent, BoundingBox

class VisionTelemetrySimulator:
    def __init__(self, centre_id: str = "TC-DEL-042", room_id: str = "LAB-A"):
        self.centre_id = centre_id
        self.room_id = room_id
        self.camera_id = f"CAM-{centre_id}-{room_id}"

    def generate_event(self, scenario: str = "NORMAL") -> AggregateDetectionEvent:
        """
        Scenarios:
        - 'NORMAL': Typical occupancy (18-24 students in 30-capacity lab)
        - 'GHOST_ATTENDANCE': Reported 28, but actual vision count is 2 to 4 students!
        - 'EQUIPMENT_DEFICIT': Sanctioned 25 computers, but only 12 detected
        - 'TAMPERING': Camera covered or pointed away
        """
        if scenario == "GHOST_ATTENDANCE":
            count = random.randint(1, 4)
            tamper = False
            equip = {"computer_workstations": 24, "biometric_kiosks": 1}
        elif scenario == "EQUIPMENT_DEFICIT":
            count = random.randint(15, 20)
            tamper = False
            equip = {"computer_workstations": 9, "biometric_kiosks": 0}
        elif scenario == "TAMPERING":
            count = 0
            tamper = True
            equip = {}
        else: # NORMAL
            count = random.randint(19, 25)
            tamper = False
            equip = {"computer_workstations": 25, "biometric_kiosks": 1, "projectors": 1}

        boxes = [
            BoundingBox(
                x_min=round(random.uniform(0.05, 0.8), 2),
                y_min=round(random.uniform(0.1, 0.7), 2),
                x_max=round(random.uniform(0.15, 0.9), 2),
                y_max=round(random.uniform(0.2, 0.95), 2),
                confidence=round(random.uniform(0.85, 0.98), 2),
                tracking_id=i + 1
            ) for i in range(count)
        ]

        return AggregateDetectionEvent(
            camera_id=self.camera_id,
            centre_id=self.centre_id,
            room_id=self.room_id,
            timestamp=datetime.utcnow(),
            person_count=count,
            detected_boxes=boxes,
            average_confidence=0.92,
            equipment_detected=equip,
            ambient_tampering_detected=tamper
        )
