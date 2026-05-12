import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { logger } from '../config/logger';
import { orderRateLimiter } from '../middleware/rateLimiter';

const router = Router();

const proxyOptions = (target: string, pathRewrite: Record<string, string>) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  on: {
    error: (err: Error) => {
      logger.error(`Proxy error: ${err.message}`);
    },
  },
});

// User Service
router.use(
  '/api/v1/auth',
  createProxyMiddleware(
    proxyOptions(config.services.userService, { '^/api/v1/auth': '/api/auth' }),
  ),
);

router.use(
  '/api/v1/users',
  createProxyMiddleware(
    proxyOptions(config.services.userService, { '^/api/v1/users': '/api/users' }),
  ),
);

// Trading Engine
router.use(
  '/api/v1/orders',
  orderRateLimiter,
  createProxyMiddleware(
    proxyOptions(config.services.tradingEngine, { '^/api/v1/orders': '/api/orders' }),
  ),
);

router.use(
  '/api/v1/trades',
  createProxyMiddleware(
    proxyOptions(config.services.tradingEngine, { '^/api/v1/trades': '/api/trades' }),
  ),
);

// Wallet Service
router.use(
  '/api/v1/wallets',
  createProxyMiddleware(
    proxyOptions(config.services.walletService, { '^/api/v1/wallets': '/api/wallets' }),
  ),
);

router.use(
  '/api/v1/transactions',
  createProxyMiddleware(
    proxyOptions(config.services.walletService, {
      '^/api/v1/transactions': '/api/transactions',
    }),
  ),
);

// Market Data Service
router.use(
  '/api/v1/market',
  createProxyMiddleware(
    proxyOptions(config.services.marketData, { '^/api/v1/market': '/api/market' }),
  ),
);

// Notification Service
router.use(
  '/api/v1/notifications',
  createProxyMiddleware(
    proxyOptions(config.services.notification, {
      '^/api/v1/notifications': '/api/notifications',
    }),
  ),
);

export default router;
