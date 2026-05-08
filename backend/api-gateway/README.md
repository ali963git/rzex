# API Gateway Documentation

## Overview

The API Gateway serves as the single entry point for all client requests. It handles:
- Request routing to appropriate microservices
- JWT authentication
- Rate limiting
- CORS handling
- Security headers
- Request/response logging

## Features

- 🔐 JWT Authentication
- ⚡ Rate Limiting
- 🛡️ Security Headers (Helmet)
- 📊 Request Logging
- 🔄 Service Proxying
- 📝 Request Validation

## Service Routes

### Public Routes (No Authentication Required)

#### Authentication
- `POST /api/auth/register` → User Service
- `POST /api/auth/login` → User Service
- `POST /api/auth/logout` → User Service

#### Market Data
- `GET /api/ticker/:pair` → Market Data Service
- `GET /api/tickers` → Market Data Service
- `GET /api/candles/:pair` → Market Data Service
- `GET /api/trades/:pair` → Market Data Service
- `GET /api/orderbook/:pair` → Market Data Service
- `GET /api/stats/:pair` → Market Data Service

### Protected Routes (JWT Required)

#### User Management
- `GET /api/users/me` → User Service
- `PUT /api/users/me` → User Service
- `POST /api/auth/change-password` → User Service
- `POST /api/kyc/verify` → User Service

#### Wallet Management
- `GET /api/wallets` → Wallet Service
- `GET /api/wallets/:currency` → Wallet Service
- `POST /api/wallets/deposit` → Wallet Service
- `POST /api/wallets/withdraw` → Wallet Service
- `GET /api/transactions` → Wallet Service
- `POST /api/wallets/:wallet_id/lock` → Wallet Service
- `POST /api/wallets/:wallet_id/unlock` → Wallet Service
- `POST /api/wallets/transfer` → Wallet Service

#### Trading
- `POST /api/orders` → Trading Engine
- `GET /api/orders` → Trading Engine
- `GET /api/orders/:order_id` → Trading Engine
- `POST /api/orders/:order_id/cancel` → Trading Engine
- `GET /api/users/:user_id/orders` → Trading Engine

## Rate Limiting

### Default Rate Limits
- General requests: 100 requests per 15 minutes per IP
- Auth requests: 5 requests per 15 minutes per IP
- Market Data: No limit (public endpoints)

## Security

- CORS enabled with configurable origins
- Helmet.js for HTTP security headers
- Rate limiting to prevent abuse
- JWT token validation on protected routes
- Input validation and sanitization

## Environment Variables

```
PORT=3000
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3010
REDIS_URL=redis://redis:6379
USER_SERVICE_URL=http://user-service:3000
TRADING_ENGINE_URL=http://trading-engine:3000
MARKET_DATA_URL=http://market-data-service:3000
WALLET_SERVICE_URL=http://wallet-service:3000
NOTIFICATION_URL=http://notification-service:3000
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later"
}
```

### 404 Not Found
```json
{
  "error": "Route not found"
}
```

## Performance

- Average response time: < 100ms
- Request proxying overhead: < 10ms
- Rate limit check: < 5ms
