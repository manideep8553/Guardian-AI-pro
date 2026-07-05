import mongoose, { Schema, Document } from 'mongoose';
import { ModalityType, RiskLevel } from '../types';

export interface ISafetyEvent extends Document {
  workerId?: mongoose.Types.ObjectId;
  modality: ModalityType;
  riskScore: number;
  riskLevel: RiskLevel;
  anomalyScore: number;
  data: Record<string, unknown>;
  location?: {
    type: string;
    coordinates: [number, number];
    zone?: string;
  };
  factoryId?: mongoose.Types.ObjectId;
  deviceId?: mongoose.Types.ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const safetyEventSchema = new Schema<ISafetyEvent>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      index: true,
    },
    modality: {
      type: String,
      enum: Object.values(ModalityType),
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
    },
    anomalyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
      zone: String,
    },
    factoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Factory',
      index: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

safetyEventSchema.index({ createdAt: -1 });
safetyEventSchema.index({ riskLevel: 1, createdAt: -1 });
safetyEventSchema.index({ 'location.coordinates': '2dsphere' });

export const SafetyEvent = mongoose.model<ISafetyEvent>('SafetyEvent', safetyEventSchema);
