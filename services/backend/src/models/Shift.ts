import mongoose, { Schema, Document } from 'mongoose';
import { ShiftType } from '../types';

export interface IShift extends Document {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  workingDays: number[];
  department?: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  maxWorkers: number;
  currentWorkers: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ShiftType),
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15,
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
    },
    maxWorkers: {
      type: Number,
      default: 50,
    },
    currentWorkers: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
