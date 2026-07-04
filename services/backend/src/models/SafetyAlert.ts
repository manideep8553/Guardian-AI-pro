import mongoose, { Schema, Document } from 'mongoose';
import { AlertType, IncidentSeverity } from '../types';

export interface ISafetyAlert extends Document {
  title: string;
  message: string;
  type: AlertType;
  severity: IncidentSeverity;
  zone: string;
  isActive: boolean;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  acknowledgedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const safetyAlertSchema = new Schema<ISafetyAlert>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(IncidentSeverity),
      required: true,
    },
    zone: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acknowledgedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
);

safetyAlertSchema.index({ isActive: 1, zone: 1 });
safetyAlertSchema.index({ type: 1, severity: 1 });

export const SafetyAlert = mongoose.model<ISafetyAlert>('SafetyAlert', safetyAlertSchema);
