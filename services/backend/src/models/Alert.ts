import mongoose, { Schema, Document } from 'mongoose';
import { AlertType, IncidentSeverity, RiskLevel, ModalityType } from '../types';

export interface IAlert extends Document {
  title: string;
  message: string;
  type: AlertType;
  severity: IncidentSeverity | RiskLevel;
  source: string;
  modality?: ModalityType;
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  device?: mongoose.Types.ObjectId;
  worker?: mongoose.Types.ObjectId;
  incident?: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  acknowledged: boolean;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  autoResolve: boolean;
  autoResolveAfterMs?: number;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: { type: String, enum: Object.values(AlertType), required: true, index: true },
    severity: { type: String, enum: [...Object.values(IncidentSeverity), ...Object.values(RiskLevel)], required: true, index: true },
    source: { type: String, required: true },
    modality: { type: String, enum: Object.values(ModalityType) },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    device: { type: Schema.Types.ObjectId, ref: 'Device' },
    worker: { type: Schema.Types.ObjectId, ref: 'Worker' },
    incident: { type: Schema.Types.ObjectId, ref: 'Incident' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: Date,
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    autoResolve: { type: Boolean, default: false },
    autoResolveAfterMs: Number,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

alertSchema.index({ isActive: 1, createdAt: -1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ acknowledged: 1, isActive: 1 });
alertSchema.index({ zone: 1, isActive: 1 });
alertSchema.index({ worker: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
