import { Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync';
import { pick } from '../utils/pick';
import * as workerService from '../services/worker.service';
import { IAuthRequest } from '../types';

export const createWorker = catchAsync(async (req: IAuthRequest, res: Response) => {
  const workerData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const worker = await workerService.createWorker(workerData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Worker created successfully',
    data: worker,
  });
});

export const getWorkers = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['department', 'gender', 'isActive', 'designation', 'shiftId']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await workerService.getWorkers({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Workers retrieved successfully',
    ...result,
  });
});

export const getWorker = catchAsync(async (req: IAuthRequest, res: Response) => {
  const worker = await workerService.getWorkerById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Worker retrieved successfully',
    data: worker,
  });
});

export const updateWorker = catchAsync(async (req: IAuthRequest, res: Response) => {
  const worker = await workerService.updateWorker(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Worker updated successfully',
    data: worker,
  });
});

export const assignDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const worker = await workerService.assignDevice(req.params.id, req.body.deviceId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device assigned successfully',
    data: worker,
  });
});

export const removeDevice = catchAsync(async (req: IAuthRequest, res: Response) => {
  const worker = await workerService.removeDevice(req.params.id, req.params.deviceId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Device removed successfully',
    data: worker,
  });
});

export const createShift = catchAsync(async (req: IAuthRequest, res: Response) => {
  const shiftData = {
    ...req.body,
    createdBy: req.user!.userId,
  };
  const shift = await workerService.createShift(shiftData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Shift created successfully',
    data: shift,
  });
});

export const getShifts = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['type', 'department', 'zone', 'isActive']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await workerService.getShifts({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Shifts retrieved successfully',
    ...result,
  });
});

export const updateShift = catchAsync(async (req: IAuthRequest, res: Response) => {
  const shift = await workerService.updateShift(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Shift updated successfully',
    data: shift,
  });
});

export const markAttendance = catchAsync(async (req: IAuthRequest, res: Response) => {
  const attendance = await workerService.markAttendance(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance,
  });
});

export const getAttendance = catchAsync(async (req: IAuthRequest, res: Response) => {
  const filter = pick(req.query, ['worker', 'status', 'startDate', 'endDate']);
  const options = pick(req.query, ['page', 'limit', 'sort', 'order']);
  const result = await workerService.getAttendance({ ...filter, ...options });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Attendance records retrieved successfully',
    ...result,
  });
});

export const createCertification = catchAsync(async (req: IAuthRequest, res: Response) => {
  const certification = await workerService.createCertification(req.params.id, {
    ...req.body,
    verifiedBy: req.user!.userId,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Certification added successfully',
    data: certification,
  });
});

export const getCertifications = catchAsync(async (req: IAuthRequest, res: Response) => {
  const certifications = await workerService.getCertifications(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Certifications retrieved successfully',
    data: certifications,
  });
});

export const updateCertification = catchAsync(async (req: IAuthRequest, res: Response) => {
  const certification = await workerService.updateCertification(req.params.id, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Certification updated successfully',
    data: certification,
  });
});

export const generateQRCode = catchAsync(async (req: IAuthRequest, res: Response) => {
  const result = await workerService.generateQRCode(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'QR code generated successfully',
    data: result,
  });
});
