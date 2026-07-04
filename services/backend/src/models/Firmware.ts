import mongoose, { Schema, Document } from 'mongoose';

export interface IFirmware extends Document {
  name: string;
  version: string;
  deviceType: string;
  fileUrl?: string;
  checksum?: string;
  fileSize?: number;
  changelog?: string;
  isMandatory: boolean;
  isActive: boolean;
  minBatteryLevel: number;
  compatibleDevices: string[];
  rollbackVersion?: string;
  deployedCount: number;
  successCount: number;
  failureCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const firmwareSchema = new Schema<IFirmware>(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    deviceType: { type: String, required: true, index: true },
    fileUrl: String,
    checksum: String,
    fileSize: Number,
    changelog: String,
    isMandatory: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    minBatteryLevel: { type: Number, default: 20 },
    compatibleDevices: [String],
    rollbackVersion: String,
    deployedCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

firmwareSchema.index({ version: 1, deviceType: 1 }, { unique: true });

export const Firmware = mongoose.model<IFirmware>('Firmware', firmwareSchema);
