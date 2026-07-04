import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from '../types';

export interface IFactory extends Document {
  name: string;
  code: string;
  address: IAddress;
  contactPhone: string;
  contactEmail: string;
  timezone: string;
  operatingHours: {
    start: string;
    end: string;
  };
  totalBuildings: number;
  totalWorkers: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const factorySchema = new Schema<IFactory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    operatingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
    },
    totalBuildings: { type: Number, default: 0 },
    totalWorkers: { type: Number, default: 0 },
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

export const Factory = mongoose.model<IFactory>('Factory', factorySchema);
