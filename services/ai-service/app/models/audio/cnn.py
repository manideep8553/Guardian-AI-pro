import numpy as np
import logging
from typing import Optional
from app.inference.engine import inference_engine

logger = logging.getLogger(__name__)

AUDIO_LABELS = [
    "gas_leak", "machine_failure", "explosion", "worker_scream",
    "alarm", "abnormal_equipment", "normal_operation",
]

class CNNAudioClassifier:
    def __init__(self):
        self._model_name = "cnn_audio"
        self._sample_rate = 16000
        self._n_mels = 128
        self._hop_length = 512
        self._n_fft = 2048
        self._loaded = False

    async def initialize(self):
        self._loaded = inference_engine.is_backend_available("onnx")
        logger.info(f"CNN audio classifier initialized, ONNX loaded: {self._loaded}")

    async def classify(self, audio_data: np.ndarray) -> dict:
        try:
            spectrogram = self._compute_mel_spectrogram(audio_data)
            if self._loaded:
                outputs = inference_engine.run_onnx(self._model_name, {"input": spectrogram})
                return self._parse_outputs(outputs)
            else:
                return self._heuristic_classify(audio_data, spectrogram)
        except Exception as e:
            logger.error(f"CNN audio classification error: {e}")
            return self._heuristic_classify(audio_data, None)

    def _compute_mel_spectrogram(self, audio: np.ndarray) -> np.ndarray:
        try:
            import librosa
            mel_spec = librosa.feature.melspectrogram(
                y=audio.astype(np.float32),
                sr=self._sample_rate,
                n_mels=self._n_mels,
                hop_length=self._hop_length,
                n_fft=self._n_fft,
            )
            log_mel = librosa.power_to_db(mel_spec, ref=np.max)
            target_frames = 128
            if log_mel.shape[1] < target_frames:
                pad_width = target_frames - log_mel.shape[1]
                log_mel = np.pad(log_mel, ((0, 0), (0, pad_width)))
            else:
                log_mel = log_mel[:, :target_frames]
            return np.expand_dims(np.expand_dims(log_mel, 0), 0).astype(np.float32)
        except ImportError:
            audio_len = len(audio)
            target_len = self._n_mels * 128
            if audio_len < target_len:
                audio = np.pad(audio, (0, target_len - audio_len))
            else:
                audio = audio[:target_len]
            return audio.reshape(1, 1, self._n_mels, 128).astype(np.float32)

    def _parse_outputs(self, outputs: list[np.ndarray]) -> dict:
        probs = outputs[0][0]
        top_idx = int(np.argmax(probs))
        top_class = AUDIO_LABELS[top_idx] if top_idx < len(AUDIO_LABELS) else "unknown"
        scores = {AUDIO_LABELS[i]: float(probs[i]) for i in range(len(AUDIO_LABELS)) if i < len(probs)}
        return {
            "classification": top_class,
            "confidence": round(float(probs[top_idx]), 4),
            "scores": {k: round(v, 4) for k, v in scores.items()},
            "alert_triggered": top_class != "normal_operation" and float(probs[top_idx]) > 0.5,
            "model": "cnn_spectrogram",
        }

    def _heuristic_classify(self, audio: np.ndarray, spectrogram: Optional[np.ndarray]) -> dict:
        rms = np.sqrt(np.mean(audio ** 2)) if audio is not None else 0
        if rms > 0.15:
            classification = "alarm"
            confidence = min(rms * 2, 0.8)
        elif rms > 0.08:
            classification = "machine_failure"
            confidence = rms
        else:
            classification = "normal_operation"
            confidence = max(1 - rms * 10, 0.5)
        return {
            "classification": classification,
            "confidence": round(confidence, 3),
            "scores": {lbl: round(0.1, 3) for lbl in AUDIO_LABELS},
            "alert_triggered": classification != "normal_operation",
            "model": "heuristic_fallback",
            "rms_energy": round(float(rms), 4),
        }

cnn_audio_classifier = CNNAudioClassifier()
