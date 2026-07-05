export type UserRole = 'admin' | 'supervisor' | 'safety_officer' | 'worker';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  employeeId: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface Resource {
  _id: string;
  user: string;
  title: string;
  type: 'note' | 'pdf' | 'link' | 'code' | 'image';
  url?: string;
  content?: string;
  subject: string;
  tags: string[];
  shared: boolean;
  createdAt: string;
}

export interface SafetyAnalytics {
  daily: { date: string; incidents: number; inspections: number; hazards: number }[];
  weekly: { week: string; incidents: number; nearMisses: number; inspections: number }[];
  monthly: { month: string; incidents: number; safetyScore: number; compliance: number }[];
  departments: { department: string; incidents: number; riskLevel: number }[];
  incidents: { date: string; count: number; severity: Record<string, number> }[];
  inspections: { date: string; completed: number; failed: number }[];
}
