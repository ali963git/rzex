import React from 'react';

interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: string;
  price: string;
  quantity: string;
  filled: string;
  status: string;
  time: string;
}

interface OpenOrdersProps {
  orders: Order[];
}

export default function OpenOrders({ orders }: OpenOrdersProps) {
  return (
    <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2b3139', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
          <button style={{ color: '#eaecef', paddingBottom: '4px', background: 'none', border: 'none', borderBottom: '2px solid #f0b90b', cursor: 'pointer' }}>
            Open Orders ({orders.length})
          </button>
          <button style={{ color: '#848e9c', paddingBottom: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>Order History</button>
          <button style={{ color: '#848e9c', paddingBottom: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>Trade History</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ fontSize: '12px', color: '#848e9c' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Time</th>
              <th style={{ textAlign: 'left' }}>Pair</th>
              <th style={{ textAlign: 'left' }}>Side</th>
              <th style={{ textAlign: 'left' }}>Type</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Filled</th>
              <th style={{ textAlign: 'right' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '8px 12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#848e9c', fontSize: '14px' }}>
                  No open orders
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} style={{ fontSize: '12px' }}>
                  <td style={{ padding: '8px 12px', color: '#848e9c' }}>{order.time}</td>
                  <td>{order.pair}</td>
                  <td style={{ color: order.side === 'buy' ? '#0ecb81' : '#f6465d' }}>{order.side.toUpperCase()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{order.type}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{parseFloat(order.price).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{parseFloat(order.quantity).toFixed(4)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{order.filled}%</td>
                  <td style={{ textAlign: 'right', textTransform: 'capitalize' }}>{order.status}</td>
                  <td style={{ textAlign: 'right', padding: '8px 12px' }}>
                    <button style={{ color: '#f6465d', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
