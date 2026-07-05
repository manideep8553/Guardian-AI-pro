import mongoose, { Schema, Document } from 'mongoose';
import { ModelStatus, ModalityType } from '../types';

export interface IAIModelLog extends Document {
  name: string;
  version: string;
  type: string;
  modality: ModalityType;
  description?: string;
  status: ModelStatus;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  latencyP50?: number;
  latencyP99?: number;
  modelSize?: number;
  framework: string;
  modelPath?: string;
  trainingDataCount?: number;
  trainingDuration?: number;
  trainedAt?: Date;
  deployedAt?: Date;
  lastInferenceAt?: Date;
  inferenceCount: number;
  successCount: number;
  failureCount: number;
  errorRate: number;
  hyperparameters: Record<string, unknown>;
  metrics: Record<string, number>;
  tags: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aiModelLogSchema = new Schema<IAIModelLog>(
  {
    name: { type: String, required: true, trim: true },
    version: { type: String, required: true },
    type: { type: String, required: true },
    modality: { type: String, enum: Object.values(ModalityType), required: true, index: true },
    description: String,
    status: { type: String, enum: Object.values(ModelStatus), default: ModelStatus.ACTIVE, index: true },
    accuracy: { type: Number, min: 0, max: 100 },
    precision: { type: Number, min: 0, max: 100 },
    recall: { type: Number, min: 0, max: 100 },
    f1Score: { type: Number, min: 0, max: 100 },
    latencyP50: Number,
    latencyP99: Number,
    modelSize: Number,
    framework: { type: String, required: true },
    modelPath: String,
    trainingDataCount: Number,
    trainingDuration: Number,
    trainedAt: Date,
    deployedAt: Date,
    lastInferenceAt: Date,
    inferenceCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0, min: 0, max: 1 },
    hyperparameters: { type: Schema.Types.Mixed, default: {} },
    metrics: { type: Schema.Types.Mixed, default: {} },
    tags: [String],
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

aiModelLogSchema.index({ name: 1, version: 1 }, { unique: true });
aiModelLogSchema.index({ status: 1, modality: 1 });
aiModelLogSchema.index({ accuracy: -1 });
aiModelLogSchema.index({ createdAt: -1 });

export const AIModelLog = mongoose.model<IAIModelLog>('AIModelLog', aiModelLogSchema);
