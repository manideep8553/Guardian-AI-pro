import mongoose, { Schema, Document } from 'mongoose';

export interface IFloor extends Document {
  name: string;
  number: number;
  building: mongoose.Types.ObjectId;
  totalZones: number;
  floorPlan?: string;
  ceilingHeight?: number;
  fireExitCount?: number;
  hasSprinklerSystem: boolean;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const floorSchema = new Schema<IFloor>(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true },
    building: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    totalZones: { type: Number, default: 0 },
    floorPlan: String,
    ceilingHeight: Number,
    fireExitCount: { type: Number, default: 0 },
    hasSprinklerSystem: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

floorSchema.index({ building: 1, number: 1 }, { unique: true });

export const Floor = mongoose.model<IFloor>('Floor', floorSchema);
