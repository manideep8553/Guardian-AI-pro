import { EmergencyAction, RiskLevel, EmergencyType } from '../types';
import { User } from '../models/User';
import { logger } from '../config/logger';

interface NotificationPayload {
  title: string;
  message: string;
  severity: RiskLevel;
  type: EmergencyType;
  zone?: string;
  metadata?: Record<string, unknown>;
}

export async function sendPushNotification(userIds: string[], payload: NotificationPayload): Promise<void> {
  try {
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName email').lean();
    for (const user of users) {
      logger.info(`[PUSH] To ${user.firstName} ${user.lastName}: ${payload.title} - ${payload.message}`);
    }
  } catch (error) {
    logger.error('Push notification failed', { error });
  }
}

export async function sendSmsNotification(phoneNumbers: string[], payload: NotificationPayload): Promise<void> {
  try {
    for (const phone of phoneNumbers) {
      logger.info(`[SMS] To ${phone}: ${payload.title} - ${payload.message}`);
    }
  } catch (error) {
    logger.error('SMS notification failed', { error });
  }
}

export async function sendEmailNotification(emails: string[], payload: NotificationPayload): Promise<void> {
  try {
    for (const email of emails) {
      logger.info(`[EMAIL] To ${email}: ${payload.title} - ${payload.message}`);
    }
  } catch (error) {
    logger.error('Email notification failed', { error });
  }
}

export async function triggerSiren(zone: string, durationMs = 30000): Promise<void> {
  logger.info(`[SIREN] Activated in zone ${zone} for ${durationMs}ms`);
}

export async function triggerEvacuation(zone: string, route?: string): Promise<void> {
  logger.info(`[EVACUATION] Triggered in zone ${zone} via route ${route || 'primary'}`);
}

export async function callEmergencyServices(details: NotificationPayload): Promise<void> {
  logger.info(`[EMERGENCY_CALL] Dispatched: ${details.title} at ${details.zone}`);
}

export async function dispatchAction(
  action: EmergencyAction,
  payload: NotificationPayload,
  userIds: string[],
  phoneNumbers: string[],
  emails: string[],
  zone: string,
): Promise<void> {
  switch (action) {
    case EmergencyAction.SEND_PUSH:
      await sendPushNotification(userIds, payload);
      break;
    case EmergencyAction.SEND_SMS:
      await sendSmsNotification(phoneNumbers, payload);
      break;
    case EmergencyAction.SEND_EMAIL:
      await sendEmailNotification(emails, payload);
      break;
    case EmergencyAction.SOUND_SIREN:
      await triggerSiren(zone);
      break;
    case EmergencyAction.TRIGGER_EVACUATION:
      await triggerEvacuation(zone);
      break;
    case EmergencyAction.NOTIFY_SUPERVISOR:
      {
        const supervisors = await User.find({ role: 'supervisor' }).select('firstName lastName email').lean();
        const supEmails = supervisors.map(s => s.email);
        await sendEmailNotification(supEmails, { ...payload, title: `[SUPERVISOR] ${payload.title}` });
        const supIds = supervisors.map(s => s._id.toString());
        await sendPushNotification(supIds, { ...payload, title: `[SUPERVISOR] ${payload.title}` });
      }
      break;
    case EmergencyAction.LOG_INCIDENT:
      logger.info(`[INCIDENT] Auto-logged: ${payload.title}`);
      break;
    case EmergencyAction.CALL_EMERGENCY_SERVICES:
      await callEmergencyServices(payload);
      break;
    case EmergencyAction.ACTIVATE_SPRINKLERS:
      logger.info(`[SPRINKLER] Activated in zone ${zone}`);
      break;
    case EmergencyAction.SHUTDOWN_EQUIPMENT:
      logger.info(`[SHUTDOWN] Equipment in zone ${zone}`);
      break;
    default:
      logger.warn(`Unknown emergency action: ${action}`);
  }
}
