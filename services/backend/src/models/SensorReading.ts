import mongoose, { Schema, Document } from 'mongoose';
import { SensorType } from '../types';

export interface ISensorReading extends Document {
  sensor: mongoose.Types.ObjectId;
  device: mongoose.Types.ObjectId;
  type: SensorType;
  value: number;
  unit: string;
  quality: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
  createdAt: Date;
}

const sensorReadingSchema = new Schema<ISensorReading>(
  {
    sensor: { type: Schema.Types.ObjectId, ref: 'Sensor', required: true, index: true },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    type: { type: String, enum: Object.values(SensorType), required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    quality: { type: Number, min: 0, max: 1, default: 1 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    metadata: { type: Schema.Types.Mixed },
    recordedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sensorReadingSchema.index({ recordedAt: -1 });
sensorReadingSchema.index({ sensor: 1, recordedAt: -1 });
sensorReadingSchema.index({ type: 1, recordedAt: -1 });
sensorReadingSchema.index({ location: '2dsphere' });
sensorReadingSchema.index({ factory: 1, recordedAt: -1 });
sensorReadingSchema.index({ value: 1, type: 1, recordedAt: -1 }, { name: 'value_range_query' });

export const SensorReading = mongoose.model<ISensorReading>('SensorReading', sensorReadingSchema);
