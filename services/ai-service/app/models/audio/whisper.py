import numpy as np
import logging
from typing import Optional
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

AUDIO_CLASSES = {
    "gas_leak": ["hissing", "gas escaping", "pressure release", "chemical leak"],
    "machine_failure": ["grinding", "metal scraping", "engine knocking", "bearing noise", "mechanical failure"],
    "explosion": ["explosion", "blast", "loud bang", "detonation", "deflagration"],
    "worker_scream": ["scream", "shout for help", "cry of pain", "distress call", "yell"],
    "alarm": ["siren", "alarm", "warning buzzer", "fire alarm", "emergency alert"],
    "abnormal_equipment": ["abnormal vibration", "unusual noise", "rattle", "clunk", "overheating sound"],
    "normal": ["normal operation", "ambient noise", "background", "conversation"],
}

class WhisperAnalyzer:
    def __init__(self):
        self._model_name = "whisper_base"
        self._sample_rate = 16000
        self._loaded = False

    async def initialize(self):
        self._loaded = inference_engine.is_backend_available("pytorch")
        logger.info(f"Whisper analyzer initialized, model loaded: {self._loaded}")

    async def analyze(self, audio_data: np.ndarray) -> dict:
        if not self._loaded:
            return self._fallback_analyze(audio_data)
        try:
            result = inference_engine.run_pytorch(self._model_name, audio_data)
            return self._parse_result(result)
        except Exception as e:
            logger.warning(f"Whisper inference failed, using fallback: {e}")
            return self._fallback_analyze(audio_data)

    def _parse_result(self, result) -> dict:
        text = str(result.get("text", "")) if isinstance(result, dict) else str(result)
        return self._classify_text(text)

    def _classify_text(self, text: str) -> dict:
        text_lower = text.lower()
        scores = {}
        for category, keywords in AUDIO_CLASSES.items():
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            scores[category] = min(score / max(len(keywords), 1), 1.0)
        top_category = max(scores, key=scores.get)
        return {
            "transcription": text,
            "classification": top_category,
            "confidence": round(scores[top_category], 3),
            "scores": {k: round(v, 3) for k, v in scores.items()},
            "alert_triggered": top_category != "normal" and scores[top_category] > 0.2,
        }

    def _fallback_analyze(self, audio_data: np.ndarray) -> dict:
        rms = np.sqrt(np.mean(audio_data ** 2))
        spectral_centroid = self._compute_spectral_features(audio_data)
        is_loud = rms > 0.1
        is_high_freq = spectral_centroid.get("mean_freq", 0) > 3000
        classification = "normal"
        confidence = 0.3
        if is_loud and is_high_freq:
            classification = "alarm"
            confidence = 0.5
        elif is_loud:
            classification = "explosion"
            confidence = 0.4
        return {
            "transcription": "",
            "classification": classification,
            "confidence": round(confidence, 3),
            "scores": {k: round(0.1, 3) for k in AUDIO_CLASSES},
            "alert_triggered": classification != "normal",
            "rms_energy": round(float(rms), 4),
            "spectral_features": spectral_centroid,
            "fallback": True,
        }

    def _compute_spectral_features(self, audio: np.ndarray) -> dict:
        try:
            from scipy import signal
            freqs, times, Sxx = signal.spectrogram(audio, fs=self._sample_rate)
            mean_freq = float(np.mean(freqs))
            max_freq = float(freqs[np.argmax(np.mean(Sxx, axis=1))])
            return {"mean_freq": round(mean_freq, 2), "max_freq": round(max_freq, 2)}
        except:
            return {"mean_freq": 0, "max_freq": 0}

whisper_analyzer = WhisperAnalyzer()
