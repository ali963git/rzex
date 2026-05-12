'use client';

import React, { useState } from 'react';

interface TradeFormProps {
  pair: string;
  lastPrice: string;
}

export default function TradeForm({ pair, lastPrice }: TradeFormProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState(lastPrice);
  const [amount, setAmount] = useState('');

  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : '0.00';
  const [base, quote] = pair.split('/');

  return (
    <div className="bg-rzex-card rounded border border-rzex-border">
      <div className="p-3 border-b border-rzex-border">
        <h3 className="text-sm font-medium">Place Order</h3>
      </div>

      <div className="p-3 space-y-3">
        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-rzex-bg rounded p-0.5">
          <button
            onClick={() => setSide('buy')}
            className={`py-2 rounded text-sm font-medium transition ${
              side === 'buy'
                ? 'bg-rzex-green text-white'
                : 'text-rzex-text-secondary hover:text-rzex-text'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-2 rounded text-sm font-medium transition ${
              side === 'sell'
                ? 'bg-rzex-red text-white'
                : 'text-rzex-text-secondary hover:text-rzex-text'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-3 text-xs">
          <button
            onClick={() => setOrderType('limit')}
            className={`pb-1 border-b-2 transition ${
              orderType === 'limit'
                ? 'border-rzex-accent text-rzex-text'
                : 'border-transparent text-rzex-text-secondary'
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType('market')}
            className={`pb-1 border-b-2 transition ${
              orderType === 'market'
                ? 'border-rzex-accent text-rzex-text'
                : 'border-transparent text-rzex-text-secondary'
            }`}
          >
            Market
          </button>
        </div>

        {/* Price Input */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-rzex-text-secondary mb-1 block">Price ({quote})</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2 text-sm font-mono focus:border-rzex-accent outline-none"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="text-xs text-rzex-text-secondary mb-1 block">Amount ({base})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2 text-sm font-mono focus:border-rzex-accent outline-none"
            placeholder="0.0000"
            step="0.0001"
          />
        </div>

        {/* Percentage buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              className="text-xs py-1 bg-rzex-bg border border-rzex-border rounded text-rzex-text-secondary hover:text-rzex-text hover:border-rzex-accent transition"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-xs">
          <span className="text-rzex-text-secondary">Total</span>
          <span className="font-mono">{total} {quote}</span>
        </div>

        {/* Submit */}
        <button
          className={`w-full py-3 rounded font-medium text-sm transition ${
            side === 'buy'
              ? 'bg-rzex-green hover:opacity-90 text-white'
              : 'bg-rzex-red hover:opacity-90 text-white'
          }`}
        >
          {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
        </button>
      </div>
    </div>
  );
}
