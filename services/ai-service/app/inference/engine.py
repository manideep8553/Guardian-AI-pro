import numpy as np
import logging
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class BackendType(Enum):
    ONNX = "onnx"
    PYTORCH = "pytorch"
    MEDIAPIPE = "mediapipe"
    TENSORFLOW = "tensorflow"


class InferenceEngine:
    def __init__(self):
        self._sessions: dict[str, Any] = {}
        self._metadata: dict[str, dict] = {}
        self._available_backends: dict[BackendType, bool] = {}

    async def initialize(self):
        self._available_backends[BackendType.ONNX] = await self._check_onnx()
        self._available_backends[BackendType.PYTORCH] = await self._check_pytorch()
        self._available_backends[BackendType.MEDIAPIPE] = await self._check_mediapipe()
        available = [b.value for b, v in self._available_backends.items() if v]
        logger.info(f"Inference engine initialized. Available backends: {available}")

    async def _check_onnx(self) -> bool:
        try:
            import onnxruntime
            logger.info(f"ONNX Runtime available: {onnxruntime.__version__}")
            return True
        except ImportError:
            logger.warning("ONNX Runtime not available")
            return False

    async def _check_pytorch(self) -> bool:
        try:
            import torch
            logger.info(f"PyTorch available: {torch.__version__}, CUDA: {torch.cuda.is_available()}")
            return True
        except ImportError:
            logger.warning("PyTorch not available")
            return False

    async def _check_mediapipe(self) -> bool:
        try:
            import mediapipe
            logger.info(f"MediaPipe available: {mediapipe.__version__}")
            return True
        except ImportError:
            logger.warning("MediaPipe not available")
            return False

    def load_onnx_model(self, model_name: str, model_path: str) -> bool:
        try:
            import onnxruntime
            session = onnxruntime.InferenceSession(
                model_path,
                providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
                if onnxruntime.get_device() == "GPU"
                else ["CPUExecutionProvider"],
            )
            self._sessions[model_name] = session
            self._metadata[model_name] = {"backend": "onnx", "path": model_path}
            logger.info(f"Loaded ONNX model: {model_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to load ONNX model {model_name}: {e}")
            return False

    def load_pytorch_model(self, model_name: str, model: Any) -> bool:
        try:
            import torch
            model.eval()
            if torch.cuda.is_available():
                model = model.cuda()
            self._sessions[model_name] = model
            self._metadata[model_name] = {"backend": "pytorch"}
            logger.info(f"Loaded PyTorch model: {model_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to load PyTorch model {model_name}: {e}")
            return False

    def run_onnx(self, model_name: str, input_data: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
        session = self._sessions.get(model_name)
        if not session:
            raise ValueError(f"Model {model_name} not loaded")
        input_names = [inp.name for inp in session.get_inputs()]
        output_names = [out.name for out in session.get_outputs()]
        onnx_input = {name: input_data[name] for name in input_names if name in input_data}
        outputs = session.run(output_names, onnx_input)
        return dict(zip(output_names, outputs))

    def run_pytorch(self, model_name: str, input_tensor: Any) -> Any:
        import torch
        model = self._sessions.get(model_name)
        if not model:
            raise ValueError(f"Model {model_name} not loaded")
        with torch.no_grad():
            if torch.cuda.is_available():
                input_tensor = input_tensor.cuda()
            return model(input_tensor)

    def unload_model(self, model_name: str):
        if model_name in self._sessions:
            del self._sessions[model_name]
            del self._metadata[model_name]
            logger.info(f"Unloaded model: {model_name}")

    def is_backend_available(self, backend: BackendType) -> bool:
        return self._available_backends.get(backend, False)

    @property
    def loaded_models(self) -> list[str]:
        return list(self._sessions.keys())


inference_engine = InferenceEngine()
