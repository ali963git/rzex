// ============================================
// RZEX Shared Constants
// ============================================

export const SUPPORTED_PAIRS: string[] = [
  'BTC/USDT',
  'ETH/USDT',
  'BNB/USDT',
  'SOL/USDT',
  'XRP/USDT',
  'ADA/USDT',
  'DOGE/USDT',
  'DOT/USDT',
  'MATIC/USDT',
  'AVAX/USDT',
  'ETH/BTC',
  'BNB/BTC',
  'SOL/BTC',
];

export const SUPPORTED_CURRENCIES: string[] = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP',
  'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX',
  'USDT', 'USDC',
];

export const CANDLESTICK_INTERVALS = [
  '1m', '5m', '15m', '30m',
  '1h', '4h', '12h',
  '1d', '1w', '1M',
] as const;

export const ORDER_BOOK_DEPTH = 50;

export const DEFAULT_TRADING_FEES = {
  maker: '0.001',
  taker: '0.001',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const RATE_LIMITS = {
  PUBLIC_API: { windowMs: 60_000, max: 120 },
  PRIVATE_API: { windowMs: 60_000, max: 60 },
  ORDER_API: { windowMs: 1_000, max: 10 },
  WS_MESSAGES: { windowMs: 1_000, max: 50 },
};

export const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  USER_SERVICE: 3001,
  TRADING_ENGINE: 3002,
  WALLET_SERVICE: 3003,
  MARKET_DATA: 3004,
  NOTIFICATION: 3005,
};
