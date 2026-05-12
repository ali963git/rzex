import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { OrderBook, OrderBookOrder, MatchResult } from './OrderBook';
import { pool } from '../config/database';
import { config } from '../config';
import { logger } from '../config/logger';

export class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.redis.on('error', (err) => {
      logger.error('Redis connection error', { error: err.message });
    });
  }

  getOrCreateOrderBook(pair: string): OrderBook {
    let book = this.orderBooks.get(pair);
    if (!book) {
      book = new OrderBook(pair);
      this.orderBooks.set(pair, book);
      logger.info(`Order book created for ${pair}`);
    }
    return book;
  }

  async placeOrder(params: {
    userId: string;
    pair: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market' | 'stop_limit';
    price: string;
    quantity: string;
    stopPrice?: string;
  }): Promise<{
    order: { id: string; status: string };
    trades: MatchResult[];
  }> {
    const orderId = uuidv4();
    const price = new Decimal(params.price || '0');
    const quantity = new Decimal(params.quantity);

    // Persist order to DB
    await pool.query(
      `INSERT INTO orders (id, user_id, pair, side, type, price, quantity, remaining_quantity, stop_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)`,
      [orderId, params.userId, params.pair, params.side, params.type, price.toString(), quantity.toString(), params.stopPrice || null],
    );

    const bookOrder: OrderBookOrder = {
      id: orderId,
      userId: params.userId,
      price,
      quantity,
      remainingQuantity: quantity,
      side: params.side,
      type: params.type,
      timestamp: Date.now(),
    };

    const orderBook = this.getOrCreateOrderBook(params.pair);
    const matches = orderBook.addOrder(bookOrder);

    // Process matches
    for (const match of matches) {
      await this.processTrade(params.pair, match);
    }

    // Update order status
    const status = bookOrder.remainingQuantity.isZero()
      ? 'filled'
      : matches.length > 0
        ? 'partially_filled'
        : 'open';

    await pool.query(
      `UPDATE orders SET status = $1, filled_quantity = quantity - $2, remaining_quantity = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, bookOrder.remainingQuantity.toString(), orderId],
    );

    // Publish order book update via Redis
    await this.publishOrderBookUpdate(params.pair, orderBook);

    logger.info('Order placed', {
      orderId,
      pair: params.pair,
      side: params.side,
      type: params.type,
      price: price.toString(),
      quantity: quantity.toString(),
      matches: matches.length,
      status,
    });

    return { order: { id: orderId, status }, trades: matches };
  }

  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT pair, status FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId],
    );

    if (result.rows.length === 0) return false;

    const { pair, status } = result.rows[0];
    if (!['open', 'partially_filled', 'pending'].includes(status)) return false;

    const orderBook = this.orderBooks.get(pair);
    if (orderBook) {
      orderBook.cancelOrder(orderId);
      await this.publishOrderBookUpdate(pair, orderBook);
    }

    await pool.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [orderId],
    );

    logger.info('Order cancelled', { orderId, pair });
    return true;
  }

  getOrderBookSnapshot(pair: string, depth: number = 50) {
    const orderBook = this.getOrCreateOrderBook(pair);
    return {
      pair,
      bids: orderBook.getBids(depth),
      asks: orderBook.getAsks(depth),
      spread: orderBook.getSpread()?.toString() || null,
      timestamp: new Date().toISOString(),
    };
  }

  private async processTrade(pair: string, match: MatchResult): Promise<void> {
    const makerFee = match.price.times(match.quantity).times(config.fees.maker);
    const takerFee = match.price.times(match.quantity).times(config.fees.taker);

    await pool.query(
      `INSERT INTO trades (pair, buy_order_id, sell_order_id, buyer_id, seller_id, price, quantity, buyer_fee, seller_fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [pair, match.buyOrderId, match.sellOrderId, match.buyerId, match.sellerId,
       match.price.toString(), match.quantity.toString(), takerFee.toString(), makerFee.toString()],
    );

    // Update matched orders
    for (const orderId of [match.buyOrderId, match.sellOrderId]) {
      await pool.query(
        `UPDATE orders SET
          filled_quantity = filled_quantity + $1,
          remaining_quantity = remaining_quantity - $1,
          status = CASE WHEN remaining_quantity - $1 <= 0 THEN 'filled' ELSE 'partially_filled' END,
          updated_at = NOW()
         WHERE id = $2`,
        [match.quantity.toString(), orderId],
      );
    }

    // Publish trade event
    await this.redis.publish(`trades:${pair}`, JSON.stringify({
      pair,
      price: match.price.toString(),
      quantity: match.quantity.toString(),
      buyerId: match.buyerId,
      sellerId: match.sellerId,
      timestamp: new Date().toISOString(),
    }));
  }

  private async publishOrderBookUpdate(pair: string, orderBook: OrderBook): Promise<void> {
    const snapshot = {
      pair,
      bids: orderBook.getBids(50),
      asks: orderBook.getAsks(50),
      timestamp: new Date().toISOString(),
    };

    await this.redis.publish(`orderbook:${pair}`, JSON.stringify(snapshot));
  }
}
