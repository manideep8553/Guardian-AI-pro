import mongoose, { Schema, Document } from 'mongoose';

export interface IWearableVitals extends Document {
  worker: mongoose.Types.ObjectId;
  device: mongoose.Types.ObjectId;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  stressLevel?: number;
  fatigueIndex?: number;
  stepCount?: number;
  caloriesBurned?: number;
  fallDetected: boolean;
  impactDetected: boolean;
  impactForce?: number;
  posture?: 'standing' | 'sitting' | 'lying' | 'walking' | 'running';
  gpsLocation: {
    type: string;
    coordinates: [number, number];
  };
  zone?: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  batteryLevel?: number;
  signalStrength?: number;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
  createdAt: Date;
}

const wearableVitalsSchema = new Schema<IWearableVitals>(
  {
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    heartRate: { type: Number, min: 0, max: 300 },
    bloodPressureSystolic: { type: Number, min: 50, max: 300 },
    bloodPressureDiastolic: { type: Number, min: 30, max: 200 },
    spo2: { type: Number, min: 0, max: 100 },
    temperature: { type: Number, min: 30, max: 45 },
    respiratoryRate: { type: Number, min: 0, max: 100 },
    stressLevel: { type: Number, min: 0, max: 100 },
    fatigueIndex: { type: Number, min: 0, max: 100 },
    stepCount: { type: Number, default: 0 },
    caloriesBurned: Number,
    fallDetected: { type: Boolean, default: false, index: true },
    impactDetected: { type: Boolean, default: false },
    impactForce: Number,
    posture: { type: String, enum: ['standing', 'sitting', 'lying', 'walking', 'running'] },
    gpsLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    batteryLevel: { type: Number, min: 0, max: 100 },
    signalStrength: { type: Number, min: 0, max: 100 },
    metadata: { type: Schema.Types.Mixed },
    recordedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

wearableVitalsSchema.index({ recordedAt: -1 });
wearableVitalsSchema.index({ worker: 1, recordedAt: -1 });
wearableVitalsSchema.index({ fallDetected: 1, recordedAt: -1 });
wearableVitalsSchema.index({ gpsLocation: '2dsphere' });
wearableVitalsSchema.index({ factory: 1, recordedAt: -1 });

export const WearableVitals = mongoose.model<IWearableVitals>('WearableVitals', wearableVitalsSchema);
