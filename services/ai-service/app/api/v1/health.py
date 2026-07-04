from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings
from app.inference.engine import inference_engine
from app.services.vision_service import vision_service
from app.services.audio_service import audio_service
from app.services.iot_service import iot_service
from app.services.edge_service import edge_service

router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        version="1.0.0",
        model_loaded=len(inference_engine.loaded_models) > 0,
        vision_loaded=vision_service.is_initialized,
        audio_loaded=audio_service.is_initialized,
        iot_running=iot_service.is_running,
        edge_mode=edge_service.is_edge_mode,
        cached_inferences=edge_service.cached_count,
    )
