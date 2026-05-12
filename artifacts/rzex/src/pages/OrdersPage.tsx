import React, { useState } from 'react';
import Header from '../components/layout/Header';

interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: string;
  price: string;
  quantity: string;
  filled: string;
  total: string;
  status: string;
  date: string;
}

const demoOpenOrders: Order[] = [
  { id: 'ord-001', pair: 'BTC/USDT', side: 'buy', type: 'Limit', price: '42000.00', quantity: '0.5000', filled: '0.0000', total: '21,000.00', status: 'Open', date: '2024-01-15 14:30' },
  { id: 'ord-002', pair: 'ETH/USDT', side: 'sell', type: 'Limit', price: '2400.00', quantity: '3.0000', filled: '1.2000', total: '7,200.00', status: 'Partial', date: '2024-01-15 13:15' },
  { id: 'ord-003', pair: 'SOL/USDT', side: 'buy', type: 'Stop-Limit', price: '95.00', quantity: '50.0000', filled: '0.0000', total: '4,750.00', status: 'Pending', date: '2024-01-15 12:00' },
];

const demoOrderHistory: Order[] = [
  { id: 'ord-010', pair: 'BTC/USDT', side: 'buy', type: 'Market', price: '43100.00', quantity: '0.2000', filled: '0.2000', total: '8,620.00', status: 'Filled', date: '2024-01-14 16:45' },
  { id: 'ord-011', pair: 'ETH/USDT', side: 'sell', type: 'Limit', price: '2300.00', quantity: '5.0000', filled: '5.0000', total: '11,500.00', status: 'Filled', date: '2024-01-14 11:20' },
  { id: 'ord-012', pair: 'BNB/USDT', side: 'buy', type: 'Limit', price: '300.00', quantity: '10.0000', filled: '0.0000', total: '3,000.00', status: 'Cancelled', date: '2024-01-13 09:30' },
  { id: 'ord-013', pair: 'SOL/USDT', side: 'sell', type: 'Market', price: '97.50', quantity: '25.0000', filled: '25.0000', total: '2,437.50', status: 'Filled', date: '2024-01-13 08:15' },
  { id: 'ord-014', pair: 'XRP/USDT', side: 'buy', type: 'Limit', price: '0.6000', quantity: '10000.0000', filled: '10000.0000', total: '6,000.00', status: 'Filled', date: '2024-01-12 14:00' },
];

const demoTradeHistory = [
  { id: 'trd-001', pair: 'BTC/USDT', side: 'buy' as const, price: '43100.00', quantity: '0.2000', fee: '8.62 USDT', total: '8,620.00', date: '2024-01-14 16:45' },
  { id: 'trd-002', pair: 'ETH/USDT', side: 'sell' as const, price: '2300.00', quantity: '5.0000', fee: '11.50 USDT', total: '11,500.00', date: '2024-01-14 11:20' },
  { id: 'trd-003', pair: 'SOL/USDT', side: 'sell' as const, price: '97.50', quantity: '25.0000', fee: '2.44 USDT', total: '2,437.50', date: '2024-01-13 08:15' },
  { id: 'trd-004', pair: 'XRP/USDT', side: 'buy' as const, price: '0.6000', quantity: '10000.0000', fee: '6.00 USDT', total: '6,000.00', date: '2024-01-12 14:00' },
];

type Tab = 'open' | 'history' | 'trades';

const statusColors: Record<string, { bg: string; color: string }> = {
  Open: { bg: 'rgba(30, 136, 229, 0.2)', color: '#1e88e5' },
  Partial: { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308' },
  Pending: { bg: 'rgba(132, 142, 156, 0.2)', color: '#848e9c' },
  Filled: { bg: 'rgba(14, 203, 129, 0.2)', color: '#0ecb81' },
  Cancelled: { bg: 'rgba(246, 70, 93, 0.2)', color: '#f6465d' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] || { bg: '#2b3139', color: '#848e9c' };
  return (
    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('open');
  const [pairFilter, setPairFilter] = useState('all');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11' }}>
      <Header />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Orders</h1>
          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            style={{ backgroundColor: '#1e2329', border: '1px solid #2b3139', borderRadius: '4px', padding: '8px 12px', fontSize: '14px', color: '#eaecef', outline: 'none' }}
          >
            <option value="all">All Pairs</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Open Orders', value: demoOpenOrders.length.toString() },
            { label: 'Total Value in Orders', value: '$32,950.00' },
            { label: 'Total Trades', value: demoTradeHistory.length.toString() },
            { label: 'Total Fees Paid', value: '$28.56' },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', padding: '16px' }}>
              <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>{stat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #2b3139' }}>
          {[
            { key: 'open' as Tab, label: `Open Orders (${demoOpenOrders.length})` },
            { key: 'history' as Tab, label: 'Order History' },
            { key: 'trades' as Tab, label: 'Trade History' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px', fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: 'transparent',
                borderBottom: `2px solid ${tab === t.key ? '#f0b90b' : 'transparent'}`,
                color: tab === t.key ? '#f0b90b' : '#848e9c',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'open' && (
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2b3139' }}>
                  {['Pair', 'Type', 'Side', 'Price', 'Amount', 'Filled', 'Total', 'Status', 'Action'].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 3 && i <= 6 ? 'right' : 'left', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoOpenOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{order.pair}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{order.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: order.side === 'buy' ? '#0ecb81' : '#f6465d' }}>{order.side.toUpperCase()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{order.price}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{order.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>{order.filled}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>${order.total}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: '12px 16px' }}><button style={{ color: '#f6465d', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #2b3139' }}>
              <button style={{ color: '#f6465d', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel All Orders</button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2b3139' }}>
                  {['Date', 'Pair', 'Type', 'Side', 'Price', 'Amount', 'Total', 'Status'].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 4 && i <= 6 ? 'right' : 'left', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoOrderHistory.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{order.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{order.pair}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{order.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: order.side === 'buy' ? '#0ecb81' : '#f6465d' }}>{order.side.toUpperCase()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{order.price}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{order.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>${order.total}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'trades' && (
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2b3139' }}>
                  {['Date', 'Pair', 'Side', 'Price', 'Quantity', 'Fee', 'Total'].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 3 ? 'right' : 'left', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoTradeHistory.map((trade) => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{trade.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{trade.pair}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: trade.side === 'buy' ? '#0ecb81' : '#f6465d' }}>{trade.side.toUpperCase()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{trade.price}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{trade.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{trade.fee}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>${trade.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
