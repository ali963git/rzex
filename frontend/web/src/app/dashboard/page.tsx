'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';

const portfolioData = [
  { asset: 'BTC', allocation: 34.2, value: '$23,491', change: '+2.34%', color: 'bg-orange-500' },
  { asset: 'ETH', allocation: 17.0, value: '$11,706', change: '-1.12%', color: 'bg-blue-500' },
  { asset: 'USDT', allocation: 22.5, value: '$15,433', change: '+0.01%', color: 'bg-green-500' },
  { asset: 'BNB', allocation: 5.6, value: '$3,858', change: '+0.89%', color: 'bg-yellow-500' },
  { asset: 'SOL', allocation: 6.6, value: '$4,511', change: '+5.67%', color: 'bg-purple-500' },
  { asset: 'Others', allocation: 14.1, value: '$10,109', change: '+1.23%', color: 'bg-gray-500' },
];

const recentActivity = [
  { action: 'Buy BTC/USDT', amount: '0.2000 BTC', value: '$8,620.00', time: '2 hours ago', type: 'buy' },
  { action: 'Sell ETH/USDT', amount: '5.0000 ETH', value: '$11,500.00', time: '5 hours ago', type: 'sell' },
  { action: 'Deposit USDT', amount: '10,000 USDT', value: '$10,000.00', time: '1 day ago', type: 'deposit' },
  { action: 'Buy SOL/USDT', amount: '25.0000 SOL', value: '$2,437.50', time: '2 days ago', type: 'buy' },
  { action: 'Withdraw BTC', amount: '0.0500 BTC', value: '$2,162.50', time: '3 days ago', type: 'withdraw' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-rzex-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-rzex-text-secondary mt-1">Welcome back to RZEX</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="bg-rzex-accent text-rzex-bg px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition"
            >
              Start Trading
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <p className="text-xs text-rzex-text-secondary">Total Portfolio Value</p>
            <p className="text-2xl font-bold mt-1">$69,108.21</p>
            <p className="text-sm text-rzex-green mt-1">+$1,234.56 (1.82%)</p>
          </div>
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <p className="text-xs text-rzex-text-secondary">Today&apos;s PnL</p>
            <p className="text-2xl font-bold text-rzex-green mt-1">+$856.32</p>
            <p className="text-sm text-rzex-text-secondary mt-1">Unrealized</p>
          </div>
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <p className="text-xs text-rzex-text-secondary">Open Positions</p>
            <p className="text-2xl font-bold mt-1">3</p>
            <p className="text-sm text-rzex-text-secondary mt-1">$32,950 value</p>
          </div>
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <p className="text-xs text-rzex-text-secondary">Account Level</p>
            <p className="text-2xl font-bold mt-1">VIP 1</p>
            <p className="text-sm text-rzex-accent mt-1">0.1% maker / 0.1% taker</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Allocation */}
          <div className="lg:col-span-2">
            <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
              <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {portfolioData.map((item) => (
                  <div
                    key={item.asset}
                    className={`${item.color}`}
                    style={{ width: `${item.allocation}%` }}
                    title={`${item.asset}: ${item.allocation}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {portfolioData.map((item) => (
                  <div key={item.asset} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium">{item.asset} <span className="text-rzex-text-secondary">({item.allocation}%)</span></p>
                      <p className="text-xs text-rzex-text-secondary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/wallet" className="block w-full bg-rzex-bg border border-rzex-border rounded p-3 hover:border-rzex-accent transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rzex-green/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rzex-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Deposit</p>
                    <p className="text-xs text-rzex-text-secondary">Add funds to your wallet</p>
                  </div>
                </div>
              </Link>
              <Link href="/wallet" className="block w-full bg-rzex-bg border border-rzex-border rounded p-3 hover:border-rzex-accent transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rzex-blue/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rzex-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Transfer</p>
                    <p className="text-xs text-rzex-text-secondary">Move between wallets</p>
                  </div>
                </div>
              </Link>
              <Link href="/markets" className="block w-full bg-rzex-bg border border-rzex-border rounded p-3 hover:border-rzex-accent transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rzex-accent/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rzex-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Markets</p>
                    <p className="text-xs text-rzex-text-secondary">Explore trading pairs</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <div className="bg-rzex-card rounded-lg border border-rzex-border">
            <div className="flex items-center justify-between p-5 border-b border-rzex-border">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link href="/orders" className="text-rzex-accent text-sm hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-rzex-border/50">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-rzex-border/20 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'buy' ? 'bg-rzex-green/20' :
                      activity.type === 'sell' ? 'bg-rzex-red/20' :
                      activity.type === 'deposit' ? 'bg-rzex-blue/20' : 'bg-rzex-accent/20'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        activity.type === 'buy' ? 'text-rzex-green' :
                        activity.type === 'sell' ? 'text-rzex-red' :
                        activity.type === 'deposit' ? 'text-rzex-blue' : 'text-rzex-accent'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {activity.type === 'buy' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                        {activity.type === 'sell' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        {activity.type === 'deposit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
                        {activity.type === 'withdraw' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />}
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-rzex-text-secondary">{activity.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{activity.value}</p>
                    <p className="text-xs text-rzex-text-secondary">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rzex-green/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rzex-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">2FA Enabled</p>
                <p className="text-xs text-rzex-green">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rzex-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rzex-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">KYC Verification</p>
                <p className="text-xs text-rzex-accent">Level 1 Verified</p>
              </div>
            </div>
          </div>
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rzex-blue/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-rzex-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Anti-Phishing</p>
                <p className="text-xs text-rzex-blue">Code: RZEX-2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
