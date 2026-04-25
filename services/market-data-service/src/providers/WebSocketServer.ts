import { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer as WSServer } from 'ws';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../config/logger';

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
  isAlive: boolean;
}

export class MarketWebSocketServer {
  private wss: WSServer;
  private clients: Map<string, Client> = new Map();
  private subscriber: Redis;
  private clientIdCounter = 0;

  constructor(server: HTTPServer) {
    this.wss = new WSServer({ server, path: '/ws' });
    this.subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    });

    this.setupWebSocket();
    this.setupRedisSubscriber();
    this.startHeartbeat();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = `client-${++this.clientIdCounter}`;
      const client: Client = { ws, subscriptions: new Set(), isAlive: true };
      this.clients.set(clientId, client);

      logger.debug(`WebSocket client connected: ${clientId}`);

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, client, message);
        } catch {
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Invalid message format' },
          }));
        }
      });

      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.debug(`WebSocket client disconnected: ${clientId}`);
      });

      ws.send(JSON.stringify({
        type: 'connected',
        data: { clientId, message: 'Connected to RZEX Market Data' },
      }));
    });
  }

  private handleMessage(clientId: string, client: Client, message: { type: string; channel?: string }): void {
    switch (message.type) {
      case 'subscribe':
        if (message.channel) {
          client.subscriptions.add(message.channel);
          client.ws.send(JSON.stringify({
            type: 'subscribed',
            data: { channel: message.channel },
          }));
          logger.debug(`${clientId} subscribed to ${message.channel}`);
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          client.subscriptions.delete(message.channel);
          client.ws.send(JSON.stringify({
            type: 'unsubscribed',
            data: { channel: message.channel },
          }));
        }
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          data: { message: `Unknown message type: ${message.type}` },
        }));
    }
  }

  private setupRedisSubscriber(): void {
    this.subscriber.on('error', (err) => {
      logger.error('Redis subscriber error', { error: err.message });
    });

    this.subscriber.psubscribe('orderbook:*', 'trades:*', 'ticker:*', (err) => {
      if (err) {
        logger.error('Redis psubscribe failed', { error: err.message });
      } else {
        logger.info('Subscribed to Redis channels for market data');
      }
    });

    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      this.broadcast(channel, message);
    });
  }

  private broadcast(channel: string, message: string): void {
    for (const [, client] of this.clients) {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'data',
          channel,
          data: JSON.parse(message),
        }));
      }
    }
  }

  private startHeartbeat(): void {
    setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }
        client.isAlive = false;
        client.ws.ping();
      }
    }, 30000);
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      subscriptions: Array.from(this.clients.values()).reduce(
        (acc, c) => acc + c.subscriptions.size, 0,
      ),
    };
  }
}
