const API_BASE = import.meta.env.VITE_API_URL || 'https://rzex-backend-agzekwil.fly.dev';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: Record<string, unknown>;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  kycStatus?: string;
  twoFactorEnabled?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private userId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('rzex_token');
      this.userId = localStorage.getItem('rzex_user_id');
    }
  }

  setAuth(token: string, refreshToken: string, user: UserData) {
    this.token = token;
    this.userId = user.id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rzex_token', token);
      localStorage.setItem('rzex_refresh_token', refreshToken);
      localStorage.setItem('rzex_user_id', user.id);
      localStorage.setItem('rzex_user', JSON.stringify(user));
    }
  }

  clearAuth() {
    this.token = null;
    this.userId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rzex_token');
      localStorage.removeItem('rzex_refresh_token');
      localStorage.removeItem('rzex_user_id');
      localStorage.removeItem('rzex_user');
    }
  }

  getUser(): UserData | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('rzex_user');
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
      return res.json();
    } catch {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Network error' } };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  async login(email: string, password: string) {
    const res = await this.post<{ user: UserData; token: string; refreshToken: string }>(
      '/api/v1/auth/login', { email, password }
    );
    if (res.success && res.data) {
      this.setAuth(res.data.token, res.data.refreshToken, res.data.user);
    }
    return res;
  }

  async register(email: string, username: string, password: string) {
    const res = await this.post<{ user: UserData; token: string; refreshToken: string }>(
      '/api/v1/auth/register', { email, username, password }
    );
    if (res.success && res.data) {
      this.setAuth(res.data.token, res.data.refreshToken, res.data.user);
    }
    return res;
  }

  logout() {
    this.clearAuth();
  }
}

export const api = new ApiClient(API_BASE);
export type { ApiResponse, UserData };
