-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  aml_status VARCHAR(50) DEFAULT 'pending',
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR(255),
  phone_number VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL, -- limit, market, stop-limit, OCO
  side VARCHAR(10) NOT NULL, -- buy, sell
  price DECIMAL(18, 8),
  stop_price DECIMAL(18, 8),
  amount DECIMAL(18, 8) NOT NULL,
  filled_amount DECIMAL(18, 8) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, filled, partially_filled, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_pair_status ON orders(pair, status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair VARCHAR(20) NOT NULL,
  price DECIMAL(18, 8) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  buyer_user_id UUID REFERENCES users(id),
  seller_user_id UUID REFERENCES users(id),
  buyer_order_id VARCHAR(255),
  seller_order_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  fee DECIMAL(18, 8) DEFAULT 0,
  fee_asset VARCHAR(10)
);

CREATE INDEX idx_trades_pair ON trades(pair);
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX idx_trades_user_id ON trades(buyer_user_id, seller_user_id);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(20) NOT NULL,
  balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  locked_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  address VARCHAR(255),
  is_hot_wallet BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency ON wallets(currency);
CREATE INDEX idx_wallets_address ON wallets(address);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- deposit, withdrawal, trade
  amount DECIMAL(18, 8) NOT NULL,
  fee DECIMAL(18, 8) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
  tx_hash VARCHAR(255),
  blockchain VARCHAR(50),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  secret_hash VARCHAR(255) NOT NULL,
  permissions TEXT NOT NULL, -- JSON array
  ip_whitelist TEXT, -- JSON array
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE INDEX idx_settings_user_id ON settings(user_id);

-- Market Pairs Table
CREATE TABLE IF NOT EXISTS market_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) UNIQUE NOT NULL, -- BTC/USD
  base_asset VARCHAR(20) NOT NULL,
  quote_asset VARCHAR(20) NOT NULL,
  min_order_size DECIMAL(18, 8),
  max_order_size DECIMAL(18, 8),
  tick_size DECIMAL(18, 8),
  maker_fee DECIMAL(6, 4),
  taker_fee DECIMAL(6, 4),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_pairs_symbol ON market_pairs(symbol);
CREATE INDEX idx_market_pairs_active ON market_pairs(is_active);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- order_filled, deposit, withdrawal
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
