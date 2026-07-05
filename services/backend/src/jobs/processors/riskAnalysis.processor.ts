import { Job } from 'bullmq';
import { logger } from '../../config/logger';
import { SafetyEvent } from '../../models/SafetyEvent';
import { RiskPrediction } from '../../models/RiskPrediction';
import { RiskLevel } from '../../types';

export async function processRiskAnalysis(job: Job): Promise<void> {
  const { fusionSnapshotId, modalityScores, factoryId } = job.data;
  logger.info('Processing risk analysis', { jobId: job.id, fusionSnapshotId });

  const overallScore = Object.values(modalityScores as Record<string, number>).reduce((a, b) => a + b, 0) /
    Object.keys(modalityScores).length;

  let predictedRiskLevel: RiskLevel;
  if (overallScore < 0.3) predictedRiskLevel = RiskLevel.SAFE;
  else if (overallScore < 0.5) predictedRiskLevel = RiskLevel.WARNING;
  else if (overallScore < 0.75) predictedRiskLevel = RiskLevel.HIGH_RISK;
  else predictedRiskLevel = RiskLevel.CRITICAL;

  await RiskPrediction.create({
    factory: factoryId,
    predictedRiskLevel,
    predictedRiskScore: overallScore,
    confidence: 0.85,
    timeHorizon: '1h',
    contributingModalities: Object.entries(modalityScores as Record<string, number>).map(([type, score]) => ({
      type,
      score,
      weight: 1 / Object.keys(modalityScores).length,
    })),
    features: modalityScores,
    modelVersion: 'fusion-engine-v1',
    expiresAt: new Date(Date.now() + 3600000),
  });

  logger.info('Risk prediction created', { jobId: job.id, predictedRiskLevel, score: overallScore });
}

export async function processAnomalyDetection(job: Job): Promise<void> {
  const { safetyEventId } = job.data;
  logger.info('Processing anomaly detection', { jobId: job.id, safetyEventId });

  const anomalyScore = Math.random() * 0.3;
  if (anomalyScore > 0.7) {
    logger.warn('Anomaly detected', { jobId: job.id, safetyEventId, anomalyScore });
  }

  await SafetyEvent.findByIdAndUpdate(safetyEventId, { anomalyScore });
}
