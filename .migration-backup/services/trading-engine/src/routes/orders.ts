import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { MatchingEngine } from '../engine/MatchingEngine';
import { pool } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

export function createOrderRoutes(engine: MatchingEngine): Router {
  // POST /api/orders — Place a new order
  router.post(
    '/',
    [
      body('userId').isUUID(),
      body('pair').notEmpty(),
      body('side').isIn(['buy', 'sell']),
      body('type').isIn(['limit', 'market', 'stop_limit']),
      body('quantity').isDecimal({ decimal_digits: '0,18' }),
      body('price').optional().isDecimal({ decimal_digits: '0,18' }),
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

      try {
        const { userId, pair, side, type, price, quantity, stopPrice } = req.body;
        const result = await engine.placeOrder({
          userId, pair, side, type,
          price: price || '0',
          quantity,
          stopPrice,
        });

        res.status(201).json({ success: true, data: result });
      } catch (err) {
        logger.error('Place order failed', { error: (err as Error).message });
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL', message: 'Failed to place order' },
        });
      }
    },
  );

  // DELETE /api/orders/:orderId — Cancel an order
  router.delete('/:orderId', async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User ID required' },
      });
      return;
    }

    try {
      const cancelled = await engine.cancelOrder(orderId, userId);
      if (!cancelled) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Order not found or cannot be cancelled' },
        });
        return;
      }

      res.json({ success: true, data: { orderId, status: 'cancelled' } });
    } catch (err) {
      logger.error('Cancel order failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Failed to cancel order' },
      });
    }
  });

  // GET /api/orders — Get user's orders
  router.get(
    '/',
    [
      query('userId').isUUID(),
      query('pair').optional().isString(),
      query('status').optional().isIn(['open', 'filled', 'cancelled', 'partially_filled']),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('offset').optional().isInt({ min: 0 }),
    ],
    async (req: Request, res: Response): Promise<void> => {
      const { userId, pair, status, limit = '20', offset = '0' } = req.query;

      try {
        let queryStr = 'SELECT * FROM orders WHERE user_id = $1';
        const params: (string | number)[] = [userId as string];
        let paramIdx = 2;

        if (pair) {
          queryStr += ` AND pair = $${paramIdx++}`;
          params.push(pair as string);
        }
        if (status) {
          queryStr += ` AND status = $${paramIdx++}`;
          params.push(status as string);
        }

        queryStr += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`;
        params.push(parseInt(limit as string, 10));
        params.push(parseInt(offset as string, 10));

        const result = await pool.query(queryStr, params);
        res.json({
          success: true,
          data: result.rows,
          meta: { limit: parseInt(limit as string, 10), offset: parseInt(offset as string, 10) },
        });
      } catch (err) {
        logger.error('Get orders failed', { error: (err as Error).message });
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL', message: 'Failed to get orders' },
        });
      }
    },
  );

  // GET /api/orders/book/:pair — Get order book
  router.get('/book/:pair', (req: Request, res: Response): void => {
    const { pair } = req.params;
    const depth = parseInt(req.query.depth as string || '50', 10);
    const snapshot = engine.getOrderBookSnapshot(pair, depth);
    res.json({ success: true, data: snapshot });
  });

  return router;
}
