import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './config/logger';
import { MarketWebSocketServer } from './providers/WebSocketServer';
import marketRoutes from './routes/market';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Initialize WebSocket server
const wsServer = new MarketWebSocketServer(server);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'market-data-service',
      status: 'healthy',
      ws: wsServer.getStats(),
    },
  });
});

app.use('/api/market', marketRoutes);

async function start(): Promise<void> {
  try {
    await mongoose.connect(config.mongo.uri);
    logger.info('Connected to MongoDB');

    server.listen(config.port, () => {
      logger.info(`📊 Market Data Service running on port ${config.port}`);
      logger.info(`WebSocket available at ws://localhost:${config.port}/ws`);
    });
  } catch (err) {
    logger.error('Failed to start market data service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
