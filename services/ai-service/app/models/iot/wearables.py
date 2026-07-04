import random
import logging
import numpy as np
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

class WearableSimulator:
    def __init__(self):
        self._running = False
        self._stress_mode = False

    async def start(self):
        self._running = True
        logger.info("Wearable simulator started")

    async def stop(self):
        self._running = False

    def set_stress_mode(self, enabled: bool):
        self._stress_mode = enabled

    async def read_vitals(self) -> dict:
        base_hr = 72
        base_spo2 = 97
        if self._stress_mode:
            base_hr += random.randint(20, 50)
            base_spo2 -= random.randint(3, 8)
        hr = base_hr + random.randint(-5, 5)
        spo2 = min(base_spo2 + random.randint(-2, 1), 100)
        hr_max = 220
        hr_reserve = hr_max - hr
        hr_variability = random.randint(20, 80) if not self._stress_mode else random.randint(5, 20)
        stress_index = self._calculate_stress(hr, hr_variability, spo2)
        fatigue_index = self._calculate_fatigue(hr, hr_variability)
        return {
            "heart_rate": {"bpm": hr, "min": hr - random.randint(3, 8), "max": hr + random.randint(3, 8), "variability": hr_variability},
            "spo2": {"percent": spo2, "status": "normal" if spo2 > 94 else "low" if spo2 > 90 else "critical"},
            "stress": {"index": round(stress_index, 3), "level": "high" if stress_index > 0.7 else "moderate" if stress_index > 0.4 else "low"},
            "fatigue": {"index": round(fatigue_index, 3), "level": "high" if fatigue_index > 0.7 else "moderate" if fatigue_index > 0.4 else "low"},
            "temperature": round(random.uniform(36.1, 37.8), 1),
            "respiratory_rate": random.randint(12, 20) + (5 if self._stress_mode else 0),
            "posture": random.choice(["standing", "walking", "sitting", "lying"]),
            "steps": random.randint(0, 100),
            "calories_burned": round(random.uniform(0, 5), 1),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _calculate_stress(self, hr: int, hrv: int, spo2: int) -> float:
        hr_factor = max(0, (hr - 60) / 100)
        hrv_factor = max(0, 1 - hrv / 80)
        spo2_factor = max(0, (100 - spo2) / 10)
        return min(hr_factor * 0.4 + hrv_factor * 0.4 + spo2_factor * 0.2, 1.0)

    def _calculate_fatigue(self, hr: int, hrv: int) -> float:
        hr_factor = max(0, (hr - 70) / 80)
        hrv_factor = max(0, 1 - abs(hrv - 40) / 60)
        return min(hr_factor * 0.5 + hrv_factor * 0.5, 1.0)

    async def read_smart_helmet(self) -> dict:
        vitals = await self.read_vitals()
        vitals["helmet_impact"] = random.choice([False, False, False, True]) if self._stress_mode else False
        vitals["helmet_temperature"] = round(random.uniform(25, 45), 1)
        vitals["visor_status"] = random.choice(["clean", "fogged", "cracked"])
        vitals["proximity_alerts"] = random.randint(0, 3)
        return vitals

wearable_sim = WearableSimulator()
