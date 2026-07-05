import asyncio
import logging
from datetime import datetime
from typing import Optional
from app.core.mqtt import mqtt_client
from app.core.aws import aws_iot_client
from app.models.iot.sensors import env_sensor_sim
from app.models.iot.wearables import wearable_sim
from app.models.iot.location import location_sim
from app.models.iot.equipment import equipment_monitor

logger = logging.getLogger(__name__)

class IoTService:
    def __init__(self):
        self._running = False
        self._stream_task: Optional[asyncio.Task] = None
        self._interval = 5.0

    async def initialize(self):
        await env_sensor_sim.start()
        await wearable_sim.start()
        await equipment_monitor.initialize()
        await mqtt_client.connect()
        await aws_iot_client.connect()
        self._running = True
        logger.info("IoT service initialized")

    async def start_streaming(self, device_type: str = "esp32"):
        if self._stream_task:
            self._stream_task.cancel()
        self._stream_task = asyncio.create_task(self._stream_loop(device_type))
        logger.info(f"IoT streaming started for {device_type}")

    async def stop_streaming(self):
        if self._stream_task:
            self._stream_task.cancel()
            self._stream_task = None
        self._running = False
        logger.info("IoT streaming stopped")

    async def _stream_loop(self, device_type: str):
        while self._running:
            try:
                data = await self._read_device(device_type)
                topic = f"devices/{device_type}/telemetry"
                await mqtt_client.publish(topic, data)
                await aws_iot_client.publish(topic, data)
                await asyncio.sleep(self._interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"IoT stream error: {e}")
                await asyncio.sleep(1)

    async def _read_device(self, device_type: str) -> dict:
        base = {
            "device_id": f"{device_type.upper()}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "device_type": device_type,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if device_type == "esp32":
            base["sensors"] = await env_sensor_sim.read_esp32()
        elif device_type == "raspberry_pi":
            base["sensors"] = await env_sensor_sim.read_raspberry_pi()
            base["location"] = await location_sim.read_gps()
        elif device_type == "jetson_nano":
            base["sensors"] = await env_sensor_sim.read_jetson_nano()
            base["location"] = await location_sim.get_location_fusion()
            base["vitals"] = await wearable_sim.read_vitals()
        elif device_type == "smart_helmet":
            base["vitals"] = await wearable_sim.read_smart_helmet()
            base["location"] = await location_sim.read_uwb()
        elif device_type == "wearable":
            base["vitals"] = await wearable_sim.read_vitals()
            base["location"] = await location_sim.read_ble()
        return base

    async def read_device(self, device_type: str) -> dict:
        return await self._read_device(device_type)

    async def read_equipment_health(self, equipment_id: str) -> dict:
        return await equipment_monitor.read_health(equipment_id)

    async def read_equipment_all(self) -> dict:
        return await equipment_monitor.read_all()

    async def read_location(self, method: str = "gps") -> dict:
        if method == "gps":
            return await location_sim.read_gps()
        elif method == "uwb":
            return await location_sim.read_uwb()
        elif method == "ble":
            return await location_sim.read_ble()
        return await location_sim.get_location_fusion()

    async def set_anomaly(self, enabled: bool):
        env_sensor_sim.set_anomaly(enabled)
        wearable_sim.set_stress_mode(enabled)
        logger.info(f"Anomaly mode set to: {enabled}")

    async def sync_pending_iot_data(self) -> int:
        return await aws_iot_client.sync_pending()

    @property
    def pending_sync_count(self) -> int:
        return aws_iot_client.pending_count

    @property
    def is_running(self) -> bool:
        return self._running

iot_service = IoTService()
