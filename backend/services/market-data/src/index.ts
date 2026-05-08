import express, { Express, Request, Response, NextFunction } from 'express';
import { MongoClient, Db, Collection } from 'mongodb';
import redis from 'redis';
import pinoHttp from 'pino-http';
import pino from 'pino';
import Decimal from 'decimal.js';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger = pino();
app.use(pinoHttp({ logger }));
app.use(express.json());

// MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/market_data';
let mongoClient: MongoClient;
let db: Db;
let candles: Collection;
let trades: Collection;
let tickers: Collection;
let orderBooks: Collection;

// Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => logger.error('Redis connection error:', err));

// Types
interface Candle {
  pair: string;
  interval: string; // 1m, 5m, 15m, 1h, 4h, 1d
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  timestamp: Date;
}

interface Ticker {
  pair: string;
  price: string;
  bid: string;
  ask: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  change24h: string;
  changePercent24h: string;
  lastUpdate: Date;
}

interface OrderBook {
  pair: string;
  bids: Array<[string, string]>;
  asks: Array<[string, string]>;
  timestamp: Date;
}

// Initialize MongoDB connection
async function initializeMongoDB(): Promise<void> {
  try {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    db = mongoClient.db('market_data');
    candles = db.collection('candles');
    trades = db.collection('trades');
    tickers = db.collection('tickers');
    orderBooks = db.collection('order_books');

    // Create indexes
    await candles.createIndex({ pair: 1, interval: 1, timestamp: -1 });
    await trades.createIndex({ pair: 1, timestamp: -1 });
    await tickers.createIndex({ pair: 1 }, { unique: true });
    await orderBooks.createIndex({ pair: 1, timestamp: -1 });

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    setTimeout(initializeMongoDB, 5000);
  }
}

initializeMongoDB();

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check MongoDB
    const adminDb = mongoClient.db('admin');
    await adminDb.admin().ping();
    // Check Redis
    await redisClient.ping();
    res.json({ status: 'ok', service: 'market-data-service', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

// Get Ticker
app.get('/api/ticker/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const pairUpper = pair.toUpperCase();

    // Try cache first
    const cached = await redisClient.get(`ticker:${pairUpper}`);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    // Get from MongoDB
    const ticker = await tickers.findOne({ pair: pairUpper });

    if (!ticker) {
      res.status(404).json({ error: 'Ticker not found' });
      return;
    }

    // Cache for 5 seconds
    await redisClient.setEx(
      `ticker:${pairUpper}`,
      5,
      JSON.stringify(ticker)
    );

    res.json(ticker);
  } catch (error) {
    logger.error('Get ticker error:', error);
    res.status(500).json({ error: 'Failed to fetch ticker' });
  }
});

// Get Multiple Tickers
app.get('/api/tickers', async (req: Request, res: Response) => {
  try {
    const pairs = (req.query.pairs as string)?.split(',') || [];

    const tickerList = await tickers
      .find(pairs.length > 0 ? { pair: { $in: pairs.map((p) => p.toUpperCase()) } } : {})
      .toArray();

    res.json(tickerList);
  } catch (error) {
    logger.error('Get tickers error:', error);
    res.status(500).json({ error: 'Failed to fetch tickers' });
  }
});

// Get Candles (OHLCV)
app.get('/api/candles/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const { interval = '1h', limit = 100, startTime, endTime } = req.query;

    const pairUpper = pair.toUpperCase();
    const filter: any = { pair: pairUpper, interval };

    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime as string);
      if (endTime) filter.timestamp.$lte = new Date(endTime as string);
    }

    const candleList = await candles
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(parseInt(limit as string) || 100, 1000))
      .toArray();

    res.json(candleList.reverse());
  } catch (error) {
    logger.error('Get candles error:', error);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
});

