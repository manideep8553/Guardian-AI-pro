import random
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class LocationSimulator:
    def __init__(self):
        self._base_lat = 12.9716
        self._base_lng = 77.5946
        self._current_pos = {"lat": self._base_lat, "lng": self._base_lng}

    async def read_gps(self) -> dict:
        self._current_pos["lat"] += random.uniform(-0.0001, 0.0001)
        self._current_pos["lng"] += random.uniform(-0.0001, 0.0001)
        return {
            "latitude": round(self._current_pos["lat"], 6),
            "longitude": round(self._current_pos["lng"], 6),
            "altitude": round(random.uniform(500, 550), 2),
            "speed": round(random.uniform(0, 5), 2),
            "heading": round(random.uniform(0, 360), 1),
            "accuracy": round(random.uniform(1, 5), 2),
            "satellites": random.randint(4, 12),
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def read_uwb(self) -> dict:
        return {
            "anchors": [
                {"id": "UWB-001", "distance": round(random.uniform(1, 50), 2), "rssi": round(random.uniform(-80, -30), 1)},
                {"id": "UWB-002", "distance": round(random.uniform(1, 50), 2), "rssi": round(random.uniform(-80, -30), 1)},
                {"id": "UWB-003", "distance": round(random.uniform(1, 50), 2), "rssi": round(random.uniform(-80, -30), 1)},
            ],
            "position": {"x": round(random.uniform(0, 100), 2), "y": round(random.uniform(0, 100), 2), "z": round(random.uniform(0, 10), 2)},
            "accuracy_cm": round(random.uniform(5, 30), 1),
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def read_ble(self) -> dict:
        return {
            "beacons": [
                {"id": "BLE-001", "rssi": round(random.uniform(-90, -40), 1), "tx_power": -59},
                {"id": "BLE-002", "rssi": round(random.uniform(-90, -40), 1), "tx_power": -59},
                {"id": "BLE-003", "rssi": round(random.uniform(-90, -40), 1), "tx_power": -59},
            ],
            "estimated_distance": round(random.uniform(1, 30), 2),
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_location_fusion(self) -> dict:
        gps = await self.read_gps()
        uwb = await self.read_uwb()
        ble = await self.read_ble()
        return {
            "gps": gps,
            "uwb": uwb,
            "ble": ble,
            "best_estimate": {
                "latitude": gps["latitude"],
                "longitude": gps["longitude"],
                "x": uwb["position"]["x"],
                "y": uwb["position"]["y"],
                "z": uwb["position"]["z"],
                "accuracy": min(gps["accuracy"], uwb["accuracy_cm"] / 100),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

location_sim = LocationSimulator()
