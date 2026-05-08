import express, { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import redis from 'redis';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger = pino();
app.use(pinoHttp({ logger }));

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Redis for rate limiting
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => logger.error('Redis connection error:', err));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
});

app.use(limiter);

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3000',
  trading: process.env.TRADING_ENGINE_URL || 'http://trading-engine:3000',
  marketData: process.env.MARKET_DATA_URL || 'http://market-data-service:3000',
  wallet: process.env.WALLET_SERVICE_URL || 'http://wallet-service:3000',
  notification: process.env.NOTIFICATION_URL || 'http://notification-service:3000',
};

// JWT Middleware
const jwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await redisClient.ping();
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

// Public Routes

// Auth Routes (with stricter rate limiting)
app.use(
  '/api/auth',
  authLimiter,
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/api/auth' },
    logLevel: 'warn',
  })
);

// Public Market Data
app.use(
  '/api/ticker',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/ticker': '/api/ticker' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/tickers',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/tickers': '/api/tickers' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/candles',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/candles': '/api/candles' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/trades',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/trades': '/api/trades' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/orderbook',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/orderbook': '/api/orderbook' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/stats',
  createProxyMiddleware({
    target: services.marketData,
    changeOrigin: true,
    pathRewrite: { '^/api/stats': '/api/stats' },
    logLevel: 'warn',
  })
);

// Protected Routes (require JWT)
app.use('/api/users', jwtMiddleware);
app.use('/api/wallets', jwtMiddleware);
app.use('/api/transactions', jwtMiddleware);
app.use('/api/orders', jwtMiddleware);

// User Service
app.use(
  '/api/users',
  createProxyMiddleware({
    target: services.user,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/api/users' },
    logLevel: 'warn',
  })
);

// Wallet Service
app.use(
  '/api/wallets',
  createProxyMiddleware({
    target: services.wallet,
    changeOrigin: true,
    pathRewrite: { '^/api/wallets': '/api/wallets' },
    logLevel: 'warn',
  })
);

app.use(
  '/api/transactions',
  createProxyMiddleware({
    target: services.wallet,
    changeOrigin: true,
    pathRewrite: { '^/api/transactions': '/api/transactions' },
    logLevel: 'warn',
  })
);

// Trading Engine
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: services.trading,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/api/orders' },
    logLevel: 'warn',
  })
);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Gateway error',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
  logger.info('Services:');
  logger.info(`  User Service: ${services.user}`);
  logger.info(`  Trading Engine: ${services.trading}`);
  logger.info(`  Market Data: ${services.marketData}`);
  logger.info(`  Wallet Service: ${services.wallet}`);
  logger.info(`  Notification: ${services.notification}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(async () => {
    await redisClient.quit();
    process.exit(0);
  });
});

export default app;
