import logging
import uvicorn
from app.core.config import settings
from app.inference.engine import inference_engine
from app.inference.registry import model_registry
from app.services.vision_service import vision_service
from app.services.audio_service import audio_service
from app.services.iot_service import iot_service
from app.services.edge_service import edge_service
from app.api.v1.api import app

logging.basicConfig(level=getattr(logging, settings.log_level.upper()) if hasattr(settings, 'log_level') else logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    logger.info("Initializing GuardianAI Pro AI Microservice...")
    await inference_engine.initialize()
    await model_registry.initialize()
    await vision_service.initialize()
    await audio_service.initialize()
    await edge_service.initialize()
    await iot_service.initialize()
    logger.info("All services initialized successfully")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down AI Microservice...")
    await iot_service.stop_streaming()
    await edge_service.stop()

if __name__ == "__main__":
    uvicorn.run(
        "app.api.v1.api:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.env == "development",
    )
