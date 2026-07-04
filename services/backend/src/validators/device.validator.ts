import { z } from 'zod';
import { DeviceType, DeviceStatus } from '../types';

export const registerDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    serialNumber: z.string().min(1),
    macAddress: z.string().optional(),
    type: z.nativeEnum(DeviceType),
    capabilities: z.array(z.string()),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    status: z.nativeEnum(DeviceStatus).optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    batteryStatus: z.enum(['charging', 'discharging', 'full', 'low']).optional(),
    location: z
      .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
    zone: z.string().optional(),
    assignedWorker: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const firmwareUploadSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    deviceType: z.string().min(1),
    fileUrl: z.string().optional(),
    checksum: z.string().optional(),
    changelog: z.string().optional(),
    isMandatory: z.boolean().optional(),
    minBatteryLevel: z.number().min(0).max(100).optional(),
  }),
});

export const calibrationSchema = z.object({
  body: z.object({
    type: z.string().min(1),
    parameters: z.record(z.string(), z.number()),
    results: z.record(z.string(), z.number()),
    status: z.enum(['passed', 'failed', 'partial']),
    notes: z.string().optional(),
    nextCalibrationDue: z.string().optional(),
  }),
});

export const deviceQuerySchema = z.object({
  query: z.object({
    type: z.string().optional(),
    status: z.string().optional(),
    zone: z.string().optional(),
    assignedWorker: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
