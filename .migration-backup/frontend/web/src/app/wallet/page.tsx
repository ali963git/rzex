'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';

interface WalletAsset {
  currency: string;
  name: string;
  balance: string;
  locked: string;
  usdValue: string;
  change24h: string;
}

const demoAssets: WalletAsset[] = [
  { currency: 'BTC', name: 'Bitcoin', balance: '0.54321000', locked: '0.10000000', usdValue: '23,491.34', change24h: '2.34' },
  { currency: 'ETH', name: 'Ethereum', balance: '5.12340000', locked: '1.00000000', usdValue: '11,706.21', change24h: '-1.12' },
  { currency: 'USDT', name: 'Tether', balance: '15432.50000000', locked: '2000.00000000', usdValue: '15,432.50', change24h: '0.01' },
  { currency: 'BNB', name: 'BNB', balance: '12.34500000', locked: '0.00000000', usdValue: '3,857.67', change24h: '0.89' },
  { currency: 'SOL', name: 'Solana', balance: '45.67800000', locked: '10.00000000', usdValue: '4,510.70', change24h: '5.67' },
  { currency: 'XRP', name: 'Ripple', balance: '5000.00000000', locked: '0.00000000', usdValue: '3,117.00', change24h: '-0.45' },
  { currency: 'ADA', name: 'Cardano', balance: '8000.00000000', locked: '0.00000000', usdValue: '4,712.00', change24h: '3.21' },
  { currency: 'DOGE', name: 'Dogecoin', balance: '25000.00000000', locked: '0.00000000', usdValue: '2,280.00', change24h: '-2.15' },
];

