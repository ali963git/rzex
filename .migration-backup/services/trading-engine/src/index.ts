import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './config/logger';
import { initDatabase } from './config/database';
import { MatchingEngine } from './engine/MatchingEngine';
import { createOrderRoutes } from './routes/orders';
import tradeRoutes from './routes/trades';

const app = express();
const engine = new MatchingEngine();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { service: 'trading-engine', status: 'healthy' } });
});

app.use('/api/orders', createOrderRoutes(engine));
app.use('/api/trades', tradeRoutes);

async function start(): Promise<void> {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      logger.info(`⚡ Trading Engine running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start trading engine', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
