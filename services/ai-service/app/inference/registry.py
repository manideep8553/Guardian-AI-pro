import os
import json
import logging
from typing import Optional
from app.core.config import settings
from app.inference.engine import inference_engine, BackendType

logger = logging.getLogger(__name__)


class ModelRegistry:
    def __init__(self):
        self._model_index: dict[str, dict] = {}
        self._index_path = os.path.join(settings.model_path, "model_index.json")

    async def initialize(self):
        os.makedirs(settings.model_path, exist_ok=True)
        os.makedirs(settings.yolo_model_path, exist_ok=True)
        os.makedirs(settings.mediapipe_model_path, exist_ok=True)
        os.makedirs(settings.ppe_model_path, exist_ok=True)
        os.makedirs(settings.edge_cache_dir, exist_ok=True)
        await self._load_index()
        logger.info(f"Model registry initialized. Path: {settings.model_path}")

    async def _load_index(self):
        if os.path.exists(self._index_path):
            with open(self._index_path) as f:
                self._model_index = json.load(f)
        else:
            self._model_index = {
                "yolov8n_ppe": {
                    "path": os.path.join(settings.yolo_model_path, "yolov8n_ppe.onnx"),
                    "backend": "onnx",
                    "version": "1.0.0",
                    "loaded": False,
                },
                "yolov8n_fire": {
                    "path": os.path.join(settings.yolo_model_path, "yolov8n_fire.onnx"),
                    "backend": "onnx",
                    "version": "1.0.0",
                    "loaded": False,
                },
                "pose_landmarker": {
                    "path": os.path.join(settings.mediapipe_model_path, "pose_landmarker.task"),
                    "backend": "mediapipe",
                    "version": "1.0.0",
                    "loaded": False,
                },
                "whisper_base": {
                    "path": "base",
                    "backend": "pytorch",
                    "version": "1.0.0",
                    "loaded": False,
                },
                "cnn_audio": {
                    "path": os.path.join(settings.model_path, "cnn_audio.onnx"),
                    "backend": "onnx",
                    "version": "1.0.0",
                    "loaded": False,
                },
            }
            self._save_index()

    def _save_index(self):
        with open(self._index_path, "w") as f:
            json.dump(self._model_index, f, indent=2)

    async def load_model(self, model_name: str) -> bool:
        info = self._model_index.get(model_name)
        if not info:
            logger.error(f"Model {model_name} not found in registry")
            return False
        if info["loaded"]:
            return True
        try:
            if info["backend"] == "onnx":
                success = inference_engine.load_onnx_model(model_name, info["path"])
            elif info["backend"] == "pytorch":
                if model_name == "whisper_base":
                    success = await self._load_whisper()
                else:
                    success = inference_engine.load_pytorch_model(model_name, None)
            elif info["backend"] == "mediapipe":
                success = await self._load_mediapipe_model(model_name, info["path"])
            else:
                success = False
            if success:
                info["loaded"] = True
                self._save_index()
            return success
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            return False

    async def _load_whisper(self) -> bool:
        try:
            import whisper
            model = whisper.load_model(settings.whisper_model_size)
            inference_engine.load_pytorch_model("whisper_base", model)
            return True
        except Exception as e:
            logger.error(f"Failed to load Whisper: {e}")
            return False

    async def _load_mediapipe_model(self, model_name: str, model_path: str) -> bool:
        try:
            import mediapipe as mp
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    model_data = f.read()
                inference_engine._sessions[model_name] = model_data
                inference_engine._metadata[model_name] = {"backend": "mediapipe", "path": model_path}
                return True
            logger.warning(f"MediaPipe model not found at {model_path}, using runtime solution")
            return True
        except Exception as e:
            logger.error(f"MediaPipe load error: {e}")
            return False

    def get_model_info(self, model_name: str) -> Optional[dict]:
        return self._model_index.get(model_name)

    @property
    def registered_models(self) -> list[str]:
        return list(self._model_index.keys())


model_registry = ModelRegistry()
