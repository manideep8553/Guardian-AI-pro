import { Queue, Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { logger } from '../config/logger';

const connection = getRedis();

export const incidentQueue = new Queue('incident-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export const notificationQueue = new Queue('notifications', {
  connection: connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 1000 },
    removeOnComplete: { age: 3600 },
  },
});

export const incidentWorker = new Worker(
  'incident-processing',
  async (job: Job) => {
    logger.info(`Processing incident job ${job.id}`, { data: job.data });

    switch (job.name) {
      case 'analyze-risk':
        await analyzeRisk(job.data);
        break;
      case 'notify-supervisors':
        await notifySupervisors(job.data);
        break;
      default:
        logger.warn(`Unknown job type: ${job.name}`);
    }
  },
  { connection: connection },
);

async function analyzeRisk(data: Record<string, unknown>): Promise<void> {
  logger.info('Analyzing risk for incident', { incidentId: data.incidentId });
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function notifySupervisors(data: Record<string, unknown>): Promise<void> {
  logger.info('Notifying supervisors', { incidentId: data.incidentId });
  await new Promise((resolve) => setTimeout(resolve, 500));
}

incidentWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

incidentWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed`, { error: err.message });
});
