import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import redis from 'redis';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import Decimal from 'decimal.js';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// Logger
const logger = pino();
app.use(pinoHttp({ logger }));
app.use(express.json());

// Database
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  max: 30,
});

// Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => logger.error('Redis connection error:', err));

// Types
interface Order {
  id: string;
  user_id: string;
  pair: string;
  type: 'limit' | 'market' | 'stop-limit' | 'OCO';
  side: 'buy' | 'sell';
  price: string;
  stop_price?: string;
  amount: string;
  filled_amount: string;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled';
  created_at: Date;
}

interface OrderBook {
  pair: string;
  bids: Array<[string, string]>; // [price, amount]
  asks: Array<[string, string]>;
  timestamp: Date;
}

interface Trade {
  id: string;
  pair: string;
  price: string;
  amount: string;
  buyer_user_id: string;
  seller_user_id: string;
  timestamp: Date;
  fee: string;
}

// In-memory order books
const orderBooks = new Map<string, OrderBook>();
const activeConnections = new Map<string, WebSocket[]>();

// WebSocket Handling
wss.on('connection', (ws: WebSocket) => {
  logger.info('New WebSocket connection');
  let userId: string | null = null;
  let subscribedPairs: Set<string> = new Set();

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(ws, data, (id) => (userId = id), subscribedPairs);
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      const connections = activeConnections.get(userId) || [];
      const index = connections.indexOf(ws);
      if (index > -1) connections.splice(index, 1);
    }
    logger.info('WebSocket closed');
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
});

async function handleWebSocketMessage(
  ws: WebSocket,
  data: any,
  setUserId: (id: string) => void,
  subscribedPairs: Set<string>
): Promise<void> {
  const { action, pair, token } = data;

  if (action === 'auth') {
    // Authenticate via JWT
    setUserId(data.userId);
    const connections = activeConnections.get(data.userId) || [];
    connections.push(ws);
    activeConnections.set(data.userId, connections);
    ws.send(JSON.stringify({ type: 'auth_success', userId: data.userId }));
  } else if (action === 'subscribe') {
    subscribedPairs.add(pair);
    ws.send(JSON.stringify({ type: 'subscribe_success', pair }));
    // Send current order book
    const book = orderBooks.get(pair);
    if (book) {
      ws.send(JSON.stringify({ type: 'orderbook', data: book }));
    }
  } else if (action === 'unsubscribe') {
    subscribedPairs.delete(pair);
    ws.send(JSON.stringify({ type: 'unsubscribe_success', pair }));
  }
}

