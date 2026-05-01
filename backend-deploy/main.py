"""RZEX Trading Platform - Unified Backend API (SQLite)"""
import os
import uuid
import aiosqlite
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import bcrypt as _bcrypt
from jose import jwt

# --- Config ---
DB_PATH = os.getenv("DATABASE_PATH", "/data/rzex.db")
JWT_SECRET = os.getenv("JWT_SECRET", "rzex-super-secret-jwt-key-2024-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
MAKER_FEE = Decimal("0.001")
TAKER_FEE = Decimal("0.001")


# --- Database ---
async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


# --- In-Memory Order Book ---
class OrderBookEngine:
    def __init__(self):
        self.bids: dict[str, list[dict]] = defaultdict(list)
        self.asks: dict[str, list[dict]] = defaultdict(list)

    def add_order(self, order: dict) -> list[dict]:
        pair = order["pair"]
        side = order["side"]
        order_type = order["type"]
        trades = []

        if order_type == "market":
            trades = self._match_market(order)
        else:
            trades = self._match_limit(order)

        remaining = Decimal(order["remaining_quantity"])
        if order_type == "limit" and remaining > 0:
            if side == "buy":
                self.bids[pair].append(order)
                self.bids[pair].sort(key=lambda o: (-Decimal(o["price"]), o["timestamp"]))
            else:
                self.asks[pair].append(order)
                self.asks[pair].sort(key=lambda o: (Decimal(o["price"]), o["timestamp"]))

        return trades

    def cancel_order(self, pair: str, order_id: str) -> bool:
        for book in [self.bids[pair], self.asks[pair]]:
            for i, o in enumerate(book):
                if o["id"] == order_id:
                    book.pop(i)
                    return True
        return False

    def get_snapshot(self, pair: str, depth: int = 50):
        bid_agg: dict[str, Decimal] = {}
        for o in self.bids.get(pair, [])[:depth * 2]:
            p = o["price"]
            bid_agg[p] = bid_agg.get(p, Decimal(0)) + Decimal(o["remaining_quantity"])

        ask_agg: dict[str, Decimal] = {}
        for o in self.asks.get(pair, [])[:depth * 2]:
            p = o["price"]
            ask_agg[p] = ask_agg.get(p, Decimal(0)) + Decimal(o["remaining_quantity"])

        bids_list = [{"price": p, "quantity": str(q)} for p, q in list(bid_agg.items())[:depth]]
        asks_list = [{"price": p, "quantity": str(q)} for p, q in list(ask_agg.items())[:depth]]

        spread = None
        if bids_list and asks_list:
            spread = str(Decimal(asks_list[0]["price"]) - Decimal(bids_list[0]["price"]))

        return {"pair": pair, "bids": bids_list, "asks": asks_list, "spread": spread, "timestamp": datetime.now(timezone.utc).isoformat()}

    def _match_market(self, order: dict) -> list[dict]:
        trades = []
        pair = order["pair"]
        opposite = self.asks[pair] if order["side"] == "buy" else self.bids[pair]
        remaining = Decimal(order["remaining_quantity"])

        while remaining > 0 and opposite:
            best = opposite[0]
            best_remaining = Decimal(best["remaining_quantity"])
            match_qty = min(remaining, best_remaining)

            trade = {
                "buy_order_id": order["id"] if order["side"] == "buy" else best["id"],
                "sell_order_id": order["id"] if order["side"] == "sell" else best["id"],
                "buyer_id": order["user_id"] if order["side"] == "buy" else best["user_id"],
                "seller_id": order["user_id"] if order["side"] == "sell" else best["user_id"],
                "price": best["price"],
                "quantity": str(match_qty),
            }
            trades.append(trade)
            remaining -= match_qty
            best_remaining -= match_qty
            best["remaining_quantity"] = str(best_remaining)
            if best_remaining <= 0:
                opposite.pop(0)

        order["remaining_quantity"] = str(remaining)
        return trades

    def _match_limit(self, order: dict) -> list[dict]:
        trades = []
        pair = order["pair"]
        opposite = self.asks[pair] if order["side"] == "buy" else self.bids[pair]
        remaining = Decimal(order["remaining_quantity"])
        price = Decimal(order["price"])

        while remaining > 0 and opposite:
            best = opposite[0]
            best_price = Decimal(best["price"])
            if order["side"] == "buy" and price < best_price:
                break
            if order["side"] == "sell" and price > best_price:
                break

            best_remaining = Decimal(best["remaining_quantity"])
            match_qty = min(remaining, best_remaining)

            trade = {
                "buy_order_id": order["id"] if order["side"] == "buy" else best["id"],
                "sell_order_id": order["id"] if order["side"] == "sell" else best["id"],
                "buyer_id": order["user_id"] if order["side"] == "buy" else best["user_id"],
                "seller_id": order["user_id"] if order["side"] == "sell" else best["user_id"],
                "price": best["price"],
                "quantity": str(match_qty),
            }
            trades.append(trade)
            remaining -= match_qty
            best_remaining -= match_qty
            best["remaining_quantity"] = str(best_remaining)
            if best_remaining <= 0:
                opposite.pop(0)

        order["remaining_quantity"] = str(remaining)
        return trades


engine = OrderBookEngine()


# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateWalletRequest(BaseModel):
    userId: str
    currency: str = Field(min_length=2, max_length=10)

class DepositRequest(BaseModel):
    userId: str
    currency: str
    amount: str
    txHash: Optional[str] = None

class WithdrawRequest(BaseModel):
    userId: str
    currency: str
    amount: str
    toAddress: Optional[str] = None

class PlaceOrderRequest(BaseModel):
    userId: str
    pair: str
    side: str
    type: str
    price: Optional[str] = "0"
    quantity: str
    stopPrice: Optional[str] = None

class NotificationRequest(BaseModel):
    userId: str
    type: str
    title: str
    message: str


# --- JWT ---
def create_token(user_id: str, role: str) -> str:
    payload = {
        "userId": user_id,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization[7:]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _uid() -> str:
    return str(uuid.uuid4())


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- Database Init ---
INIT_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    kyc_status TEXT DEFAULT 'none',
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pair TEXT NOT NULL,
    side TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    price TEXT DEFAULT '0',
    quantity TEXT NOT NULL,
    filled_quantity TEXT DEFAULT '0',
    remaining_quantity TEXT NOT NULL,
    stop_price TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    pair TEXT NOT NULL,
    buy_order_id TEXT,
    sell_order_id TEXT,
    buyer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    price TEXT NOT NULL,
    quantity TEXT NOT NULL,
    buyer_fee TEXT DEFAULT '0',
    seller_fee TEXT DEFAULT '0',
    created_at TEXT,
    FOREIGN KEY (buy_order_id) REFERENCES orders(id),
    FOREIGN KEY (sell_order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    balance TEXT DEFAULT '0',
    locked_balance TEXT DEFAULT '0',
    wallet_type TEXT DEFAULT 'hot',
    address TEXT,
    created_at TEXT,
    updated_at TEXT,
    UNIQUE(user_id, currency)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_id TEXT,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    amount TEXT NOT NULL,
    fee TEXT DEFAULT '0',
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    from_address TEXT,
    to_address TEXT,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 6,
    memo TEXT,
    created_at TEXT,
    confirmed_at TEXT,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pair ON orders(pair, status);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    db = await get_db()
    await db.executescript(INIT_SQL)
    await db.commit()
    await db.close()
    yield


# --- App ---
app = FastAPI(
    title="RZEX Trading Platform API",
    description="Professional cryptocurrency trading platform backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================
# Health Check
# ========================
@app.get("/health")
async def health():
    return {"success": True, "data": {"service": "rzex-api", "status": "healthy", "timestamp": _now()}}


@app.get("/api/v1/status")
async def status():
    return {
        "success": True,
        "data": {
            "platform": "RZEX",
            "version": "1.0.0",
            "services": {"auth": "operational", "trading": "operational", "wallet": "operational", "market": "operational", "notifications": "operational"},
            "timestamp": _now(),
        },
    }


# ========================
# Auth Routes
# ========================
@app.post("/api/v1/auth/register")
async def register(req: RegisterRequest):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM users WHERE email = ? OR username = ?", (req.email, req.username))
        if await cursor.fetchone():
            raise HTTPException(409, detail="Email or username already exists")

        user_id = _uid()
        now = _now()
        password_hash = _bcrypt.hashpw(req.password.encode(), _bcrypt.gensalt()).decode()
        await db.execute(
            "INSERT INTO users (id, email, username, password_hash, role, kyc_status, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', 'none', ?, ?)",
            (user_id, req.email, req.username, password_hash, now, now),
        )
        token = create_token(user_id, "user")
        refresh = _uid()
        exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        await db.execute(
            "INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            (_uid(), user_id, refresh, exp, now),
        )
        await db.execute(
            "INSERT INTO audit_logs (id, user_id, action, created_at) VALUES (?, ?, 'register', ?)",
            (_uid(), user_id, now),
        )
        await db.commit()
        return {
            "success": True,
            "data": {
                "user": {"id": user_id, "email": req.email, "username": req.username, "role": "user"},
                "token": token,
                "refreshToken": refresh,
            },
        }
    finally:
        await db.close()


@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE email = ?", (req.email,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(401, detail="Invalid email or password")

        if not _bcrypt.checkpw(req.password.encode(), row["password_hash"].encode()):
            raise HTTPException(401, detail="Invalid email or password")

        user_id = row["id"]
        token = create_token(user_id, row["role"])
        refresh = _uid()
        now = _now()
        exp = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        await db.execute(
            "INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            (_uid(), user_id, refresh, exp, now),
        )
        await db.execute(
            "INSERT INTO audit_logs (id, user_id, action, created_at) VALUES (?, ?, 'login', ?)",
            (_uid(), user_id, now),
        )
        await db.commit()
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user_id,
                    "email": row["email"],
                    "username": row["username"],
                    "role": row["role"],
                    "kycStatus": row["kyc_status"],
                    "twoFactorEnabled": bool(row["two_factor_enabled"]),
                },
                "token": token,
                "refreshToken": refresh,
            },
        }
    finally:
        await db.close()


@app.get("/api/v1/auth/me")
async def get_me(payload: dict = Depends(verify_token)):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM users WHERE id = ?", (payload["userId"],))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, detail="User not found")
        return {
            "success": True,
            "data": {
                "id": row["id"],
                "email": row["email"],
                "username": row["username"],
                "role": row["role"],
                "kycStatus": row["kyc_status"],
                "twoFactorEnabled": bool(row["two_factor_enabled"]),
                "createdAt": row["created_at"],
            },
        }
    finally:
        await db.close()


# ========================
# Wallet Routes
# ========================
@app.get("/api/v1/wallets")
async def get_wallets(userId: str):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, currency, balance, locked_balance, wallet_type, address, created_at FROM wallets WHERE user_id = ? ORDER BY currency",
            (userId,),
        )
        rows = await cursor.fetchall()
        return {"success": True, "data": [dict(r) for r in rows]}
    finally:
        await db.close()


