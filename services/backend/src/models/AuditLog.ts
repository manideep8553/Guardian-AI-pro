import mongoose, { Schema, Document } from 'mongoose';
import { AuditAction } from '../types';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description: string;
  details?: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    description: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    requestId: String,
    duration: Number,
    success: { type: Boolean, default: true },
    errorMessage: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ success: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
