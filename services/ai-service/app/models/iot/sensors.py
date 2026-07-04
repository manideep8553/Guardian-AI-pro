import numpy as np
import logging
import random
import asyncio
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

class EnvironmentalSensorSimulator:
    def __init__(self):
        self._running = False
        self._base_temp = 25.0
        self._base_humidity = 60.0
        self._anomaly_mode = False

    async def start(self):
        self._running = True
        logger.info("Environmental sensor simulator started")

    async def stop(self):
        self._running = False

    def set_anomaly(self, enabled: bool):
        self._anomaly_mode = enabled

    async def read_sensors(self) -> dict:
        temp = self._base_temp + random.gauss(0, 2)
        humidity = self._base_humidity + random.gauss(0, 5)
        if self._anomaly_mode:
            temp += random.uniform(10, 30)
            humidity += random.uniform(-20, 10)
        gas_ppm = random.uniform(0, 50) + (random.uniform(100, 500) if self._anomaly_mode else 0)
        smoke_ppm = random.uniform(0, 10) + (random.uniform(50, 200) if self._anomaly_mode else 0)
        dust_pm25 = random.uniform(0, 50) + (random.uniform(100, 300) if self._anomaly_mode else 0)
        dust_pm10 = dust_pm25 * random.uniform(1.5, 2.5)
        return {
            "temperature": round(temp, 2),
            "humidity": round(humidity, 2),
            "gas": {"co": round(random.uniform(0, 10), 2), "lpg": round(random.uniform(0, 5), 2), "methane": round(random.uniform(0, 3), 2), "total_voc": round(gas_ppm, 2)},
            "smoke": {"density": round(smoke_ppm, 2), "alarm": smoke_ppm > 100},
            "dust": {"pm1_0": round(dust_pm25 * 0.3, 2), "pm2_5": round(dust_pm25, 2), "pm10": round(dust_pm10, 2)},
            "air_quality_index": self._calculate_aqi(temp, humidity, gas_ppm, dust_pm25),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _calculate_aqi(self, temp: float, humidity: float, gas: float, dust: float) -> dict:
        score = 0
        if temp > 40: score += 40
        elif temp > 35: score += 20
        if humidity > 85: score += 20
        elif humidity < 20: score += 15
        if gas > 100: score += 30
        elif gas > 50: score += 15
        if dust > 150: score += 30
        elif dust > 50: score += 15
        level = "hazardous" if score > 80 else "unhealthy" if score > 50 else "moderate" if score > 25 else "good"
        return {"score": min(score, 100), "level": level, "primary_pollutant": "dust" if dust > 50 else "gas" if gas > 50 else "none"}

    async def read_esp32(self) -> dict:
        return await self.read_sensors()

    async def read_raspberry_pi(self) -> dict:
        data = await self.read_sensors()
        data["processor_temp"] = round(random.uniform(40, 75), 2)
        data["cpu_usage"] = round(random.uniform(10, 95), 1)
        data["memory_usage"] = round(random.uniform(20, 85), 1)
        return data

    async def read_jetson_nano(self) -> dict:
        data = await self.read_raspberry_pi()
        data["gpu_usage"] = round(random.uniform(10, 100), 1)
        data["inference_temp"] = round(random.uniform(45, 80), 2)
        data["power_consumption"] = round(random.uniform(5, 15), 2)
        return data

env_sensor_sim = EnvironmentalSensorSimulator()
