import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Optional
from app.core.config import settings
from app.core.mqtt import mqtt_client
from app.core.aws import aws_iot_client

logger = logging.getLogger(__name__)

class EdgeService:
    def __init__(self):
        self._cache_dir = settings.edge_cache_dir
        self._sync_interval = settings.sync_interval_seconds
        self._sync_task: Optional[asyncio.Task] = None
        self._running = False
        self._edge_mode = False

    async def initialize(self):
        os.makedirs(self._cache_dir, exist_ok=True)
        self._running = True
        self._detect_edge_mode()
        self._sync_task = asyncio.create_task(self._sync_loop())
        logger.info(f"Edge service initialized. Mode: {'EDGE' if self._edge_mode else 'CLOUD'}")

    def _detect_edge_mode(self):
        self._edge_mode = not os.environ.get("CLOUD_CONNECTED", "true").lower() == "true"

    async def _sync_loop(self):
        while self._running:
            try:
                await self._sync_cached_inferences()
                await self._sync_queued_iot_data()
                await asyncio.sleep(self._sync_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Edge sync error: {e}")
                await asyncio.sleep(10)

    async def cache_inference(self, inference_type: str, result: dict):
        cache_file = os.path.join(
            self._cache_dir,
            f"{inference_type}_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}.json",
        )
        payload = {
            "type": inference_type,
            "result": result,
            "timestamp": datetime.utcnow().isoformat(),
            "synced": False,
        }
        with open(cache_file, "w") as f:
            json.dump(payload, f, default=str)
        logger.debug(f"Cached {inference_type} inference at {cache_file}")

    async def _sync_cached_inferences(self):
        if self._edge_mode:
            return
        synced = 0
        for filename in os.listdir(self._cache_dir):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(self._cache_dir, filename)
            try:
                with open(filepath) as f:
                    data = json.load(f)
                if data.get("synced"):
                    os.remove(filepath)
                    continue
                topic = f"edge/inferences/{data['type']}"
                await mqtt_client.publish(topic, data["result"])
                await aws_iot_client.publish(topic, data["result"])
                os.remove(filepath)
                synced += 1
            except Exception as e:
                logger.error(f"Failed to sync {filepath}: {e}")
        if synced > 0:
            logger.info(f"Synced {synced} cached inferences")

    async def _sync_queued_iot_data(self):
        if self._edge_mode:
            return
        synced = await aws_iot_client.sync_pending()
        if synced > 0:
            logger.info(f"Synced {synced} queued IoT data points")

    async def run_inference(self, inference_fn, inference_type: str, *args, **kwargs) -> dict:
        try:
            result = await inference_fn(*args, **kwargs)
            if self._edge_mode or aws_iot_client.pending_count > 0:
                await self.cache_inference(inference_type, result)
            return result
        except Exception as e:
            logger.error(f"Edge inference error: {e}")
            return {"error": str(e), "type": inference_type}

    async def set_edge_mode(self, enabled: bool):
        self._edge_mode = enabled
        logger.info(f"Edge mode set to: {enabled}")

    @property
    def is_edge_mode(self) -> bool:
        return self._edge_mode

    @property
    def cached_count(self) -> int:
        return len([f for f in os.listdir(self._cache_dir) if f.endswith('.json')])

    async def stop(self):
        self._running = False
        if self._sync_task:
            self._sync_task.cancel()

edge_service = EdgeService()
