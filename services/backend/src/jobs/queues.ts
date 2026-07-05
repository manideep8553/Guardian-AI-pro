import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { getRedis } from '../config/redis';
import { logger } from '../config/logger';

const connection = getRedis() as never;

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { age: 86400 },
  removeOnFail: { age: 604800 },
};

function createQueue(name: string, opts?: Partial<QueueOptions>): Queue {
  const queue = new Queue(name, {
    connection,
    defaultJobOptions,
    ...opts,
  });

  queue.on('error', (err) => {
    logger.error(`Queue ${name} error`, { error: err.message });
  });

  return queue;
}

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
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 1000 },
    removeOnComplete: { age: 3600 },
  },
});

export const riskAnalysisQueue = createQueue('risk-analysis', {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { age: 604800 },
    removeOnFail: { age: 2592000 },
  },
});

export const reportGenerationQueue = createQueue('report-generation', {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: { age: 604800 },
    removeOnFail: { age: 86400 },
  },
});

export const sensorIngestionQueue = createQueue('sensor-ingestion', {
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export const emailQueue = createQueue('email', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400 },
  },
});

export const smsQueue = createQueue('sms', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400 },
  },
});

export const pushQueue = createQueue('push', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: { age: 86400 },
  },
});

export const dataExportQueue = createQueue('data-export', {
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { age: 604800 },
    removeOnFail: { age: 86400 },
  },
});

export async function getQueueMetrics(queueName: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queues: Record<string, Queue> = {
    'incident-processing': incidentQueue,
    'notifications': notificationQueue,
    'risk-analysis': riskAnalysisQueue,
    'report-generation': reportGenerationQueue,
    'sensor-ingestion': sensorIngestionQueue,
    'email': emailQueue,
    'sms': smsQueue,
    'push': pushQueue,
    'data-export': dataExportQueue,
  };

  const queue = queues[queueName];
  if (!queue) throw new Error(`Unknown queue: ${queueName}`);

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

export async function getAllQueueMetrics(): Promise<Record<string, { waiting: number; active: number; completed: number; failed: number; delayed: number }>> {
  const queueNames = [
    'incident-processing', 'notifications', 'risk-analysis',
    'report-generation', 'sensor-ingestion', 'email', 'sms', 'push', 'data-export',
  ];
  const entries = await Promise.all(queueNames.map(async (name) => {
    try {
      const metrics = await getQueueMetrics(name);
      return [name, metrics] as const;
    } catch {
      return [name, { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }] as const;
    }
  }));
  return Object.fromEntries(entries);
}

export async function closeAllQueues(): Promise<void> {
  const queues = [
    incidentQueue, notificationQueue, riskAnalysisQueue,
    reportGenerationQueue, sensorIngestionQueue, emailQueue,
    smsQueue, pushQueue, dataExportQueue,
  ];
  await Promise.all(queues.map((q) => q.close()));
  logger.info('All queues closed');
}
