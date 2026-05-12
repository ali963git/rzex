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
    <div style={{ backgroundColor: '#1e2329', borderBottom: '1px solid #2b3139', padding: '8px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', overflowX: 'auto' }}>
        {pairs.map((p) => {
          const isPositive = !p.change24h.startsWith('-');
          const isSelected = p.pair === selectedPair;

          return (
            <button
              key={p.pair}
              onClick={() => onSelect(p.pair)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '4px 0',
                whiteSpace: 'nowrap',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? '#f0b90b' : '#eaecef' }}>
                {p.pair}
              </span>
              <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                {parseFloat(p.lastPrice).toLocaleString()}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isPositive ? '#0ecb81' : '#f6465d' }}>
                {isPositive ? '+' : ''}{p.change24h}%
              </span>
              <span style={{ fontSize: '12px', color: '#848e9c' }}>
                Vol {parseFloat(p.volume24h).toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
