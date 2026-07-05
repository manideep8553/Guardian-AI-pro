import { Job } from 'bullmq';
import { logger } from '../../config/logger';
import { Notification, INotification } from '../../models/Notification';
import { NotificationType, NotificationPriority } from '../../types';

export async function processPushNotification(job: Job): Promise<void> {
  const { userId, title, message, data } = job.data;
  logger.info('Sending push notification', { userId, title });

  await Notification.create({
    userId,
    type: NotificationType.PUSH,
    priority: NotificationPriority.HIGH,
    title,
    message,
    data,
    delivered: true,
    deliveredAt: new Date(),
    sentAt: new Date(),
  } as Partial<INotification>);
}

export async function processEmailNotification(job: Job): Promise<void> {
  const { userId, email, subject, body } = job.data;
  logger.info('Sending email notification', { userId, email, subject });

  await Notification.create({
    userId,
    type: NotificationType.EMAIL,
    priority: NotificationPriority.MEDIUM,
    title: subject,
    message: body,
    delivered: true,
    deliveredAt: new Date(),
    sentAt: new Date(),
  } as Partial<INotification>);
}

export async function processSmsNotification(job: Job): Promise<void> {
  const { userId, phone, message } = job.data;
  logger.info('Sending SMS notification', { userId, phone });

  await Notification.create({
    userId,
    type: NotificationType.SMS,
    priority: NotificationPriority.HIGH,
    title: 'SMS Alert',
    message,
    delivered: true,
    deliveredAt: new Date(),
    sentAt: new Date(),
  } as Partial<INotification>);
}
