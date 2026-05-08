# Market Data Service Documentation

## Overview

Market Data Service provides:
- Real-time ticker data
- OHLCV candle data
- Trade history
- Order book snapshots
- Market statistics

## Features

- 📊 Real-time price tickers
- 📈 Historical OHLCV data
- 💹 Market statistics
- ⚡ Redis caching
- 🔄 MongoDB time-series data
- 📉 Trade history

## REST Endpoints

### GET /api/ticker/:pair

Get current ticker for a pair.

**Response:**
```json
{
  "pair": "BTC/USD",
  "price": "45000.50",
  "bid": "45000.25",
  "ask": "45000.75",
  "high24h": "46000.00",
  "low24h": "44000.00",
  "volume24h": "1000.5",
  "change24h": "500.50",
  "changePercent24h": "1.12",
  "lastUpdate": "2026-05-08T10:00:00Z"
}
```

### GET /api/tickers

Get multiple tickers.

**Query Parameters:**
- `pairs`: Comma-separated pair list (e.g., BTC/USD,ETH/USD)

### GET /api/candles/:pair

Get OHLCV candles.

**Query Parameters:**
- `interval`: 1m, 5m, 15m, 1h, 4h, 1d (default: 1h)
- `limit`: Number of candles (default: 100, max: 1000)
- `startTime`: ISO timestamp
- `endTime`: ISO timestamp

**Response:**
```json
[
  {
    "pair": "BTC/USD",
    "interval": "1h",
    "open": "45000.00",
    "high": "45500.00",
    "low": "44500.00",
    "close": "45250.00",
    "volume": "100.5",
    "timestamp": "2026-05-08T10:00:00Z"
  }
]
```

### GET /api/trades/:pair

Get recent trades.

**Query Parameters:**
- `limit`: Number of trades (default: 100, max: 1000)

### GET /api/orderbook/:pair

Get order book snapshot.

**Response:**
```json
{
  "pair": "BTC/USD",
  "bids": [["45000", "1.5"], ["44999", "2.0"]],
  "asks": [["45001", "1.0"], ["45002", "2.5"]],
  "timestamp": "2026-05-08T10:00:00Z"
}
```

### GET /api/stats/:pair

Get market statistics.

**Query Parameters:**
- `interval`: Candle interval (default: 1d)
- `days`: Number of days (default: 1)

**Response:**
```json
{
  "pair": "BTC/USD",
  "period": "1 day(s)",
  "highest": "46000.00",
  "lowest": "44000.00",
  "average_volume": "500.25",
  "data_points": 24
}
```

## Webhook Endpoints (from Trading Engine)

### POST /api/ticker/:pair

Update ticker.

### POST /api/candles/:pair

Store new candle.

### POST /api/trades

Store trade.

### POST /api/orderbook

Store order book snapshot.

## Environment Variables

```
MONGO_URL=mongodb://admin:password@mongodb:27017/market_data
REDIS_URL=redis://redis:6379
PORT=3000
LOG_LEVEL=debug
```

## Data Storage

- **MongoDB**: Historical data, candles, trades, order books
- **Redis**: Hot data caching (tickers, recent trades)

## Performance

- Ticker query: < 1ms (cached)
- Candle query: < 10ms
- Stats calculation: < 50ms
