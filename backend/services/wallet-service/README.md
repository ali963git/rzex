# Wallet Service Documentation

## Overview

Wallet Service manages:
- User wallet creation and management
- Deposits and withdrawals
- Balance tracking
- Transaction history
- Multi-currency support
- Hot/Cold wallet management

## Features

- 🔐 Secure balance management
- 💰 Multi-currency support
- 🔒 Balance locking for trading
- 📊 Transaction history
- ⚡ Real-time balance updates
- 💳 Deposit/Withdrawal processing
- 🔄 Inter-wallet transfers

## REST Endpoints

### GET /api/wallets

Get all user wallets (requires authentication).

**Response:**
```json
[
  {
    "id": "wallet_uuid",
    "currency": "BTC",
    "balance": "10.5",
    "locked_balance": "2.0",
    "address": "1A1z7agoat",
    "is_hot_wallet": true
  }
]
```

### GET /api/wallets/:currency

Get specific wallet balance.

**Response:**
```json
{
  "currency": "BTC",
  "balance": "10.5",
  "locked_balance": "2.0",
  "available": "8.5",
  "address": "1A1z7agoat",
  "is_hot_wallet": true
}
```

### POST /api/wallets/deposit

Deposit cryptocurrency.

**Request:**
```json
{
  "currency": "BTC",
  "amount": "1.5",
  "tx_hash": "0x123abc...",
  "blockchain": "bitcoin"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "tx_uuid",
  "amount": "1.4985",
  "fee": "0.0015",
  "status": "confirmed"
}
```

### POST /api/wallets/withdraw

Withdraw cryptocurrency.

**Request:**
```json
{
  "currency": "BTC",
  "amount": "1.0",
  "to_address": "1A1z7agoat"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "tx_uuid",
  "amount": "1.0",
  "fee": "0.005",
  "status": "pending"
}
```

### GET /api/transactions

Get transaction history.

**Query Parameters:**
- `currency`: Filter by currency
- `status`: Filter by status (pending, confirmed, failed)
- `limit`: Number of results (default: 50, max: 100)

**Response:**
```json
[
  {
    "id": "tx_uuid",
    "type": "deposit",
    "amount": "1.5",
    "fee": "0.0015",
    "status": "confirmed",
    "tx_hash": "0x123abc...",
    "created_at": "2026-05-08T10:00:00Z"
  }
]
```

### POST /api/wallets/:wallet_id/lock

Lock balance for trading.

**Request:**
```json
{
  "amount": "2.0"
}
```

### POST /api/wallets/:wallet_id/unlock

Unlock balance.

**Request:**
```json
{
  "amount": "2.0"
}
```

### POST /api/wallets/transfer

Transfer between user's wallets.

**Request:**
```json
{
  "from_wallet_id": "wallet_uuid",
  "to_wallet_id": "wallet_uuid",
  "amount": "1.0"
}
```

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

## Security

- All operations require authentication
- Balance locking prevents double-spending
- Transactions use database ACID compliance
- Fee calculations use Decimal.js for precision
- Automatic balance reconciliation
