from pydantic import BaseModel, Field
from typing import Optional, Literal


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    vision_loaded: bool = False
    audio_loaded: bool = False
    iot_running: bool = False
    edge_mode: bool = False
    cached_inferences: int = 0


# ── Vision Schemas ──

class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class PPEDetection(BaseModel):
    class_name: str
    confidence: float
    bbox: BBox

class PPEDetectionResult(BaseModel):
    detections: list[PPEDetection]
    ppe_worn: list[str]
    missing_ppe: list[str]
    compliance: float

class FallDetectionResult(BaseModel):
    fall_detected: bool
    confidence: float
    risk_level: str

class PostureRisk(BaseModel):
    type: str
    severity: str
    value: float

class PostureResult(BaseModel):
    unsafe_posture: bool
    risks: list[PostureRisk]
    overall_score: float

class FireSmokeResult(BaseModel):
    fire_detected: bool
    smoke_detected: bool
    detections: list[dict]
    risk_level: str

class IntrusionResult(BaseModel):
    intrusion_detected: bool
    intrusions: list[dict]
    total_intrusions: int

class WorkerCountResult(BaseModel):
    total_count: int
    current_frame_count: int

class VisionAlert(BaseModel):
    type: str
    severity: str
    message: str

class VisionAnalysisResponse(BaseModel):
    results: dict
    alerts: list[VisionAlert]
    overall_risk: str


# ── Audio Schemas ──

class AudioAnalysisResult(BaseModel):
    classification: str
    confidence: float
    whisper: dict
    cnn: dict
    alert_triggered: bool

class AudioAlert(BaseModel):
    type: str
    severity: str
    message: str

class AudioAnalysisResponse(BaseModel):
    analysis: AudioAnalysisResult
    alerts: list[AudioAlert]
    overall_risk: str


# ── IoT Schemas ──

class IoTDeviceReadRequest(BaseModel):
    device_type: Literal["esp32", "raspberry_pi", "jetson_nano", "smart_helmet", "wearable"] = "esp32"

class IoTStreamRequest(BaseModel):
    device_type: Literal["esp32", "raspberry_pi", "jetson_nano", "smart_helmet", "wearable"] = "esp32"
    interval_seconds: float = 5.0

class IoTLocationRequest(BaseModel):
    method: Literal["gps", "uwb", "ble", "fusion"] = "fusion"

class IoTAnomalyRequest(BaseModel):
    enabled: bool = True

class EquipmentReadRequest(BaseModel):
    equipment_id: Optional[str] = None


# ── Edge Schemas ──

class EdgeModeRequest(BaseModel):
    enabled: bool = True

class EdgeSyncResponse(BaseModel):
    synced_count: int
    pending_count: int
    cached_count: int


# ── Inference Schemas ──

class VisionInferenceRequest(BaseModel):
    image_base64: Optional[str] = None
    landmarks: Optional[list] = None
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None
    detect_ppe: bool = True
    detect_fall: bool = True
    detect_posture: bool = True
    detect_fire: bool = True
    detect_intrusion: bool = False
    count_workers: bool = True

class AudioInferenceRequest(BaseModel):
    audio_base64: Optional[str] = None
    sample_rate: int = 16000

class PredictionRequest(BaseModel):
    features: list[float]
    model_name: str = "default"

class PredictionResponse(BaseModel):
    prediction: float
    probability: float
    model_name: str
    model_version: str

class RiskAssessmentRequest(BaseModel):
    incident_type: str
    severity: str
    zone: str
    weather_conditions: Optional[str] = None
    equipment_status: Optional[str] = None
    historical_incidents: int = Field(default=0, ge=0)

class RiskAssessmentResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: Literal["low", "medium", "high", "critical"]
    recommendations: list[str]
    confidence: float = Field(..., ge=0, le=1)
