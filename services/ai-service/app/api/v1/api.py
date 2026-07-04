from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.health import router as health_router
from app.api.v1.predictions import router as prediction_router
from app.api.v1.detection import router as detection_router
from app.api.v1.audio import router as audio_router
from app.api.v1.iot import router as iot_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-powered predictive safety analysis microservice with computer vision, audio intelligence, IoT simulation, and edge inference",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_prefix, tags=["health"])
app.include_router(prediction_router, prefix=settings.api_prefix, tags=["predictions"])
app.include_router(detection_router, prefix=settings.api_prefix, tags=["vision"])
app.include_router(audio_router, prefix=settings.api_prefix, tags=["audio"])
app.include_router(iot_router, prefix=settings.api_prefix, tags=["iot"])
