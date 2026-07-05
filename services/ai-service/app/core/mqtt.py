import json
import asyncio
import logging
from typing import Callable
from app.core.config import settings

logger = logging.getLogger(__name__)


class MQTTClient:
    def __init__(self):
        self._client = None
        self._connected = False
        self._handlers: dict[str, list[Callable]] = {}

    async def connect(self) -> bool:
        try:
            import paho.mqtt.client as mqtt

            self._client = mqtt.Client(
                client_id="guardianai-ai-service", protocol=mqtt.MQTTv311
            )
            self._client.on_connect = self._on_connect
            self._client.on_message = self._on_message
            if settings.mqtt_username:
                self._client.username_pw_set(
                    settings.mqtt_username, settings.mqtt_password
                )
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self._client.connect(
                    settings.mqtt_broker, settings.mqtt_port, 60
                ),
            )
            self._client.loop_start()
            self._connected = True
            logger.info(
                f"MQTT connected to {settings.mqtt_broker}:{settings.mqtt_port}"
            )
            return True
        except Exception as e:
            logger.warning(f"MQTT connection failed: {e}")
            return False

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("MQTT broker connected successfully")
            self._connected = True
        else:
            logger.error(f"MQTT connection failed with code {rc}")

    def _on_message(self, client, userdata, msg):
        topic = msg.topic
        try:
            payload = json.loads(msg.payload.decode())
            for pattern, handlers in self._handlers.items():
                if pattern in topic:
                    for handler in handlers:
                        handler(topic, payload)
        except Exception as e:
            logger.error(f"MQTT message handler error: {e}")

    def subscribe(self, topic: str, handler: Callable):
        if self._client:
            self._client.subscribe(topic)
        if topic not in self._handlers:
            self._handlers[topic] = []
        self._handlers[topic].append(handler)

    async def publish(self, topic: str, payload: dict) -> bool:
        if not self._connected or not self._client:
            return False
        try:
            full_topic = f"{settings.mqtt_topic_prefix}/{topic}"
            self._client.publish(full_topic, json.dumps(payload, default=str), qos=1)
            return True
        except Exception as e:
            logger.error(f"MQTT publish error: {e}")
            return False

    async def publish_ws(self, topic: str, payload: dict) -> bool:
        return await self.publish(topic, payload)

    def disconnect(self):
        if self._client:
            self._client.loop_stop()
            self._client.disconnect()
            self._connected = False


mqtt_client = MQTTClient()
