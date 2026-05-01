<div align="center">
  <h1>RZEX</h1>
  <p><strong>Professional Cryptocurrency Trading Platform</strong></p>
  <p>A full-featured, production-ready crypto exchange built with microservices architecture</p>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-4.9+-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Docker-Ready-blue?logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/Kubernetes-Ready-blue?logo=kubernetes" alt="Kubernetes" />
  </p>
</div>

---

## Overview

RZEX is a professional-grade cryptocurrency trading platform designed to rival platforms like Binance. It features a high-performance matching engine, real-time market data, secure wallet management, and a modern trading interface.

### Key Features

- **High-Performance Matching Engine** — Order matching with support for Limit, Market, Stop-Limit, and OCO orders
- **Real-Time Market Data** — WebSocket-powered live price updates, candlestick charts, and depth charts
- **Secure Wallet Management** — Hot/Cold wallet architecture with multi-signature support
- **Professional Trading UI** — Real-time order book, depth chart, TradingView-style charts, trade forms
- **User Management** — Registration, authentication, KYC/AML verification, 2FA
- **Microservices Architecture** — Independent, scalable services for each domain
- **Monitoring & Analytics** — Prometheus + Grafana dashboards with alerting
- **Production Ready** — Docker, Kubernetes, CI/CD, security hardening

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  Trading UI · Dashboard · Wallet · Markets · Orders          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Gateway (:3000)                        │
│  Rate Limiting · Auth · Request Routing · Load Balancing     │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐
│User  │  │Trade │  │Wallet│  │Market│  │Notif.    │
│Svc   │  │Engine│  │Svc   │  │Data  │  │Service   │
│:3001 │  │:3002 │  │:3003 │  │:3004 │  │:3005     │
└──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───────┘
   │         │         │         │          │
   ▼         ▼         ▼         ▼          ▼
┌──────────────────┐  ┌─────┐  ┌──────────────────┐
│   PostgreSQL     │  │Redis│  │    MongoDB        │
│  Users, Orders   │  │Cache│  │  Market Data      │
│  Wallets, Trades │  │ WS  │  │  Candlesticks     │
└──────────────────┘  └─────┘  └──────────────────┘
```

## Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (v2)
- **Node.js** >= 18 (for local development)

### One-Command Launch

```bash
# Clone the repository
git clone https://github.com/ali963git/rzex.git
cd rzex

# Start everything
bash scripts/deploy.sh development
```

This starts all services, databases, and monitoring tools:

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3010 |
| API Gateway | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3020 (admin/admin) |

### Local Frontend Development

```bash
cd frontend/web
npm install
npm run dev
# → http://localhost:3010
```

### Backend Development

```bash
# Start databases
docker compose up -d postgres redis mongo

