import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  SAFETY_OFFICER = 'safety_officer',
  WORKER = 'worker',
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum AlertType {
  HAZARD = 'hazard',
  NEAR_MISS = 'near_miss',
  SAFETY_VIOLATION = 'safety_violation',
  EQUIPMENT_FAILURE = 'equipment_failure',
  ENVIRONMENTAL = 'environmental',
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IAuthPayload {
  userId: string;
  role: UserRole;
}

export interface IAuthRequest extends Request {
  user?: IAuthPayload;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  ROTATING = 'rotating',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
  ON_DUTY = 'on_duty',
}

export enum DeviceType {
  ESP32 = 'esp32',
  RASPBERRY_PI = 'raspberry_pi',
  JETSON_NANO = 'jetson_nano',
  CAMERA = 'camera',
  SMART_HELMET = 'smart_helmet',
  WEARABLE = 'wearable',
  GATEWAY = 'gateway',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  DEPLOYING = 'deploying',
}

export enum ZoneType {
  GENERAL = 'general',
  RESTRICTED = 'restricted',
  EVACUATION_ROUTE = 'evacuation_route',
  SAFE_ZONE = 'safe_zone',
  HAZARDOUS = 'hazardous',
  STORAGE = 'storage',
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface IMedicalInfo {
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyNotes?: string;
  primaryPhysician?: string;
  physicianPhone?: string;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number];
}
