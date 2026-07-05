import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { logger } from '../config/logger';
import { processRiskAnalysis, processAnomalyDetection } from './processors/riskAnalysis.processor';
import { processReportGeneration } from './processors/reportGeneration.processor';
import { processPushNotification, processEmailNotification, processSmsNotification } from './processors/notificationDispatch.processor';

const connection = getRedis() as never;

export const riskAnalysisWorker = new Worker(
  'risk-analysis',
  async (job: Job) => {
    switch (job.name) {
      case 'analyze-risk':
        await processRiskAnalysis(job);
        break;
      case 'detect-anomaly':
        await processAnomalyDetection(job);
        break;
      default:
        logger.warn(`Unknown risk analysis job type: ${job.name}`);
    }
  },
  { connection, concurrency: 5 },
);

export const reportGenerationWorker = new Worker(
  'report-generation',
  async (job: Job) => {
    await processReportGeneration(job);
  },
  { connection, concurrency: 2 },
);

export const pushWorker = new Worker(
  'push',
  async (job: Job) => {
    await processPushNotification(job);
  },
  { connection, concurrency: 10 },
);

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    await processEmailNotification(job);
  },
  { connection, concurrency: 5 },
);

export const smsWorker = new Worker(
  'sms',
  async (job: Job) => {
    await processSmsNotification(job);
  },
  { connection, concurrency: 5 },
);

export const sensorIngestionWorker = new Worker(
  'sensor-ingestion',
  async (job: Job) => {
    logger.info('Processing sensor ingestion', { jobId: job.id, data: job.data });
  },
  { connection, concurrency: 20 },
);

export const dataExportWorker = new Worker(
  'data-export',
  async (job: Job) => {
    logger.info('Processing data export', { jobId: job.id, format: job.data.format });
  },
  { connection, concurrency: 3 },
);

export function initializeAllWorkers(): void {
  const workers = [
    { name: 'risk-analysis', worker: riskAnalysisWorker },
    { name: 'report-generation', worker: reportGenerationWorker },
    { name: 'push', worker: pushWorker },
    { name: 'email', worker: emailWorker },
    { name: 'sms', worker: smsWorker },
    { name: 'sensor-ingestion', worker: sensorIngestionWorker },
    { name: 'data-export', worker: dataExportWorker },
  ];

  for (const { name, worker } of workers) {
    worker.on('completed', (job) => {
      logger.info(`Worker ${name} completed job ${job.id}`);
    });
    worker.on('failed', (job, err) => {
      logger.error(`Worker ${name} failed job ${job?.id}`, { error: err.message });
    });
    worker.on('error', (err) => {
      logger.error(`Worker ${name} error`, { error: err.message });
    });
  }

  logger.info(`Initialized ${workers.length} workers`);
}

export async function closeAllWorkers(): Promise<void> {
  const workers = [
    riskAnalysisWorker, reportGenerationWorker, pushWorker,
    emailWorker, smsWorker, sensorIngestionWorker, dataExportWorker,
  ];
  await Promise.all(workers.map((w) => w.close()));
  logger.info('All workers closed');
}
