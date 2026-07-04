import base64
import numpy as np
import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import VisionInferenceRequest, VisionAnalysisResponse, VisionAlert
from app.services.vision_service import vision_service
from app.services.edge_service import edge_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["vision"])

def decode_image(base64_str: str) -> np.ndarray:
    try:
        import cv2
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode image")
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

@router.post("/vision/analyze", response_model=VisionAnalysisResponse)
async def analyze_vision(request: VisionInferenceRequest):
    if not vision_service.is_initialized:
        raise HTTPException(status_code=503, detail="Vision service not initialized")
    image = decode_image(request.image_base64) if request.image_base64 else np.zeros((480, 640, 3), dtype=np.uint8)
    landmarks = request.landmarks
    result = await edge_service.run_inference(vision_service.detect_all, "vision", image, landmarks)
    return result

@router.post("/vision/ppe")
async def detect_ppe(request: VisionInferenceRequest):
    image = decode_image(request.image_base64) if request.image_base64 else np.zeros((480, 640, 3), dtype=np.uint8)
    result = await vision_service.detect_ppe(image)
    return result

@router.post("/vision/fall")
async def detect_fall(request: VisionInferenceRequest):
    landmarks = request.landmarks or [{"x": 0.5, "y": 0.3}] * 17
    result = await vision_service.detect_fall(landmarks, (request.frame_height or 480, request.frame_width or 640))
    return result

@router.post("/vision/posture")
async def analyze_posture(request: VisionInferenceRequest):
    landmarks = request.landmarks or [{"x": 0.5, "y": 0.3}] * 17
    result = await vision_service.analyze_posture(landmarks)
    return result

@router.post("/vision/fire-smoke")
async def detect_fire_smoke(request: VisionInferenceRequest):
    image = decode_image(request.image_base64) if request.image_base64 else np.zeros((480, 640, 3), dtype=np.uint8)
    result = await vision_service.detect_fire_smoke(image)
    return result

@router.post("/vision/intrusion")
async def check_intrusion(request: VisionInferenceRequest):
    result = await vision_service.check_intrusion([], [])
    return result

@router.post("/vision/count")
async def count_workers(request: VisionInferenceRequest):
    result = await vision_service.count_workers([], 0)
    return result
