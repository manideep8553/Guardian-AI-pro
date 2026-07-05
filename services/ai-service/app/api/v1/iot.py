import logging
from fastapi import APIRouter
from app.models.schemas import (
    IoTDeviceReadRequest, IoTStreamRequest, IoTLocationRequest,
    IoTAnomalyRequest, EdgeModeRequest,
)
from app.services.iot_service import iot_service
from app.services.edge_service import edge_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["iot"])

@router.post("/iot/read")
async def read_device(request: IoTDeviceReadRequest):
    data = await iot_service.read_device(request.device_type)
    return {"success": True, "data": data}

@router.post("/iot/stream/start")
async def start_stream(request: IoTStreamRequest):
    await iot_service.start_streaming(request.device_type)
    return {"success": True, "message": f"Streaming started for {request.device_type}"}

@router.post("/iot/stream/stop")
async def stop_stream():
    await iot_service.stop_streaming()
    return {"success": True, "message": "Streaming stopped"}

@router.get("/iot/location")
async def get_location(method: str = "fusion"):
    data = await iot_service.read_location(method)
    return {"success": True, "data": data}

@router.post("/iot/location")
async def read_location(request: IoTLocationRequest):
    data = await iot_service.read_location(request.method)
    return {"success": True, "data": data}

@router.post("/iot/anomaly")
async def set_anomaly(request: IoTAnomalyRequest):
    await iot_service.set_anomaly(request.enabled)
    return {"success": True, "message": f"Anomaly mode {'enabled' if request.enabled else 'disabled'}"}

@router.get("/iot/equipment")
async def read_all_equipment():
    data = await iot_service.read_equipment_all()
    return {"success": True, "data": data}

@router.get("/iot/equipment/{equipment_id}")
async def read_equipment(equipment_id: str):
    data = await iot_service.read_equipment_health(equipment_id)
    return {"success": True, "data": data}

@router.get("/iot/sync/status")
async def sync_status():
    return {
        "success": True,
        "data": {
            "edge_mode": edge_service.is_edge_mode,
            "pending_sync": iot_service.pending_sync_count,
            "cached_inferences": edge_service.cached_count,
        },
    }

@router.post("/iot/sync")
async def sync_now():
    synced = await iot_service.sync_pending_iot_data()
    return {
        "success": True,
        "data": {"synced_count": synced},
    }

@router.post("/edge/mode")
async def set_edge_mode(request: EdgeModeRequest):
    await edge_service.set_edge_mode(request.enabled)
    return {"success": True, "message": f"Edge mode {'enabled' if request.enabled else 'disabled'}"}
