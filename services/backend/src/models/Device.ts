import mongoose, { Schema, Document } from 'mongoose';
import { DeviceType, DeviceStatus } from '../types';

export interface IDevice extends Document {
  name: string;
  serialNumber: string;
  macAddress?: string;
  type: DeviceType;
  status: DeviceStatus;
  firmware: {
    version: string;
    lastUpdated?: Date;
    updateAvailable?: boolean;
  };
  batteryLevel?: number;
  batteryStatus?: 'charging' | 'discharging' | 'full' | 'low';
  lastPingAt?: Date;
  ipAddress?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedWorker?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  capabilities: string[];
  isActive: boolean;
  lastCalibration?: Date;
  nextCalibrationDue?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: { type: String, required: true, trim: true },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    macAddress: { type: String, sparse: true, unique: true },
    type: {
      type: String,
      enum: Object.values(DeviceType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      default: DeviceStatus.OFFLINE,
      index: true,
    },
    firmware: {
      version: { type: String, default: '1.0.0' },
      lastUpdated: Date,
      updateAvailable: Boolean,
    },
    batteryLevel: { type: Number, min: 0, max: 100 },
    batteryStatus: {
      type: String,
      enum: ['charging', 'discharging', 'full', 'low'],
    },
    lastPingAt: Date,
    ipAddress: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedWorker: { type: Schema.Types.ObjectId, ref: 'Worker' },
    metadata: { type: Schema.Types.Mixed },
    capabilities: [String],
    isActive: { type: Boolean, default: true },
    lastCalibration: Date,
    nextCalibrationDue: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

deviceSchema.index({ location: '2dsphere' });
deviceSchema.index({ type: 1, status: 1 });
deviceSchema.index({ assignedWorker: 1 });

export const Device = mongoose.model<IDevice>('Device', deviceSchema);
