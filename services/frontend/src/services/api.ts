import { config } from '../config';
import type { ApiResponse, AuthResponse, Incident } from '../types';

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = config.apiUrl;
    this.accessToken = localStorage.getItem('accessToken');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async login(email: string, password: string) {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data) {
      this.setAccessToken(res.data.accessToken);
    }
    return res;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    department: string;
    employeeId: string;
  }) {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data) {
      this.setAccessToken(res.data.accessToken);
    }
    return res;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setAccessToken(null);
  }

  async getMe() {
    return this.request<{ user: { userId: string; role: string } }>('/auth/me');
  }

  async getIncidents(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ incidents: Incident[]; meta: ApiResponse['meta'] }>(
      `/incidents${query}`,
    );
  }

  async getIncident(id: string) {
    return this.request<Incident>(`/incidents/${id}`);
  }

  async createIncident(data: Partial<Incident>) {
    return this.request<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncident(id: string, data: Partial<Incident>) {
    return this.request<Incident>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteIncident(id: string) {
    return this.request(`/incidents/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
