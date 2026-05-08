# Trading Engine Documentation

## Overview

The Trading Engine is a high-performance service that handles:
- Order submission and management
- Real-time order matching
- Order book management
- Trade execution
- Real-time market data via WebSocket

## Key Features

- ⚡ Real-time order processing
- 📊 In-memory order book for fast matching
- 🔄 WebSocket support for live updates
- 💰 Support for multiple order types (limit, market, stop-limit, OCO)
- 📈 Decimal.js for precise price calculations
- 🔒 Redis caching for performance

## REST Endpoints

### POST /api/orders

Submit a new order.

**Request:**
```json
{
  "user_id": "uuid",
  "pair": "BTC/USD",
  "type": "limit",
  "side": "buy",
  "price": "45000.50",
  "amount": "0.5"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_1234567890",
  "order": {...}
}
```

### GET /api/orderbook/:pair

Get current order book for a pair.

**Response:**
```json
{
  "pair": "BTC/USD",
  "bids": [
    ["45000", "1.5"],
    ["44999", "2.0"]
  ],
  "asks": [
    ["45001", "1.0"],
    ["45002", "2.5"]
  ],
  "timestamp": "2026-05-08T10:00:00Z"
}
```

### GET /api/trades/:pair

Get recent trades.

**Response:**
```json
[
  {
    "id": "trade_123",
    "pair": "BTC/USD",
    "price": "45000.50",
    "amount": "1.5",
    "timestamp": "2026-05-08T10:00:00Z",
    "fee": "0.0015"
  }
]
```

### POST /api/orders/:order_id/cancel

Cancel an order.

### GET /api/users/:user_id/orders

Get user's orders.

## WebSocket

Connect to `ws://localhost:3000` for real-time updates.

### Authentication
```json
{
  "action": "auth",
  "userId": "uuid",
  "token": "jwt_token"
}
```

### Subscribe to Order Book
```json
{
  "action": "subscribe",
  "pair": "BTC/USD"
}
```

### Messages

**Order Book Update:**
```json
{
  "type": "orderbook_update",
  "pair": "BTC/USD",
  "data": {...}
}
```

**Trade Executed:**
```json
{
  "type": "trade_executed",
  "data": {...}
}
```

## Order Matching Algorithm

1. Market orders are matched immediately against best available prices
2. Limit orders are added to the order book
3. Matching occurs when bid price >= ask price
4. Recursive matching ensures all possible trades are executed
5. Order book is maintained in memory for O(1) access

## Performance

- Order submission: < 10ms
- Order matching: < 5ms
- Order book query: < 1ms
- WebSocket broadcast: ~50ms (depending on clients)

## Environment Variables

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=rzex_db
DB_USER=rzex_user
DB_PASSWORD=password
REDIS_URL=redis://redis:6379
PORT=3000
LOG_LEVEL=debug
```
