import { Pool } from 'pg';
import { config } from './index';
import { logger } from './logger';

export const pool = new Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected PostgreSQL error', { error: err.message });
});

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        currency VARCHAR(20) NOT NULL,
        balance DECIMAL(36, 18) DEFAULT 0,
        locked_balance DECIMAL(36, 18) DEFAULT 0,
        wallet_type VARCHAR(10) DEFAULT 'hot',
        address VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, currency)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        wallet_id UUID REFERENCES wallets(id),
        type VARCHAR(20) NOT NULL,
        currency VARCHAR(20) NOT NULL,
        amount DECIMAL(36, 18) NOT NULL,
        fee DECIMAL(36, 18) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        tx_hash VARCHAR(255),
        from_address VARCHAR(255),
        to_address VARCHAR(255),
        confirmations INT DEFAULT 0,
        required_confirmations INT DEFAULT 6,
        memo TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `);
    logger.info('Wallet database tables initialized');
  } finally {
    client.release();
  }
}
