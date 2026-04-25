import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.MARKET_DATA_PORT || '3004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  mongo: {
    uri: process.env.MONGO_URI ||
      `mongodb://${process.env.MONGO_USER || 'rzex'}:${process.env.MONGO_PASSWORD || 'rzex_dev_password'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'rzex_market'}?authSource=admin`,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};
