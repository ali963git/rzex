import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.TRADING_ENGINE_PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'rzex',
    password: process.env.POSTGRES_PASSWORD || 'rzex_dev_password',
    database: process.env.POSTGRES_DB || 'rzex',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  fees: {
    maker: process.env.MAKER_FEE || '0.001',
    taker: process.env.TAKER_FEE || '0.001',
  },
};
