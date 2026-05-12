import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.WALLET_SERVICE_PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'rzex',
    password: process.env.POSTGRES_PASSWORD || 'rzex_dev_password',
    database: process.env.POSTGRES_DB || 'rzex',
  },
};
