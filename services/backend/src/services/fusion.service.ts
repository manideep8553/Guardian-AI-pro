import { ModalityType, RiskLevel, RiskTrend, UserRole } from '../types';
import type {
  IModalityInput,
  IFusionResult,
  IWorkerVitals,
  IEnvironmentalReading,
  IMachineHealthReading,
  ILiveWorkerStatus,
  ILiveAlert,
} from '../types';
import { SafetyEvent } from '../models/SafetyEvent';
import { FusionSnapshot } from '../models/FusionSnapshot';
import { Worker } from '../models/Worker';
import { Incident } from '../models/Incident';
import { getIO } from '../sockets/incidentSocket';

const temporalBuffer = new Map<string, number[]>();

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function normalizeValue(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function computeVisionRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const ppeCompliance = (data.ppeCompliance as number) ?? 1;
  const fallDetected = (data.fallDetected as boolean) ?? false;
  const intrusionDetected = (data.intrusionDetected as boolean) ?? false;
  const fireSmokeDetected = (data.fireSmokeDetected as boolean) ?? false;
  const postureRisk = (data.postureRisk as number) ?? 0;
  const unauthorizedZone = (data.unauthorizedZone as boolean) ?? false;
  const crowdingRatio = (data.crowdingRatio as number) ?? 0;
  const noHardhat = (data.noHardhat as boolean) ?? false;
  const noVest = (data.noVest as boolean) ?? false;
  const confinedSpace = (data.confinedSpace as boolean) ?? false;

  let score = 0;

  if (fallDetected) { score += 0.35; factors.push('Fall detected'); }
  if (fireSmokeDetected) { score += 0.3; factors.push('Fire/smoke detected'); }
  if (intrusionDetected) { score += 0.25; factors.push('Intrusion detected'); }
  if (unauthorizedZone) { score += 0.2; factors.push('Unauthorized zone access'); }
  if (noHardhat) { score += 0.15; factors.push('Missing hardhat'); }
  if (noVest) { score += 0.15; factors.push('Missing safety vest'); }
  if (confinedSpace) { score += 0.1; factors.push('Confined space entry'); }

  score += (1 - ppeCompliance) * 0.2;
  score += postureRisk * 0.15;
  score += crowdingRatio * 0.1;

  return { score: Math.min(1, score), factors };
}

function computeAudioRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const noiseLevel = (data.noiseLevel as number) ?? 0;
  const impactDetected = (data.impactDetected as boolean) ?? false;
  const glassBreakDetected = (data.glassBreakDetected as boolean) ?? false;
  const alarmDetected = (data.alarmDetected as boolean) ?? false;
  const distressCall = (data.distressCall as boolean) ?? false;
  const machineAnomaly = (data.machineAnomaly as boolean) ?? false;

  let score = 0;

  if (distressCall) { score += 0.4; factors.push('Distress call detected'); }
  if (alarmDetected) { score += 0.3; factors.push('Alarm detected'); }
  if (impactDetected) { score += 0.2; factors.push('Impact sound detected'); }
  if (glassBreakDetected) { score += 0.2; factors.push('Glass break detected'); }
  if (machineAnomaly) { score += 0.15; factors.push('Abnormal machine sound'); }

  const normalizedNoise = normalizeValue(noiseLevel, 0, 120);
  score += normalizedNoise * 0.15;

  return { score: Math.min(1, score), factors };
}

function computeWearableRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const vitals = data.vitals as IWorkerVitals | undefined;
  if (!vitals) return { score: 0, factors: ['No wearable data'] };

  let score = 0;

  if (vitals.fallDetected) { score += 0.35; factors.push('Fall detected by wearable'); }
  if (vitals.impactDetected) { score += 0.25; factors.push('Impact detected'); }

  if (vitals.heartRate !== undefined) {
    const hrRisk = normalizeValue(Math.abs(vitals.heartRate - 75), 0, 100);
    score += hrRisk * 0.1;
    if (vitals.heartRate > 120) factors.push('Elevated heart rate');
    if (vitals.heartRate < 50) factors.push('Low heart rate');
  }

  if (vitals.spo2 !== undefined) {
    const spo2Risk = vitals.spo2 < 95 ? normalizeValue(95 - vitals.spo2, 0, 15) : 0;
    score += spo2Risk * 0.1;
    if (vitals.spo2 < 90) factors.push('Critical SpO2 level');
  }

  if (vitals.temperature !== undefined) {
    const tempRisk = Math.abs(vitals.temperature - 36.5) / 5;
    score += Math.min(1, tempRisk) * 0.05;
    if (vitals.temperature > 38) factors.push('Elevated body temperature');
  }

  if (vitals.stressLevel !== undefined) {
    score += vitals.stressLevel * 0.1;
    if (vitals.stressLevel > 0.7) factors.push('High stress level');
  }

  if (vitals.fatigueIndex !== undefined) {
    score += vitals.fatigueIndex * 0.1;
    if (vitals.fatigueIndex > 0.7) factors.push('High fatigue index');
  }

  return { score: Math.min(1, score), factors };
}

function computeEnvironmentalRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const env = data.environmental as IEnvironmentalReading | undefined;
  if (!env) return { score: 0, factors: ['No environmental data'] };

  let score = 0;

  if (env.gasLevel) {
    for (const [gas, level] of Object.entries(env.gasLevel)) {
      if (level > 0.8) { score += 0.2; factors.push(`High ${gas} concentration`); }
      else if (level > 0.5) { score += 0.1; factors.push(`Elevated ${gas} level`); }
    }
  }

  if (env.airQualityIndex !== undefined) {
    const aqiRisk = normalizeValue(env.airQualityIndex, 0, 500);
    score += aqiRisk * 0.15;
    if (env.airQualityIndex > 200) factors.push('Hazardous air quality');
  }

  if (env.temperature !== undefined) {
    const tempRisk = Math.max(0, Math.abs(env.temperature - 22) - 10) / 30;
    score += Math.min(1, tempRisk) * 0.1;
    if (env.temperature > 40) factors.push('Extreme heat');
    if (env.temperature < 0) factors.push('Extreme cold');
  }

  if (env.noiseLevel !== undefined) {
    const noiseRisk = normalizeValue(env.noiseLevel, 0, 120);
    score += noiseRisk * 0.1;
    if (env.noiseLevel > 85) factors.push('Hazardous noise level');
  }

  if (env.radiation !== undefined) {
    score += normalizeValue(env.radiation, 0, 10) * 0.2;
    if (env.radiation > 1) factors.push('Radiation detected');
  }

  return { score: Math.min(1, score), factors };
}

function computeLocationRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const inRestrictedZone = (data.inRestrictedZone as boolean) ?? false;
  const inEvacuationZone = (data.inEvacuationZone as boolean) ?? false;
  const speed = (data.speed as number) ?? 0;
  const deviationFromPath = (data.deviationFromPath as number) ?? 0;
  const loneWorker = (data.loneWorker as boolean) ?? false;
  const stayedTooLong = (data.stayedTooLong as boolean) ?? false;
  const geofenceViolation = (data.geofenceViolation as boolean) ?? false;

  let score = 0;

  if (inEvacuationZone) { score += 0.3; factors.push('Worker in evacuation zone'); }
  if (geofenceViolation) { score += 0.25; factors.push('Geofence violation'); }
  if (inRestrictedZone) { score += 0.2; factors.push('Worker in restricted zone'); }
  if (loneWorker) { score += 0.15; factors.push('Lone worker detected'); }
  if (stayedTooLong) { score += 0.1; factors.push('Worker stayed too long in zone'); }

  const normalizedSpeed = normalizeValue(speed, 0, 20);
  score += normalizedSpeed * 0.05;
  score += deviationFromPath * 0.1;

  return { score: Math.min(1, score), factors };
}

