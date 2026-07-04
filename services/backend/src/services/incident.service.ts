import httpStatus from 'http-status';
import { Incident } from '../models/Incident';
import { ApiError } from '../utils/ApiError';
import { IncidentStatus } from '../types';

interface CreateIncidentParams {
  title: string;
  description: string;
  type: string;
  severity?: string;
  location: { coordinates: [number, number]; address?: string; zone?: string };
  reportedBy: string;
  witnesses?: string[];
  mediaUrls?: string[];
}

interface QueryParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  type?: string;
  sort?: string;
  order?: string;
}

export async function createIncident(params: CreateIncidentParams) {
  return Incident.create(params);
}

export async function getIncidents(query: QueryParams) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.severity) filter.severity = query.severity;
  if (query.type) filter.type = query.type;

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [incidents, total] = await Promise.all([
    Incident.find(filter)
      .populate('reportedBy', 'firstName lastName email employeeId')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Incident.countDocuments(filter),
  ]);

  return {
    incidents,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getIncidentById(incidentId: string) {
  const incident = await Incident.findById(incidentId)
    .populate('reportedBy', 'firstName lastName email employeeId')
    .populate('assignedTo', 'firstName lastName email');

  if (!incident) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  return incident;
}

export async function updateIncident(incidentId: string, updateData: Record<string, unknown>) {
  const incident = await Incident.findByIdAndUpdate(incidentId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!incident) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  if (updateData.status === IncidentStatus.RESOLVED) {
    incident.resolvedAt = new Date();
    await incident.save();
  }

  return incident;
}

export async function deleteIncident(incidentId: string) {
  const incident = await Incident.findByIdAndDelete(incidentId);
  if (!incident) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Incident not found');
  }
  return incident;
}
