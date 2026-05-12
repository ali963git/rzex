'use client';

import React from 'react';

interface MarketStatsProps {
  pair: string;
  lastPrice: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function MarketStats({ pair, lastPrice, change24h, high24h, low24h, volume24h }: MarketStatsProps) {
  const changeNum = parseFloat(change24h);
  const isPositive = changeNum >= 0;

  return (
    <div className="bg-rzex-card border-b border-rzex-border px-4 py-2">
      <div className="flex items-center gap-8 overflow-x-auto">
        <div>
          <span className="text-lg font-bold">{pair}</span>
        </div>

        <div>
          <span className={`text-xl font-mono font-bold ${isPositive ? 'text-rzex-green' : 'text-rzex-red'}`}>
            {parseFloat(lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-rzex-text-secondary">24h Change</span>
          <span className={`text-xs font-mono ${isPositive ? 'text-rzex-green' : 'text-rzex-red'}`}>
            {isPositive ? '+' : ''}{change24h}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-rzex-text-secondary">24h High</span>
          <span className="text-xs font-mono">{parseFloat(high24h).toLocaleString()}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-rzex-text-secondary">24h Low</span>
          <span className="text-xs font-mono">{parseFloat(low24h).toLocaleString()}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-rzex-text-secondary">24h Volume</span>
          <span className="text-xs font-mono">{parseFloat(volume24h).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
