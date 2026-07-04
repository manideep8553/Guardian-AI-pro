import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
  name: string;
  code: string;
  factory: mongoose.Types.ObjectId;
  totalFloors: number;
  floorArea: number;
  constructionYear?: number;
  hasBasement: boolean;
  safetyRating?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const buildingSchema = new Schema<IBuilding>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    factory: {
      type: Schema.Types.ObjectId,
      ref: 'Factory',
      required: true,
      index: true,
    },
    totalFloors: { type: Number, default: 1 },
    floorArea: { type: Number, default: 0 },
    constructionYear: Number,
    hasBasement: { type: Boolean, default: false },
    safetyRating: String,
    metadata: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

buildingSchema.index({ factory: 1, code: 1 }, { unique: true });

export const Building = mongoose.model<IBuilding>('Building', buildingSchema);