# Run individual service
cd services/trading-engine
npm install
npm run dev
```

## Project Structure

```
rzex/
├── frontend/
│   └── web/                    # Next.js 14 Trading UI
│       ├── src/app/            # Pages (trade, markets, wallet, orders, dashboard, login, register)
│       ├── src/components/     # React components (trading, layout, common)
│       └── src/lib/            # API client, utilities
├── services/
│   ├── api-gateway/            # Request routing, rate limiting, auth proxy
│   ├── user-service/           # Auth, KYC, 2FA, session management
│   ├── trading-engine/         # Order matching, order book management
│   ├── wallet-service/         # Deposits, withdrawals, balance management
│   ├── market-data-service/    # WebSocket feeds, candlesticks, tickers
│   └── notification-service/   # Email, push, WebSocket notifications
├── packages/
│   └── shared/                 # Shared types, constants, utilities
├── infra/
│   ├── kubernetes/             # K8s manifests (deployments, services, ingress)
│   ├── monitoring/             # Prometheus & Grafana configs
│   └── nginx/                  # Reverse proxy configuration
├── scripts/
│   └── deploy.sh               # Deployment script (dev/prod/k8s)
├── docs/
│   ├── api/                    # API documentation
│   └── deployment/             # Deployment guides
├── docker-compose.yml          # Local development orchestration
└── .github/workflows/          # CI/CD pipelines
```

## Services

### API Gateway (Port 3000)
- Request routing to microservices
- Rate limiting (100 req/15min per IP)
- CORS, Helmet security headers
- Request/response compression

### User Service (Port 3001)
- User registration and authentication (JWT)
- Refresh token rotation
- KYC/AML document verification
- Two-Factor Authentication (2FA)
- Role-Based Access Control (RBAC)
- Audit logging

### Trading Engine (Port 3002)
- High-performance order matching
- Order types: Limit, Market, Stop-Limit, OCO
- Per-pair order book management
- Atomic balance updates
- Trade fee calculation (maker/taker)
- Paper trading support

### Wallet Service (Port 3003)
- Multi-currency wallet management
- Deposit/withdrawal processing
- Hot and Cold wallet support
- Transaction history
- Withdrawal limits by KYC level
- Atomic balance operations

### Market Data Service (Port 3004)
- WebSocket real-time price feeds
- REST API for historical data
- Candlestick aggregation (1m, 5m, 15m, 1h, 4h, 1D, 1W)
- Ticker data for all trading pairs
- MongoDB storage for time-series data

### Notification Service (Port 3005)
- Order execution notifications
- Deposit/withdrawal alerts
- Security alerts (login, 2FA)
- WebSocket push notifications

## API Reference

### Authentication
```
POST /api/auth/register    — Register new user
POST /api/auth/login       — Login and receive JWT
POST /api/auth/refresh     — Refresh access token
POST /api/auth/2fa/setup   — Setup 2FA
POST /api/auth/2fa/verify  — Verify 2FA code
GET  /api/auth/profile     — Get user profile
```

### Trading
```
POST   /api/orders          — Place new order
GET    /api/orders           — List orders (with filters)
DELETE /api/orders/:id       — Cancel order
GET    /api/orders/:id       — Get order details
GET    /api/orderbook/:pair  — Get order book snapshot
```

### Wallets
```
GET  /api/wallets            — List user wallets
POST /api/wallets            — Create wallet for currency
POST /api/wallets/deposit    — Process deposit
POST /api/wallets/withdraw   — Request withdrawal
GET  /api/wallets/history    — Transaction history
```

### Market Data
```
GET /api/market/tickers            — All ticker data
GET /api/market/ticker/:pair       — Single pair ticker
GET /api/market/candlesticks       — Historical OHLCV data
GET /api/market/trades/:pair       — Recent trades
WS  ws://localhost:3004/ws         — Real-time WebSocket feed
```

## Databases

| Database | Purpose | Port |
|----------|---------|------|
| PostgreSQL 16 | Users, orders, wallets, trades, audit logs | 5432 |
| Redis 7 | Caching, order book pub/sub, sessions | 6379 |
| MongoDB 7 | Market data, candlesticks, time-series | 27017 |

## Security

- **TLS/SSL** encryption for all connections
- **JWT** with short-lived access tokens + refresh token rotation
- **bcrypt** password hashing (12 rounds)
- **Rate limiting** on all endpoints
- **Helmet** security headers
- **CORS** configuration
- **2FA** (TOTP) support
- **KYC/AML** verification pipeline
- **RBAC** for API access control
- **Audit logging** for all user actions
- **Input validation** on all endpoints
- **SQL injection** prevention (parameterized queries)
- **DDoS protection** via rate limiting

## Monitoring

### Prometheus (Port 9090)
- Service health metrics
- Request latency histograms
- Order execution metrics
- Database connection pool stats

### Grafana (Port 3020)
- Pre-configured dashboards
- Trading volume analytics
- System performance monitoring
- Alert rules for anomalies

## Deployment

### Docker Compose (Development)
```bash
bash scripts/deploy.sh development
```

### Kubernetes (Production)
```bash
# Set your container registry
export DOCKER_REGISTRY=your-registry.com

# Build, push, and deploy
bash scripts/deploy.sh production
```

### AWS EKS
```bash
# 1. Create EKS cluster
eksctl create cluster --name rzex --region us-east-1 --nodes 3

# 2. Deploy
bash scripts/deploy.sh production
```

## Environment Variables

See `.env.example` for a complete list of configuration variables.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS, Lightweight Charts |
| Backend | Node.js 18, Express, TypeScript |
| Databases | PostgreSQL 16, Redis 7, MongoDB 7 |
| Infrastructure | Docker, Kubernetes, Nginx |
| Monitoring | Prometheus, Grafana |
| CI/CD | GitHub Actions |
| Security | JWT, bcrypt, Helmet, CORS, Rate Limiting |

## License

MIT License — see [LICENSE](LICENSE) for details.
