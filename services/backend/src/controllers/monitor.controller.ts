import httpStatus from 'http-status';
import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { fuseModalities, getCurrentFusionSnapshot, getWorkerLiveStatuses, getLiveAlerts } from '../services/fusion.service';
import { triggerEmergencyResponse, acknowledgeEmergency, resolveEmergency, getActiveEmergencies, getEmergencyHistory } from '../services/emergency.service';
import { SafetyEvent } from '../models/SafetyEvent';
import { FusionSnapshot } from '../models/FusionSnapshot';
import { ModalityType } from '../types';
import type { IModalityInput, IAuthRequest } from '../types';

export const ingestSensorData = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { modality, data, confidence, workerId, factoryId, deviceId } = req.body;

  const input: IModalityInput = {
    type: modality as ModalityType,
    timestamp: new Date(),
    data: data || {},
    confidence: confidence || 0.8,
  };

  const entityKey = workerId || factoryId || 'global';
  const result = await fuseModalities([input], entityKey);

  const event = await SafetyEvent.create({
    workerId: workerId,
    modality: input.type,
    riskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    anomalyScore: result.anomalyDetected ? 0.8 : 0,
    data: data,
    factoryId: factoryId,
    deviceId: deviceId,
    metadata: { fusionResult: result },
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Sensor data ingested',
    data: { event, fusion: result },
  });
});

export const ingestMultimodal = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { inputs, entityKey } = req.body;

  if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'At least one modality input required',
    });
    return;
  }

  const result = await fuseModalities(inputs as IModalityInput[], entityKey || 'bulk');

  await FusionSnapshot.create({
    overallRiskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    temporalTrend: result.temporalTrend,
    modalityScores: result.modalityScores,
    contributingFactors: result.contributingFactors,
    anomalyDetected: result.anomalyDetected,
    activeWorkerCount: 0,
    criticalAlertCount: 0,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Multimodal fusion complete',
    data: result,
  });
});

export const getDashboardSummary = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const [workers, snapshot, recentScore, alerts] = await Promise.all([
    getWorkerLiveStatuses(),
    getCurrentFusionSnapshot(),
    SafetyEvent.findOne().sort({ createdAt: -1 }).lean(),
    getLiveAlerts(10),
  ]);

  const activeEmergencies = await getActiveEmergencies();

  const onlineWorkers = workers.filter(w => w.isOnline).length;
  const highRiskWorkers = workers.filter(w => w.riskLevel === 'high_risk' || w.riskLevel === 'critical');
  const avgRisk = workers.length > 0
    ? workers.reduce((sum, w) => sum + w.riskScore, 0) / workers.length
    : 0;

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      fusion: {
        overallRiskScore: recentScore?.riskScore || 0,
        riskLevel: recentScore?.riskLevel || 'safe',
        temporalTrend: snapshot?.temporalTrend || 'stable',
      },
      workers: {
        total: workers.length,
        online: onlineWorkers,
        offline: workers.length - onlineWorkers,
        highRisk: highRiskWorkers.length,
        avgRiskScore: Math.round(avgRisk * 1000) / 1000,
      },
      alerts: alerts.slice(0, 5),
      emergencies: activeEmergencies.length,
      timestamp: new Date().toISOString(),
    },
  });
});

export const getWorkerStatuses = catchAsync(async (_req: IAuthRequest, res: Response) => {
  const statuses = await getWorkerLiveStatuses();
  res.status(httpStatus.OK).json({
    success: true,
    data: statuses,
  });
});

export const getAlerts = catchAsync(async (req: IAuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const alerts = await getLiveAlerts(limit);
  res.status(httpStatus.OK).json({
    success: true,
    data: alerts,
  });
});

export const triggerEmergency = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { type, severity, title, description, zone, affectedWorkerIds, factoryId, coordinates, evacuationRoute } = req.body;
  const userId = req.user!.userId;

  const emergency = await triggerEmergencyResponse({
    type,
    severity,
    triggeredBy: userId,
    title,
    description,
    zone,
    affectedWorkerIds,
    factoryId,
    coordinates,
    evacuationRoute,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Emergency response triggered',
    data: emergency,
  });
});

export const acknowledgeEmergencyEvent = catchAsync(async (req: IAuthRequest, res: Response) => {
  const result = await acknowledgeEmergency(req.params.id, req.user!.userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Emergency acknowledged',
    data: result,
  });
});

export const resolveEmergencyEvent = catchAsync(async (req: IAuthRequest, res: Response) => {
  const result = await resolveEmergency(req.params.id, req.user!.userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Emergency resolved',
    data: result,
  });
});

export const listEmergencies = catchAsync(async (req: IAuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (req.query.active === 'true') {
    const emergencies = await getActiveEmergencies();
    res.status(httpStatus.OK).json({
      success: true,
      data: emergencies,
    });
    return;
  }

  const result = await getEmergencyHistory(page, limit);
  res.status(httpStatus.OK).json({
    success: true,
    ...result,
  });
});

export const getFusionHistory = catchAsync(async (req: IAuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.factoryId) filter.factoryId = req.query.factoryId;
  if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;

  const [snapshots, total] = await Promise.all([
    FusionSnapshot.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    FusionSnapshot.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    data: snapshots,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
