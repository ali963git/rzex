import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// GET /api/notifications — Get user notifications
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string;
  const limit = parseInt(req.query.limit as string || '20', 10);
  const offset = parseInt(req.query.offset as string || '0', 10);

  if (!userId) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'userId is required' },
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = $1 AND read = false',
      [userId],
    );

    res.json({
      success: true,
      data: result.rows,
      meta: { unread: parseInt(countResult.rows[0].unread, 10) },
    });
  } catch (err) {
    logger.error('Get notifications failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to get notifications' },
    });
  }
});

// POST /api/notifications — Create a notification
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId, type, title, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, type, title, message],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error('Create notification failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to create notification' },
    });
  }
});

// PATCH /api/notifications/:id/read — Mark as read
router.patch('/:id/read', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE notifications SET read = true WHERE id = $1', [id]);
    res.json({ success: true, data: { id, read: true } });
  } catch (err) {
    logger.error('Mark read failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to mark notification as read' },
    });
  }
});

// POST /api/notifications/read-all — Mark all as read
router.post('/read-all', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId],
    );
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) {
    logger.error('Mark all read failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to mark all as read' },
    });
  }
});

export default router;
