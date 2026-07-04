import httpStatus from 'http-status';
import { Device } from '../models/Device';
import { Firmware } from '../models/Firmware';
import { DeviceCalibration } from '../models/DeviceCalibration';
import { ApiError } from '../utils/ApiError';

interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  [key: string]: unknown;
}

export async function registerDevice(data: Record<string, unknown>) {
  const existing = await Device.findOne({ serialNumber: data.serialNumber as string });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'Device with this serial number already exists');
  }
  return Device.create(data);
}

export async function getDevices(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [devices, total] = await Promise.all([
    Device.find(filter)
      .populate('zone', 'name type')
      .populate('assignedWorker', 'employeeId name')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Device.countDocuments(filter),
  ]);

  return {
    devices,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDeviceById(id: string) {
  const device = await Device.findById(id)
    .populate('zone', 'name type')
    .populate('assignedWorker', 'employeeId name');

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function updateDevice(id: string, data: Record<string, unknown>) {
  const device = await Device.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function deleteDevice(id: string) {
  const device = await Device.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function updateDeviceStatus(
  id: string,
  status: string,
  metadata?: Record<string, unknown>,
) {
  const update: Record<string, unknown> = { status };
  if (status === 'online') {
    update.lastPingAt = new Date();
  }
  if (metadata) {
    Object.assign(update, metadata);
  }

  const device = await Device.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function updateBatteryLevel(
  id: string,
  level: number,
  batteryStatus?: string,
) {
  const update: Record<string, unknown> = { batteryLevel: level };
  if (batteryStatus) {
    update.batteryStatus = batteryStatus;
  }

  const device = await Device.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function getDeviceTelemetry(id: string) {
  const device = await Device.findById(id).select(
    'name status batteryLevel batteryStatus lastPingAt location ipAddress',
  );

  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return device;
}

export async function getDevicesByType(type: string) {
  return Device.find({ type, isActive: true })
    .populate('zone', 'name type')
    .populate('assignedWorker', 'employeeId name');
}

export async function getDevicesByWorker(workerId: string) {
  return Device.find({ assignedWorker: workerId, isActive: true })
    .populate('zone', 'name type');
}

export async function uploadFirmware(data: Record<string, unknown>) {
  return Firmware.create(data);
}

export async function getFirmwares(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const nonFilterKeys = ['page', 'limit', 'sort', 'order'];
  for (const key of Object.keys(query)) {
    if (!nonFilterKeys.includes(key) && query[key] !== undefined) {
      filter[key] = query[key];
    }
  }

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [firmwares, total] = await Promise.all([
    Firmware.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Firmware.countDocuments(filter),
  ]);

  return {
    firmwares,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFirmwareById(id: string) {
  const firmware = await Firmware.findById(id).populate(
    'createdBy',
    'firstName lastName',
  );

  if (!firmware) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Firmware not found');
  }

  return firmware;
}

export async function deployFirmware(firmwareId: string, deviceIds: string[]) {
  const firmware = await Firmware.findById(firmwareId);
  if (!firmware) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Firmware not found');
  }

  await Device.updateMany(
    { _id: { $in: deviceIds } },
    {
      $set: {
        'firmware.updateAvailable': true,
        status: 'deploying',
      },
    },
  );

  firmware.deployedCount += deviceIds.length;
  await firmware.save();

  return firmware;
}

export async function performCalibration(
  deviceId: string,
  data: Record<string, unknown>,
  performedBy: string,
) {
  const device = await Device.findById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  const calibration = await DeviceCalibration.create({
    ...data,
    device: deviceId,
    performedBy,
  });

  device.lastCalibration = new Date();
  if (data.nextCalibrationDue) {
    device.nextCalibrationDue = new Date(data.nextCalibrationDue as string);
  }
  await device.save();

  return calibration;
}

export async function getCalibrationHistory(deviceId: string) {
  const device = await Device.findById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  return DeviceCalibration.find({ device: deviceId })
    .populate('performedBy', 'firstName lastName')
    .sort({ performedAt: -1 });
}
