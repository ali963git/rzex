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
    <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', height: '100%' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2b3139' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Recent Trades</h3>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '4px 12px', fontSize: '12px', color: '#848e9c' }}>
          <span>Price</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
          <span style={{ textAlign: 'right' }}>Time</span>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {trades.map((trade, i) => (
            <div
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '2px 12px', fontSize: '12px' }}
            >
              <span style={{ fontFamily: 'monospace', color: trade.isBuyerMaker ? '#f6465d' : '#0ecb81' }}>
                {parseFloat(trade.price).toFixed(2)}
              </span>
              <span style={{ textAlign: 'right', fontFamily: 'monospace' }}>{parseFloat(trade.quantity).toFixed(4)}</span>
              <span style={{ textAlign: 'right', color: '#848e9c' }}>{trade.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
