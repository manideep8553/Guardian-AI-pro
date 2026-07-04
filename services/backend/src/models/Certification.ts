import mongoose, { Schema, Document } from 'mongoose';
import { CertificationStatus } from '../types';

export interface ICertification extends Document {
  worker: mongoose.Types.ObjectId;
  name: string;
  issuingAuthority: string;
  certificationId: string;
  issueDate: Date;
  expiryDate: Date;
  status: CertificationStatus;
  attachments: string[];
  notes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const certificationSchema = new Schema<ICertification>(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true,
    },
    certificationId: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CertificationStatus),
      default: CertificationStatus.ACTIVE,
    },
    attachments: [String],
    notes: String,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

certificationSchema.index({ expiryDate: 1 });
certificationSchema.index({ status: 1 });

export const Certification = mongoose.model<ICertification>('Certification', certificationSchema);
