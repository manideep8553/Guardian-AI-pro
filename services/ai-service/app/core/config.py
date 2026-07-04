from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    env: str = "development"
    app_name: str = "GuardianAI Pro - AI Microservice"
    debug: bool = True
    redis_url: str = "redis://redis:6379"
    model_path: str = "/app/models"
    api_prefix: str = "/api/v1"

    # Vision
    yolo_model_path: str = "/app/models/yolo"
    mediapipe_model_path: str = "/app/models/mediapipe"
    ppe_model_path: str = "/app/models/ppe"
    detection_confidence: float = 0.5
    iou_threshold: float = 0.45

    # Audio
    whisper_model_size: str = "base"
    audio_sample_rate: int = 16000
    spectrogram_height: int = 128

    # IoT / MQTT
    mqtt_broker: str = "localhost"
    mqtt_port: int = 1883
    mqtt_ws_port: int = 9001
    mqtt_username: Optional[str] = None
    mqtt_password: Optional[str] = None
    mqtt_topic_prefix: str = "guardianai/iot"

    # AWS IoT Core
    aws_iot_endpoint: Optional[str] = None
    aws_iot_cert_path: Optional[str] = None
    aws_iot_key_path: Optional[str] = None
    aws_iot_ca_path: Optional[str] = None
    aws_iot_topic: str = "guardianai/edge/sync"
    aws_region: str = "us-east-1"

    # Edge
    edge_cache_dir: str = "/tmp/edge-cache"
    sync_interval_seconds: int = 300
    max_batch_size: int = 32

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
