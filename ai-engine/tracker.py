"""
SKILL-SENTINEL AI Engine: Multi-Object Tracking Module
Implements IoU and Centroid-based tracking for multi-frame deduplication,
dwell-time calculation, and motion vector extraction.
Strictly non-biometric: tracking IDs are ephemeral integers (T-01, T-02...).
"""

import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .detector import DetectedObject

class TrackedObject(BaseModel):
    track_id: int
    class_name: str
    current_bbox: List[float]
    current_center: List[float]
    velocity_vector: List[float] = Field(default_factory=lambda: [0.0, 0.0])
    is_stationary: bool = True
    dwell_time_seconds: float = 0.0
    zone: str = "WORKSTATION_ZONE"
    trajectory: List[List[float]] = Field(default_factory=list)
    age_frames: int = 1
    missed_frames: int = 0

class SpatialTracker:
    def __init__(self, max_missed: int = 15, iou_dist_threshold: float = 0.3):
        self.max_missed = max_missed
        self.iou_dist_threshold = iou_dist_threshold
        self.next_track_id = 1
        self.tracks: Dict[int, TrackedObject] = {}

    def _determine_zone(self, center: List[float]) -> str:
        cx, cy = center[0], center[1]
        if cy < 0.25 and 0.35 <= cx <= 0.65:
            return "INSTRUCTOR_PODIUM"
        elif cx > 0.82 and cy < 0.40:
            return "ENTRANCE_EXIT"
        elif 0.10 <= cx <= 0.85 and 0.22 <= cy <= 0.75:
            return "WORKSTATION_ZONE"
        else:
            return "COLLABORATION_AREA"

    def update(self, detections: List[DetectedObject], delta_time: float = 1.0) -> List[TrackedObject]:
        """
        Updates tracks with new detections using spatial Euclidean center matching.
        """
        matched_tracks = set()
        matched_detections = set()

        # Only track person class for presence & activity signals
        person_detections = [d for d in detections if d.class_name == "person"]

        # Match existing tracks with detections based on distance
        for track_id, track in list(self.tracks.items()):
            best_dist = float("inf")
            best_det_idx = None

            for i, det in enumerate(person_detections):
                if i in matched_detections:
                    continue
                dx = track.current_center[0] - det.center[0]
                dy = track.current_center[1] - det.center[1]
                dist = math.sqrt(dx * dx + dy * dy)
                if dist < best_dist and dist < self.iou_dist_threshold:
                    best_dist = dist
                    best_det_idx = i

            if best_det_idx is not None:
                det = person_detections[best_det_idx]
                matched_tracks.add(track_id)
                matched_detections.add(best_det_idx)

                # Compute velocity vector
                vx = round((det.center[0] - track.current_center[0]) / max(0.01, delta_time), 3)
                vy = round((det.center[1] - track.current_center[1]) / max(0.01, delta_time), 3)
                speed = math.sqrt(vx * vx + vy * vy)

                track.velocity_vector = [vx, vy]
                track.is_stationary = speed < 0.05
                track.current_bbox = det.bbox
                track.current_center = det.center
                track.dwell_time_seconds += delta_time
                track.age_frames += 1
                track.missed_frames = 0
                track.zone = self._determine_zone(det.center)
                track.trajectory.append(det.center)
                if len(track.trajectory) > 20:
                    track.trajectory.pop(0)
            else:
                track.missed_frames += 1

        # Delete stale tracks
        stale_ids = [t_id for t_id, t in self.tracks.items() if t.missed_frames > self.max_missed]
        for s_id in stale_ids:
            del self.tracks[s_id]

        # Initialize new tracks for unmatched detections
        for i, det in enumerate(person_detections):
            if i not in matched_detections:
                new_track = TrackedObject(
                    track_id=self.next_track_id,
                    class_name="person",
                    current_bbox=det.bbox,
                    current_center=det.center,
                    velocity_vector=[0.0, 0.0],
                    is_stationary=True,
                    dwell_time_seconds=delta_time,
                    zone=self._determine_zone(det.center),
                    trajectory=[det.center],
                    age_frames=1,
                    missed_frames=0
                )
                self.tracks[self.next_track_id] = new_track
                self.next_track_id += 1

        return list(self.tracks.values())
