from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PredictionRequest,
    PredictionResponse,
    RiskAssessmentRequest,
    RiskAssessmentResponse,
)
from app.services.prediction import prediction_service
from app.services.risk_analysis import risk_service

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        result = await prediction_service.predict(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/risk-assessment", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    try:
        result = await risk_service.assess_risk(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
