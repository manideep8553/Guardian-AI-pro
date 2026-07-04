import numpy as np
import logging
from typing import Optional
from shapely.geometry import Point, Polygon

logger = logging.getLogger(__name__)

class IntrusionDetector:
    def __init__(self):
        self._restricted_zones: dict[str, list[tuple]] = {}

    async def initialize(self):
        logger.info("Intrusion detector initialized")

    def register_zone(self, zone_id: str, boundary: list[tuple[float, float]]):
        self._restricted_zones[zone_id] = boundary
        logger.info(f"Registered restricted zone: {zone_id}")

    def remove_zone(self, zone_id: str):
        self._restricted_zones.pop(zone_id, None)

    async def check(self, detections: list[dict], persons: list[dict]) -> dict:
        intrusions = []
        for person in persons:
            cx = (person["bbox"][0] + person["bbox"][2]) / 2
            cy = (person["bbox"][1] + person["bbox"][3]) / 2
            point = Point(cx, cy)
            for zone_id, boundary in self._restricted_zones.items():
                if len(boundary) < 3:
                    continue
                polygon = Polygon(boundary)
                if polygon.contains(point):
                    ppe_compliant = "helmet" in [d["class"] for d in detections if d.get("zone") == zone_id]
                    intrusions.append({
                        "zone_id": zone_id,
                        "person_location": {"x": float(cx), "y": float(cy)},
                        "ppe_compliant": ppe_compliant,
                        "severity": "critical" if not ppe_compliant else "high",
                        "timestamp": None,
                    })
        return {
            "intrusion_detected": len(intrusions) > 0,
            "intrusions": intrusions,
            "total_intrusions": len(intrusions),
            "active_zones": len(self._restricted_zones),
        }

intrusion_detector = IntrusionDetector()
