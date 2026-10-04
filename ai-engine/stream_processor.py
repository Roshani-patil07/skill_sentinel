"""
AI Vision Stream Processor Interface
Handles RTSP / WebRTC frame sampling, aggregate counting without biometric facial recognition.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
from .contracts import AggregateDetectionEvent, BoundingBox

class BaseVisionProcessor(ABC):
    @abstractmethod
    def process_frame(self, frame_data: Any) -> AggregateDetectionEvent:
        """Process video frame and extract anonymous person count + equipment presence."""
        pass

class EdgeYOLOAggregator(BaseVisionProcessor):
    def __init__(self, camera_id: str, centre_id: str, room_id: str, confidence_threshold: float = 0.45):
        self.camera_id = camera_id
        self.centre_id = centre_id
        self.room_id = room_id
        self.confidence_threshold = confidence_threshold

    def process_frame(self, frame_data: Any) -> AggregateDetectionEvent:
        """
        Placeholder edge processor compliant with Phase 1.
        In Phase 2, this loads Ultralytics YOLOv11n weights with TensorRT/OpenVINO acceleration.
        """
        # Returns structured anonymous telemetry
        return AggregateDetectionEvent(
            camera_id=self.camera_id,
            centre_id=self.centre_id,
            room_id=self.room_id,
            person_count=18,
            average_confidence=0.91,
            equipment_detected={"computer_workstations": 20, "biometric_kiosks": 1},
            ambient_tampering_detected=False
        )
