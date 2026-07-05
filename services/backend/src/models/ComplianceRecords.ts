import mongoose, { Schema, Document } from 'mongoose';
import { ComplianceStatus } from '../types';

export interface IComplianceRecords extends Document {
  worker: mongoose.Types.ObjectId;
  factory?: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  certification?: mongoose.Types.ObjectId;
  type: string;
  category: string;
  title: string;
  description?: string;
  status: ComplianceStatus;
  score: number;
  assessedBy: mongoose.Types.ObjectId;
  assessmentDate: Date;
  nextAssessmentDate?: Date;
  findings: string[];
  correctiveActions?: string;
  documents: string[];
  isOverdue: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const complianceRecordsSchema = new Schema<IComplianceRecords>(
  {
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    factory: { type: Schema.Types.ObjectId, ref: 'Factory' },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    certification: { type: Schema.Types.ObjectId, ref: 'Certification' },
    type: { type: String, required: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: Object.values(ComplianceStatus), required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    assessedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentDate: { type: Date, required: true },
    nextAssessmentDate: Date,
    findings: [String],
    correctiveActions: String,
    documents: [String],
    isOverdue: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

complianceRecordsSchema.index({ worker: 1, type: 1 });
complianceRecordsSchema.index({ status: 1, nextAssessmentDate: 1 });
complianceRecordsSchema.index({ assessmentDate: -1 });
complianceRecordsSchema.index({ department: 1, status: 1 });
complianceRecordsSchema.index({ category: 1, status: 1 });

export const ComplianceRecords = mongoose.model<IComplianceRecords>('ComplianceRecords', complianceRecordsSchema);
