import mongoose, { Schema, Document } from 'mongoose';
import { EmergencyType, EmergencyAction, EmergencyStatus, RiskLevel } from '../types';

export interface IEmergencyEvent extends Document {
  type: EmergencyType;
  severity: RiskLevel;
  triggeredBy: string;
  title: string;
  description: string;
  location: {
    factoryId?: mongoose.Types.ObjectId;
    zone?: string;
    coordinates?: [number, number];
  };
  affectedWorkers: mongoose.Types.ObjectId[];
  autoActions: EmergencyAction[];
  requiresEvacuation: boolean;
  evacuationRoute?: string;
  status: EmergencyStatus;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  incidentId?: mongoose.Types.ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyEventSchema = new Schema<IEmergencyEvent>(
  {
    type: {
      type: String,
      enum: Object.values(EmergencyType),
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
    },
    triggeredBy: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      factoryId: { type: Schema.Types.ObjectId, ref: 'Factory' },
      zone: String,
      coordinates: [Number],
    },
    affectedWorkers: [{
      type: Schema.Types.ObjectId,
      ref: 'Worker',
    }],
    autoActions: [{
      type: String,
      enum: Object.values(EmergencyAction),
    }],
    requiresEvacuation: {
      type: Boolean,
      default: false,
    },
    evacuationRoute: String,
    status: {
      type: String,
      enum: Object.values(EmergencyStatus),
      default: EmergencyStatus.ACTIVE,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

emergencyEventSchema.index({ status: 1, createdAt: -1 });
emergencyEventSchema.index({ type: 1, severity: 1 });
emergencyEventSchema.index({ 'location.factoryId': 1 });

export const EmergencyEvent = mongoose.model<IEmergencyEvent>('EmergencyEvent', emergencyEventSchema);
