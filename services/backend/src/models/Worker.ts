import mongoose, { Schema, Document } from 'mongoose';
import { Gender, IEmergencyContact, IMedicalInfo, IAddress } from '../types';

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  phone: string;
  gender: Gender;
  dateOfBirth?: Date;
  address: IAddress;
  emergencyContacts: IEmergencyContact[];
  medicalInfo?: IMedicalInfo;
  department: mongoose.Types.ObjectId;
  designation: string;
  dateOfJoining: Date;
  shiftId?: mongoose.Types.ObjectId;
  isActive: boolean;
  digitalIdQR?: string;
  rfidTag?: string;
  profileImage?: string;
  assignedDevices: mongoose.Types.ObjectId[];
  certifications: mongoose.Types.ObjectId[];
  currentZone?: mongoose.Types.ObjectId;
  lastKnownLocation?: {
    type: string;
    coordinates: [number, number];
    timestamp: Date;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const workerSchema = new Schema<IWorker>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    dateOfBirth: Date,
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    medicalInfo: {
      bloodGroup: { type: String, required: true },
      allergies: [String],
      chronicConditions: [String],
      medications: [String],
      emergencyNotes: String,
      primaryPhysician: String,
      physicianPhone: String,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    digitalIdQR: String,
    rfidTag: {
      type: String,
      sparse: true,
      unique: true,
    },
    profileImage: String,
    assignedDevices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Device',
      },
    ],
    certifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Certification',
      },
    ],
    currentZone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
    },
    lastKnownLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
      timestamp: { type: Date, default: Date.now },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

workerSchema.index({ 'lastKnownLocation': '2dsphere' });
workerSchema.index({ department: 1 });
workerSchema.index({ shiftId: 1 });

export const Worker = mongoose.model<IWorker>('Worker', workerSchema);
