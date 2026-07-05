import { logger } from '../config/logger';
import { cleanupAuditLogs } from '../services/audit.service';
import { EquipmentHealth } from '../models/EquipmentHealth';
import { ComplianceRecords } from '../models/ComplianceRecords';
import { FusionSnapshot } from '../models/FusionSnapshot';
import { Notification } from '../models/Notification';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { Incident } from '../models/Incident';

interface ScheduledTask {
  name: string;
  interval: number;
  handler: () => Promise<unknown>;
  enabled: boolean;
}

const tasks: ScheduledTask[] = [
  {
    name: 'audit-log-cleanup',
    interval: 86400000,
    handler: () => cleanupAuditLogs(90),
    enabled: true,
  },
  {
    name: 'equipment-health-check',
    interval: 3600000,
    handler: async () => {
      const overdue = await EquipmentHealth.find({
        nextMaintenanceDue: { $lte: new Date() },
        status: { $ne: 'critical' },
      });
      for (const eq of overdue) {
        eq.status = 'warning';
        eq.maintenanceDue = true;
        await eq.save();
      }
      logger.info(`Equipment health check: ${overdue.length} items updated`);
    },
    enabled: true,
  },
  {
    name: 'compliance-overdue-check',
    interval: 43200000,
    handler: async () => {
      const result = await ComplianceRecords.updateMany(
        { nextAssessmentDate: { $lte: new Date() }, status: { $ne: 'non_compliant' } },
        { isOverdue: true },
      );
      logger.info(`Compliance overdue check: ${result.modifiedCount} records updated`);
    },
    enabled: true,
  },
  {
    name: 'stale-fusion-snapshots-cleanup',
    interval: 86400000,
    handler: async () => {
      const cutoff = new Date(Date.now() - 7 * 86400000);
      const result = await FusionSnapshot.deleteMany({ createdAt: { $lt: cutoff } });
      logger.info(`Cleaned up ${result.deletedCount} stale fusion snapshots`);
    },
    enabled: true,
  },
  {
    name: 'stale-notifications-cleanup',
    interval: 86400000,
    handler: async () => {
      const cutoff = new Date(Date.now() - 30 * 86400000);
      const result = await Notification.deleteMany({ createdAt: { $lt: cutoff }, read: true });
      logger.info(`Cleaned up ${result.deletedCount} stale notifications`);
    },
    enabled: true,
  },
  {
    name: 'daily-analytics-snapshot',
    interval: 86400000,
    handler: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeEmergencies = await EmergencyEvent.countDocuments({
        createdAt: { $gte: today },
        status: { $in: ['active', 'acknowledged', 'evacuating'] },
      });
      const newIncidents = await Incident.countDocuments({ createdAt: { $gte: today } });
      logger.info(`Daily analytics snapshot: ${newIncidents} incidents, ${activeEmergencies} active emergencies`);
    },
    enabled: true,
  },
];

const intervals: ReturnType<typeof setInterval>[] = [];

export function startScheduler(): void {
  for (const task of tasks) {
    if (!task.enabled) continue;
    task.handler().catch((err) => logger.error(`Scheduler initial run ${task.name} failed`, { error: err }));
    const interval = setInterval(() => {
      task.handler().catch((err) => logger.error(`Scheduler task ${task.name} failed`, { error: err }));
    }, task.interval);
    intervals.push(interval);
    logger.info(`Scheduler started: ${task.name} (every ${task.interval / 60000} min)`);
  }
}

export function stopScheduler(): void {
  for (const interval of intervals) {
    clearInterval(interval);
  }
  logger.info(`Scheduler stopped: ${intervals.length} tasks`);
}
