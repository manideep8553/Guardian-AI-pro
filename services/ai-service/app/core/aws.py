import json
import asyncio
import logging
from datetime import datetime
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class AWSIoTCoreClient:
    def __init__(self):
        self._connected = False
        self._client = None
        self._pending_sync: list = []

    async def connect(self) -> bool:
        if not settings.aws_iot_endpoint:
            logger.warning("AWS IoT Core endpoint not configured")
            return False
        try:
            import aiobotocore.session

            session = aiobotocore.session.get_session()
            self._client = await session.create_client(
                "iot-data",
                region_name=settings.aws_region,
                endpoint_url=f"https://{settings.aws_iot_endpoint}",
            )
            self._connected = True
            logger.info("Connected to AWS IoT Core")
            return True
        except Exception as e:
            logger.error(f"AWS IoT Core connection failed: {e}")
            return False

    async def publish(self, topic: str, payload: dict) -> bool:
        if not self._connected:
            self._pending_sync.append(
                {"topic": topic, "payload": payload, "timestamp": datetime.utcnow().isoformat()}
            )
            return False
        try:
            await self._client.publish(
                topic=f"{settings.aws_iot_topic}/{topic}",
                qos=1,
                payload=json.dumps(payload, default=str).encode(),
            )
            return True
        except Exception as e:
            logger.error(f"AWS IoT publish failed: {e}")
            self._pending_sync.append(
                {"topic": topic, "payload": payload, "timestamp": datetime.utcnow().isoformat()}
            )
            return False

    async def sync_pending(self) -> int:
        synced = 0
        remaining = []
        for item in self._pending_sync:
            try:
                await self._client.publish(
                    topic=f"{settings.aws_iot_topic}/{item['topic']}",
                    qos=1,
                    payload=json.dumps(item["payload"], default=str).encode(),
                )
                synced += 1
            except:
                remaining.append(item)
        self._pending_sync = remaining
        logger.info(f"AWS IoT sync: {synced} items synced, {len(remaining)} remaining")
        return synced

    @property
    def pending_count(self) -> int:
        return len(self._pending_sync)

    async def disconnect(self):
        if self._client:
            await self._client.close()
            self._connected = False


aws_iot_client = AWSIoTCoreClient()
