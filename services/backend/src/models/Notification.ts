import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationPriority } from '../types';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  imageUrl?: string;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  groupKey?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    priority: { type: String, enum: Object.values(NotificationPriority), default: NotificationPriority.MEDIUM },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    actionUrl: String,
    imageUrl: String,
    read: { type: Boolean, default: false },
    readAt: Date,
    delivered: { type: Boolean, default: false },
    deliveredAt: Date,
    failedAt: Date,
    failureReason: String,
    scheduledFor: Date,
    sentAt: Date,
    expiresAt: Date,
    groupKey: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
