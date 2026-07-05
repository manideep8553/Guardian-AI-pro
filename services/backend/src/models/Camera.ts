import mongoose, { Schema, Document } from 'mongoose';
import { CameraStatus } from '../types';

export interface ICamera extends Document {
  name: string;
  cameraId: string;
  streamUrl: string;
  recordingUrl?: string;
  status: CameraStatus;
  device: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  orientation: {
    pan: number;
    tilt: number;
    zoom: number;
  };
  fieldOfView: number;
  resolution: string;
  fps: number;
  nightVision: boolean;
  motionDetection: boolean;
  aiEnabled: boolean;
  aiModel?: string;
  recordingEnabled: boolean;
  retentionDays: number;
  lastFrameUrl?: string;
  lastMotionAt?: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cameraSchema = new Schema<ICamera>(
  {
    name: { type: String, required: true, trim: true },
    cameraId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    streamUrl: { type: String, required: true },
    recordingUrl: String,
    status: { type: String, enum: Object.values(CameraStatus), default: CameraStatus.ONLINE, index: true },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    orientation: {
      pan: { type: Number, default: 0 },
      tilt: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 },
    },
    fieldOfView: { type: Number, default: 90 },
    resolution: { type: String, default: '1920x1080' },
    fps: { type: Number, default: 30 },
    nightVision: { type: Boolean, default: false },
    motionDetection: { type: Boolean, default: true },
    aiEnabled: { type: Boolean, default: false },
    aiModel: String,
    recordingEnabled: { type: Boolean, default: true },
    retentionDays: { type: Number, default: 30 },
    lastFrameUrl: String,
    lastMotionAt: Date,
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

cameraSchema.index({ location: '2dsphere' });
cameraSchema.index({ status: 1 });
cameraSchema.index({ zone: 1 });
cameraSchema.index({ factory: 1, status: 1 });

export const Camera = mongoose.model<ICamera>('Camera', cameraSchema);
