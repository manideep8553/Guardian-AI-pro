import httpStatus from 'http-status';
import { Worker } from '../models/Worker';
import { Shift } from '../models/Shift';
import { Attendance } from '../models/Attendance';
import { Certification } from '../models/Certification';
import { Device } from '../models/Device';
import { ApiError } from '../utils/ApiError';

interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  [key: string]: unknown;
}

export async function createWorker(data: Record<string, unknown>) {
  return Worker.create(data);
}

export async function getWorkers(query: PaginationQuery) {
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

  const [workers, total] = await Promise.all([
    Worker.find(filter)
      .populate('userId', 'firstName lastName email employeeId profileImage')
      .populate('department', 'name code')
      .populate('shiftId', 'name startTime endTime type')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Worker.countDocuments(filter),
  ]);

  return {
    workers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getWorkerById(id: string) {
  const worker = await Worker.findById(id)
    .populate('userId', 'firstName lastName email employeeId profileImage isActive')
    .populate('department', 'name code')
    .populate('shiftId', 'name startTime endTime type')
    .populate('assignedDevices', 'name serialNumber type status')
    .populate('certifications', 'name issuingAuthority certificationId issueDate expiryDate status')
    .populate('currentZone', 'name type');

  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  return worker;
}

export async function updateWorker(id: string, data: Record<string, unknown>) {
  const worker = await Worker.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  return worker;
}

export async function assignDevice(workerId: string, deviceId: string) {
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  const device = await Device.findById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  if (device.assignedWorker && device.assignedWorker.toString() !== workerId) {
    throw new ApiError(httpStatus.CONFLICT, 'Device is already assigned to another worker');
  }

  if (!worker.assignedDevices.includes(device._id)) {
    worker.assignedDevices.push(device._id);
    await worker.save();
  }

  device.assignedWorker = worker._id;
  await device.save();

  return worker.populate('assignedDevices', 'name serialNumber type status');
}

export async function removeDevice(workerId: string, deviceId: string) {
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  const device = await Device.findById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }

  worker.assignedDevices = worker.assignedDevices.filter(
    (d) => d.toString() !== deviceId,
  );
  await worker.save();

  device.assignedWorker = undefined;
  await device.save();

  return worker.populate('assignedDevices', 'name serialNumber type status');
}

export async function createShift(data: Record<string, unknown>) {
  return Shift.create(data);
}

export async function getShifts(query: PaginationQuery) {
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

  const [shifts, total] = await Promise.all([
    Shift.find(filter)
      .populate('department', 'name code')
      .populate('zone', 'name type')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Shift.countDocuments(filter),
  ]);

  return {
    shifts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateShift(id: string, data: Record<string, unknown>) {
  const shift = await Shift.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shift not found');
  }

  return shift;
}

export async function markAttendance(data: Record<string, unknown>) {
  const { worker, date, ...rest } = data;
  const attendanceDate = new Date(date as string);

  const attendance = await Attendance.findOneAndUpdate(
    { worker, date: attendanceDate },
    { ...rest, date: attendanceDate },
    { upsert: true, new: true, runValidators: true },
  );

  return attendance;
}

export async function getAttendance(query: PaginationQuery & { worker?: string; startDate?: string; endDate?: string }) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.worker) filter.worker = query.worker;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) (filter.date as Record<string, unknown>).$gte = new Date(query.startDate);
    if (query.endDate) (filter.date as Record<string, unknown>).$lte = new Date(query.endDate);
  }

  const sortField = query.sort || 'date';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [attendance, total] = await Promise.all([
    Attendance.find(filter)
      .populate('worker', 'employeeId phone')
      .populate('shift', 'name startTime endTime')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return {
    attendance,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createCertification(workerId: string, data: Record<string, unknown>) {
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  const certification = await Certification.create({
    ...data,
    worker: workerId,
  });

  worker.certifications.push(certification._id);
  await worker.save();

  return certification;
}

export async function getCertifications(workerId: string) {
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  const certifications = await Certification.find({ worker: workerId })
    .populate('verifiedBy', 'firstName lastName')
    .sort({ issueDate: -1 });

  return certifications;
}

export async function updateCertification(id: string, data: Record<string, unknown>) {
  const certification = await Certification.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!certification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Certification not found');
  }

  return certification;
}

export async function generateQRCode(workerId: string) {
  const worker = await Worker.findById(workerId).populate('userId', 'firstName lastName');
  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Worker not found');
  }

  const qrData = JSON.stringify({
    id: worker._id,
    employeeId: worker.employeeId,
    name: (worker.userId as unknown as { firstName: string; lastName: string })?.firstName
      ? `${(worker.userId as unknown as { firstName: string; lastName: string }).firstName} ${(worker.userId as unknown as { firstName: string; lastName: string }).lastName}`
      : '',
  });

  const qrBase64 = Buffer.from(qrData).toString('base64');
  const qrUrl = `data:application/json;base64,${qrBase64}`;

  worker.digitalIdQR = qrUrl;
  await worker.save();

  return { qrCode: qrUrl };
}
