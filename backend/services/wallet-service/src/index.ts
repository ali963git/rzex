import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
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

// Database
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  max: 20,
});

// Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => logger.error('Redis connection error:', err));

// Types
interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: string;
  locked_balance: string;
  address: string;
  is_hot_wallet: boolean;
}

interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'trade';
  amount: string;
  fee: string;
  status: 'pending' | 'confirmed' | 'failed';
  tx_hash?: string;
}

// Middleware: Authentication
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    (req as any).userId = 'user_id_from_token'; // In real app, verify JWT
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    await redisClient.ping();
    res.json({ status: 'ok', service: 'wallet-service', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

// Get User Wallets
app.get('/api/wallets', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Try cache first
    const cached = await redisClient.get(`wallets:${userId}`);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const result = await pool.query(
      `SELECT id, user_id, currency, balance, locked_balance, address, is_hot_wallet, created_at
       FROM wallets
       WHERE user_id = $1
       ORDER BY currency ASC`,
      [userId]
    );

    const wallets = result.rows;

    // Cache for 5 minutes
    await redisClient.setEx(
      `wallets:${userId}`,
      300,
      JSON.stringify(wallets)
    );

    res.json(wallets);
  } catch (error) {
    logger.error('Get wallets error:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Get Wallet Balance
app.get('/api/wallets/:currency', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currency } = req.params;

    const result = await pool.query(
      `SELECT id, balance, locked_balance, address, is_hot_wallet
       FROM wallets
       WHERE user_id = $1 AND currency = $2`,
      [userId, currency.toUpperCase()]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    const wallet = result.rows[0];
    const available = new Decimal(wallet.balance).minus(wallet.locked_balance);

    res.json({
      currency: currency.toUpperCase(),
      balance: wallet.balance,
      locked_balance: wallet.locked_balance,
      available: available.toString(),
      address: wallet.address,
      is_hot_wallet: wallet.is_hot_wallet,
    });
  } catch (error) {
    logger.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Deposit
app.post('/api/wallets/deposit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currency, tx_hash, amount, blockchain } = req.body;

    if (!currency || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get or create wallet
    let wallet = await pool.query(
      'SELECT id FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, currency.toUpperCase()]
    );

    let walletId;
    if (wallet.rows.length === 0) {
      const createWallet = await pool.query(
        `INSERT INTO wallets (user_id, currency, balance, address)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, currency.toUpperCase(), '0', `${currency.toUpperCase()}_${Date.now()}`]
      );
      walletId = createWallet.rows[0].id;
    } else {
      walletId = wallet.rows[0].id;
    }

    // Create transaction
    const txResult = await pool.query(
      `INSERT INTO transactions (wallet_id, user_id, type, amount, status, tx_hash, blockchain, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [walletId, userId, 'deposit', amount, 'pending', tx_hash, blockchain]
    );

    const transactionId = txResult.rows[0].id;

    // In production, verify transaction on blockchain
    // For now, automatically confirm
    const fee = new Decimal(amount).mul(0.001).toString(); // 0.1% fee
    const netAmount = new Decimal(amount).minus(fee);

    await pool.query(
      `UPDATE transactions SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`,
      [transactionId]
    );

    // Update wallet balance
    await pool.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
      [netAmount.toString(), walletId]
    );

    // Invalidate cache
    await redisClient.del(`wallets:${userId}`);

    res.status(201).json({
      success: true,
      transaction_id: transactionId,
      amount: netAmount.toString(),
      fee,
      status: 'confirmed',
    });
  } catch (error) {
    logger.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Withdrawal
app.post('/api/wallets/withdraw', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currency, amount, to_address } = req.body;

    if (!currency || !amount || !to_address) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get wallet
    const wallet = await pool.query(
      'SELECT id, balance, locked_balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, currency.toUpperCase()]
    );

    if (wallet.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    const walletData = wallet.rows[0];
    const available = new Decimal(walletData.balance).minus(walletData.locked_balance);
    const withdrawAmount = new Decimal(amount);
    const fee = withdrawAmount.mul(0.005).toString(); // 0.5% fee
    const totalDebit = withdrawAmount.plus(fee);

    // Check balance
    if (available.lt(totalDebit)) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    // Create transaction
    const txResult = await pool.query(
      `INSERT INTO transactions (wallet_id, user_id, type, amount, fee, status, to_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [walletData.id, userId, 'withdrawal', amount, fee, 'pending', to_address]
    );

    const transactionId = txResult.rows[0].id;

    // Lock balance
    await pool.query(
      `UPDATE wallets SET locked_balance = locked_balance + $1 WHERE id = $2`,
      [totalDebit.toString(), walletData.id]
    );

    // In production, broadcast to blockchain
    // For now, simulate confirmation
    setTimeout(async () => {
      await pool.query(
        `UPDATE transactions SET status = 'confirmed', tx_hash = $1, confirmed_at = NOW() WHERE id = $2`,
        [`0x${Math.random().toString(16).substr(2)}`, transactionId]
      );

      await pool.query(
        `UPDATE wallets SET balance = balance - $1, locked_balance = locked_balance - $2 WHERE id = $3`,
        [withdrawAmount.toString(), totalDebit.toString(), walletData.id]
      );

      await redisClient.del(`wallets:${userId}`);
    }, 30000);

    res.status(201).json({
      success: true,
      transaction_id: transactionId,
      amount: withdrawAmount.toString(),
      fee,
      status: 'pending',
      to_address,
    });
  } catch (error) {
    logger.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get Transaction History
app.get('/api/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currency, status, limit = 50 } = req.query;

    let query = `
      SELECT t.* FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      WHERE t.user_id = $1
    `;
    const params: any[] = [userId];
    let paramCount = 1;

    if (currency) {
      paramCount++;
      query += ` AND w.currency = $${paramCount}`;
      params.push((currency as string).toUpperCase());
    }

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(Math.min(parseInt(limit as string) || 50, 100));

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Lock Balance (for trading)
app.post('/api/wallets/:wallet_id/lock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { wallet_id } = req.params;
    const { amount } = req.body;

    const wallet = await pool.query(
      'SELECT balance, locked_balance FROM wallets WHERE id = $1 AND user_id = $2',
      [wallet_id, userId]
    );

    if (wallet.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    const available = new Decimal(wallet.rows[0].balance).minus(wallet.rows[0].locked_balance);
    if (available.lt(amount)) {
      res.status(400).json({ error: 'Insufficient available balance' });
      return;
    }

    await pool.query(
      'UPDATE wallets SET locked_balance = locked_balance + $1 WHERE id = $2',
      [amount, wallet_id]
    );

    await redisClient.del(`wallets:${userId}`);

    res.json({ success: true, message: 'Balance locked' });
  } catch (error) {
    logger.error('Lock balance error:', error);
    res.status(500).json({ error: 'Failed to lock balance' });
  }
});

// Unlock Balance
app.post('/api/wallets/:wallet_id/unlock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { wallet_id } = req.params;
    const { amount } = req.body;

    await pool.query(
      'UPDATE wallets SET locked_balance = GREATEST(0, locked_balance - $1) WHERE id = $2 AND user_id = $3',
      [amount, wallet_id, userId]
    );

    await redisClient.del(`wallets:${userId}`);

    res.json({ success: true, message: 'Balance unlocked' });
  } catch (error) {
    logger.error('Unlock balance error:', error);
    res.status(500).json({ error: 'Failed to unlock balance' });
  }
});

// Transfer Between Wallets
app.post('/api/wallets/transfer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { from_wallet_id, to_wallet_id, amount } = req.body;

    if (!from_wallet_id || !to_wallet_id || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify sender owns from_wallet
      const fromWallet = await client.query(
        'SELECT balance FROM wallets WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [from_wallet_id, userId]
      );

      if (fromWallet.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'From wallet not found' });
        return;
      }

      if (new Decimal(fromWallet.rows[0].balance).lt(amount)) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Insufficient balance' });
        return;
      }

      // Debit from wallet
      await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
        [amount, from_wallet_id]
      );

      // Credit to wallet
      await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
        [amount, to_wallet_id]
      );

      await client.query('COMMIT');

      await redisClient.del(`wallets:${userId}`);

      res.json({
        success: true,
        message: 'Transfer completed',
        amount,
        from_wallet: from_wallet_id,
        to_wallet: to_wallet_id,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer' });
  }
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Wallet Service listening on port ${PORT}`);
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
