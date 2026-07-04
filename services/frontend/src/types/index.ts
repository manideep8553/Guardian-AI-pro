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
