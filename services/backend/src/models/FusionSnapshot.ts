import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel, RiskTrend } from '../types';

export interface IFusionSnapshot extends Document {
  factoryId?: mongoose.Types.ObjectId;
  zone?: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  temporalTrend: RiskTrend;
  modalityScores: Record<string, number>;
  contributingFactors: string[];
  anomalyDetected: boolean;
  activeWorkerCount: number;
  criticalAlertCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const fusionSnapshotSchema = new Schema<IFusionSnapshot>(
  {
    factoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Factory',
      index: true,
    },
    zone: { type: String, index: true },
    overallRiskScore: { type: Number, required: true, min: 0, max: 1 },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
    },
    temporalTrend: {
      type: String,
      enum: Object.values(RiskTrend),
      default: RiskTrend.STABLE,
    },
    modalityScores: { type: Schema.Types.Mixed, default: {} },
    contributingFactors: [String],
    anomalyDetected: { type: Boolean, default: false },
    activeWorkerCount: { type: Number, default: 0 },
    criticalAlertCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

fusionSnapshotSchema.index({ createdAt: -1 });
fusionSnapshotSchema.index({ factoryId: 1, createdAt: -1 });
fusionSnapshotSchema.index({ riskLevel: 1 });

export const FusionSnapshot = mongoose.model<IFusionSnapshot>('FusionSnapshot', fusionSnapshotSchema);
