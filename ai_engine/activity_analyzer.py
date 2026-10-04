"""
SKILL-SENTINEL AI Engine: Aggregate Presence & Activity Signals Module
Converts low-level object tracks into high-level behavioural telemetry:
- Person Count & Density Index
- Zone Occupancy (Workstation, Podium, Collaboration, Entrance)
- Activity & Motion Score (Stationary vs Moving Trainee Dynamics)
- Low Activity / Disengagement Event Triggering
"""

from typing import List, Dict, Any, Tuple
from pydantic import BaseModel, Field
from .tracker import TrackedObject

class PresenceAndActivityTelemetry(BaseModel):
    person_count: int
    occupancy_rate: float
    zone_occupancy: Dict[str, int]
    motion_energy: float
    activity_score: float
    stationary_count: int
    moving_count: int
    activity_status: str # "NORMAL_ENGAGEMENT", "LOW_ACTIVITY", "ROOM_VACANT", "SUDDEN_DROP"
    activity_events: List[str] = Field(default_factory=list)

class ActivityAnalyzer:
    def __init__(self, room_capacity: int = 30, low_activity_threshold: float = 0.15):
        self.room_capacity = room_capacity
        self.low_activity_threshold = low_activity_threshold

    def analyze(
        self,
        tracks: List[TrackedObject],
        expected_batch_active: bool = True
    ) -> PresenceAndActivityTelemetry:
        person_count = len(tracks)
        occupancy_rate = round(min(1.0, person_count / float(self.room_capacity)), 3)

        # Zone counts
        zones = {
            "WORKSTATION_ZONE": 0,
            "INSTRUCTOR_PODIUM": 0,
            "ENTRANCE_EXIT": 0,
            "COLLABORATION_AREA": 0
        }
        stationary_count = 0
        moving_count = 0
        total_speed = 0.0

        for t in tracks:
            z = t.zone if t.zone in zones else "COLLABORATION_AREA"
            zones[z] += 1
            if t.is_stationary:
                stationary_count += 1
            else:
                moving_count += 1
            
            vx, vy = t.velocity_vector[0], t.velocity_vector[1]
            total_speed += (vx * vx + vy * vy) ** 0.5

        # Activity Score normalized 0.0 to 1.0
        avg_speed = (total_speed / person_count) if person_count > 0 else 0.0
        # Normal activity in a computer lab has 15-40% subtle motion; 0% is frozen/empty/dummy
        activity_score = round(min(1.0, (moving_count / max(1, person_count)) * 0.7 + avg_speed * 1.5), 3)

        events: List[str] = []
        if person_count == 0 and expected_batch_active:
            status = "ROOM_VACANT"
            events.append("SCHEDULED_LAB_VACANT")
        elif person_count > 0 and activity_score < self.low_activity_threshold and expected_batch_active:
            status = "LOW_ACTIVITY"
            events.append("LOW_ACTIVITY_SIGNAL: Static room occupancy during active training batch")
        elif person_count > 0:
            status = "NORMAL_ENGAGEMENT"
            events.append("ACTIVE_TRAINING_SESSION")
        else:
            status = "ROOM_VACANT"

        if zones["INSTRUCTOR_PODIUM"] > 0:
            events.append("TRAINER_PRESENT_AT_PODIUM")

        return PresenceAndActivityTelemetry(
            person_count=person_count,
            occupancy_rate=occupancy_rate,
            zone_occupancy=zones,
            motion_energy=round(total_speed, 3),
            activity_score=activity_score,
            stationary_count=stationary_count,
            moving_count=moving_count,
            activity_status=status,
            activity_events=events
        )
