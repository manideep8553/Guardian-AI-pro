import { config } from '../config';
import type {
  ApiResponse,
  AuthResponse,
  User,
  Task,
  Resource,
  SafetyAnalytics,
} from '../types';

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.baseUrl = config.apiUrl;
    this.accessToken = localStorage.getItem('accessToken');
    this._refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this._refreshToken = refreshToken;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  clearTokens() {
    this.accessToken = null;
    this._refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this._refreshToken) {
      throw new Error('No refresh token');
    }
    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this._refreshToken }),
    });
    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    if (!res.ok || !data.data) {
      throw new Error(data.message || 'Failed to refresh token');
    }
    this.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (response.status === 401 && this._refreshToken) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;
          this.processQueue(null, newToken);
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: { ...headers, ...(options.headers as Record<string, string>) },
          });
        } catch (err) {
          this.isRefreshing = false;
          this.processQueue(err, null);
          this.clearTokens();
          window.location.href = '/login';
          throw err;
        }
      } else {
        const newToken = await new Promise<string>((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        });
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: { ...headers, ...(options.headers as Record<string, string>) },
        });
      }
    }

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  private processQueue(error: unknown, token: string | null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  async login(email: string, password: string) {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data) {
      this.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    department?: string;
    employeeId?: string;
  }) {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data) {
      this.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken() {
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this._refreshToken }),
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  async getTasks(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Task[]>(`/tasks${query}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    category: string;
    tags?: string[];
  }) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'completed';
    dueDate: string;
    category: string;
    tags: string[];
  }>) {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getResources(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Resource[]>(`/resources${query}`);
  }

  async getAnalytics() {
    return this.request<SafetyAnalytics>('/analytics');
  }

  async chatWithAI(messages: { role: 'user' | 'assistant'; content: string }[]) {
    return this.request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }
}

export const api = new ApiService();
