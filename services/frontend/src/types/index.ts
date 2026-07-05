export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  institution?: string;
  studyStreak: number;
  totalStudyHours: number;
  completedTasks: number;
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

export interface StudyRoom {
  _id: string;
  name: string;
  description: string;
  subject: string;
  isPrivate: boolean;
  password?: string;
  maxParticipants: number;
  participants: { user: User; joinedAt: string }[];
  createdBy: User;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export interface StudySession {
  _id: string;
  user: string;
  room?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  type: 'focus' | 'pomodoro' | 'group' | 'coding';
  subject: string;
  notes?: string;
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

export interface StudyAnalytics {
  daily: { date: string; hours: number; tasks: number; sessions: number }[];
  weekly: { week: string; hours: number; focus: number; coding: number }[];
  monthly: { month: string; hours: number; streak: number; completion: number }[];
  subjects: { subject: string; hours: number; percentage: number }[];
  pomodoro: { date: string; sessions: number; focusMinutes: number }[];
  coding: { date: string; languages: Record<string, number> }[];
}

export interface LeaderboardEntry {
  user: User;
  totalHours: number;
  streak: number;
  tasksCompleted: number;
  resourcesShared: number;
  score: number;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CodingSession {
  _id: string;
  language: string;
  code: string;
  input?: string;
  output?: string;
  status: 'running' | 'completed' | 'error';
  duration: number;
  createdAt: string;
}
