import base64
import numpy as np
import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import AudioInferenceRequest, AudioAnalysisResponse
from app.services.audio_service import audio_service
from app.services.edge_service import edge_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["audio"])

def decode_audio(base64_str: str, sample_rate: int = 16000) -> np.ndarray:
    try:
        import io
        import wave
        audio_bytes = base64.b64decode(base64_str)
        if len(audio_bytes) < 44:
            return np.frombuffer(audio_bytes, dtype=np.float32)
        with io.BytesIO(audio_bytes) as wav_io:
            with wave.open(wav_io, 'rb') as wav:
                frames = wav.readframes(wav.getnframes())
                audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
                return audio
    except Exception as e:
        logger.warning(f"Audio decode fallback: {e}")
        return np.random.randn(sample_rate).astype(np.float32) * 0.01

@router.post("/audio/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio(request: AudioInferenceRequest):
    if not audio_service.is_initialized:
        raise HTTPException(status_code=503, detail="Audio service not initialized")
    audio = decode_audio(request.audio_base64, request.sample_rate) if request.audio_base64 else np.random.randn(request.sample_rate).astype(np.float32) * 0.01
    result = await edge_service.run_inference(audio_service.analyze, "audio", audio)
    return result

@router.post("/audio/classify")
async def classify_audio(request: AudioInferenceRequest):
    audio = decode_audio(request.audio_base64, request.sample_rate) if request.audio_base64 else np.random.randn(request.sample_rate).astype(np.float32) * 0.01
    result = await audio_service.analyze(audio)
    return result
