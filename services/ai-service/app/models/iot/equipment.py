import random
import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

class EquipmentMonitor:
    def __init__(self):
        self._equipment_states: dict[str, dict] = {}

    async def initialize(self):
        self._equipment_states = {
            f"EQ-{i:03d}": {
                "name": random.choice(["Conveyor Belt", "Press Machine", "Welding Unit", "HVAC System", "Generator", "Compressor", "Pump Station", "Crane"]),
                "status": "operational",
                "uptime_hours": random.randint(100, 5000),
                "last_maintenance": (datetime.utcnow() - timedelta(days=random.randint(1, 90))).isoformat(),
            }
            for i in range(1, 9)
        }
        logger.info(f"Equipment monitor initialized with {len(self._equipment_states)} assets")

    async def read_health(self, equipment_id: str) -> dict:
        state = self._equipment_states.get(equipment_id)
        if not state:
            return {"error": f"Equipment {equipment_id} not found"}
        anomaly = random.random() < 0.05
        vibration = random.uniform(0.5, 5.0) + (random.uniform(5, 15) if anomaly else 0)
        temperature = random.uniform(35, 65) + (random.uniform(20, 40) if anomaly else 0)
        return {
            "equipment_id": equipment_id,
            "name": state["name"],
            "status": "critical" if anomaly else state["status"],
            "vibration": {"mm_s": round(vibration, 2), "normal": vibration < 8.0, "threshold": 8.0},
            "temperature": {"celsius": round(temperature, 1), "normal": temperature < 75, "threshold": 75},
            "rpm": random.randint(1000, 3600) if "Conveyor" not in state["name"] and "HVAC" not in state["name"] else random.randint(100, 1500),
            "power_consumption_kw": round(random.uniform(1.5, 50), 2),
            "uptime_hours": state["uptime_hours"],
            "last_maintenance": state["last_maintenance"],
            "days_since_maintenance": (datetime.utcnow() - datetime.fromisoformat(state["last_maintenance"])).days,
            "maintenance_due": (datetime.utcnow() - datetime.fromisoformat(state["last_maintenance"])).days > 60,
            "alerts": self._generate_alerts(anomaly),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _generate_alerts(self, anomaly: bool) -> list:
        if not anomaly:
            return []
        alerts = []
        if random.random() < 0.5:
            alerts.append({"type": "vibration_warning", "severity": "high", "message": "Abnormal vibration detected"})
        if random.random() < 0.4:
            alerts.append({"type": "overheating", "severity": "critical", "message": "Temperature exceeding safe threshold"})
        if random.random() < 0.3:
            alerts.append({"type": "maintenance_required", "severity": "medium", "message": "Scheduled maintenance overdue"})
        return alerts

    async def read_all(self) -> dict:
        results = {}
        for eid in self._equipment_states:
            results[eid] = await self.read_health(eid)
        return {"equipment": results, "total": len(results), "critical_count": sum(1 for r in results.values() if r.get("status") == "critical")}

equipment_monitor = EquipmentMonitor()
