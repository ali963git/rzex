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
    <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', height: '100%' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2b3139' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Order Book</h3>
        <span style={{ fontSize: '12px', color: '#848e9c' }}>{pair}</span>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '4px 12px', fontSize: '12px', color: '#848e9c' }}>
          <span>Price</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
          <span style={{ textAlign: 'right' }}>Total</span>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
          {asks.slice(0, 15).map((ask, i) => {
            const total = (parseFloat(ask.price) * parseFloat(ask.quantity)).toFixed(2);
            const widthPercent = (parseFloat(ask.quantity) / maxAskQty) * 100;
            return (
              <div
                key={`ask-${i}`}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '2px 12px', fontSize: '12px', position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', inset: 0, right: 0, left: 'auto', width: `${widthPercent}%`, backgroundColor: 'rgba(246, 70, 93, 0.1)' }} />
                <span style={{ color: '#f6465d', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{parseFloat(ask.price).toFixed(2)}</span>
                <span style={{ textAlign: 'right', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{parseFloat(ask.quantity).toFixed(4)}</span>
                <span style={{ textAlign: 'right', color: '#848e9c', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{total}</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '8px 12px', borderTop: '1px solid #2b3139', borderBottom: '1px solid #2b3139', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#0ecb81' }}>
            {bids.length > 0 ? parseFloat(bids[0].price).toFixed(2) : '—'}
          </span>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {bids.slice(0, 15).map((bid, i) => {
            const total = (parseFloat(bid.price) * parseFloat(bid.quantity)).toFixed(2);
            const widthPercent = (parseFloat(bid.quantity) / maxBidQty) * 100;
            return (
              <div
                key={`bid-${i}`}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '2px 12px', fontSize: '12px', position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', inset: 0, right: 0, left: 'auto', width: `${widthPercent}%`, backgroundColor: 'rgba(14, 203, 129, 0.1)' }} />
                <span style={{ color: '#0ecb81', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{parseFloat(bid.price).toFixed(2)}</span>
                <span style={{ textAlign: 'right', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{parseFloat(bid.quantity).toFixed(4)}</span>
                <span style={{ textAlign: 'right', color: '#848e9c', position: 'relative', zIndex: 1, fontFamily: 'monospace' }}>{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
