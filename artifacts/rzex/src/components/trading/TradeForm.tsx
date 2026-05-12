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
    <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2b3139' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Place Order</h3>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: '#0b0e11', borderRadius: '4px', padding: '2px' }}>
          <button
            onClick={() => setSide('buy')}
            style={{
              padding: '8px', borderRadius: '4px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: side === 'buy' ? '#0ecb81' : 'transparent',
              color: side === 'buy' ? 'white' : '#848e9c',
            }}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            style={{
              padding: '8px', borderRadius: '4px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: side === 'sell' ? '#f6465d' : 'transparent',
              color: side === 'sell' ? 'white' : '#848e9c',
            }}
          >
            Sell
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <button
            onClick={() => setOrderType('limit')}
            style={{
              background: 'none', border: 'none', borderBottom: `2px solid ${orderType === 'limit' ? '#f0b90b' : 'transparent'}`,
              cursor: 'pointer', color: orderType === 'limit' ? '#eaecef' : '#848e9c', transition: 'all 0.2s', paddingBottom: '4px',
            }}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType('market')}
            style={{
              paddingBottom: '4px',
              background: 'none', border: 'none', borderBottom: `2px solid ${orderType === 'market' ? '#f0b90b' : 'transparent'}`,
              cursor: 'pointer', color: orderType === 'market' ? '#eaecef' : '#848e9c', transition: 'all 0.2s',
            }}
          >
            Market
          </button>
        </div>

        {orderType === 'limit' && (
          <div>
            <label style={{ fontSize: '12px', color: '#848e9c', display: 'block', marginBottom: '4px' }}>Price ({quote})</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
                padding: '8px 12px', fontSize: '14px', fontFamily: 'monospace', color: '#eaecef',
                outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: '12px', color: '#848e9c', display: 'block', marginBottom: '4px' }}>Amount ({base})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
              padding: '8px 12px', fontSize: '14px', fontFamily: 'monospace', color: '#eaecef',
              outline: 'none', boxSizing: 'border-box',
            }}
            placeholder="0.0000"
            step="0.0001"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px' }}>
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              style={{
                fontSize: '12px', padding: '4px', backgroundColor: '#0b0e11', border: '1px solid #2b3139',
                borderRadius: '4px', color: '#848e9c', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#848e9c' }}>Total</span>
          <span style={{ fontFamily: 'monospace' }}>{total} {quote}</span>
        </div>

        <button
          style={{
            width: '100%', padding: '12px', borderRadius: '4px', fontWeight: '500', fontSize: '14px',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', color: 'white',
            backgroundColor: side === 'buy' ? '#0ecb81' : '#f6465d',
          }}
        >
          {side === 'buy' ? `Buy ${base}` : `Sell ${base}`}
        </button>
      </div>
    </div>
  );
}
