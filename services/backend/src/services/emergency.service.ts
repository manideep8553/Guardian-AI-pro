import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import mongoose from 'mongoose';
import { EmergencyEvent, IEmergencyEvent } from '../models/EmergencyEvent';
import { Incident } from '../models/Incident';
import { Worker } from '../models/Worker';
import { User } from '../models/User';
import { getIO } from '../sockets/incidentSocket';
import { dispatchAction } from './notification.service';
import { logger } from '../config/logger';
import {
  EmergencyType,
  EmergencyAction,
  EmergencyStatus,
  RiskLevel,
  IncidentSeverity,
  IncidentStatus,
  AlertType,
} from '../types';
import type { IEmergencyEvent as IEmergencyEventDoc } from '../models/EmergencyEvent';

const SEVERITY_ACTION_MAP: Record<RiskLevel, EmergencyAction[]> = {
  [RiskLevel.SAFE]: [],
  [RiskLevel.WARNING]: [
    EmergencyAction.SEND_PUSH,
    EmergencyAction.NOTIFY_SUPERVISOR,
  ],
  [RiskLevel.HIGH_RISK]: [
    EmergencyAction.SEND_PUSH,
    EmergencyAction.SEND_SMS,
    EmergencyAction.NOTIFY_SUPERVISOR,
    EmergencyAction.LOG_INCIDENT,
    EmergencyAction.SOUND_SIREN,
  ],
  [RiskLevel.CRITICAL]: [
    EmergencyAction.SEND_PUSH,
    EmergencyAction.SEND_SMS,
    EmergencyAction.SEND_EMAIL,
    EmergencyAction.NOTIFY_SUPERVISOR,
    EmergencyAction.TRIGGER_EVACUATION,
    EmergencyAction.SOUND_SIREN,
    EmergencyAction.LOG_INCIDENT,
    EmergencyAction.CALL_EMERGENCY_SERVICES,
  ],
};

async function getEmergencyContacts(workerIds: string[]): Promise<{ userIds: string[]; phones: string[]; emails: string[] }> {
  const workers = await Worker.find({ _id: { $in: workerIds } })
    .populate('userId', 'firstName lastName email')
    .lean();

  const userIds: string[] = [];
  const phones: string[] = [];
  const emails: string[] = [];

  for (const w of workers) {
    const user = w.userId as unknown as { _id: string; email: string } | null;
    if (user) {
      userIds.push(user._id.toString());
      emails.push(user.email);
    }
    if (w.phone) phones.push(w.phone);
    if (w.emergencyContacts?.length) {
      w.emergencyContacts.forEach((ec: { phone: string }) => {
        if (ec.phone) phones.push(ec.phone);
      });
    }
  }

  return { userIds, phones, emails };
}

async function createAutoIncident(params: {
  type: EmergencyType;
  severity: RiskLevel;
  title: string;
  description: string;
  zone?: string;
  triggeredBy: string;
}): Promise<string | undefined> {
  try {
    const severityMap: Record<RiskLevel, IncidentSeverity> = {
      [RiskLevel.SAFE]: IncidentSeverity.LOW,
      [RiskLevel.WARNING]: IncidentSeverity.LOW,
      [RiskLevel.HIGH_RISK]: IncidentSeverity.HIGH,
      [RiskLevel.CRITICAL]: IncidentSeverity.CRITICAL,
    };

    const typeMap: Record<EmergencyType, AlertType> = {
      [EmergencyType.FIRE]: AlertType.HAZARD,
      [EmergencyType.CHEMICAL_SPILL]: AlertType.ENVIRONMENTAL,
      [EmergencyType.STRUCTURAL_FAILURE]: AlertType.HAZARD,
      [EmergencyType.WORKER_INJURY]: AlertType.NEAR_MISS,
      [EmergencyType.GAS_LEAK]: AlertType.ENVIRONMENTAL,
      [EmergencyType.EQUIPMENT_MALFUNCTION]: AlertType.EQUIPMENT_FAILURE,
      [EmergencyType.INTRUSION]: AlertType.SAFETY_VIOLATION,
      [EmergencyType.NATURAL_DISASTER]: AlertType.ENVIRONMENTAL,
      [EmergencyType.POWER_OUTAGE]: AlertType.EQUIPMENT_FAILURE,
      [EmergencyType.MEDICAL_EMERGENCY]: AlertType.NEAR_MISS,
    };

    const admin = await User.findOne({ role: 'admin' }).lean();
    const incident = await Incident.create({
      title: params.title,
      description: params.description,
      type: typeMap[params.type] || AlertType.HAZARD,
      severity: severityMap[params.severity],
      status: IncidentStatus.REPORTED,
      location: { type: 'Point', coordinates: [0, 0], zone: params.zone },
      reportedBy: admin?._id || params.triggeredBy,
    });

    return incident._id.toString();
  } catch (error) {
    logger.error('Failed to auto-create incident', { error });
    return undefined;
  }
}

