'use client';

import React from 'react';

interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBookProps {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export default function OrderBook({ pair, bids, asks }: OrderBookProps) {
  const maxBidQty = Math.max(...bids.map(b => parseFloat(b.quantity)), 1);
  const maxAskQty = Math.max(...asks.map(a => parseFloat(a.quantity)), 1);

  return (
    <div className="bg-rzex-card rounded border border-rzex-border h-full">
      <div className="p-3 border-b border-rzex-border">
        <h3 className="text-sm font-medium">Order Book</h3>
        <span className="text-xs text-rzex-text-secondary">{pair}</span>
      </div>

      <div className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-3 py-1 text-xs text-rzex-text-secondary">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (reversed so lowest ask is at bottom) */}
        <div className="max-h-[200px] overflow-y-auto flex flex-col-reverse">
          {asks.slice(0, 15).map((ask, i) => {
            const total = (parseFloat(ask.price) * parseFloat(ask.quantity)).toFixed(2);
            const widthPercent = (parseFloat(ask.quantity) / maxAskQty) * 100;
            return (
              <div
                key={`ask-${i}`}
                className="grid grid-cols-3 gap-2 px-3 py-0.5 text-xs relative hover:bg-rzex-border/30 cursor-pointer"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-rzex-red/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="text-rzex-red relative z-10 font-mono">{parseFloat(ask.price).toFixed(2)}</span>
                <span className="text-right relative z-10 font-mono">{parseFloat(ask.quantity).toFixed(4)}</span>
                <span className="text-right text-rzex-text-secondary relative z-10 font-mono">{total}</span>
              </div>
            );
          })}
        </div>

        {/* Spread indicator */}
        <div className="px-3 py-2 border-y border-rzex-border text-center">
          <span className="text-sm font-mono text-rzex-green">
            {bids.length > 0 ? parseFloat(bids[0].price).toFixed(2) : '—'}
          </span>
        </div>

        {/* Bids */}
        <div className="max-h-[200px] overflow-y-auto">
          {bids.slice(0, 15).map((bid, i) => {
            const total = (parseFloat(bid.price) * parseFloat(bid.quantity)).toFixed(2);
            const widthPercent = (parseFloat(bid.quantity) / maxBidQty) * 100;
            return (
              <div
                key={`bid-${i}`}
                className="grid grid-cols-3 gap-2 px-3 py-0.5 text-xs relative hover:bg-rzex-border/30 cursor-pointer"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-rzex-green/10"
                  style={{ width: `${widthPercent}%` }}
                />
                <span className="text-rzex-green relative z-10 font-mono">{parseFloat(bid.price).toFixed(2)}</span>
                <span className="text-right relative z-10 font-mono">{parseFloat(bid.quantity).toFixed(4)}</span>
                <span className="text-right text-rzex-text-secondary relative z-10 font-mono">{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
