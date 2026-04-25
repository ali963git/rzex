import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { config } from '../config';
import { logger } from '../config/logger';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('password').isLength({ min: 8 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION', message: errors.array()[0].msg } });
      return;
    }

    const { email, username, password } = req.body;

    try {
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username],
      );
      if (existing.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Email or username already exists' },
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);
      const result = await pool.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3) RETURNING id, email, username, role, created_at`,
        [email, username, passwordHash],
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration },
      );

      const refreshToken = uuidv4();
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken],
      );

      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent)
         VALUES ($1, 'register', $2, $3)`,
        [user.id, req.ip, req.get('user-agent')],
      );

      logger.info('User registered', { userId: user.id, email });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, email: user.email, username: user.username, role: user.role },
          token,
          refreshToken,
        },
      });
    } catch (err) {
      logger.error('Registration failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Registration failed' },
      });
    }
  },
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Invalid input' } });
      return;
    }

    const { email, password } = req.body;

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
        return;
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration },
      );

      const refreshToken = uuidv4();
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken],
      );

      await pool.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent)
         VALUES ($1, 'login', $2, $3)`,
        [user.id, req.ip, req.get('user-agent')],
      );

      logger.info('User logged in', { userId: user.id });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            kycStatus: user.kyc_status,
            twoFactorEnabled: user.two_factor_enabled,
          },
          token,
          refreshToken,
        },
      });
    } catch (err) {
      logger.error('Login failed', { error: (err as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Login failed' },
      });
    }
  },
);

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, role, kyc_status, two_factor_enabled, created_at
       FROM users WHERE id = $1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    logger.error('Get profile failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to get profile' },
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Refresh token required' },
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT rt.user_id, u.role FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [refreshToken],
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' },
      });
      return;
    }

    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    const { user_id, role } = result.rows[0];
    const newToken = jwt.sign({ userId: user_id, role }, config.jwt.secret, {
      expiresIn: config.jwt.expiration,
    });

    const newRefreshToken = uuidv4();
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user_id, newRefreshToken],
    );

    res.json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    logger.error('Token refresh failed', { error: (err as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Token refresh failed' },
    });
  }
});

export default router;
