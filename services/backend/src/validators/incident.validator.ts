import { z } from 'zod';
import { IncidentSeverity, IncidentStatus, AlertType } from '../types';

export const createIncidentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.nativeEnum(AlertType),
    severity: z.nativeEnum(IncidentSeverity).optional(),
    location: z.object({
      coordinates: z.tuple([z.number(), z.number()]),
      address: z.string().optional(),
      zone: z.string().optional(),
    }),
    witnesses: z.array(z.string()).optional(),
    mediaUrls: z.array(z.string().url()).optional(),
  }),
});

export const updateIncidentSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    severity: z.nativeEnum(IncidentSeverity).optional(),
    status: z.nativeEnum(IncidentStatus).optional(),
    assignedTo: z.string().optional(),
    rootCause: z.string().optional(),
    correctiveActions: z.string().optional(),
  }),
});
