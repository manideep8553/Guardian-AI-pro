import mongoose, { Schema, Document } from 'mongoose';
import { ZoneType } from '../types';

export interface IZone extends Document {
  name: string;
  code: string;
  type: ZoneType;
  floor: mongoose.Types.ObjectId;
  building: mongoose.Types.ObjectId;
  factory: mongoose.Types.ObjectId;
  boundary?: {
    type: string;
    coordinates: number[][][];
  };
  capacity: number;
  currentOccupancy: number;
  hazardLevel?: string;
  restrictions?: string[];
  hasEmergencyEquipment: boolean;
  evacuationRoute?: {
    destination: string;
    path: number[][];
    estimatedTime: number;
  };
  safeZoneCapacity?: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const zoneSchema = new Schema<IZone>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    type: {
      type: String,
      enum: Object.values(ZoneType),
      default: ZoneType.GENERAL,
    },
    floor: {
      type: Schema.Types.ObjectId,
      ref: 'Floor',
      required: true,
      index: true,
    },
    building: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
    },
    factory: {
      type: Schema.Types.ObjectId,
      ref: 'Factory',
      required: true,
    },
    boundary: {
      type: { type: String, enum: ['Polygon'] },
      coordinates: { type: [[[Number]]] },
    },
    capacity: { type: Number, default: 10 },
    currentOccupancy: { type: Number, default: 0 },
    hazardLevel: String,
    restrictions: [String],
    hasEmergencyEquipment: { type: Boolean, default: false },
    evacuationRoute: {
      destination: String,
      path: [[Number]],
      estimatedTime: Number,
    },
    safeZoneCapacity: Number,
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

zoneSchema.index({ floor: 1, code: 1 }, { unique: true });
zoneSchema.index({ type: 1 });
zoneSchema.index({ 'boundary': '2dsphere' });

export const Zone = mongoose.model<IZone>('Zone', zoneSchema);
