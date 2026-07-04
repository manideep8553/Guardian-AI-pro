import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceStatus } from '../types';

export interface IAttendance extends Document {
  worker: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  checkInLocation?: {
    type: string;
    coordinates: [number, number];
  };
  checkOutLocation?: {
    type: string;
    coordinates: [number, number];
  };
  shift?: mongoose.Types.ObjectId;
  workHours?: number;
  overtimeHours?: number;
  deviceUsed?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
    },
    checkIn: Date,
    checkOut: Date,
    checkInLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    checkOutLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    shift: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
    },
    workHours: Number,
    overtimeHours: Number,
    deviceUsed: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  { timestamps: true },
);

attendanceSchema.index({ worker: 1, date: -1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