type Tab = 'overview' | 'deposit' | 'withdraw' | 'history';

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [hideSmall, setHideSmall] = useState(false);
  const [search, setSearch] = useState('');

  const totalUSD = useMemo(() => {
    return demoAssets.reduce((sum, a) => sum + parseFloat(a.usdValue.replace(/,/g, '')), 0);
  }, []);

  const totalBTC = useMemo(() => {
    return totalUSD / 43250.50;
  }, [totalUSD]);

  const filtered = useMemo(() => {
    let assets = demoAssets;
    if (hideSmall) {
      assets = assets.filter((a) => parseFloat(a.usdValue.replace(/,/g, '')) > 1);
    }
    if (search) {
      const q = search.toUpperCase();
      assets = assets.filter((a) => a.currency.includes(q) || a.name.toUpperCase().includes(q));
    }
    return assets;
  }, [hideSmall, search]);

  return (
    <div className="min-h-screen bg-rzex-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Wallet</h1>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-6 md:col-span-2">
            <p className="text-sm text-rzex-text-secondary">Total Balance</p>
            <p className="text-3xl font-bold mt-1">${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-rzex-text-secondary mt-1">{totalBTC.toFixed(8)} BTC</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setTab('deposit')}
                className="bg-rzex-accent text-rzex-bg px-6 py-2 rounded font-medium text-sm hover:opacity-90 transition"
              >
                Deposit
              </button>
              <button
                onClick={() => setTab('withdraw')}
                className="bg-rzex-border text-rzex-text px-6 py-2 rounded font-medium text-sm hover:bg-rzex-border/80 transition"
              >
                Withdraw
              </button>
              <button className="bg-rzex-border text-rzex-text px-6 py-2 rounded font-medium text-sm hover:bg-rzex-border/80 transition">
                Transfer
              </button>
            </div>
          </div>

          <div className="bg-rzex-card rounded-lg border border-rzex-border p-6">
            <p className="text-sm text-rzex-text-secondary">24h PnL</p>
            <p className="text-2xl font-bold text-rzex-green mt-1">+$1,234.56</p>
            <p className="text-sm text-rzex-green mt-1">+1.82%</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-rzex-text-secondary">Available</span>
                <span>${(totalUSD * 0.85).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rzex-text-secondary">In Orders</span>
                <span>${(totalUSD * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-rzex-border">
          {(['overview', 'deposit', 'withdraw', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition border-b-2 ${
                tab === t
                  ? 'border-rzex-accent text-rzex-accent'
                  : 'border-transparent text-rzex-text-secondary hover:text-rzex-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="bg-rzex-card border border-rzex-border rounded pl-8 pr-3 py-2 text-sm text-rzex-text focus:border-rzex-accent focus:outline-none w-48"
                />
                <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-rzex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <label className="flex items-center gap-2 text-sm text-rzex-text-secondary">
                <input
                  type="checkbox"
                  checked={hideSmall}
                  onChange={(e) => setHideSmall(e.target.checked)}
                  className="rounded border-rzex-border"
                />
                Hide small balances
              </label>
            </div>

            <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rzex-border">
                    <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Asset</th>
                    <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Total</th>
                    <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium hidden md:table-cell">Available</th>
                    <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium hidden md:table-cell">In Orders</th>
                    <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">USD Value</th>
                    <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const total = parseFloat(asset.balance);
                    const locked = parseFloat(asset.locked);
                    const available = total - locked;
                    return (
                      <tr key={asset.currency} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rzex-accent/20 flex items-center justify-center text-rzex-accent text-xs font-bold">
                              {asset.currency.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{asset.currency}</p>
                              <p className="text-xs text-rzex-text-secondary">{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 font-mono text-sm">{total.toFixed(8)}</td>
                        <td className="text-right px-4 py-3 font-mono text-sm hidden md:table-cell text-rzex-text-secondary">
                          {available.toFixed(8)}
                        </td>
                        <td className="text-right px-4 py-3 font-mono text-sm hidden md:table-cell text-rzex-text-secondary">
                          {locked.toFixed(8)}
                        </td>
                        <td className="text-right px-4 py-3 font-mono text-sm">${asset.usdValue}</td>
                        <td className="text-right px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setTab('deposit')}
                              className="text-rzex-accent text-xs hover:underline"
                            >
                              Deposit
                            </button>
                            <button
                              onClick={() => setTab('withdraw')}
                              className="text-rzex-text-secondary text-xs hover:text-rzex-text"
                            >
                              Withdraw
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'deposit' && (
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-6 max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Deposit Crypto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Select Coin</label>
                <select className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none">
                  <option>BTC — Bitcoin</option>
                  <option>ETH — Ethereum</option>
                  <option>USDT — Tether</option>
                  <option>BNB — BNB</option>
                  <option>SOL — Solana</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Network</label>
                <select className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none">
                  <option>Bitcoin (BTC)</option>
                  <option>BEP20 (BSC)</option>
                  <option>ERC20 (Ethereum)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Deposit Address</label>
                <div className="bg-rzex-bg border border-rzex-border rounded p-3 font-mono text-sm break-all">
                  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                </div>
                <button className="mt-2 text-rzex-accent text-sm hover:underline">Copy Address</button>
              </div>
              <div className="bg-rzex-accent/10 border border-rzex-accent/30 rounded p-3 text-sm">
                <p className="text-rzex-accent font-medium mb-1">Important</p>
                <ul className="text-rzex-text-secondary text-xs space-y-1">
                  <li>- Send only BTC to this address</li>
                  <li>- Minimum deposit: 0.0001 BTC</li>
                  <li>- Required confirmations: 2</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div className="bg-rzex-card rounded-lg border border-rzex-border p-6 max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Withdraw Crypto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Select Coin</label>
                <select className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none">
                  <option>BTC — Bitcoin (Available: 0.44321000)</option>
                  <option>ETH — Ethereum (Available: 4.12340000)</option>
                  <option>USDT — Tether (Available: 13432.50000000)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter withdrawal address"
                  className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Network</label>
                <select className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none">
                  <option>Bitcoin (BTC) — Fee: 0.0005 BTC</option>
                  <option>BEP20 (BSC) — Fee: 0.000005 BTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-rzex-text-secondary mb-1">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00000000"
                    className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none pr-16"
                  />
                  <button className="absolute right-3 top-2.5 text-rzex-accent text-sm">MAX</button>
                </div>
                <p className="text-xs text-rzex-text-secondary mt-1">Available: 0.44321000 BTC</p>
              </div>
              <div className="flex justify-between text-sm text-rzex-text-secondary">
                <span>Network Fee</span>
                <span>0.0005 BTC</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>You will receive</span>
                <span>— BTC</span>
              </div>
              <button className="w-full bg-rzex-accent text-rzex-bg py-2.5 rounded font-semibold hover:opacity-90 transition">
                Withdraw
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rzex-border">
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Asset</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Deposit', asset: 'BTC', amount: '+0.50000000', status: 'Completed', date: '2024-01-15 14:30' },
                  { type: 'Withdrawal', asset: 'ETH', amount: '-2.00000000', status: 'Completed', date: '2024-01-14 09:15' },
                  { type: 'Deposit', asset: 'USDT', amount: '+10000.00000000', status: 'Completed', date: '2024-01-13 18:45' },
                  { type: 'Withdrawal', asset: 'BTC', amount: '-0.05000000', status: 'Pending', date: '2024-01-12 12:00' },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                    <td className={`px-4 py-3 text-sm ${tx.type === 'Deposit' ? 'text-rzex-green' : 'text-rzex-red'}`}>{tx.type}</td>
                    <td className="px-4 py-3 text-sm">{tx.asset}</td>
                    <td className={`text-right px-4 py-3 font-mono text-sm ${tx.amount.startsWith('+') ? 'text-rzex-green' : 'text-rzex-red'}`}>
                      {tx.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        tx.status === 'Completed' ? 'bg-rzex-green/20 text-rzex-green' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 text-sm text-rzex-text-secondary">{tx.date}</td>
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
