import numpy as np
import logging
from enum import Enum
from typing import Optional
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

class PPEClass(Enum):
    HELMET = "helmet"
    SAFETY_VEST = "safety_vest"
    GLOVES = "gloves"
    SAFETY_BOOTS = "safety_boots"
    MASK = "mask"
    SAFETY_GOGGLES = "safety_goggles"
    HARNESS = "harness"
    EAR_PROTECTION = "ear_protection"

PPE_CLASS_MAP: dict[int, str] = {
    0: "helmet", 1: "safety_vest", 2: "gloves", 3: "safety_boots",
    4: "mask", 5: "safety_goggles", 6: "harness", 7: "ear_protection",
}

class PPEDetector:
    def __init__(self):
        self._model_name = "yolov8n_ppe"
        self._input_shape = (640, 640)
        self._confidence_threshold = 0.5
        self._iou_threshold = 0.45

    async def initialize(self):
        logger.info("PPE detector initialized")

    def preprocess(self, image: np.ndarray) -> np.ndarray:
        import cv2
        h, w = image.shape[:2]
        input_w, input_h = self._input_shape
        scale = min(input_w / w, input_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        resized = cv2.resize(image, (new_w, new_h))
        canvas = np.zeros((input_h, input_w, 3), dtype=np.uint8)
        canvas[:new_h, :new_w] = resized
        blob = canvas.astype(np.float32) / 255.0
        blob = np.transpose(blob, (2, 0, 1))
        return np.expand_dims(blob, axis=0)

    def postprocess(self, outputs: list[np.ndarray], orig_shape: tuple) -> list[dict]:
        import numpy as np
        detections = []
        output = outputs[0][0]
        confidences = output[:, 4]
        mask = confidences > self._confidence_threshold
        output = output[mask]
        if len(output) == 0:
            return detections
        class_ids = np.argmax(output[:, 5:], axis=1)
        scores = np.max(output[:, 5:], axis=1)
        boxes = output[:, :4]
        oh, ow = orig_shape
        input_w, input_h = self._input_shape
        scale = min(input_w / ow, input_h / oh)
        for box, class_id, score in zip(boxes, class_ids, scores):
            x1, y1, x2, y2 = box
            x1 = int((x1 - (input_w - ow * scale) / 2) / scale)
            y1 = int((y1 - (input_h - oh * scale) / 2) / scale)
            x2 = int((x2 - (input_w - ow * scale) / 2) / scale)
            y2 = int((y2 - (input_h - oh * scale) / 2) / scale)
            detections.append({
                "class": PPE_CLASS_MAP.get(int(class_id), "unknown"),
                "confidence": float(score),
                "bbox": [max(0, x1), max(0, y1), min(ow, x2), min(oh, y2)],
            })
        return detections

    async def detect(self, image: np.ndarray) -> dict:
        try:
            orig_shape = image.shape[:2]
            input_blob = self.preprocess(image)
            outputs = inference_engine.run_onnx(self._model_name, {"images": input_blob})
            detections = self.postprocess(outputs, orig_shape)
            ppe_worn = set(d["class"] for d in detections if d["confidence"] > 0.5)
            missing_ppe = [p.value for p in PPEClass if p.value not in ppe_worn]
            return {
                "detections": detections,
                "ppe_worn": list(ppe_worn),
                "missing_ppe": missing_ppe,
                "total_ppe_items": len(ppe_worn),
                "compliance": len(ppe_worn) / len(PPEClass),
            }
        except Exception as e:
            logger.error(f"PPE detection error: {e}")
            return {"detections": [], "ppe_worn": [], "missing_ppe": [p.value for p in PPEClass], "total_ppe_items": 0, "compliance": 0.0, "error": str(e)}

ppe_detector = PPEDetector()
