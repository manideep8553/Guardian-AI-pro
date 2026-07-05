export type UserRole = 'admin' | 'supervisor' | 'safety_officer' | 'worker';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  employeeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';
export type AlertType =
  | 'hazard'
  | 'near_miss'
  | 'safety_violation'
  | 'equipment_failure'
  | 'environmental';

export interface Incident {
  _id: string;
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
  reportedBy: User | string;
  assignedTo?: User | string;
  witnesses?: string[];
  mediaUrls?: string[];
  rootCause?: string;
  correctiveActions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
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

export type RiskLevel = 'safe' | 'warning' | 'high_risk' | 'critical';
export type RiskTrend = 'improving' | 'stable' | 'degrading' | 'critical';

export interface ModalityScores {
  vision?: number;
  audio?: number;
  wearable?: number;
  environmental?: number;
  location?: number;
  machine_health?: number;
}

export interface FusionResult {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  modalityScores: ModalityScores;
  temporalTrend: RiskTrend;
  contributingFactors: string[];
  timestamp: string;
  anomalyDetected: boolean;
}

export interface LiveWorkerStatus {
  workerId: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  role: UserRole;
  riskScore: number;
  riskLevel: RiskLevel;
  location?: { lat: number; lng: number; zone?: string; floor?: number };
  vitals?: {
    heartRate?: number;
    spo2?: number;
    temperature?: number;
    stressLevel?: number;
    fatigueIndex?: number;
    fallDetected?: boolean;
  };
  lastPingAt: string;
  isOnline: boolean;
  inSafeZone: boolean;
  currentZone?: string;
  deviceStatus: string;
}

export interface LiveAlert {
  id: string;
  type: AlertType;
  severity: IncidentSeverity | RiskLevel;
  title: string;
  message: string;
  zone: string;
  modality: string;
  timestamp: string;
  acknowledged: boolean;
}

export type EmergencyType =
  | 'fire' | 'chemical_spill' | 'structural_failure' | 'worker_injury'
  | 'gas_leak' | 'equipment_malfunction' | 'intrusion' | 'natural_disaster'
  | 'power_outage' | 'medical_emergency';

export type EmergencyStatus = 'active' | 'acknowledged' | 'evacuating' | 'contained' | 'resolved';

export interface EmergencyEvent {
  _id: string;
  type: EmergencyType;
  severity: RiskLevel;
  title: string;
  description: string;
  location?: { zone?: string; coordinates?: [number, number] };
  affectedWorkers: string[];
  requiresEvacuation: boolean;
  evacuationRoute?: string;
  status: EmergencyStatus;
  acknowledgedBy?: { firstName: string; lastName: string } | string;
  resolvedBy?: { firstName: string; lastName: string } | string;
  incidentId?: string;
  createdAt: string;
}

export interface DashboardSummary {
  fusion: {
    overallRiskScore: number;
    riskLevel: RiskLevel;
    temporalTrend: RiskTrend;
  };
  workers: {
    total: number;
    online: number;
    offline: number;
    highRisk: number;
    avgRiskScore: number;
  };
  alerts: LiveAlert[];
  emergencies: number;
  timestamp: string;
}
