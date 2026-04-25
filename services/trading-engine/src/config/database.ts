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
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        pair VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        price DECIMAL(36, 18) NOT NULL DEFAULT 0,
        quantity DECIMAL(36, 18) NOT NULL,
        filled_quantity DECIMAL(36, 18) DEFAULT 0,
        remaining_quantity DECIMAL(36, 18) NOT NULL,
        stop_price DECIMAL(36, 18),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pair VARCHAR(20) NOT NULL,
        buy_order_id UUID REFERENCES orders(id),
        sell_order_id UUID REFERENCES orders(id),
        buyer_id UUID NOT NULL,
        seller_id UUID NOT NULL,
        price DECIMAL(36, 18) NOT NULL,
        quantity DECIMAL(36, 18) NOT NULL,
        buyer_fee DECIMAL(36, 18) NOT NULL DEFAULT 0,
        seller_fee DECIMAL(36, 18) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_pair_status ON orders(pair, status);
      CREATE INDEX IF NOT EXISTS idx_orders_pair_side_price ON orders(pair, side, price);
      CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
      CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_trades_seller ON trades(seller_id);
    `);
    logger.info('Trading engine database tables initialized');
  } finally {
    client.release();
  }
}
