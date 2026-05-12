import Decimal from 'decimal.js';
import { logger } from '../config/logger';

export interface OrderBookOrder {
  id: string;
  userId: string;
  price: Decimal;
  quantity: Decimal;
  remainingQuantity: Decimal;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop_limit';
  timestamp: number;
}

export interface MatchResult {
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  price: Decimal;
  quantity: Decimal;
}

export class OrderBook {
  private bids: OrderBookOrder[] = []; // sorted by price DESC, then time ASC
  private asks: OrderBookOrder[] = []; // sorted by price ASC, then time ASC

  constructor(public readonly pair: string) {}

  addOrder(order: OrderBookOrder): MatchResult[] {
    const matches: MatchResult[] = [];

    if (order.type === 'market') {
      this.matchMarketOrder(order, matches);
    } else {
      this.matchLimitOrder(order, matches);
    }

    // If there's remaining quantity for a limit order, add to book
    if (order.type === 'limit' && order.remainingQuantity.greaterThan(0)) {
      this.insertToBook(order);
    }

    if (matches.length > 0) {
      logger.debug(`Matched ${matches.length} trades for ${this.pair}`, {
        orderId: order.id,
      });
    }

    return matches;
  }

  cancelOrder(orderId: string): boolean {
    let idx = this.bids.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      this.bids.splice(idx, 1);
      return true;
    }

    idx = this.asks.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      this.asks.splice(idx, 1);
      return true;
    }

    return false;
  }

  getBids(depth: number = 50): Array<{ price: string; quantity: string }> {
    const aggregated = new Map<string, Decimal>();
    for (const order of this.bids.slice(0, depth * 2)) {
      const priceKey = order.price.toString();
      const existing = aggregated.get(priceKey) || new Decimal(0);
      aggregated.set(priceKey, existing.plus(order.remainingQuantity));
    }
    return Array.from(aggregated.entries())
      .map(([price, quantity]) => ({ price, quantity: quantity.toString() }))
      .slice(0, depth);
  }

  getAsks(depth: number = 50): Array<{ price: string; quantity: string }> {
    const aggregated = new Map<string, Decimal>();
    for (const order of this.asks.slice(0, depth * 2)) {
      const priceKey = order.price.toString();
      const existing = aggregated.get(priceKey) || new Decimal(0);
      aggregated.set(priceKey, existing.plus(order.remainingQuantity));
    }
    return Array.from(aggregated.entries())
      .map(([price, quantity]) => ({ price, quantity: quantity.toString() }))
      .slice(0, depth);
  }

  getBestBid(): Decimal | null {
    return this.bids.length > 0 ? this.bids[0].price : null;
  }

  getBestAsk(): Decimal | null {
    return this.asks.length > 0 ? this.asks[0].price : null;
  }

  getSpread(): Decimal | null {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();
    if (bestBid && bestAsk) {
      return bestAsk.minus(bestBid);
    }
    return null;
  }

  private matchMarketOrder(order: OrderBookOrder, matches: MatchResult[]): void {
    const oppositeBook = order.side === 'buy' ? this.asks : this.bids;

    while (order.remainingQuantity.greaterThan(0) && oppositeBook.length > 0) {
      const bestOrder = oppositeBook[0];
      const matchQty = Decimal.min(order.remainingQuantity, bestOrder.remainingQuantity);

      matches.push({
        buyOrderId: order.side === 'buy' ? order.id : bestOrder.id,
        sellOrderId: order.side === 'sell' ? order.id : bestOrder.id,
        buyerId: order.side === 'buy' ? order.userId : bestOrder.userId,
        sellerId: order.side === 'sell' ? order.userId : bestOrder.userId,
        price: bestOrder.price,
        quantity: matchQty,
      });

      order.remainingQuantity = order.remainingQuantity.minus(matchQty);
      bestOrder.remainingQuantity = bestOrder.remainingQuantity.minus(matchQty);

      if (bestOrder.remainingQuantity.isZero()) {
        oppositeBook.shift();
      }
    }
  }

  private matchLimitOrder(order: OrderBookOrder, matches: MatchResult[]): void {
    const oppositeBook = order.side === 'buy' ? this.asks : this.bids;

    while (order.remainingQuantity.greaterThan(0) && oppositeBook.length > 0) {
      const bestOrder = oppositeBook[0];

      // Check price compatibility
      if (order.side === 'buy' && order.price.lessThan(bestOrder.price)) break;
      if (order.side === 'sell' && order.price.greaterThan(bestOrder.price)) break;

      const matchQty = Decimal.min(order.remainingQuantity, bestOrder.remainingQuantity);

      matches.push({
        buyOrderId: order.side === 'buy' ? order.id : bestOrder.id,
        sellOrderId: order.side === 'sell' ? order.id : bestOrder.id,
        buyerId: order.side === 'buy' ? order.userId : bestOrder.userId,
        sellerId: order.side === 'sell' ? order.userId : bestOrder.userId,
        price: bestOrder.price, // price-time priority: use resting order's price
        quantity: matchQty,
      });

      order.remainingQuantity = order.remainingQuantity.minus(matchQty);
      bestOrder.remainingQuantity = bestOrder.remainingQuantity.minus(matchQty);

      if (bestOrder.remainingQuantity.isZero()) {
        oppositeBook.shift();
      }
    }
  }

  private insertToBook(order: OrderBookOrder): void {
    if (order.side === 'buy') {
      const idx = this.bids.findIndex(
        (o) => order.price.greaterThan(o.price) ||
               (order.price.equals(o.price) && order.timestamp < o.timestamp),
      );
      if (idx === -1) {
        this.bids.push(order);
      } else {
        this.bids.splice(idx, 0, order);
      }
    } else {
      const idx = this.asks.findIndex(
        (o) => order.price.lessThan(o.price) ||
               (order.price.equals(o.price) && order.timestamp < o.timestamp),
      );
      if (idx === -1) {
        this.asks.push(order);
      } else {
        this.asks.splice(idx, 0, order);
      }
    }
  }
}
