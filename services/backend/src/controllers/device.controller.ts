import { Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import { pick } from '../utils/pick';
import * as deviceService from '../services/device.service';
import { IAuthRequest } from '../types';

export const registerDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const deviceData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const device = await deviceService.registerDevice(deviceData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Device registered successfully',
    data: device,
  });
});

export const getDevices = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['type', 'status', 'zone', 'assignedWorker']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await deviceService.getDevices({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Devices retrieved successfully',
    ...result,
  });
});

export const getDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const device = await deviceService.getDeviceById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device retrieved successfully',
    data: device,
  });
});

export const updateDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const device = await deviceService.updateDevice(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device updated successfully',
    data: device,
  });
});

export const deleteDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const device = await deviceService.deleteDevice(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device deleted successfully',
    data: device,
  });
});

export const updateDeviceStatus = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { status, ...metadata } = req.body;
  const device = await deviceService.updateDeviceStatus(req.params.id, status, metadata);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device status updated successfully',
    data: device,
  });
});

export const updateBatteryLevel = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { batteryLevel, batteryStatus } = req.body;
  const device = await deviceService.updateBatteryLevel(req.params.id, batteryLevel, batteryStatus);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Battery level updated successfully',
    data: device,
  });
});

export const getDeviceTelemetry = catchAsync(async (req: IAuthRequest, res: Response) => {
  const device = await deviceService.getDeviceTelemetry(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device telemetry retrieved successfully',
    data: device,
  });
});

export const getDevicesByType = catchAsync(async (req: IAuthRequest, res: Response) => {
  const devices = await deviceService.getDevicesByType(req.params.type);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Devices by type retrieved successfully',
    data: devices,
  });
});

export const getDevicesByWorker = catchAsync(async (req: IAuthRequest, res: Response) => {
  const devices = await deviceService.getDevicesByWorker(req.params.workerId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Devices by worker retrieved successfully',
    data: devices,
  });
});

export const uploadFirmware = catchAsync(async (req: IAuthRequest, res: Response) => {
  const firmwareData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const firmware = await deviceService.uploadFirmware(firmwareData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Firmware uploaded successfully',
    data: firmware,
  });
});

export const getFirmwares = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['deviceType', 'isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await deviceService.getFirmwares({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Firmwares retrieved successfully',
    ...result,
  });
});

export const getFirmware = catchAsync(async (req: IAuthRequest, res: Response) => {
  const firmware = await deviceService.getFirmwareById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Firmware retrieved successfully',
    data: firmware,
  });
});

export const deployFirmware = catchAsync(async (req: IAuthRequest, res: Response) => {
  const firmware = await deviceService.deployFirmware(req.params.id, req.body.deviceIds);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Firmware deployed successfully',
    data: firmware,
  });
});

export const performCalibration = catchAsync(async (req: IAuthRequest, res: Response) => {
  const calibration = await deviceService.performCalibration(
    req.params.id,
    req.body,
    req.user!.userId,
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Calibration performed successfully',
    data: calibration,
  });
});

export const getCalibrationHistory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const calibrations = await deviceService.getCalibrationHistory(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Calibration history retrieved successfully',
    data: calibrations,
  });
});
