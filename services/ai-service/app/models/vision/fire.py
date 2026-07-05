import numpy as np
import logging
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

class FireSmokeDetector:
    def __init__(self):
        self._model_name = "yolov8n_fire"
        self._frame_buffer: list = []
        self._buffer_size = 5
        self._fire_threshold = 0.4
        self._smoke_threshold = 0.3

    async def initialize(self):
        logger.info("Fire/smoke detector initialized")

    def preprocess(self, image: np.ndarray) -> np.ndarray:
        import cv2
        blob = cv2.dnn.blobFromImage(image, 1/255.0, (640, 640), swapRB=True, crop=False)
        return blob

    async def detect(self, image: np.ndarray) -> dict:
        try:
            input_blob = self.preprocess(image)
            outputs = inference_engine.run_onnx(self._model_name, {"images": input_blob})
            detections = self._parse_outputs(outputs, image.shape[:2])
            has_fire = any(d["class"] == "fire" and d["confidence"] > self._fire_threshold for d in detections)
            has_smoke = any(d["class"] == "smoke" and d["confidence"] > self._smoke_threshold for d in detections)
            self._frame_buffer.append({"has_fire": has_fire, "has_smoke": has_smoke})
            if len(self._frame_buffer) > self._buffer_size:
                self._frame_buffer.pop(0)
            smoothed_fire = sum(1 for f in self._frame_buffer if f["has_fire"]) > len(self._frame_buffer) * 0.4
            smoothed_smoke = sum(1 for f in self._frame_buffer if f["has_smoke"]) > len(self._frame_buffer) * 0.4
            return {
                "fire_detected": smoothed_fire,
                "smoke_detected": smoothed_smoke,
                "detections": detections,
                "risk_level": "critical" if smoothed_fire else "high" if smoothed_smoke else "none",
                "frame_count": len(self._frame_buffer),
            }
        except Exception as e:
            logger.error(f"Fire/smoke detection error: {e}")
            return {"fire_detected": False, "smoke_detected": False, "detections": [], "risk_level": "none", "error": str(e)}

    def _parse_outputs(self, outputs: list[np.ndarray], orig_shape: tuple) -> list[dict]:
        import numpy as np
        detections = []
        output = outputs[0][0]
        conf_mask = output[:, 4] > 0.3
        output = output[conf_mask]
        for row in output:
            scores = row[5:]
            class_id = np.argmax(scores)
            confidence = float(scores[class_id])
            label = "fire" if class_id == 0 else "smoke"
            detections.append({"class": label, "confidence": round(confidence, 3)})
        return detections

    async def detect_fire_by_color(self, image: np.ndarray) -> dict:
        try:
            import cv2
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            fire_lower = np.array([0, 50, 200])
            fire_upper = np.array([30, 255, 255])
            fire_mask = cv2.inRange(hsv, fire_lower, fire_upper)
            fire_pixels = cv2.countNonZero(fire_mask)
            total_pixels = image.shape[0] * image.shape[1]
            fire_ratio = fire_pixels / total_pixels
            smoke_lower = np.array([0, 0, 100])
            smoke_upper = np.array([180, 50, 200])
            smoke_mask = cv2.inRange(hsv, smoke_lower, smoke_upper)
            smoke_pixels = cv2.countNonZero(smoke_mask)
            smoke_ratio = smoke_pixels / total_pixels
            return {"fire_ratio": round(fire_ratio, 4), "smoke_ratio": round(smoke_ratio, 4)}
        except Exception as e:
            return {"fire_ratio": 0, "smoke_ratio": 0, "error": str(e)}

fire_detector = FireSmokeDetector()
