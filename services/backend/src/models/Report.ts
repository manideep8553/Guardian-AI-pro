import mongoose, { Schema, Document } from 'mongoose';
import { ReportType, ReportFormat } from '../types';

export interface IReport extends Document {
  title: string;
  type: ReportType;
  format: ReportFormat;
  generatedBy: mongoose.Types.ObjectId;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, unknown>;
  summary?: string;
  data?: Record<string, unknown>;
  fileUrl?: string;
  fileSize?: number;
  status: 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  scheduled: boolean;
  scheduleCron?: string;
  recipients: string[];
  lastSentAt?: Date;
  downloadCount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(ReportType), required: true, index: true },
    format: { type: String, enum: Object.values(ReportFormat), required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    filters: { type: Schema.Types.Mixed },
    summary: String,
    data: { type: Schema.Types.Mixed },
    fileUrl: String,
    fileSize: Number,
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
    errorMessage: String,
    scheduled: { type: Boolean, default: false },
    scheduleCron: String,
    recipients: [String],
    lastSentAt: Date,
    downloadCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ scheduled: 1, scheduleCron: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
