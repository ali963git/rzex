'use client';

import React from 'react';

interface PairInfo {
  pair: string;
  lastPrice: string;
  change24h: string;
  volume24h: string;
}

interface PairSelectorProps {
  pairs: PairInfo[];
  selectedPair: string;
  onSelect: (pair: string) => void;
}

export default function PairSelector({ pairs, selectedPair, onSelect }: PairSelectorProps) {
  return (
    <div className="bg-rzex-card border-b border-rzex-border px-4 py-2">
      <div className="flex items-center gap-6 overflow-x-auto">
        {pairs.map((p) => {
          const isPositive = !p.change24h.startsWith('-');
          const isSelected = p.pair === selectedPair;

          return (
            <button
              key={p.pair}
              onClick={() => onSelect(p.pair)}
              className={`flex items-center gap-4 py-1 whitespace-nowrap transition ${
                isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-rzex-accent' : 'text-rzex-text'}`}>
                {p.pair}
              </span>
              <span className="text-sm font-mono">{parseFloat(p.lastPrice).toLocaleString()}</span>
              <span className={`text-xs font-mono ${isPositive ? 'text-rzex-green' : 'text-rzex-red'}`}>
                {isPositive ? '+' : ''}{p.change24h}%
              </span>
              <span className="text-xs text-rzex-text-secondary">
                Vol {parseFloat(p.volume24h).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
