const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://rzex-backend-agzekwil.fly.dev';

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
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });
      return res.json();
    } catch {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Network error' } };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async del<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  // Auth
  async register(email: string, username: string, password: string) {
    const res = await this.post<{ user: UserData; token: string; refreshToken: string }>(
      '/api/v1/auth/register', { email, username, password }
    );
    if (res.success && res.data) {
      this.setAuth(res.data.token, res.data.refreshToken, res.data.user);
    }
    return res;
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

  async getProfile() {
    return this.get<UserData>('/api/v1/auth/me');
  }

  logout() {
    this.clearAuth();
  }

  // Market
  async getTickers() {
    return this.get('/api/v1/market/tickers');
  }

  async getPairs() {
    return this.get('/api/v1/market/pairs');
  }

  async getTicker(pair: string) {
    return this.get(`/api/v1/market/ticker/${pair.replace('/', '-')}`);
  }

  // Orders
  async placeOrder(params: { pair: string; side: string; type: string; price?: string; quantity: string }) {
    return this.post('/api/v1/orders', { ...params, userId: this.userId });
  }

  async cancelOrder(orderId: string) {
    return this.request(`/api/v1/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'X-User-Id': this.userId || '' },
    });
  }

  async getOrders(params?: { pair?: string; status?: string }) {
    const qs = new URLSearchParams({ userId: this.userId || '', ...params } as Record<string, string>).toString();
    return this.get(`/api/v1/orders?${qs}`);
  }

  async getOrderBook(pair: string, depth?: number) {
    return this.get(`/api/v1/orderbook?pair=${encodeURIComponent(pair)}&depth=${depth || 50}`);
  }

  // Wallets
  async getWallets() {
    return this.get(`/api/v1/wallets?userId=${this.userId}`);
  }

  async createWallet(currency: string) {
    return this.post('/api/v1/wallets', { userId: this.userId, currency });
  }

  async deposit(currency: string, amount: string, txHash?: string) {
    return this.post('/api/v1/wallets/deposit', { userId: this.userId, currency, amount, txHash });
  }

  async withdraw(currency: string, amount: string, toAddress?: string) {
    return this.post('/api/v1/wallets/withdraw', { userId: this.userId, currency, amount, toAddress });
  }

  async getTransactions(limit?: number) {
    return this.get(`/api/v1/wallets/transactions?userId=${this.userId}&limit=${limit || 20}`);
  }

  // Notifications
  async getNotifications(limit?: number) {
    return this.get(`/api/v1/notifications?userId=${this.userId}&limit=${limit || 20}`);
  }

  // Status
  async getStatus() {
    return this.get('/api/v1/status');
  }
}

export const api = new ApiClient(API_BASE);
export type { ApiResponse, UserData };
