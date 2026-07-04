import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceCalibration extends Document {
  device: mongoose.Types.ObjectId;
  type: string;
  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
  parameters: Record<string, number>;
  results: Record<string, number>;
  status: 'passed' | 'failed' | 'partial';
  notes?: string;
  nextCalibrationDue?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceCalibrationSchema = new Schema<IDeviceCalibration>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true,
    },
    type: { type: String, required: true },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedAt: { type: Date, default: Date.now },
    parameters: { type: Schema.Types.Mixed, required: true },
    results: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['passed', 'failed', 'partial'],
      required: true,
    },
    notes: String,
    nextCalibrationDue: Date,
  },
  { timestamps: true },
);

export const DeviceCalibration = mongoose.model<IDeviceCalibration>(
  'DeviceCalibration',
  deviceCalibrationSchema,
);
