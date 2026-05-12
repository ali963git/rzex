'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';

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

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('open');
  const [pairFilter, setPairFilter] = useState('all');

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Open: 'bg-rzex-blue/20 text-rzex-blue',
      Partial: 'bg-yellow-500/20 text-yellow-500',
      Pending: 'bg-rzex-text-secondary/20 text-rzex-text-secondary',
      Filled: 'bg-rzex-green/20 text-rzex-green',
      Cancelled: 'bg-rzex-red/20 text-rzex-red',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || 'bg-rzex-border text-rzex-text-secondary'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-rzex-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            className="bg-rzex-card border border-rzex-border rounded px-3 py-2 text-sm text-rzex-text focus:border-rzex-accent focus:outline-none"
          >
            <option value="all">All Pairs</option>
            <option value="BTC/USDT">BTC/USDT</option>
            <option value="ETH/USDT">ETH/USDT</option>
            <option value="SOL/USDT">SOL/USDT</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Open Orders</p>
            <p className="text-lg font-semibold mt-1">{demoOpenOrders.length}</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Total Value in Orders</p>
            <p className="text-lg font-semibold mt-1">$32,950.00</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Total Trades</p>
            <p className="text-lg font-semibold mt-1">{demoTradeHistory.length}</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Total Fees Paid</p>
            <p className="text-lg font-semibold mt-1">$28.56</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-rzex-border">
          {([
            { key: 'open' as Tab, label: `Open Orders (${demoOpenOrders.length})` },
            { key: 'history' as Tab, label: 'Order History' },
            { key: 'trades' as Tab, label: 'Trade History' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm transition border-b-2 ${
                tab === t.key
                  ? 'border-rzex-accent text-rzex-accent'
                  : 'border-transparent text-rzex-text-secondary hover:text-rzex-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Open Orders */}
        {tab === 'open' && (
          <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rzex-border">
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Pair</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Side</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Price</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Amount</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium hidden md:table-cell">Filled</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {demoOpenOrders.map((order) => (
                  <tr key={order.id} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                    <td className="px-4 py-3 text-sm font-medium">{order.pair}</td>
                    <td className="px-4 py-3 text-sm text-rzex-text-secondary">{order.type}</td>
                    <td className={`px-4 py-3 text-sm ${order.side === 'buy' ? 'text-rzex-green' : 'text-rzex-red'}`}>
                      {order.side.toUpperCase()}
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{order.price}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{order.quantity}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm hidden md:table-cell text-rzex-text-secondary">{order.filled}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">${order.total}</td>
                    <td className="px-4 py-3">{renderStatusBadge(order.status)}</td>
                    <td className="text-right px-4 py-3">
                      <button className="text-rzex-red text-xs hover:underline">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {demoOpenOrders.length > 0 && (
              <div className="px-4 py-3 border-t border-rzex-border">
                <button className="text-rzex-red text-sm hover:underline">Cancel All Orders</button>
              </div>
            )}
          </div>
        )}

        {/* Order History */}
        {tab === 'history' && (
          <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rzex-border">
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Pair</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Side</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Price</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Amount</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoOrderHistory.map((order) => (
                  <tr key={order.id} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                    <td className="px-4 py-3 text-sm text-rzex-text-secondary">{order.date}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.pair}</td>
                    <td className="px-4 py-3 text-sm text-rzex-text-secondary">{order.type}</td>
                    <td className={`px-4 py-3 text-sm ${order.side === 'buy' ? 'text-rzex-green' : 'text-rzex-red'}`}>
                      {order.side.toUpperCase()}
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{order.price}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{order.quantity}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">${order.total}</td>
                    <td className="px-4 py-3">{renderStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Trade History */}
        {tab === 'trades' && (
          <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rzex-border">
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Pair</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Side</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Price</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Quantity</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Fee</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {demoTradeHistory.map((trade) => (
                  <tr key={trade.id} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                    <td className="px-4 py-3 text-sm text-rzex-text-secondary">{trade.date}</td>
                    <td className="px-4 py-3 text-sm font-medium">{trade.pair}</td>
                    <td className={`px-4 py-3 text-sm ${trade.side === 'buy' ? 'text-rzex-green' : 'text-rzex-red'}`}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{trade.price}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{trade.quantity}</td>
                    <td className="text-right px-4 py-3 text-sm text-rzex-text-secondary">{trade.fee}</td>
                    <td className="text-right px-4 py-3 font-mono text-sm">${trade.total}</td>
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
