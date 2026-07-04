import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class PostureDetector:
    def __init__(self):
        self._thresholds = {
            "back_angle_max": 30,
            "knee_angle_min": 60,
            "neck_angle_max": 25,
            "shoulder_slope_max": 20,
        }

    async def initialize(self):
        logger.info("Posture detector initialized")

    async def analyze(self, landmarks: list[dict]) -> dict:
        if not landmarks or len(landmarks) < 17:
            return {"unsafe_posture": False, "risks": [], "overall_score": 1.0}
        nose = landmarks[0]
        left_eye = landmarks[1]
        right_eye = landmarks[2]
        left_shoulder = landmarks[5]
        right_shoulder = landmarks[6]
        left_hip = landmarks[11]
        right_hip = landmarks[12]
        left_knee = landmarks[13]
        right_knee = landmarks[14]
        left_ankle = landmarks[15]
        right_ankle = landmarks[16]
        risks = []
        mid_shoulder = {"x": (left_shoulder["x"] + right_shoulder["x"]) / 2, "y": (left_shoulder["y"] + right_shoulder["y"]) / 2}
        mid_hip = {"x": (left_hip["x"] + right_hip["x"]) / 2, "y": (left_hip["y"] + right_hip["y"]) / 2}
        back_angle = abs(np.degrees(np.arctan2(mid_hip["y"] - mid_shoulder["y"], mid_hip["x"] - mid_shoulder["x"] + 1e-6)))
        forward_lean = abs(back_angle - 90)
        if forward_lean > self._thresholds["back_angle_max"]:
            risks.append({"type": "forward_lean", "severity": "high" if forward_lean > 45 else "medium", "value": round(forward_lean, 1)})
        neck_angle = abs(np.degrees(np.arctan2(nose["y"] - mid_shoulder["y"], nose["x"] - mid_shoulder["x"] + 1e-6)))
        neck_tilt = abs(neck_angle - 90)
        if neck_tilt > self._thresholds["neck_angle_max"]:
            risks.append({"type": "neck_tilt", "severity": "medium" if neck_tilt < 40 else "high", "value": round(neck_tilt, 1)})
        shoulder_slope = abs(np.degrees(np.arctan2(left_shoulder["y"] - right_shoulder["y"], left_shoulder["x"] - right_shoulder["x"] + 1e-6)))
        if shoulder_slope > self._thresholds["shoulder_slope_max"]:
            risks.append({"type": "uneven_shoulders", "severity": "low", "value": round(shoulder_slope, 1)})
        def knee_angle(hip, knee, ankle):
            v1 = np.array([hip["x"] - knee["x"], hip["y"] - knee["y"]])
            v2 = np.array([ankle["x"] - knee["x"], ankle["y"] - knee["y"]])
            cos_a = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
            return np.degrees(np.arccos(np.clip(cos_a, -1, 1)))
        l_knee = knee_angle(left_hip, left_knee, left_ankle)
        r_knee = knee_angle(right_hip, right_knee, right_ankle)
        min_knee = min(l_knee, r_knee)
        if min_knee < self._thresholds["knee_angle_min"]:
            risks.append({"type": "deep_squat", "severity": "high" if min_knee < 30 else "medium", "value": round(min_knee, 1)})
        has_risks = len(risks) > 0
        risk_count = len([r for r in risks if r["severity"] in ("high", "critical")])
        overall_score = max(0, 1.0 - (risk_count * 0.3 + len(risks) * 0.1))
        return {
            "unsafe_posture": has_risks,
            "risks": risks,
            "overall_score": round(overall_score, 3),
            "risk_level": "high" if risk_count > 1 else "medium" if risk_count > 0 else "low" if has_risks else "none",
        }

posture_detector = PostureDetector()
