import mongoose, { Schema, Document } from 'mongoose';
import { IncidentSeverity, IncidentStatus, AlertType } from '../types';

export interface IIncident extends Document {
  title: string;
  description: string;
  type: AlertType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
    zone?: string;
  };
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  witnesses?: string[];
  mediaUrls?: string[];
  rootCause?: string;
  correctiveActions?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(IncidentSeverity),
      default: IncidentSeverity.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(IncidentStatus),
      default: IncidentStatus.REPORTED,
      required: true,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: String,
      zone: String,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    witnesses: [String],
    mediaUrls: [String],
    rootCause: String,
    correctiveActions: String,
    resolvedAt: Date,
  },
  { timestamps: true },
);

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ reportedBy: 1 });

export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);
