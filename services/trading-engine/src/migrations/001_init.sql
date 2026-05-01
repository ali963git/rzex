-- RZEX Trading Engine — Initial Schema
-- Orders, trades, trading pairs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trading pairs
CREATE TABLE IF NOT EXISTS trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    min_quantity DECIMAL(30, 18) DEFAULT 0.00000001,
    max_quantity DECIMAL(30, 18) DEFAULT 999999999,
    quantity_step DECIMAL(30, 18) DEFAULT 0.00000001,
    min_price DECIMAL(30, 18) DEFAULT 0.00000001,
    max_price DECIMAL(30, 18) DEFAULT 999999999,
    price_step DECIMAL(30, 18) DEFAULT 0.01,
    min_notional DECIMAL(30, 18) DEFAULT 10,
    maker_fee DECIMAL(10, 6) DEFAULT 0.001,
    taker_fee DECIMAL(10, 6) DEFAULT 0.001,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    pair VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('limit', 'market', 'stop_limit', 'oco')),
    price DECIMAL(30, 18),
    quantity DECIMAL(30, 18) NOT NULL,
    filled_quantity DECIMAL(30, 18) DEFAULT 0,
    remaining_quantity DECIMAL(30, 18) NOT NULL,
    stop_price DECIMAL(30, 18),
    time_in_force VARCHAR(5) DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'filled', 'cancelled', 'pending', 'expired', 'rejected')),
    is_paper BOOLEAN DEFAULT FALSE,
    client_order_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair VARCHAR(20) NOT NULL,
    buy_order_id UUID NOT NULL REFERENCES orders(id),
    sell_order_id UUID NOT NULL REFERENCES orders(id),
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    price DECIMAL(30, 18) NOT NULL,
    quantity DECIMAL(30, 18) NOT NULL,
    buyer_fee DECIMAL(30, 18) DEFAULT 0,
    seller_fee DECIMAL(30, 18) DEFAULT 0,
    is_buyer_maker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pair ON orders(pair);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_pair_status ON orders(user_id, pair, status);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller ON trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at);

-- Seed initial trading pairs
INSERT INTO trading_pairs (symbol, base_currency, quote_currency, maker_fee, taker_fee) VALUES
    ('BTC/USDT', 'BTC', 'USDT', 0.001, 0.001),
    ('ETH/USDT', 'ETH', 'USDT', 0.001, 0.001),
    ('BNB/USDT', 'BNB', 'USDT', 0.001, 0.001),
    ('SOL/USDT', 'SOL', 'USDT', 0.001, 0.001),
    ('XRP/USDT', 'XRP', 'USDT', 0.001, 0.001),
    ('ADA/USDT', 'ADA', 'USDT', 0.001, 0.001),
    ('DOGE/USDT', 'DOGE', 'USDT', 0.001, 0.001),
    ('DOT/USDT', 'DOT', 'USDT', 0.001, 0.001),
    ('AVAX/USDT', 'AVAX', 'USDT', 0.001, 0.001),
    ('MATIC/USDT', 'MATIC', 'USDT', 0.001, 0.001),
    ('ETH/BTC', 'ETH', 'BTC', 0.001, 0.001),
    ('BNB/BTC', 'BNB', 'BTC', 0.001, 0.001)
ON CONFLICT (symbol) DO NOTHING;
