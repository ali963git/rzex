// ============================================
// RZEX Shared Types
// ============================================

// --- User Types ---
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum KYCStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// --- Order Types ---
export interface Order {
  id: string;
  userId: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: string;
  quantity: string;
  filledQuantity: string;
  remainingQuantity: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LIMIT = 'stop_limit',
  OCO = 'oco',
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// --- Trade Types ---
export interface Trade {
  id: string;
  pair: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  price: string;
  quantity: string;
  timestamp: Date;
}

// --- Wallet Types ---
export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: string;
  lockedBalance: string;
  walletType: WalletType;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WalletType {
  HOT = 'hot',
  COLD = 'cold',
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  currency: string;
  amount: string;
  fee: string;
  status: TransactionStatus;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRADE = 'trade',
  FEE = 'fee',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// --- Market Data Types ---
export interface Ticker {
  pair: string;
  lastPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  volume24h: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  timestamp: Date;
}

export interface Candlestick {
  pair: string;
  interval: string;
  openTime: Date;
  closeTime: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBookSnapshot {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: Date;
}

// --- Trading Pair ---
export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minQuantity: string;
  maxQuantity: string;
  minPrice: string;
  maxPrice: string;
  tickSize: string;
  stepSize: string;
  status: 'active' | 'inactive';
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// --- WebSocket Messages ---
export enum WSMessageType {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  TICKER = 'ticker',
  ORDER_BOOK = 'orderBook',
  TRADE = 'trade',
  CANDLESTICK = 'candlestick',
  ORDER_UPDATE = 'orderUpdate',
  BALANCE_UPDATE = 'balanceUpdate',
  ERROR = 'error',
}

export interface WSMessage {
  type: WSMessageType;
  channel?: string;
  data?: unknown;
}

// --- Notification Types ---
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_FILLED = 'order_filled',
  ORDER_CANCELLED = 'order_cancelled',
  DEPOSIT_CONFIRMED = 'deposit_confirmed',
  WITHDRAWAL_COMPLETED = 'withdrawal_completed',
  SECURITY_ALERT = 'security_alert',
  KYC_UPDATE = 'kyc_update',
  SYSTEM = 'system',
}