@app.post("/api/v1/wallets")
async def create_wallet(req: CreateWalletRequest):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM wallets WHERE user_id = ? AND currency = ?", (req.userId, req.currency.upper()))
        if await cursor.fetchone():
            raise HTTPException(409, detail="Wallet already exists")
        wallet_id = _uid()
        now = _now()
        await db.execute(
            "INSERT INTO wallets (id, user_id, currency, balance, locked_balance, wallet_type, created_at, updated_at) VALUES (?, ?, ?, '0', '0', 'hot', ?, ?)",
            (wallet_id, req.userId, req.currency.upper(), now, now),
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM wallets WHERE id = ?", (wallet_id,))
        row = await cursor.fetchone()
        return {"success": True, "data": dict(row)}
    finally:
        await db.close()


@app.post("/api/v1/wallets/deposit")
async def deposit(req: DepositRequest):
    amount = Decimal(req.amount)
    if amount <= 0:
        raise HTTPException(400, detail="Amount must be positive")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ?", (req.userId, req.currency.upper()))
        wallet = await cursor.fetchone()

        if not wallet:
            wallet_id = _uid()
            now = _now()
            await db.execute(
                "INSERT INTO wallets (id, user_id, currency, balance, locked_balance, wallet_type, created_at, updated_at) VALUES (?, ?, ?, '0', '0', 'hot', ?, ?)",
                (wallet_id, req.userId, req.currency.upper(), now, now),
            )
        else:
            wallet_id = wallet["id"]

        new_balance = str(Decimal(wallet["balance"] if wallet else "0") + amount)
        await db.execute("UPDATE wallets SET balance = ?, updated_at = ? WHERE id = ?", (new_balance, _now(), wallet_id))

        tx_id = _uid()
        now = _now()
        await db.execute(
            "INSERT INTO transactions (id, user_id, wallet_id, type, currency, amount, status, tx_hash, created_at) VALUES (?, ?, ?, 'deposit', ?, ?, 'confirmed', ?, ?)",
            (tx_id, req.userId, wallet_id, req.currency.upper(), str(amount), req.txHash, now),
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
        tx = await cursor.fetchone()
        return {"success": True, "data": dict(tx)}
    finally:
        await db.close()


@app.post("/api/v1/wallets/withdraw")
async def withdraw(req: WithdrawRequest):
    amount = Decimal(req.amount)
    if amount <= 0:
        raise HTTPException(400, detail="Amount must be positive")

    db = await get_db()
    try:
        cursor = await db.execute("SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ?", (req.userId, req.currency.upper()))
        wallet = await cursor.fetchone()
        if not wallet:
            raise HTTPException(404, detail="Wallet not found")
        if Decimal(wallet["balance"]) < amount:
            raise HTTPException(400, detail="Insufficient balance")

        new_balance = str(Decimal(wallet["balance"]) - amount)
        await db.execute("UPDATE wallets SET balance = ?, updated_at = ? WHERE id = ?", (new_balance, _now(), wallet["id"]))

        tx_id = _uid()
        now = _now()
        await db.execute(
            "INSERT INTO transactions (id, user_id, wallet_id, type, currency, amount, status, to_address, created_at) VALUES (?, ?, ?, 'withdrawal', ?, ?, 'processing', ?, ?)",
            (tx_id, req.userId, wallet["id"], req.currency.upper(), str(amount), req.toAddress, now),
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
        tx = await cursor.fetchone()
        return {"success": True, "data": dict(tx)}
    finally:
        await db.close()


@app.get("/api/v1/wallets/transactions")
async def get_transactions(userId: str, limit: int = 20, offset: int = 0):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (userId, limit, offset),
        )
        rows = await cursor.fetchall()
        return {"success": True, "data": [dict(r) for r in rows]}
    finally:
        await db.close()


# ========================
# Order Routes
# ========================
@app.post("/api/v1/orders")
async def place_order(req: PlaceOrderRequest):
    order_id = _uid()
    price = str(Decimal(req.price or "0"))
    quantity = str(Decimal(req.quantity))
    now = _now()

    db = await get_db()
    try:
        await db.execute(
            "INSERT INTO orders (id, user_id, pair, side, type, price, quantity, filled_quantity, remaining_quantity, stop_price, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, '0', ?, ?, 'pending', ?, ?)",
            (order_id, req.userId, req.pair, req.side, req.type, price, quantity, quantity, req.stopPrice, now, now),
        )

        book_order = {
            "id": order_id, "user_id": req.userId, "pair": req.pair, "side": req.side,
            "type": req.type, "price": price, "quantity": quantity,
            "remaining_quantity": quantity, "timestamp": datetime.now(timezone.utc).timestamp(),
        }

        matches = engine.add_order(book_order)

        for match in matches:
            m_price = Decimal(match["price"])
            m_qty = Decimal(match["quantity"])
            buyer_fee = str(m_price * m_qty * TAKER_FEE)
            seller_fee = str(m_price * m_qty * MAKER_FEE)
            await db.execute(
                "INSERT INTO trades (id, pair, buy_order_id, sell_order_id, buyer_id, seller_id, price, quantity, buyer_fee, seller_fee, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (_uid(), req.pair, match["buy_order_id"], match["sell_order_id"],
                 match["buyer_id"], match["seller_id"], match["price"], match["quantity"],
                 buyer_fee, seller_fee, now),
            )

        remaining = book_order["remaining_quantity"]
        status = "filled" if Decimal(remaining) == 0 else ("partially_filled" if matches else "open")
        filled = str(Decimal(quantity) - Decimal(remaining))
        await db.execute(
            "UPDATE orders SET status = ?, filled_quantity = ?, remaining_quantity = ?, updated_at = ? WHERE id = ?",
            (status, filled, remaining, _now(), order_id),
        )
        await db.commit()
        return {"success": True, "data": {"order": {"id": order_id, "status": status}, "trades": matches}}
    finally:
        await db.close()


@app.delete("/api/v1/orders/{order_id}")
async def cancel_order(order_id: str, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(401, detail="User ID required")
    db = await get_db()
    try:
        cursor = await db.execute("SELECT pair, status FROM orders WHERE id = ? AND user_id = ?", (order_id, x_user_id))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(404, detail="Order not found")
        if row["status"] not in ("open", "partially_filled", "pending"):
            raise HTTPException(400, detail="Order cannot be cancelled")

        engine.cancel_order(row["pair"], order_id)
        await db.execute("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?", (_now(), order_id))
        await db.commit()
        return {"success": True, "data": {"orderId": order_id, "status": "cancelled"}}
    finally:
        await db.close()


@app.get("/api/v1/orders")
async def get_orders(userId: str, pair: Optional[str] = None, status: Optional[str] = None, limit: int = 20, offset: int = 0):
    db = await get_db()
    try:
        query = "SELECT * FROM orders WHERE user_id = ?"
        params: list = [userId]

        if pair:
            query += " AND pair = ?"
            params.append(pair)
        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return {"success": True, "data": [dict(r) for r in rows], "meta": {"limit": limit, "offset": offset}}
    finally:
        await db.close()


@app.get("/api/v1/orders/book/{pair:path}")
async def get_order_book(pair: str, depth: int = 50):
    snapshot = engine.get_snapshot(pair.replace("-", "/"), depth)
    return {"success": True, "data": snapshot}


@app.get("/api/v1/orderbook")
async def get_order_book_query(pair: str, depth: int = 50):
    snapshot = engine.get_snapshot(pair.replace("-", "/"), depth)
    return {"success": True, "data": snapshot}


# ========================
# Trade Routes
# ========================
@app.get("/api/v1/trades")
async def get_trades(pair: str, limit: int = 50):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, pair, price, quantity, buyer_fee, seller_fee, created_at FROM trades WHERE pair = ? ORDER BY created_at DESC LIMIT ?",
            (pair, min(limit, 500)),
        )
        rows = await cursor.fetchall()
        return {"success": True, "data": [dict(r) for r in rows]}
    finally:
        await db.close()


@app.get("/api/v1/trades/user")
async def get_user_trades(userId: str, pair: Optional[str] = None, limit: int = 20, offset: int = 0):
    db = await get_db()
    try:
        query = "SELECT * FROM trades WHERE buyer_id = ? OR seller_id = ?"
        params: list = [userId, userId]
        if pair:
            query += " AND pair = ?"
            params.append(pair)
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return {"success": True, "data": [dict(r) for r in rows]}
    finally:
        await db.close()


# ========================
# Market Data
# ========================
TRADING_PAIRS = [
    {"symbol": "BTC/USDT", "baseAsset": "BTC", "quoteAsset": "USDT", "status": "active", "lastPrice": "67432.50", "change24h": "+2.34", "high24h": "68100.00", "low24h": "65800.00", "volume24h": "12543.82"},
    {"symbol": "ETH/USDT", "baseAsset": "ETH", "quoteAsset": "USDT", "status": "active", "lastPrice": "3521.80", "change24h": "+1.87", "high24h": "3580.00", "low24h": "3450.00", "volume24h": "89421.50"},
    {"symbol": "BNB/USDT", "baseAsset": "BNB", "quoteAsset": "USDT", "status": "active", "lastPrice": "612.40", "change24h": "-0.52", "high24h": "618.00", "low24h": "605.00", "volume24h": "34521.00"},
    {"symbol": "SOL/USDT", "baseAsset": "SOL", "quoteAsset": "USDT", "status": "active", "lastPrice": "178.90", "change24h": "+5.12", "high24h": "182.00", "low24h": "168.50", "volume24h": "156782.30"},
    {"symbol": "XRP/USDT", "baseAsset": "XRP", "quoteAsset": "USDT", "status": "active", "lastPrice": "0.6234", "change24h": "+0.89", "high24h": "0.6350", "low24h": "0.6100", "volume24h": "234567890.00"},
    {"symbol": "ADA/USDT", "baseAsset": "ADA", "quoteAsset": "USDT", "status": "active", "lastPrice": "0.4521", "change24h": "-1.23", "high24h": "0.4620", "low24h": "0.4480", "volume24h": "98765432.00"},
    {"symbol": "DOGE/USDT", "baseAsset": "DOGE", "quoteAsset": "USDT", "status": "active", "lastPrice": "0.1634", "change24h": "+3.45", "high24h": "0.1680", "low24h": "0.1560", "volume24h": "567890123.00"},
    {"symbol": "ETH/BTC", "baseAsset": "ETH", "quoteAsset": "BTC", "status": "active", "lastPrice": "0.05223", "change24h": "-0.47", "high24h": "0.05280", "low24h": "0.05180", "volume24h": "4521.30"},
    {"symbol": "BNB/BTC", "baseAsset": "BNB", "quoteAsset": "BTC", "status": "active", "lastPrice": "0.00908", "change24h": "-2.81", "high24h": "0.00935", "low24h": "0.00900", "volume24h": "12345.60"},
    {"symbol": "SOL/BTC", "baseAsset": "SOL", "quoteAsset": "BTC", "status": "active", "lastPrice": "0.002653", "change24h": "+2.78", "high24h": "0.002700", "low24h": "0.002580", "volume24h": "67890.40"},
]


@app.get("/api/v1/market/pairs")
async def get_pairs():
    return {"success": True, "data": TRADING_PAIRS}


@app.get("/api/v1/market/tickers")
async def get_tickers():
    return {"success": True, "data": TRADING_PAIRS}


@app.get("/api/v1/market/ticker/{pair}")
async def get_ticker(pair: str):
    symbol = pair.replace("-", "/")
    for p in TRADING_PAIRS:
        if p["symbol"] == symbol:
            return {"success": True, "data": p}
    raise HTTPException(404, detail="Ticker not found")


# ========================
# Notifications
# ========================
@app.get("/api/v1/notifications")
async def get_notifications(userId: str, limit: int = 20, offset: int = 0):
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (userId, limit, offset),
        )
        rows = await cursor.fetchall()
        cursor2 = await db.execute("SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND read = 0", (userId,))
        unread_row = await cursor2.fetchone()
        return {"success": True, "data": [dict(r) for r in rows], "meta": {"unread": unread_row["cnt"] if unread_row else 0}}
    finally:
        await db.close()


@app.post("/api/v1/notifications")
async def create_notification(req: NotificationRequest):
    db = await get_db()
    try:
        notif_id = _uid()
        now = _now()
        await db.execute(
            "INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
            (notif_id, req.userId, req.type, req.title, req.message, now),
        )
        await db.commit()
        cursor = await db.execute("SELECT * FROM notifications WHERE id = ?", (notif_id,))
        row = await cursor.fetchone()
        return {"success": True, "data": dict(row)}
    finally:
        await db.close()


@app.patch("/api/v1/notifications/{notification_id}/read")
async def mark_read(notification_id: str):
    db = await get_db()
    try:
        await db.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notification_id,))
        await db.commit()
        return {"success": True, "data": {"id": notification_id, "read": True}}
    finally:
        await db.close()
