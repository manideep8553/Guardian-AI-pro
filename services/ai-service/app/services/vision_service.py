import numpy as np
import logging
import asyncio
from typing import Optional
from app.models.vision.ppe import ppe_detector
from app.models.vision.fall import fall_detector
from app.models.vision.posture import posture_detector
from app.models.vision.fire import fire_detector
from app.models.vision.intrusion import intrusion_detector
from app.models.vision.counting import worker_counter
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        self._initialized = False

    async def initialize(self):
        await ppe_detector.initialize()
        await fall_detector.initialize()
        await posture_detector.initialize()
        await fire_detector.initialize()
        await intrusion_detector.initialize()
        await worker_counter.initialize()
        self._initialized = True
        logger.info("Vision service initialized")

    async def detect_all(self, image: np.ndarray, landmarks: Optional[list] = None) -> dict:
        tasks = {
            "ppe": ppe_detector.detect(image),
            "fire_smoke": fire_detector.detect(image),
        }
        if landmarks:
            tasks["fall"] = fall_detector.detect(landmarks, image.shape[:2])
            tasks["posture"] = posture_detector.analyze(landmarks)
        results = {}
        for key, coro in tasks.items():
            try:
                results[key] = await coro
            except Exception as e:
                logger.error(f"{key} detection failed: {e}")
                results[key] = {"error": str(e)}
        if results.get("ppe"):
            results["intrusion"] = await intrusion_detector.check(
                results["ppe"].get("detections", []),
                [{"bbox": [0, 0, 100, 100]}],
            )
        persons = results.get("ppe", {}).get("detections", [])
        results["worker_count"] = await worker_counter.count(persons, 0)
        alerts = self._generate_alerts(results)
        return {"results": results, "alerts": alerts, "overall_risk": self._overall_risk(alerts)}

    def _generate_alerts(self, results: dict) -> list:
        alerts = []
        fire = results.get("fire_smoke", {})
        if fire.get("fire_detected"):
            alerts.append({"type": "FIRE", "severity": "critical", "message": "Fire detected in monitored area"})
        if fire.get("smoke_detected"):
            alerts.append({"type": "SMOKE", "severity": "high", "message": "Smoke detected"})
        fall = results.get("fall", {})
        if fall.get("fall_detected"):
            alerts.append({"type": "FALL", "severity": fall.get("risk_level", "high"), "message": "Worker fall detected"})
        posture = results.get("posture", {})
        if posture.get("unsafe_posture"):
            alerts.append({"type": "UNSAFE_POSTURE", "severity": posture.get("risk_level", "medium"), "message": "Unsafe working posture detected"})
        ppe = results.get("ppe", {})
        if ppe.get("missing_ppe"):
            alerts.append({"type": "PPE_VIOLATION", "severity": "high", "message": f"Missing PPE: {', '.join(ppe['missing_ppe'][:3])}"})
        intrusion = results.get("intrusion", {})
        if intrusion.get("intrusion_detected"):
            alerts.append({"type": "INTRUSION", "severity": "critical", "message": "Restricted area intrusion detected"})
        return alerts

    def _overall_risk(self, alerts: list) -> str:
        if any(a["severity"] == "critical" for a in alerts):
            return "critical"
        if any(a["severity"] == "high" for a in alerts):
            return "high"
        if alerts:
            return "medium"
        return "low"

    async def detect_ppe(self, image: np.ndarray) -> dict:
        return await ppe_detector.detect(image)

    async def detect_fall(self, landmarks: list, frame_shape: tuple) -> dict:
        return await fall_detector.detect(landmarks, frame_shape)

    async def analyze_posture(self, landmarks: list) -> dict:
        return await posture_detector.analyze(landmarks)

    async def detect_fire_smoke(self, image: np.ndarray) -> dict:
        return await fire_detector.detect(image)

    async def check_intrusion(self, detections: list, persons: list) -> dict:
        return await intrusion_detector.check(detections, persons)

    async def count_workers(self, detections: list, frame_id: int) -> dict:
        return await worker_counter.count(detections, frame_id)

    @property
    def is_initialized(self) -> bool:
        return self._initialized

vision_service = VisionService()
