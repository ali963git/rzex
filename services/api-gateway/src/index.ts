import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { logger } from './config/logger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import proxyRoutes from './routes/proxy';

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'api-gateway',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Proxy routes
app.use(proxyRoutes);

// Error handler
app.use(errorHandler);

app.listen(config.port, config.host, () => {
  logger.info(`🚀 RZEX API Gateway running on ${config.host}:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;
