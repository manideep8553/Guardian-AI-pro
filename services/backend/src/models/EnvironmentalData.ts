import mongoose, { Schema, Document } from 'mongoose';

export interface IEnvironmentalData extends Document {
  zone: mongoose.Types.ObjectId;
  factory: mongoose.Types.ObjectId;
  device: mongoose.Types.ObjectId;
  temperature?: number;
  humidity?: number;
  airQualityIndex?: number;
  gasLevels: Record<string, number>;
  noiseLevel?: number;
  luminance?: number;
  vibration?: number;
  radiation?: number;
  windSpeed?: number;
  pressure?: number;
  weatherCondition?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  dataQuality: number;
  metadata?: Record<string, unknown>;
  recordedAt: Date;
  createdAt: Date;
}

const environmentalDataSchema = new Schema<IEnvironmentalData>(
  {
    zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory', required: true, index: true },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    temperature: { type: Number },
    humidity: { type: Number, min: 0, max: 100 },
    airQualityIndex: { type: Number, min: 0, max: 500 },
    gasLevels: { type: Schema.Types.Mixed, default: {} },
    noiseLevel: { type: Number, min: 0 },
    luminance: { type: Number, min: 0 },
    vibration: { type: Number, min: 0 },
    radiation: { type: Number, min: 0 },
    windSpeed: Number,
    pressure: Number,
    weatherCondition: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    dataQuality: { type: Number, min: 0, max: 1, default: 1 },
    metadata: { type: Schema.Types.Mixed },
    recordedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

environmentalDataSchema.index({ recordedAt: -1 });
environmentalDataSchema.index({ zone: 1, recordedAt: -1 });
environmentalDataSchema.index({ factory: 1, recordedAt: -1 });
environmentalDataSchema.index({ location: '2dsphere' });
environmentalDataSchema.index({ airQualityIndex: 1, recordedAt: -1 });
environmentalDataSchema.index({ temperature: 1, recordedAt: -1 });

export const EnvironmentalData = mongoose.model<IEnvironmentalData>('EnvironmentalData', environmentalDataSchema);