export async function triggerEmergencyResponse(params: {
  type: EmergencyType;
  severity: RiskLevel;
  triggeredBy: string;
  title: string;
  description: string;
  zone?: string;
  affectedWorkerIds?: string[];
  factoryId?: string;
  coordinates?: [number, number];
  evacuationRoute?: string;
}): Promise<IEmergencyEvent> {
  const severityActions = SEVERITY_ACTION_MAP[params.severity] || [];
  const requiresEvacuation = params.severity === RiskLevel.CRITICAL;

  const { userIds, phones, emails } = params.affectedWorkerIds?.length
    ? await getEmergencyContacts(params.affectedWorkerIds)
    : { userIds: [], phones: [], emails: [] };

  if (params.affectedWorkerIds?.length) {
    const supervisors = await User.find({ role: 'supervisor' }).select('_id').lean();
    userIds.push(...supervisors.map(s => s._id.toString()));
    const admin = await User.findOne({ role: 'admin' }).select('email').lean();
    if (admin?.email) emails.push(admin.email);
  }

  const emergencyDoc = await EmergencyEvent.create({
    type: params.type,
    severity: params.severity,
    triggeredBy: params.triggeredBy,
    title: params.title,
    description: params.description,
    location: {
      factoryId: params.factoryId,
      zone: params.zone,
      coordinates: params.coordinates,
    },
    affectedWorkers: params.affectedWorkerIds || [],
    autoActions: severityActions,
    requiresEvacuation,
    evacuationRoute: params.evacuationRoute,
    status: EmergencyStatus.ACTIVE,
  });

  const payload = {
    title: params.title,
    message: params.description,
    severity: params.severity,
    type: params.type,
    zone: params.zone,
    metadata: { emergencyId: emergencyDoc._id.toString() },
  };

  for (const action of severityActions) {
    await dispatchAction(action, payload, userIds, phones, emails, params.zone || 'unknown');
    await new Promise(r => setTimeout(r, 100));
  }

  if (severityActions.includes(EmergencyAction.LOG_INCIDENT)) {
    const incidentId = await createAutoIncident({
      type: params.type,
      severity: params.severity,
      title: params.title,
      description: params.description,
      zone: params.zone,
      triggeredBy: params.triggeredBy,
    });
    if (incidentId) {
      emergencyDoc.incidentId = new mongoose.Types.ObjectId(incidentId);
      await emergencyDoc.save();
    }
  }

  try {
    getIO().to('supervisors').emit('emergency:new', emergencyDoc.toObject());
    getIO().emit('emergency:alert', {
      id: emergencyDoc._id.toString(),
      type: params.type,
      severity: params.severity,
      title: params.title,
      zone: params.zone,
      timestamp: new Date(),
    });
  } catch { /* socket not ready */ }

  logger.warn(`EMERGENCY [${params.severity}] ${params.title} in ${params.zone || 'unknown zone'}`);
  return emergencyDoc.toObject() as unknown as IEmergencyEventDoc;
}

export async function acknowledgeEmergency(emergencyId: string, userId: string): Promise<IEmergencyEventDoc> {
  const emergency = await EmergencyEvent.findById(emergencyId);
  if (!emergency) throw new ApiError(httpStatus.NOT_FOUND, 'Emergency event not found');

  emergency.acknowledgedBy = new mongoose.Types.ObjectId(userId);
  emergency.acknowledgedAt = new Date();
  emergency.status = EmergencyStatus.ACKNOWLEDGED;
  await emergency.save();

  try {
    getIO().to('supervisors').emit('emergency:acknowledged', { emergencyId, userId });
  } catch { /* socket not ready */ }

  return emergency.toObject() as unknown as IEmergencyEventDoc;
}

export async function resolveEmergency(emergencyId: string, userId: string): Promise<IEmergencyEventDoc> {
  const emergency = await EmergencyEvent.findById(emergencyId);
  if (!emergency) throw new ApiError(httpStatus.NOT_FOUND, 'Emergency event not found');

  emergency.resolvedBy = new mongoose.Types.ObjectId(userId);
  emergency.resolvedAt = new Date();
  emergency.status = EmergencyStatus.RESOLVED;
  await emergency.save();

  if (emergency.incidentId) {
    await Incident.findByIdAndUpdate(emergency.incidentId, {
      status: IncidentStatus.RESOLVED,
      resolvedAt: new Date(),
    });
  }

  try {
    getIO().to('supervisors').emit('emergency:resolved', { emergencyId, userId });
  } catch { /* socket not ready */ }

  return emergency.toObject() as unknown as IEmergencyEventDoc;
}

export async function getActiveEmergencies(): Promise<IEmergencyEventDoc[]> {
  const emergencies = await EmergencyEvent.find({
    status: { $in: [EmergencyStatus.ACTIVE, EmergencyStatus.ACKNOWLEDGED, EmergencyStatus.EVACUATING] },
  })
    .populate('acknowledgedBy', 'firstName lastName')
    .populate('affectedWorkers', 'employeeId')
    .sort({ createdAt: -1 })
    .lean();

  return emergencies as unknown as IEmergencyEventDoc[];
}

export async function getEmergencyHistory(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [emergencies, total] = await Promise.all([
    EmergencyEvent.find()
      .populate('acknowledgedBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmergencyEvent.countDocuments(),
  ]);

  return {
    emergencies,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
