import { z } from 'zod';
import { Gender, BloodGroup, ShiftType, AttendanceStatus } from '../types';

export const createWorkerSchema = z.object({
  body: z.object({
    userId: z.string(),
    employeeId: z.string().min(1),
    phone: z.string().min(10),
    gender: z.nativeEnum(Gender),
    dateOfBirth: z.string().optional(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      country: z.string().min(1),
      zipCode: z.string().min(1),
    }),
    emergencyContacts: z.array(z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(10),
      email: z.string().email().optional(),
      isPrimary: z.boolean().default(false),
    })).min(1),
    medicalInfo: z.object({
      bloodGroup: z.nativeEnum(BloodGroup),
      allergies: z.array(z.string()).optional(),
      chronicConditions: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      emergencyNotes: z.string().optional(),
      primaryPhysician: z.string().optional(),
      physicianPhone: z.string().optional(),
    }).optional(),
    department: z.string().optional(),
    designation: z.string().min(1),
    dateOfJoining: z.string().optional(),
    rfidTag: z.string().optional(),
  }),
});

export const updateWorkerSchema = z.object({
  body: z.object({
    phone: z.string().min(10).optional(),
    address: z.object({
      street: z.string(), city: z.string(), state: z.string(), country: z.string(), zipCode: z.string(),
    }).optional(),
    emergencyContacts: z.array(z.object({
      name: z.string(), relationship: z.string(), phone: z.string(), email: z.string().optional(), isPrimary: z.boolean(),
    })).optional(),
    medicalInfo: z.object({
      bloodGroup: z.nativeEnum(BloodGroup), allergies: z.array(z.string()).optional(), chronicConditions: z.array(z.string()).optional(), medications: z.array(z.string()).optional(), emergencyNotes: z.string().optional(), primaryPhysician: z.string().optional(), physicianPhone: z.string().optional(),
    }).optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    shiftId: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const assignDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1),
  }),
});

export const createShiftSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.nativeEnum(ShiftType),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    gracePeriodMinutes: z.number().optional(),
    workingDays: z.array(z.number()).optional(),
    department: z.string().optional(),
    zone: z.string().optional(),
    maxWorkers: z.number().optional(),
  }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    worker: z.string().min(1),
    date: z.string().min(1),
    status: z.nativeEnum(AttendanceStatus).optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    checkInLocation: z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) }).optional(),
    shift: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createCertificationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    issuingAuthority: z.string().min(1),
    certificationId: z.string().min(1),
    issueDate: z.string().min(1),
    expiryDate: z.string().min(1),
    attachments: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});
