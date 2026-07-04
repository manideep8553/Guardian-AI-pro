import numpy as np
import logging
from typing import Optional
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

class FallDetector:
    def __init__(self):
        self._history: list = []
        self._history_len = 30
        self._fall_threshold = 0.4
        self._velocity_threshold = 50

    async def initialize(self):
        logger.info("Fall detector initialized")

    async def detect(self, landmarks: list[dict], frame_shape: tuple) -> dict:
        if not landmarks or len(landmarks) < 17:
            return {"fall_detected": False, "confidence": 0.0, "risk_level": "none"}
        nose = landmarks[0]
        left_hip = landmarks[11]
        right_hip = landmarks[12]
        left_ankle = landmarks[15]
        right_ankle = landmarks[16]
        hip_center = {"x": (left_hip["x"] + right_hip["x"]) / 2, "y": (left_hip["y"] + right_hip["y"]) / 2}
        ankle_center = {"x": (left_ankle["x"] + right_ankle["x"]) / 2, "y": (left_ankle["y"] + right_ankle["y"]) / 2}
        body_angle = abs(np.degrees(np.arctan2(hip_center["y"] - ankle_center["y"], hip_center["x"] - ankle_center["x"] + 1e-6)))
        is_horizontal = body_angle < 45 or body_angle > 135
        hip_y_ratio = hip_center["y"] / frame_shape[0]
        hip_velocity = 0
        if self._history:
            prev_hip = self._history[-1]
            hip_velocity = abs(hip_center["y"] - prev_hip["y"]) * frame_shape[0]
        self._history.append({"y": hip_center["y"], "time": len(self._history)})
        if len(self._history) > self._history_len:
            self._history.pop(0)
        fall_score = 0.0
        if is_horizontal and hip_y_ratio > 0.4:
            fall_score += 0.5
        if hip_velocity > self._velocity_threshold:
            fall_score += 0.3
        if is_horizontal and hip_y_ratio > 0.6:
            fall_score += 0.2
        fall_detected = fall_score > self._fall_threshold
        risk_level = "critical" if fall_score > 0.8 else "high" if fall_score > 0.6 else "medium" if fall_score > 0.4 else "low"
        return {
            "fall_detected": fall_detected,
            "confidence": round(fall_score, 3),
            "risk_level": risk_level,
            "body_angle": round(body_angle, 2),
            "hip_velocity": round(hip_velocity, 2),
        }

fall_detector = FallDetector()
