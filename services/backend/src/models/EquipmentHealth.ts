import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel } from '../types';

export interface IEquipmentHealth extends Document {
  device: mongoose.Types.ObjectId;
  name: string;
  healthScore: number;
  riskLevel: RiskLevel;
  temperature?: number;
  vibration?: number;
  rpm?: number;
  powerConsumption?: number;
  pressure?: number;
  errorCode?: string;
  anomalyScore: number;
  maintenanceDue: boolean;
  daysToMaintenance?: number;
  predictedFailureProbability: number;
  predictedDaysToFailure?: number;
  lastMaintenanceAt?: Date;
  nextMaintenanceDue?: Date;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  metrics: Record<string, number>;
  factory: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentHealthSchema = new Schema<IEquipmentHealth>(
  {
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true, unique: true },
    name: { type: String, required: true },
    healthScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, enum: Object.values(RiskLevel), default: RiskLevel.SAFE },
    temperature: Number,
    vibration: Number,
    rpm: Number,
    powerConsumption: Number,
    pressure: Number,
    errorCode: String,
    anomalyScore: { type: Number, default: 0, min: 0, max: 1 },
    maintenanceDue: { type: Boolean, default: false },
    daysToMaintenance: Number,
    predictedFailureProbability: { type: Number, default: 0, min: 0, max: 1 },
    predictedDaysToFailure: Number,
    lastMaintenanceAt: Date,
    nextMaintenanceDue: Date,
    status: { type: String, enum: ['healthy', 'warning', 'critical', 'offline'], default: 'healthy', index: true },
    metrics: { type: Schema.Types.Mixed, default: {} },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory', required: true, index: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    metadata: { type: Schema.Types.Mixed },
    recordedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

equipmentHealthSchema.index({ healthScore: 1 });
equipmentHealthSchema.index({ riskLevel: 1 });
equipmentHealthSchema.index({ status: 1, nextMaintenanceDue: 1 });
equipmentHealthSchema.index({ device: 1, recordedAt: -1 });
equipmentHealthSchema.index({ factory: 1, status: 1 });

export const EquipmentHealth = mongoose.model<IEquipmentHealth>('EquipmentHealth', equipmentHealthSchema);
