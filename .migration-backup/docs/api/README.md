# RZEX API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.rzex.io`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the `/api/auth/login` or `/api/auth/register` endpoints.

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per 15 minutes per IP
- **Trading endpoints**: 50 requests per minute per user

---

## Authentication API

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "trader1",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "trader1",
      "role": "user"
    },
    "token": "jwt-access-token",
    "refreshToken": "uuid-refresh-token"
  }
}
```

### POST /api/auth/login

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "trader1",
      "role": "user",
      "kycStatus": "none",
      "twoFactorEnabled": false
    },
    "token": "jwt-access-token",
    "refreshToken": "uuid-refresh-token"
  }
}
```

### POST /api/auth/refresh

Refresh an expired access token.

**Request Body:**
```json
{
  "refreshToken": "uuid-refresh-token"
}
```

### GET /api/auth/profile

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

---

## Trading API

### POST /api/orders

Place a new order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pair": "BTC/USDT",
  "side": "buy",
  "type": "limit",
  "price": "43000.00",
  "quantity": "0.5"
}
```

**Order Types:**
- `limit` — Execute at specified price or better
- `market` — Execute immediately at best available price
- `stop_limit` — Triggered when stop price is reached (requires `stopPrice`)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "open"
    },
    "trades": []
  }
}
```

### GET /api/orders

List user's orders.

**Query Parameters:**
- `pair` (optional) — Filter by trading pair
- `status` (optional) — Filter by status (open, filled, cancelled)
- `limit` (optional) — Number of results (default: 50)
- `offset` (optional) — Pagination offset

### DELETE /api/orders/:id

Cancel an open order.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Order cancelled"
  }
}
```

### GET /api/orderbook/:pair

Get the order book for a trading pair.

**Query Parameters:**
- `depth` (optional) — Number of levels (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "pair": "BTC/USDT",
    "bids": [
      { "price": "43000.00", "quantity": "1.5" }
    ],
    "asks": [
      { "price": "43100.00", "quantity": "0.8" }
    ],
    "spread": "100.00",
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Wallet API

### GET /api/wallets

List all wallets for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "currency": "BTC",
      "balance": "1.50000000",
      "locked_balance": "0.50000000",
      "wallet_type": "hot",
      "address": "bc1q...",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/wallets/deposit

Process a deposit.

**Request Body:**
```json
{
  "currency": "BTC",
  "amount": "0.5",
  "txHash": "0x..."
}
```

### POST /api/wallets/withdraw

Request a withdrawal.

**Request Body:**
```json
{
  "currency": "BTC",
  "amount": "0.1",
  "address": "bc1q...",
  "network": "BTC"
}
```

---

## Market Data API

### GET /api/market/tickers

Get ticker data for all trading pairs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pair": "BTC/USDT",
      "lastPrice": "43250.50",
      "change24h": "2.34",
      "high24h": "43800.00",
      "low24h": "42100.00",
      "volume24h": "28543.12",
      "quoteVolume": "1234567890.00"
    }
  ]
}
```

### GET /api/market/candlesticks

Get OHLCV candlestick data.

**Query Parameters:**
- `pair` (required) — Trading pair (e.g., BTC/USDT)
- `interval` (required) — Candle interval (1m, 5m, 15m, 1h, 4h, 1D, 1W)
- `limit` (optional) — Number of candles (default: 200)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "time": 1705300800,
      "open": 43000.00,
      "high": 43500.00,
      "low": 42900.00,
      "close": 43250.50,
      "volume": 123.45
    }
  ]
}
```

### WebSocket Feed

Connect to `ws://localhost:3004/ws` for real-time data.

**Subscribe to a channel:**
```json
{
  "type": "subscribe",
  "channel": "ticker",
  "pair": "BTC/USDT"
}
```

**Available channels:**
- `ticker` — Real-time price updates
- `orderbook` — Order book changes
- `trades` — New trade executions
- `candlestick` — Candlestick updates

---

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION | Input validation failed |
| INVALID_CREDENTIALS | Wrong email or password |
| UNAUTHORIZED | Missing or invalid auth token |
| FORBIDDEN | Insufficient permissions |
| CONFLICT | Resource already exists |
| NOT_FOUND | Resource not found |
| RATE_LIMITED | Too many requests |
| INSUFFICIENT_BALANCE | Not enough funds |
| INTERNAL | Internal server error |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Rate Limited |
| 500 | Internal Error |