function broadcastOrderBookUpdate(pair: string): void {
  const book = orderBooks.get(pair);
  if (!book) return;

  const message = JSON.stringify({
    type: 'orderbook_update',
    pair,
    data: book,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastTradeExecution(trade: Trade): void {
  const message = JSON.stringify({
    type: 'trade_executed',
    data: trade,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    await redisClient.ping();
    res.json({ status: 'ok', service: 'trading-engine', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

// REST Endpoints

// Submit Order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { user_id, pair, type, side, price, amount, stop_price } = req.body;

    if (!user_id || !pair || !type || !side || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const order_id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order: Order = {
      id: order_id,
      user_id,
      pair,
      type,
      side,
      price: new Decimal(price || 0).toString(),
      stop_price: stop_price ? new Decimal(stop_price).toString() : undefined,
      amount: new Decimal(amount).toString(),
      filled_amount: '0',
      status: 'pending',
      created_at: new Date(),
    };

    // Save to database
    const result = await pool.query(
      `INSERT INTO orders (id, user_id, pair, type, side, price, stop_price, amount, filled_amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [order.id, order.user_id, order.pair, order.type, order.side, order.price, order.stop_price, order.amount, '0', 'pending']
    );

    // Cache in Redis
    await redisClient.setEx(
      `order:${order.id}`,
      3600,
      JSON.stringify(order)
    );

    // Process order
    await processOrder(order);

    res.status(201).json({
      success: true,
      order_id: order.id,
      order: result.rows[0],
    });
  } catch (error) {
    logger.error('Order submission error:', error);
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

// Get Order Book
app.get('/api/orderbook/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;

    // Try cache first
    const cached = await redisClient.get(`orderbook:${pair}`);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const book = orderBooks.get(pair);
    if (book) {
      await redisClient.setEx(
        `orderbook:${pair}`,
        5,
        JSON.stringify(book)
      );
      res.json(book);
    } else {
      res.json({
        pair,
        bids: [],
        asks: [],
        timestamp: new Date(),
      });
    }
  } catch (error) {
    logger.error('Order book error:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// Get Trade History
app.get('/api/trades/:pair', async (req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

    const result = await pool.query(
      `SELECT id, pair, price, amount, buyer_user_id, seller_user_id, timestamp, fee
       FROM trades
       WHERE pair = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [pair, limit]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Trade history error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Cancel Order
app.post('/api/orders/:order_id/cancel', async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status IN ('pending', 'partially_filled')
       RETURNING *`,
      [order_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found or cannot be cancelled' });
      return;
    }

    const order = result.rows[0];
    await redisClient.del(`order:${order_id}`);
    await rebuildOrderBook(order.pair);

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get User Orders
app.get('/api/users/:user_id/orders', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const status = req.query.status as string;

    let query = 'SELECT * FROM orders WHERE user_id = $1';
    const params: any[] = [user_id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Core Trading Logic

async function processOrder(order: Order): Promise<void> {
  try {
    if (order.type === 'market') {
      await executeMarketOrder(order);
    } else if (order.type === 'limit') {
      await addToOrderBook(order);
      await matchOrders(order.pair);
    } else if (order.type === 'stop-limit') {
      // Store for monitoring
      await redisClient.setEx(
        `stop_order:${order.id}`,
        86400,
        JSON.stringify(order)
      );
    }
  } catch (error) {
    logger.error('Order processing error:', error);
  }
}

async function executeMarketOrder(order: Order): Promise<void> {
  const book = orderBooks.get(order.pair);
  if (!book) return;

  let remainingAmount = new Decimal(order.amount);
  const side = order.side === 'buy' ? 'asks' : 'bids';
  const oppositeIndex = order.side === 'buy' ? 0 : 1; // Take best price

  for (const [price, availableAmount] of (order.side === 'buy' ? book.asks : book.bids)) {
    if (remainingAmount.isZero()) break;

    const fillAmount = Decimal.min(remainingAmount, new Decimal(availableAmount));
    
    // Create trade
    await createTrade(
      order.pair,
      price,
      fillAmount.toString(),
      order.side === 'buy' ? order.user_id : 'market',
      order.side === 'buy' ? 'market' : order.user_id
    );

    remainingAmount = remainingAmount.minus(fillAmount);
  }

  // Update order status
  const filled = new Decimal(order.amount).minus(remainingAmount);
  const status = filled.isZero() ? 'cancelled' : filled.eq(order.amount) ? 'filled' : 'partially_filled';

  await pool.query(
    'UPDATE orders SET filled_amount = $1, status = $2, updated_at = NOW() WHERE id = $3',
    [filled.toString(), status, order.id]
  );
}

async function addToOrderBook(order: Order): Promise<void> {
  let book = orderBooks.get(order.pair);
  if (!book) {
    book = { pair: order.pair, bids: [], asks: [], timestamp: new Date() };
    orderBooks.set(order.pair, book);
  }

  const side = order.side === 'buy' ? book.bids : book.asks;
  const price = new Decimal(order.price);
  const amount = new Decimal(order.amount);

  // Find insertion point
  let inserted = false;
  for (let i = 0; i < side.length; i++) {
    const existingPrice = new Decimal(side[i][0]);
    if (order.side === 'buy') {
      if (price.gt(existingPrice)) {
        side.splice(i, 0, [order.price, order.amount]);
        inserted = true;
        break;
      }
    } else {
      if (price.lt(existingPrice)) {
        side.splice(i, 0, [order.price, order.amount]);
        inserted = true;
        break;
      }
    }
  }

  if (!inserted) {
    side.push([order.price, order.amount]);
  }

  book.timestamp = new Date();
  broadcastOrderBookUpdate(order.pair);
}

async function matchOrders(pair: string): Promise<void> {
  const book = orderBooks.get(pair);
  if (!book || book.bids.length === 0 || book.asks.length === 0) return;

  const bestBid = new Decimal(book.bids[0][0]);
  const bestAsk = new Decimal(book.asks[0][0]);

  if (bestBid.gte(bestAsk)) {
    const matchPrice = bestAsk.toString();
    const matchAmount = Decimal.min(
      new Decimal(book.bids[0][1]),
      new Decimal(book.asks[0][1])
    );

    // Create trade
    await createTrade(pair, matchPrice, matchAmount.toString(), 'buyer', 'seller');

    // Update order book
    const bidAmount = new Decimal(book.bids[0][1]).minus(matchAmount);
    const askAmount = new Decimal(book.asks[0][1]).minus(matchAmount);

    if (bidAmount.isZero()) book.bids.shift();
    else book.bids[0][1] = bidAmount.toString();

    if (askAmount.isZero()) book.asks.shift();
    else book.asks[0][1] = askAmount.toString();

    broadcastOrderBookUpdate(pair);
    await matchOrders(pair); // Recursive matching
  }
}

async function createTrade(
  pair: string,
  price: string,
  amount: string,
  buyerId: string,
  sellerId: string
): Promise<void> {
  const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fee = new Decimal(amount).mul(0.001).toString(); // 0.1% fee

  const result = await pool.query(
    `INSERT INTO trades (id, pair, price, amount, buyer_user_id, seller_user_id, timestamp, fee)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
     RETURNING *`,
    [tradeId, pair, price, amount, buyerId, sellerId, fee]
  );

  const trade = result.rows[0];
  broadcastTradeExecution(trade);
}

async function rebuildOrderBook(pair: string): Promise<void> {
  const result = await pool.query(
    `SELECT id, side, price, filled_amount, amount FROM orders
     WHERE pair = $1 AND status IN ('pending', 'partially_filled')
     ORDER BY created_at ASC`,
    [pair]
  );

  const book: OrderBook = {
    pair,
    bids: [],
    asks: [],
    timestamp: new Date(),
  };

  for (const order of result.rows) {
    const remaining = new Decimal(order.amount).minus(order.filled_amount);
    if (remaining.gt(0)) {
      if (order.side === 'buy') {
        book.bids.push([order.price, remaining.toString()]);
      } else {
        book.asks.push([order.price, remaining.toString()]);
      }
    }
  }

  // Sort
  book.bids.sort((a, b) => new Decimal(b[0]).minus(a[0]).toNumber());
  book.asks.sort((a, b) => new Decimal(a[0]).minus(b[0]).toNumber());

  orderBooks.set(pair, book);
  broadcastOrderBookUpdate(pair);
}

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
server.listen(PORT, () => {
  logger.info(`Trading Engine listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(async () => {
    await pool.end();
    await redisClient.quit();
    process.exit(0);
  });
});

export default app;
