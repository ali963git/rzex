const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('rzex_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rzex_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rzex_token');
      localStorage.removeItem('rzex_refresh_token');
      localStorage.removeItem('rzex_user');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    return res.json();
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

  async del<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  // Auth
  async register(email: string, username: string, password: string) {
    return this.post('/api/auth/register', { email, username, password });
  }

  async login(email: string, password: string) {
    return this.post('/api/auth/login', { email, password });
  }

  // Market
  async getTickers() {
    return this.get('/api/market/tickers');
  }

  async getCandlesticks(pair: string, interval: string) {
    return this.get(`/api/market/candlesticks?pair=${pair}&interval=${interval}`);
  }

  // Orders
  async placeOrder(params: { pair: string; side: string; type: string; price?: string; quantity: string }) {
    return this.post('/api/orders', params);
  }

  async cancelOrder(orderId: string) {
    return this.del(`/api/orders/${orderId}`);
  }

  async getOrders(params?: { pair?: string; status?: string }) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return this.get(`/api/orders${qs ? '?' + qs : ''}`);
  }

  // Wallets
  async getWallets() {
    return this.get('/api/wallets');
  }

  async deposit(currency: string, amount: string) {
    return this.post('/api/wallets/deposit', { currency, amount });
  }

  async withdraw(currency: string, amount: string, address: string) {
    return this.post('/api/wallets/withdraw', { currency, amount, address });
  }
}

export const api = new ApiClient(API_BASE);
export type { ApiResponse };
