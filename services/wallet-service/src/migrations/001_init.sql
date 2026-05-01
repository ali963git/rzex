-- RZEX Wallet Service — Initial Schema
-- Wallets, transactions, addresses

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(30, 18) DEFAULT 0,
    locked_balance DECIMAL(30, 18) DEFAULT 0,
    wallet_type VARCHAR(10) DEFAULT 'hot' CHECK (wallet_type IN ('hot', 'cold')),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'fee', 'transfer', 'fiat_deposit', 'fiat_withdrawal')),
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(30, 18) NOT NULL,
    fee DECIMAL(30, 18) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled', 'processing')),
    tx_hash VARCHAR(255),
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 6,
    network VARCHAR(50),
    memo TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposit addresses
CREATE TABLE IF NOT EXISTS deposit_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    currency VARCHAR(10) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    memo VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency, network)
);

-- Withdrawal limits
CREATE TABLE IF NOT EXISTS withdrawal_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kyc_level INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL,
    daily_limit DECIMAL(30, 18) NOT NULL,
    monthly_limit DECIMAL(30, 18) NOT NULL,
    min_withdrawal DECIMAL(30, 18) NOT NULL,
    withdrawal_fee DECIMAL(30, 18) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kyc_level, currency)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_deposit_addresses_user ON deposit_addresses(user_id);

-- Seed withdrawal limits
INSERT INTO withdrawal_limits (kyc_level, currency, daily_limit, monthly_limit, min_withdrawal, withdrawal_fee) VALUES
    (0, 'BTC', 0.1, 1, 0.001, 0.0005),
    (0, 'ETH', 2, 20, 0.01, 0.005),
    (0, 'USDT', 1000, 10000, 10, 5),
    (1, 'BTC', 2, 20, 0.001, 0.0003),
    (1, 'ETH', 50, 500, 0.01, 0.003),
    (1, 'USDT', 50000, 500000, 10, 2),
    (2, 'BTC', 100, 1000, 0.001, 0.0001),
    (2, 'ETH', 2000, 20000, 0.01, 0.001),
    (2, 'USDT', 1000000, 10000000, 10, 1)
ON CONFLICT (kyc_level, currency) DO NOTHING;