function computeMachineHealthRisk(data: Record<string, unknown>): { score: number; factors: string[] } {
  const factors: string[] = [];
  const machine = data.machine as IMachineHealthReading | undefined;
  if (!machine) return { score: 0, factors: ['No machine health data'] };

  let score = 0;

  if (machine.errorCode) { score += 0.2; factors.push(`Equipment error: ${machine.errorCode}`); }
  if (machine.maintenanceDue) { score += 0.15; factors.push('Maintenance overdue'); }

  if (machine.anomalyScore !== undefined) {
    score += machine.anomalyScore * 0.25;
    if (machine.anomalyScore > 0.7) factors.push('Critical equipment anomaly');
  }

  if (machine.temperature !== undefined) {
    const tempRisk = normalizeValue(Math.abs(machine.temperature - 60), 0, 100);
    score += tempRisk * 0.1;
    if (machine.temperature > 90) factors.push('Equipment overheating');
  }

  if (machine.vibration !== undefined) {
    const vibRisk = normalizeValue(machine.vibration, 0, 50);
    score += vibRisk * 0.1;
    if (machine.vibration > 30) factors.push('Excessive vibration');
  }

  if (machine.pressure !== undefined) {
    const pressureRisk = normalizeValue(Math.abs(machine.pressure - 100), 0, 200);
    score += pressureRisk * 0.1;
  }

  return { score: Math.min(1, score), factors };
}

function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 0.7) return RiskLevel.CRITICAL;
  if (score >= 0.45) return RiskLevel.HIGH_RISK;
  if (score >= 0.2) return RiskLevel.WARNING;
  return RiskLevel.SAFE;
}

function getTemporalTrend(entityKey: string, newScore: number): { trend: RiskTrend; bufferKey: string } {
  const key = `fusion:${entityKey}`;
  if (!temporalBuffer.has(key)) temporalBuffer.set(key, []);
  const buffer = temporalBuffer.get(key)!;
  buffer.push(newScore);
  if (buffer.length > 10) buffer.shift();

  if (buffer.length < 3) return { trend: RiskTrend.STABLE, bufferKey: key };

  const recent = buffer.slice(-3);
  const avgDelta = (
    (recent[2] - recent[1]) +
    (recent[1] - recent[0])
  ) / 2;

  let trend: RiskTrend;
  if (newScore >= 0.7) trend = RiskTrend.CRITICAL;
  else if (avgDelta > 0.05) trend = RiskTrend.DEGRADING;
  else if (avgDelta < -0.05) trend = RiskTrend.IMPROVING;
  else trend = RiskTrend.STABLE;

  return { trend, bufferKey: key };
}

function calculateAdaptiveWeights(modalityScores: Record<string, number>): Record<string, number> {
  const weights: Record<string, number> = {};
  let totalWeight = 0;

  for (const [modality, score] of Object.entries(modalityScores)) {
    const confidence = score > 0 ? 1 - Math.abs(0.5 - score) : 0.3;
    weights[modality] = 0.1 + confidence * 0.4;
    totalWeight += weights[modality];
  }

  if (totalWeight > 0) {
    for (const modality of Object.keys(weights)) {
      weights[modality] /= totalWeight;
    }
  }

  return weights;
}

function detectAnomaly(modalityScores: Record<string, number>, overallScore: number): boolean {
  const values = Object.values(modalityScores).filter(v => v > 0);
  if (values.length === 0) return false;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const zScore = stdDev > 0 ? (overallScore - mean) / stdDev : 0;
  return Math.abs(zScore) > 2 || overallScore - mean > 0.3;
}