// Get Recent Trades
app.get('/api/trades/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const { limit = 100 } = req.query;

    const tradeList = await trades
      .find({ pair: pair.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(Math.min(parseInt(limit as string) || 100, 1000))
      .toArray();

    res.json(tradeList.reverse());
  } catch (error) {
    logger.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get Order Book
app.get('/api/orderbook/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const pairUpper = pair.toUpperCase();

    const book = await orderBooks
      .findOne({ pair: pairUpper }, { sort: { timestamp: -1 } });

    if (!book) {
      res.status(404).json({ error: 'Order book not found' });
      return;
    }

    res.json(book);
  } catch (error) {
    logger.error('Get order book error:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// Update Ticker (from Trading Engine)
app.post('/api/ticker/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const { price, bid, ask, high24h, low24h, volume24h } = req.body;

    const pairUpper = pair.toUpperCase();

    // Get previous price for change calculation
    const previous = await tickers.findOne({ pair: pairUpper });
    const previousPrice = previous?.price || price;
    const change24h = new Decimal(price).minus(previousPrice).toString();
    const changePercent24h = new Decimal(change24h)
      .div(previousPrice)
      .mul(100)
      .toString();

    const ticker: Ticker = {
      pair: pairUpper,
      price: new Decimal(price).toString(),
      bid: new Decimal(bid).toString(),
      ask: new Decimal(ask).toString(),
      high24h: new Decimal(high24h).toString(),
      low24h: new Decimal(low24h).toString(),
      volume24h: new Decimal(volume24h).toString(),
      change24h,
      changePercent24h,
      lastUpdate: new Date(),
    };

    await tickers.updateOne(
      { pair: pairUpper },
      { $set: ticker },
      { upsert: true }
    );

    // Invalidate cache
    await redisClient.del(`ticker:${pairUpper}`);

    res.json({ success: true, ticker });
  } catch (error) {
    logger.error('Update ticker error:', error);
    res.status(500).json({ error: 'Failed to update ticker' });
  }
});

// Store Candle (from Trading Engine)
app.post('/api/candles/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const { interval, open, high, low, close, volume, timestamp } = req.body;

    const candle: Candle = {
      pair: pair.toUpperCase(),
      interval,
      open: new Decimal(open).toString(),
      high: new Decimal(high).toString(),
      low: new Decimal(low).toString(),
      close: new Decimal(close).toString(),
      volume: new Decimal(volume).toString(),
      timestamp: new Date(timestamp),
    };

    const result = await candles.insertOne(candle);

    res.status(201).json({
      success: true,
      candle_id: result.insertedId,
    });
  } catch (error) {
    logger.error('Store candle error:', error);
    res.status(500).json({ error: 'Failed to store candle' });
  }
});

// Store Trade (from Trading Engine)
app.post('/api/trades', async (req: Request, res: Response) => {
  try {
    const { pair, price, amount, buyer_user_id, seller_user_id, fee } = req.body;

    const trade = {
      pair: pair.toUpperCase(),
      price: new Decimal(price).toString(),
      amount: new Decimal(amount).toString(),
      buyer_user_id,
      seller_user_id,
      fee: new Decimal(fee).toString(),
      timestamp: new Date(),
    };

    const result = await trades.insertOne(trade);

    res.status(201).json({
      success: true,
      trade_id: result.insertedId,
    });
  } catch (error) {
    logger.error('Store trade error:', error);
    res.status(500).json({ error: 'Failed to store trade' });
  }
});

// Store Order Book (from Trading Engine)
app.post('/api/orderbook', async (req: Request, res: Response) => {
  try {
    const { pair, bids, asks, timestamp } = req.body;

    const orderBook: OrderBook = {
      pair: pair.toUpperCase(),
      bids,
      asks,
      timestamp: new Date(timestamp),
    };

    await orderBooks.insertOne(orderBook);

    res.status(201).json({
      success: true,
      message: 'Order book stored',
    });
  } catch (error) {
    logger.error('Store order book error:', error);
    res.status(500).json({ error: 'Failed to store order book' });
  }
});

// Market Statistics
app.get('/api/stats/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const { interval = '1d', days = 1 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const candleList = await candles
      .find({
        pair: pair.toUpperCase(),
        interval,
        timestamp: { $gte: startDate },
      })
      .toArray();

    if (candleList.length === 0) {
      res.status(404).json({ error: 'No data available' });
      return;
    }

    const prices = candleList.map((c) => new Decimal(c.close));
    const highs = candleList.map((c) => new Decimal(c.high));
    const lows = candleList.map((c) => new Decimal(c.low));
    const volumes = candleList.map((c) => new Decimal(c.volume));

    const highest = highs.reduce((a, b) => (a.gt(b) ? a : b)).toString();
    const lowest = lows.reduce((a, b) => (a.lt(b) ? a : b)).toString();
    const avgVolume = volumes
      .reduce((a, b) => a.plus(b))
      .div(volumes.length)
      .toString();

    res.json({
      pair: pair.toUpperCase(),
      period: `${days} day(s)`,
      highest,
      lowest,
      average_volume: avgVolume,
      data_points: candleList.length,
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Market Data Service listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(async () => {
    await mongoClient.close();
    await redisClient.quit();
    process.exit(0);
  });
});

export default app;
