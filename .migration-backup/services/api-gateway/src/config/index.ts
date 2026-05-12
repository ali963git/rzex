import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  host: process.env.API_GATEWAY_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  services: {
    userService: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    tradingEngine: process.env.TRADING_ENGINE_URL || 'http://trading-engine:3002',
    walletService: process.env.WALLET_SERVICE_URL || 'http://wallet-service:3003',
    marketData: process.env.MARKET_DATA_URL || 'http://market-data:3004',
    notification: process.env.NOTIFICATION_URL || 'http://notification-service:3005',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
