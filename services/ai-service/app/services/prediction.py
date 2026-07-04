import numpy as np
from app.models.schemas import PredictionRequest, PredictionResponse


class PredictionService:
    def __init__(self):
        self._model_loaded = False
        self._model_version = "1.0.0"

    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        features = np.array(request.features)
        prediction = float(np.mean(features))
        probability = float(1.0 / (1.0 + np.exp(-prediction)))

        return PredictionResponse(
            prediction=prediction,
            probability=probability,
            model_name=request.model_name,
            model_version=self._model_version,
        )

    @property
    def is_model_loaded(self) -> bool:
        return self._model_loaded


prediction_service = PredictionService()