export async function fuseModalities(inputs: IModalityInput[], entityKey = 'global'): Promise<IFusionResult> {
  const modalityScores: Record<string, number> = {};
  const allFactors: string[] = [];

  for (const input of inputs) {
    let result: { score: number; factors: string[] };

    switch (input.type) {
      case ModalityType.VISION:
        result = computeVisionRisk(input.data);
        break;
      case ModalityType.AUDIO:
        result = computeAudioRisk(input.data);
        break;
      case ModalityType.WEARABLE:
        result = computeWearableRisk(input.data);
        break;
      case ModalityType.ENVIRONMENTAL:
        result = computeEnvironmentalRisk(input.data);
        break;
      case ModalityType.LOCATION:
        result = computeLocationRisk(input.data);
        break;
      case ModalityType.MACHINE_HEALTH:
        result = computeMachineHealthRisk(input.data);
        break;
      default:
        result = { score: 0, factors: ['Unknown modality'] };
    }

    modalityScores[input.type] = result.score;
    allFactors.push(...result.factors);
  }

  const weights = calculateAdaptiveWeights(modalityScores);
  let overallRiskScore = 0;
  for (const [modality, score] of Object.entries(modalityScores)) {
    overallRiskScore += score * (weights[modality] || 0);
  }

  overallRiskScore = sigmoid(overallRiskScore * 2 - 1);

  const { trend } = getTemporalTrend(entityKey, overallRiskScore);

  const anomalyDetected = detectAnomaly(modalityScores, overallRiskScore);

  const uniqueFactors = [...new Set(allFactors)];
  const riskLevel = classifyRiskLevel(overallRiskScore);

  const result: IFusionResult = {
    overallRiskScore: Math.round(overallRiskScore * 1000) / 1000,
    riskLevel,
    modalityScores: modalityScores as Record<ModalityType, number>,
    temporalTrend: trend,
    contributingFactors: uniqueFactors.slice(0, 10),
    timestamp: new Date(),
    anomalyDetected,
  };

  await SafetyEvent.create({
    modality: inputs[0]?.type || ModalityType.ENVIRONMENTAL,
    riskScore: result.overallRiskScore,
    riskLevel: result.riskLevel,
    anomalyScore: anomalyDetected ? 1 : 0,
    data: { inputs: inputs.map(i => ({ type: i.type, confidence: i.confidence })) },
    metadata: { modalityScores, contributingFactors: uniqueFactors, trend },
  });

  try {
    getIO().to('supervisors').emit('fusion:update', result);
  } catch { /* socket not ready */ }

  return result;
}

export async function getCurrentFusionSnapshot(factoryId?: string): Promise<IFusionResult | null> {
  const filter: Record<string, unknown> = {};
  if (factoryId) filter.factoryId = factoryId;

  const snapshot = await FusionSnapshot.findOne(filter).sort({ createdAt: -1 });
  if (!snapshot) return null;

  return {
    overallRiskScore: snapshot.overallRiskScore,
    riskLevel: snapshot.riskLevel,
    modalityScores: snapshot.modalityScores as Record<ModalityType, number>,
    temporalTrend: snapshot.temporalTrend as RiskTrend,
    contributingFactors: snapshot.contributingFactors,
    timestamp: snapshot.createdAt,
    anomalyDetected: snapshot.anomalyDetected,
  };
}

export async function getWorkerLiveStatuses(): Promise<ILiveWorkerStatus[]> {
  const workers = await Worker.find({ isActive: true })
    .populate('userId', 'firstName lastName email role')
    .populate('department', 'name')
    .lean();

  const statuses: ILiveWorkerStatus[] = [];

  for (const worker of workers) {
    const user = worker.userId as unknown as { _id: string; firstName: string; lastName: string; email: string; role: UserRole } | null;
    if (!user) continue;

    const recentEvents = await SafetyEvent.find({ workerId: worker._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const avgRisk = recentEvents.length > 0
      ? recentEvents.reduce((sum, e) => sum + e.riskScore, 0) / recentEvents.length
      : 0;

    const riskLevel = classifyRiskLevel(avgRisk);

    statuses.push({
      workerId: worker._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      employeeId: worker.employeeId,
      department: (worker.department as unknown as { name: string })?.name || 'Unknown',
      designation: worker.designation,
      role: user.role,
      riskScore: Math.round(avgRisk * 1000) / 1000,
      riskLevel,
      location: worker.lastKnownLocation?.coordinates
        ? { lat: worker.lastKnownLocation.coordinates[1], lng: worker.lastKnownLocation.coordinates[0], zone: worker.currentZone?.toString() }
        : undefined,
      lastPingAt: new Date(),
      isOnline: true,
      inSafeZone: false,
      deviceStatus: worker.assignedDevices.length > 0 ? 'online' : 'offline',
    });
  }

  return statuses;
}

export async function getLiveAlerts(limit = 50): Promise<ILiveAlert[]> {
  const incidents = await Incident.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reportedBy', 'firstName lastName')
    .lean();

  const alerts: ILiveAlert[] = incidents.map((inc) => ({
    id: inc._id.toString(),
    type: inc.type,
    severity: inc.severity,
    title: inc.title,
    message: inc.description?.slice(0, 200) || '',
    zone: inc.location?.zone || 'Unknown',
    modality: ModalityType.VISION,
    timestamp: inc.createdAt,
    acknowledged: inc.status !== 'reported',
    acknowledgedBy: inc.assignedTo?.toString(),
  }));

  return alerts;
}
