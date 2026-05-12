import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// GET /api/trades — Get recent trades for a pair
router.get(
  '/',
  [
    query('pair').notEmpty(),
    query('limit').optional().isInt({ min: 1, max: 500 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION', message: 'pair is required' },
      });
      return;
    }

    const { pair, limit = '50' } = req.query;

    try {
      const result = await pool.query(
        `SELECT id, pair, price, quantity, buyer_fee, seller_fee, created_at
         FROM trades WHERE pair = $1
         ORDER BY created_at DESC LIMIT $2`,
        [pair, parseInt(limit as string, 10)],
      );

      res.json({ success: true, data: result.rows });
    } catch (err) {
      logger.error('Get trades failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to get trades' },
      });
    }
  },
);

// GET /api/trades/user — Get user's trade history
router.get(
  '/user',
  [
    query('userId').isUUID(),
    query('pair').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const { userId, pair, limit = '20', offset = '0' } = req.query;

    try {
      let queryStr = `
        SELECT * FROM trades
        WHERE buyer_id = $1 OR seller_id = $1
      `;
      const params: (string | number)[] = [userId as string];
      let paramIdx = 2;

      if (pair) {
        queryStr += ` AND pair = $${paramIdx++}`;
        params.push(pair as string);
      }

      queryStr += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`;
      params.push(parseInt(limit as string, 10));
      params.push(parseInt(offset as string, 10));

      const result = await pool.query(queryStr, params);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      logger.error('Get user trades failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to get user trades' },
      });
    }
  },
);

export default router;
