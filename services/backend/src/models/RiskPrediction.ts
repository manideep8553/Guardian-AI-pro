import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel, ModalityType } from '../types';

export interface IRiskPrediction extends Document {
  worker?: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  factory: mongoose.Types.ObjectId;
  predictedRiskLevel: RiskLevel;
  predictedRiskScore: number;
  confidence: number;
  timeHorizon: string;
  contributingModalities: {
    type: ModalityType;
    score: number;
    weight: number;
  }[];
  features: Record<string, number>;
  modelVersion: string;
  modelId?: mongoose.Types.ObjectId;
  actualOutcome?: {
    occurred: boolean;
    actualRiskLevel?: RiskLevel;
    observedAt?: Date;
  };
  validated: boolean;
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const riskPredictionSchema = new Schema<IRiskPrediction>(
  {
    worker: { type: Schema.Types.ObjectId, ref: 'Worker' },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory', required: true, index: true },
    predictedRiskLevel: { type: String, enum: Object.values(RiskLevel), required: true, index: true },
    predictedRiskScore: { type: Number, required: true, min: 0, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    timeHorizon: { type: String, required: true, default: '1h' },
    contributingModalities: [{
      type: { type: String, enum: Object.values(ModalityType), required: true },
      score: { type: Number, required: true },
      weight: { type: Number, required: true },
    }],
    features: { type: Schema.Types.Mixed, default: {} },
    modelVersion: { type: String, required: true },
    modelId: { type: Schema.Types.ObjectId, ref: 'AIModelLog' },
    actualOutcome: {
      occurred: Boolean,
      actualRiskLevel: { type: String, enum: Object.values(RiskLevel) },
      observedAt: Date,
    },
    validated: { type: Boolean, default: false },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date,
    expiresAt: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

riskPredictionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
riskPredictionSchema.index({ worker: 1, createdAt: -1 });
riskPredictionSchema.index({ zone: 1, createdAt: -1 });
riskPredictionSchema.index({ predictedRiskLevel: 1, createdAt: -1 });
riskPredictionSchema.index({ factory: 1, predictedRiskLevel: 1 });
riskPredictionSchema.index({ confidence: -1 });

export const RiskPrediction = mongoose.model<IRiskPrediction>('RiskPrediction', riskPredictionSchema);
