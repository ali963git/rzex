import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import redis from 'redis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pinoHttp from 'pino-http';
import { Logger } from 'pino';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger: Logger = pino();
app.use(pinoHttp({ logger }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => {
  logger.error('Redis connection error:', err);
});

// Types
interface User {
  id: string;
  username: string;
  email: string;
  kyc_status: string;
  created_at: Date;
}

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
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

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    (req as any).userId = decoded.userId;
    (req as any).email = decoded.email;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    // Check redis connection
    await redisClient.ping();
    res.json({ status: 'ok', service: 'user-service', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Service unhealthy' });
  }
});

// Routes

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, kyc_status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, kyc_status, created_at`,
      [username, email, passwordHash, 'pending']
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    // Cache user in redis
    await redisClient.setEx(
      `user:${user.id}`,
      3600,
      JSON.stringify(user)
    );

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, username, password_hash, kyc_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    // Cache user in redis
    await redisClient.setEx(
      `user:${user.id}`,
      3600,
      JSON.stringify(user)
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        kyc_status: user.kyc_status,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get User Profile
app.get('/api/users/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Try to get from cache first
    const cached = await redisClient.get(`user:${userId}`);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    // Get from database
    const result = await pool.query(
      `SELECT id, username, email, kyc_status, two_fa_enabled, phone_number, country, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Cache in redis
    await redisClient.setEx(
      `user:${userId}`,
      3600,
      JSON.stringify(user)
    );

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update User Profile
app.put('/api/users/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { first_name, last_name, phone_number, country } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           country = COALESCE($4, country),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, kyc_status, first_name, last_name, phone_number, country`,
      [first_name, last_name, phone_number, country, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    // Invalidate cache
    await redisClient.del(`user:${userId}`);

    res.json(user);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change Password
app.post('/api/auth/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Missing old or new password' });
      return;
    }

    // Get user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password_hash
    );

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid old password' });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout
app.post('/api/auth/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Add token to blacklist
      const decoded = jwt.decode(token) as any;
      const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 86400;
      await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// KYC Verification
app.post('/api/kyc/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { documentType, documentNumber, verificationData } = req.body;

    if (!documentType || !documentNumber) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Store KYC data (in production, integrate with external verification service)
    // For now, just mark as pending
    await pool.query(
      'UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2',
      ['pending', userId]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'KYC_VERIFICATION_INITIATED',
        'user',
        userId,
        JSON.stringify({ documentType }),
      ]
    );

    res.json({
      success: true,
      message: 'KYC verification initiated',
      status: 'pending',
    });
  } catch (error) {
    logger.error('KYC verification error:', error);
    res.status(500).json({ error: 'Failed to initiate KYC verification' });
  }
});

// Get User by ID (Admin)
app.get('/api/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT id, username, email, kyc_status, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`User Service listening on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    await redisClient.quit();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    await redisClient.quit();
    process.exit(0);
  });
});

export default app;
