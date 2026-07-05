import mongoose, { Schema, Document } from 'mongoose';
import { SensorType, SensorStatus } from '../types';

export interface ISensor extends Document {
  name: string;
  sensorId: string;
  type: SensorType;
  status: SensorStatus;
  device: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  unit: string;
  minRange: number;
  maxRange: number;
  precision: number;
  samplingRate: number;
  lastReading?: {
    value: number;
    recordedAt: Date;
  };
  firmware: {
    version: string;
    lastUpdated?: Date;
  };
  calibrationDue?: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sensorSchema = new Schema<ISensor>(
  {
    name: { type: String, required: true, trim: true },
    sensorId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: Object.values(SensorType), required: true, index: true },
    status: { type: String, enum: Object.values(SensorStatus), default: SensorStatus.ACTIVE, index: true },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    unit: { type: String, required: true },
    minRange: { type: Number, required: true },
    maxRange: { type: Number, required: true },
    precision: { type: Number, default: 2 },
    samplingRate: { type: Number, default: 1 },
    lastReading: {
      value: Number,
      recordedAt: Date,
    },
    firmware: {
      version: { type: String, default: '1.0.0' },
      lastUpdated: Date,
    },
    calibrationDue: Date,
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

sensorSchema.index({ location: '2dsphere' });
sensorSchema.index({ type: 1, status: 1 });
sensorSchema.index({ device: 1, type: 1 });
sensorSchema.index({ status: 1, calibrationDue: 1 });

export const Sensor = mongoose.model<ISensor>('Sensor', sensorSchema);
