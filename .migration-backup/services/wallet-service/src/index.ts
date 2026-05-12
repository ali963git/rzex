import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './config/logger';
import { initDatabase } from './config/database';
import walletRoutes from './routes/wallets';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { service: 'wallet-service', status: 'healthy' } });
});

app.use('/api/wallets', walletRoutes);

async function start(): Promise<void> {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      logger.info(`🔐 Wallet Service running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start wallet service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
