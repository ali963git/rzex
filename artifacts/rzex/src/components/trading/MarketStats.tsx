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
    <div style={{ backgroundColor: '#1e2329', borderBottom: '1px solid #2b3139', padding: '8px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', overflowX: 'auto' }}>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{pair}</span>
        </div>

        <div>
          <span style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', color: isPositive ? '#0ecb81' : '#f6465d' }}>
            {parseFloat(lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: '#848e9c' }}>24h Change</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isPositive ? '#0ecb81' : '#f6465d' }}>
            {isPositive ? '+' : ''}{change24h}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: '#848e9c' }}>24h High</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{parseFloat(high24h).toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: '#848e9c' }}>24h Low</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{parseFloat(low24h).toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '10px', color: '#848e9c' }}>24h Volume</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{parseFloat(volume24h).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
