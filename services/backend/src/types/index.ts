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

export enum RiskLevel {
  SAFE = 'safe',
  WARNING = 'warning',
  HIGH_RISK = 'high_risk',
  CRITICAL = 'critical',
}

export enum ModalityType {
  VISION = 'vision',
  AUDIO = 'audio',
  WEARABLE = 'wearable',
  ENVIRONMENTAL = 'environmental',
  LOCATION = 'location',
  MACHINE_HEALTH = 'machine_health',
}

export interface IModalityInput {
  type: ModalityType;
  timestamp: Date;
  data: Record<string, unknown>;
  confidence?: number;
}

export interface IFusionResult {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  modalityScores: Record<ModalityType, number>;
  temporalTrend: 'improving' | 'stable' | 'degrading' | 'critical';
  contributingFactors: string[];
  timestamp: Date;
  anomalyDetected: boolean;
}

export interface IWorkerVitals {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  stressLevel?: number;
  fatigueIndex?: number;
  stepCount?: number;
  fallDetected?: boolean;
  impactDetected?: boolean;
}

export interface IEnvironmentalReading {
  temperature?: number;
  humidity?: number;
  airQualityIndex?: number;
  gasLevel?: Record<string, number>;
  noiseLevel?: number;
  luminance?: number;
  vibration?: number;
  radiation?: number;
}

export interface IMachineHealthReading {
  temperature?: number;
  vibration?: number;
  rpm?: number;
  powerConsumption?: number;
  pressure?: number;
  errorCode?: string;
  maintenanceDue?: boolean;
  anomalyScore?: number;
}

export enum EmergencyType {
  FIRE = 'fire',
  CHEMICAL_SPILL = 'chemical_spill',
  STRUCTURAL_FAILURE = 'structural_failure',
  WORKER_INJURY = 'worker_injury',
  GAS_LEAK = 'gas_leak',
  EQUIPMENT_MALFUNCTION = 'equipment_malfunction',
  INTRUSION = 'intrusion',
  NATURAL_DISASTER = 'natural_disaster',
  POWER_OUTAGE = 'power_outage',
  MEDICAL_EMERGENCY = 'medical_emergency',
}

export enum EmergencyAction {
  SOUND_SIREN = 'sound_siren',
  SEND_PUSH = 'send_push',
  SEND_SMS = 'send_sms',
  SEND_EMAIL = 'send_email',
  NOTIFY_SUPERVISOR = 'notify_supervisor',
  TRIGGER_EVACUATION = 'trigger_evacuation',
  LOG_INCIDENT = 'log_incident',
  CALL_EMERGENCY_SERVICES = 'call_emergency_services',
  ACTIVATE_SPRINKLERS = 'activate_sprinklers',
  SHUTDOWN_EQUIPMENT = 'shutdown_equipment',
}

export enum EmergencyStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  EVACUATING = 'evacuating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
}

export interface ILiveWorkerStatus {
  workerId: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  role: UserRole;
  riskScore: number;
  riskLevel: RiskLevel;
  location?: { lat: number; lng: number; zone?: string; floor?: number };
  vitals?: IWorkerVitals;
  lastPingAt: Date;
  isOnline: boolean;
  inSafeZone: boolean;
  currentZone?: string;
  deviceStatus: string;
}

export interface ILiveAlert {
  id: string;
  type: AlertType;
  severity: IncidentSeverity | RiskLevel;
  title: string;
  message: string;
  zone: string;
  modality: ModalityType;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export enum RiskTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DEGRADING = 'degrading',
  CRITICAL = 'critical',
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  GAS = 'gas',
  MOTION = 'motion',
  VIBRATION = 'vibration',
  SOUND = 'sound',
  LIGHT = 'light',
  RADIATION = 'radiation',
  PRESSURE = 'pressure',
  FLOW = 'flow',
  LEVEL = 'level',
  PROXIMITY = 'proximity',
  SMOKE = 'smoke',
  FLAME = 'flame',
  CURRENT = 'current',
  VOLTAGE = 'voltage',
  POWER = 'power',
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CALIBRATING = 'calibrating',
}

export enum NotificationType {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReportType {
  COMPLIANCE = 'compliance',
  INCIDENT = 'incident',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
  SAFETY = 'safety',
  MAINTENANCE = 'maintenance',
  ENVIRONMENTAL = 'environmental',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIAL = 'partial',
  NOT_ASSESSED = 'not_assessed',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  STATUS_CHANGE = 'status_change',
  ASSIGN = 'assign',
  RESOLVE = 'resolve',
  ACKNOWLEDGE = 'acknowledge',
  EXPORT = 'export',
  BACKUP = 'backup',
}

export enum ModelStatus {
  TRAINING = 'training',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  ARCHIVED = 'archived',
}

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  RECORDING = 'recording',
  MAINTENANCE = 'maintenance',
}

export interface ISensorReadingValue {
  value: number;
  unit: string;
  timestamp: Date;
  quality?: number;
}

export interface INotificationPayload {
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}
