import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Decimal from 'decimal.js';
import { pool } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// GET /api/wallets — Get user's wallets
router.get(
  '/',
  [query('userId').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    try {
      const result = await pool.query(
        `SELECT id, currency, balance, locked_balance, wallet_type, address, created_at
         FROM wallets WHERE user_id = $1 ORDER BY currency`,
        [userId],
      );

      res.json({ success: true, data: result.rows });
    } catch (err) {
      logger.error('Get wallets failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to get wallets' },
      });
    }
  },
);

// POST /api/wallets — Create a wallet for a currency
router.post(
  '/',
  [
    body('userId').isUUID(),
    body('currency').isString().isLength({ min: 2, max: 10 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: errors.array()[0].msg },
      });
      return;
    }

    const { userId, currency } = req.body;

    try {
      const existing = await pool.query(
        'SELECT id FROM wallets WHERE user_id = $1 AND currency = $2',
        [userId, currency.toUpperCase()],
      );

      if (existing.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Wallet already exists for this currency' },
        });
        return;
      }

      const result = await pool.query(
        `INSERT INTO wallets (user_id, currency)
         VALUES ($1, $2) RETURNING *`,
        [userId, currency.toUpperCase()],
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      logger.error('Create wallet failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to create wallet' },
      });
    }
  },
);

// POST /api/wallets/deposit — Process a deposit
router.post(
  '/deposit',
  [
    body('userId').isUUID(),
    body('currency').isString(),
    body('amount').isDecimal(),
    body('txHash').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: errors.array()[0].msg },
      });
      return;
    }

    const { userId, currency, amount, txHash } = req.body;
    const depositAmount = new Decimal(amount);

    if (depositAmount.lessThanOrEqualTo(0)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: 'Amount must be positive' },
      });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get or create wallet
      let walletResult = await client.query(
        'SELECT id FROM wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE',
        [userId, currency.toUpperCase()],
      );

      if (walletResult.rows.length === 0) {
        walletResult = await client.query(
          `INSERT INTO wallets (user_id, currency) VALUES ($1, $2) RETURNING id`,
          [userId, currency.toUpperCase()],
        );
      }

      const walletId = walletResult.rows[0].id;

      // Update balance
      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
         WHERE id = $2`,
        [depositAmount.toString(), walletId],
      );

      // Create transaction record
      const txResult = await client.query(
        `INSERT INTO transactions (user_id, wallet_id, type, currency, amount, status, tx_hash)
         VALUES ($1, $2, 'deposit', $3, $4, 'confirmed', $5) RETURNING *`,
        [userId, walletId, currency.toUpperCase(), depositAmount.toString(), txHash],
      );

      await client.query('COMMIT');

      logger.info('Deposit processed', { userId, currency, amount: depositAmount.toString() });

      res.status(201).json({ success: true, data: txResult.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Deposit failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Deposit failed' },
      });
    } finally {
      client.release();
    }
  },
);

// POST /api/wallets/withdraw — Process a withdrawal
router.post(
  '/withdraw',
  [
    body('userId').isUUID(),
    body('currency').isString(),
    body('amount').isDecimal(),
    body('toAddress').isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: errors.array()[0].msg },
      });
      return;
    }

    const { userId, currency, amount, toAddress } = req.body;
    const withdrawAmount = new Decimal(amount);
    const fee = withdrawAmount.times('0.0005'); // 0.05% withdrawal fee

    if (withdrawAmount.lessThanOrEqualTo(0)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: 'Amount must be positive' },
      });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const walletResult = await client.query(
        'SELECT id, balance FROM wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE',
        [userId, currency.toUpperCase()],
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Wallet not found' },
        });
        return;
      }

      const wallet = walletResult.rows[0];
      const totalDeduction = withdrawAmount.plus(fee);

      if (new Decimal(wallet.balance).lessThan(totalDeduction)) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: { code: 'INSUFFICIENT_BALANCE', message: `Insufficient ${currency} balance` },
        });
        return;
      }

      // Lock funds
      await client.query(
        `UPDATE wallets SET
          balance = balance - $1,
          locked_balance = locked_balance + $2,
          updated_at = NOW()
         WHERE id = $3`,
        [totalDeduction.toString(), withdrawAmount.toString(), wallet.id],
      );

      // Create pending transaction
      const txResult = await client.query(
        `INSERT INTO transactions (user_id, wallet_id, type, currency, amount, fee, status, to_address)
         VALUES ($1, $2, 'withdrawal', $3, $4, $5, 'pending', $6) RETURNING *`,
        [userId, wallet.id, currency.toUpperCase(), withdrawAmount.toString(), fee.toString(), toAddress],
      );

      await client.query('COMMIT');

      logger.info('Withdrawal initiated', { userId, currency, amount: withdrawAmount.toString() });

      res.status(201).json({ success: true, data: txResult.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Withdrawal failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Withdrawal failed' },
      });
    } finally {
      client.release();
    }
  },
);

// GET /api/wallets/balance — Get balance summary
router.get(
  '/balance',
  [query('userId').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;

    try {
      const result = await pool.query(
        `SELECT currency, balance, locked_balance,
                (balance::numeric + locked_balance::numeric) as total_balance
         FROM wallets WHERE user_id = $1 ORDER BY currency`,
        [userId],
      );

      res.json({ success: true, data: result.rows });
    } catch (err) {
      logger.error('Get balance failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to get balance' },
      });
    }
  },
);

export default router;
