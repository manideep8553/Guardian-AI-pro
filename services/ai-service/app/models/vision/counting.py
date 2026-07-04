import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class WorkerCounter:
    def __init__(self):
        self._tracked_workers: dict[str, dict] = {}
        self._max_track_loss = 30
        self._iou_threshold = 0.3

    async def initialize(self):
        logger.info("Worker counter initialized")

    async def count(self, detections: list[dict], frame_id: int) -> dict:
        persons = [d for d in detections if d.get("class") in ("person", "worker")]
        current_ids = set()
        for person in persons:
            bbox = person["bbox"]
            matched_id = self._match_track(bbox)
            if matched_id:
                self._tracked_workers[matched_id] = {
                    "bbox": bbox, "last_seen": frame_id, "confidence": person.get("confidence", 0)
                }
                current_ids.add(matched_id)
            else:
                new_id = f"worker_{len(self._tracked_workers) + 1}_{frame_id}"
                self._tracked_workers[new_id] = {
                    "bbox": bbox, "last_seen": frame_id, "confidence": person.get("confidence", 0)
                }
                current_ids.add(new_id)
        stale_ids = [
            wid for wid, info in self._tracked_workers.items()
            if frame_id - info["last_seen"] > self._max_track_loss
        ]
        for wid in stale_ids:
            del self._tracked_workers[wid]
        return {
            "total_count": len(self._tracked_workers),
            "current_frame_count": len(persons),
            "tracked_workers": len(current_ids),
            "worker_ids": sorted(current_ids),
        }

    def _match_track(self, bbox: list) -> Optional[str]:
        import numpy as np
        best_match = None
        best_iou = 0
        for wid, info in self._tracked_workers.items():
            iou = self._calculate_iou(bbox, info["bbox"])
            if iou > best_iou and iou > self._iou_threshold:
                best_iou = iou
                best_match = wid
        return best_match

    def _calculate_iou(self, box1: list, box2: list) -> float:
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        return intersection / union if union > 0 else 0

worker_counter = WorkerCounter()
