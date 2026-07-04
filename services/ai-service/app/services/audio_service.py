import numpy as np
import logging
from typing import Optional
from app.models.audio.whisper import whisper_analyzer
from app.models.audio.cnn import cnn_audio_classifier

logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        self._initialized = False

    async def initialize(self):
        await whisper_analyzer.initialize()
        await cnn_audio_classifier.initialize()
        self._initialized = True
        logger.info("Audio service initialized")

    async def analyze(self, audio_data: np.ndarray) -> dict:
        whisper_result = await whisper_analyzer.analyze(audio_data)
        cnn_result = await cnn_audio_classifier.classify(audio_data)
        combined = self._fuse_results(whisper_result, cnn_result)
        alerts = self._generate_alerts(combined)
        return {"analysis": combined, "alerts": alerts, "overall_risk": self._overall_risk(alerts)}

    def _fuse_results(self, whisper: dict, cnn: dict) -> dict:
        w_class = whisper.get("classification", "normal")
        c_class = cnn.get("classification", "normal_operation")
        w_conf = whisper.get("confidence", 0)
        c_conf = cnn.get("confidence", 0)
        if w_conf > c_conf and w_class != "normal":
            fused_class = w_class
            fused_conf = w_conf
        elif c_conf > w_conf and c_class != "normal_operation":
            fused_class = c_class.replace("_operation", "")
            fused_conf = c_conf
        else:
            fused_class = w_class if w_class != "normal" else c_class.replace("_operation", "")
            fused_conf = max(w_conf, c_conf)
        return {
            "classification": fused_class,
            "confidence": round(fused_conf, 3),
            "whisper": {"transcription": whisper.get("transcription", ""), "classification": w_class, "confidence": w_conf},
            "cnn": {"classification": c_class, "confidence": c_conf, "scores": cnn.get("scores", {})},
            "alert_triggered": fused_class not in ("normal", "normal_operation", "normal_operation"),
        }

    def _generate_alerts(self, analysis: dict) -> list:
        alerts = []
        classification = analysis.get("classification", "")
        if classification == "gas_leak":
            alerts.append({"type": "GAS_LEAK", "severity": "critical", "message": "Gas leak detected by audio analysis"})
        elif classification == "explosion":
            alerts.append({"type": "EXPLOSION", "severity": "critical", "message": "Explosion detected"})
        elif classification == "worker_scream":
            alerts.append({"type": "WORKER_DISTRESS", "severity": "critical", "message": "Worker distress sound detected"})
        elif classification == "machine_failure":
            alerts.append({"type": "MACHINE_FAILURE", "severity": "high", "message": "Abnormal machine noise detected"})
        elif classification == "alarm":
            alerts.append({"type": "ALARM", "severity": "high", "message": "Alarm sound detected"})
        elif classification == "abnormal_equipment":
            alerts.append({"type": "ABNORMAL_EQUIPMENT", "severity": "medium", "message": "Unusual equipment sound detected"})
        return alerts

    def _overall_risk(self, alerts: list) -> str:
        if any(a["severity"] == "critical" for a in alerts):
            return "critical"
        if any(a["severity"] == "high" for a in alerts):
            return "high"
        return "low" if alerts else "none"

    @property
    def is_initialized(self) -> bool:
        return self._initialized

audio_service = AudioService()
