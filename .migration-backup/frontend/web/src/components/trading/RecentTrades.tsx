'use client';

import React from 'react';

interface Trade {
  price: string;
  quantity: string;
  time: string;
  isBuyerMaker: boolean;
}

interface RecentTradesProps {
  trades: Trade[];
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="bg-rzex-card rounded border border-rzex-border h-full">
      <div className="p-3 border-b border-rzex-border">
        <h3 className="text-sm font-medium">Recent Trades</h3>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-3 py-1 text-xs text-rzex-text-secondary">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {trades.map((trade, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-2 px-3 py-0.5 text-xs hover:bg-rzex-border/30"
            >
              <span className={`font-mono ${trade.isBuyerMaker ? 'text-rzex-red' : 'text-rzex-green'}`}>
                {parseFloat(trade.price).toFixed(2)}
              </span>
              <span className="text-right font-mono">{parseFloat(trade.quantity).toFixed(4)}</span>
              <span className="text-right text-rzex-text-secondary">{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
