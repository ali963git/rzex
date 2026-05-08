import express, { Express, Request, Response, NextFunction } from 'express';
import redis from 'redis';
import nodemailer from 'nodemailer';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger = pino();
app.use(pinoHttp({ logger }));
app.use(express.json());

// Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

const subscriber = redisClient.duplicate();

redisClient.connect().catch((err) => logger.error('Redis connection error:', err));
subscriber.connect().catch((err) => logger.error('Subscriber connection error:', err));

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Types
interface Notification {
  id: string;
  user_id: string;
  type: 'order_filled' | 'deposit' | 'withdrawal' | 'price_alert' | 'login';
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  data?: any;
  created_at: Date;
}

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await redisClient.ping();
    res.json({ status: 'ok', service: 'notification-service', timestamp: new Date() });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
  }
});

// Subscribe to notification events
subscriber.subscribe(
  ['order:filled', 'wallet:deposit', 'wallet:withdrawal', 'user:login'],
  async (message: string, channel: string) => {
    try {
      const event = JSON.parse(message);
      await processNotification(event, channel);
    } catch (error) {
      logger.error('Error processing notification event:', error);
    }
  }
);

// Process Notification
async function processNotification(event: any, channel: string): Promise<void> {
  try {
    let notification: Notification | null = null;

    if (channel === 'order:filled') {
      notification = {
        id: `notif_${Date.now()}`,
        user_id: event.user_id,
        type: 'order_filled',
        title: 'Order Filled',
        message: `Your ${event.side} order for ${event.amount} ${event.pair} has been filled at ${event.price}`,
        channels: ['email', 'push', 'in_app'],
        data: event,
        created_at: new Date(),
      };
    } else if (channel === 'wallet:deposit') {
      notification = {
        id: `notif_${Date.now()}`,
        user_id: event.user_id,
        type: 'deposit',
        title: 'Deposit Received',
        message: `You have received ${event.amount} ${event.currency}`,
        channels: ['email', 'push', 'in_app'],
        data: event,
        created_at: new Date(),
      };
    } else if (channel === 'wallet:withdrawal') {
      notification = {
        id: `notif_${Date.now()}`,
        user_id: event.user_id,
        type: 'withdrawal',
        title: 'Withdrawal Confirmed',
        message: `Your withdrawal of ${event.amount} ${event.currency} to ${event.to_address} has been confirmed`,
        channels: ['email', 'push', 'in_app'],
        data: event,
        created_at: new Date(),
      };
    } else if (channel === 'user:login') {
      notification = {
        id: `notif_${Date.now()}`,
        user_id: event.user_id,
        type: 'login',
        title: 'New Login',
        message: `New login detected from ${event.ip_address}`,
        channels: ['email', 'push'],
        data: event,
        created_at: new Date(),
      };
    }

    if (notification) {
      // Send notifications
      if (notification.channels.includes('email')) {
        await sendEmail(notification);
      }
      if (notification.channels.includes('push')) {
        await sendPushNotification(notification);
      }
      if (notification.channels.includes('in_app')) {
        await storeInAppNotification(notification);
      }
    }
  } catch (error) {
    logger.error('Error in processNotification:', error);
  }
}

// Send Email
async function sendEmail(notification: Notification): Promise<void> {
  try {
    // Get user email (in production, query from user service)
    const userEmail = `user_${notification.user_id}@example.com`;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: notification.title,
      html: `
        <h1>${notification.title}</h1>
        <p>${notification.message}</p>
        <p>Timestamp: ${notification.created_at}</p>
      `,
    });

    logger.info(`Email sent to ${userEmail} for notification ${notification.id}`);
  } catch (error) {
    logger.error('Error sending email:', error);
  }
}

// Send Push Notification
async function sendPushNotification(notification: Notification): Promise<void> {
  try {
    // Get user's device tokens from Redis
    const tokens = await redisClient.get(`push_tokens:${notification.user_id}`);

    if (tokens) {
      const deviceTokens = JSON.parse(tokens);
      // In production, integrate with Firebase Cloud Messaging or similar service
      logger.info(
        `Push notification sent to ${deviceTokens.length} devices for notification ${notification.id}`
      );
    }
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
}

// Store In-App Notification
async function storeInAppNotification(notification: Notification): Promise<void> {
  try {
    // Store in Redis with expiration (30 days)
    await redisClient.setEx(
      `notification:${notification.id}`,
      30 * 24 * 60 * 60,
      JSON.stringify(notification)
    );

    // Add to user's notification list
    await redisClient.lPush(
      `notifications:${notification.user_id}`,
      JSON.stringify(notification)
    );

    logger.info(`In-app notification stored for user ${notification.user_id}`);
  } catch (error) {
    logger.error('Error storing in-app notification:', error);
  }
}

// Send Notification Manually
app.post('/api/notifications/send', async (req: Request, res: Response) => {
  try {
    const { user_id, type, title, message, channels = ['in_app'] } = req.body;

    if (!user_id || !title || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const notification: Notification = {
      id: `notif_${Date.now()}`,
      user_id,
      type: type || 'login',
      title,
      message,
      channels,
      created_at: new Date(),
    };

    // Process notification
    if (channels.includes('email')) {
      await sendEmail(notification);
    }
    if (channels.includes('push')) {
      await sendPushNotification(notification);
    }
    if (channels.includes('in_app')) {
      await storeInAppNotification(notification);
    }

    res.status(201).json({
      success: true,
      notification_id: notification.id,
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get User Notifications
app.get('/api/notifications/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { limit = 50 } = req.query;

    const notifications = await redisClient.lRange(
      `notifications:${user_id}`,
      0,
      Math.min(parseInt(limit as string) || 50, 100) - 1
    );

    const parsedNotifications = notifications.map((n) => JSON.parse(n));

    res.json(parsedNotifications);
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Clear Notifications
app.post('/api/notifications/:user_id/clear', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    await redisClient.del(`notifications:${user_id}`);

    res.json({ success: true, message: 'Notifications cleared' });
  } catch (error) {
    logger.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Subscribe to Push Notifications
app.post('/api/push-subscribe', async (req: Request, res: Response) => {
  try {
    const { user_id, device_token } = req.body;

    if (!user_id || !device_token) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Store device token
    const tokens = await redisClient.get(`push_tokens:${user_id}`);
    const tokenList = tokens ? JSON.parse(tokens) : [];

    if (!tokenList.includes(device_token)) {
      tokenList.push(device_token);
      await redisClient.setEx(
        `push_tokens:${user_id}`,
        365 * 24 * 60 * 60, // 1 year
        JSON.stringify(tokenList)
      );
    }

    res.json({ success: true, message: 'Device registered for push notifications' });
  } catch (error) {
    logger.error('Push subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Notification Service listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(async () => {
    await redisClient.quit();
    await subscriber.quit();
    process.exit(0);
  });
});

export default app;
