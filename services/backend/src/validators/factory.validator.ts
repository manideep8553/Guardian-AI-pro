import { z } from 'zod';
import { ZoneType } from '../types';

export const createFactorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1).toUpperCase(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      country: z.string().min(1),
      zipCode: z.string().min(1),
    }),
    contactPhone: z.string().min(10),
    contactEmail: z.string().email(),
    timezone: z.string().optional(),
    operatingHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }),
});

export const updateFactorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
    timezone: z.string().optional(),
    operatingHours: z.object({
      start: z.string(), end: z.string(),
    }).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createBuildingSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1).toUpperCase(),
    factory: z.string().min(1),
    totalFloors: z.number().optional(),
    floorArea: z.number().optional(),
    constructionYear: z.number().optional(),
    hasBasement: z.boolean().optional(),
    safetyRating: z.string().optional(),
  }),
});

export const updateBuildingSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    totalFloors: z.number().optional(),
    floorArea: z.number().optional(),
    hasBasement: z.boolean().optional(),
    safetyRating: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createFloorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    number: z.number().int().min(0),
    building: z.string().min(1),
    ceilingHeight: z.number().optional(),
    fireExitCount: z.number().optional(),
    hasSprinklerSystem: z.boolean().optional(),
  }),
});

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1).toUpperCase(),
    type: z.nativeEnum(ZoneType),
    floor: z.string().min(1),
    building: z.string().min(1),
    factory: z.string().min(1),
    capacity: z.number().optional(),
    hazardLevel: z.string().optional(),
    restrictions: z.array(z.string()).optional(),
    hasEmergencyEquipment: z.boolean().optional(),
    evacuationRoute: z.object({
      destination: z.string(),
      path: z.array(z.array(z.number())),
      estimatedTime: z.number(),
    }).optional(),
    safeZoneCapacity: z.number().optional(),
  }),
});

export const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.nativeEnum(ZoneType).optional(),
    capacity: z.number().optional(),
    hazardLevel: z.string().optional(),
    restrictions: z.array(z.string()).optional(),
    hasEmergencyEquipment: z.boolean().optional(),
    evacuationRoute: z.object({
      destination: z.string(), path: z.array(z.array(z.number())), estimatedTime: z.number(),
    }).optional(),
    safeZoneCapacity: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1).toUpperCase(),
    description: z.string().optional(),
    factory: z.string().optional(),
  }),
});
