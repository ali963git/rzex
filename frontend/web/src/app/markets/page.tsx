'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

interface MarketPair {
  pair: string;
  lastPrice: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  quoteVolume: string;
}

const demoMarkets: MarketPair[] = [
  { pair: 'BTC/USDT', lastPrice: '43250.50', change24h: '2.34', high24h: '43800.00', low24h: '42100.00', volume24h: '28543.12', quoteVolume: '1234567890' },
  { pair: 'ETH/USDT', lastPrice: '2285.30', change24h: '-1.12', high24h: '2350.00', low24h: '2250.00', volume24h: '185432.50', quoteVolume: '567890123' },
  { pair: 'BNB/USDT', lastPrice: '312.45', change24h: '0.89', high24h: '318.00', low24h: '305.00', volume24h: '95432.80', quoteVolume: '123456789' },
  { pair: 'SOL/USDT', lastPrice: '98.75', change24h: '5.67', high24h: '102.00', low24h: '93.00', volume24h: '1254321.00', quoteVolume: '98765432' },
  { pair: 'XRP/USDT', lastPrice: '0.6234', change24h: '-0.45', high24h: '0.6400', low24h: '0.6100', volume24h: '45678901.00', quoteVolume: '45678901' },
  { pair: 'ADA/USDT', lastPrice: '0.5890', change24h: '3.21', high24h: '0.6000', low24h: '0.5700', volume24h: '32145678.00', quoteVolume: '32145678' },
  { pair: 'DOGE/USDT', lastPrice: '0.0912', change24h: '-2.15', high24h: '0.0950', low24h: '0.0880', volume24h: '98765432.00', quoteVolume: '12345678' },
  { pair: 'DOT/USDT', lastPrice: '7.85', change24h: '1.45', high24h: '8.10', low24h: '7.60', volume24h: '5432100.00', quoteVolume: '43210000' },
  { pair: 'AVAX/USDT', lastPrice: '35.20', change24h: '4.12', high24h: '36.50', low24h: '33.80', volume24h: '2345678.00', quoteVolume: '82345678' },
  { pair: 'MATIC/USDT', lastPrice: '0.8234', change24h: '-0.78', high24h: '0.8500', low24h: '0.8100', volume24h: '15678900.00', quoteVolume: '15678900' },
  { pair: 'ETH/BTC', lastPrice: '0.05285', change24h: '-3.45', high24h: '0.05400', low24h: '0.05200', volume24h: '12543.50', quoteVolume: '662.92' },
  { pair: 'BNB/BTC', lastPrice: '0.00722', change24h: '-1.20', high24h: '0.00740', low24h: '0.00710', volume24h: '8543.00', quoteVolume: '61.68' },
];

type Tab = 'USDT' | 'BTC' | 'all';

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('USDT');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price'>('volume');
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    let markets = demoMarkets;

    if (tab !== 'all') {
      markets = markets.filter((m) => m.pair.endsWith(`/${tab}`));
    }

    if (search) {
      const q = search.toUpperCase();
      markets = markets.filter((m) => m.pair.includes(q));
    }

    markets.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'volume') cmp = parseFloat(a.quoteVolume) - parseFloat(b.quoteVolume);
      else if (sortBy === 'change') cmp = parseFloat(a.change24h) - parseFloat(b.change24h);
      else cmp = parseFloat(a.lastPrice) - parseFloat(b.lastPrice);
      return sortDesc ? -cmp : cmp;
    });

    return markets;
  }, [search, tab, sortBy, sortDesc]);

  function handleSort(field: 'volume' | 'change' | 'price') {
    if (sortBy === field) setSortDesc(!sortDesc);
    else { setSortBy(field); setSortDesc(true); }
  }

  return (
    <div className="min-h-screen bg-rzex-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Markets</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pairs..."
                className="bg-rzex-card border border-rzex-border rounded pl-8 pr-3 py-2 text-sm text-rzex-text focus:border-rzex-accent focus:outline-none w-56"
              />
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-rzex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['USDT', 'BTC', 'all'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded text-sm transition ${
                tab === t
                  ? 'bg-rzex-accent/20 text-rzex-accent'
                  : 'text-rzex-text-secondary hover:text-rzex-text'
              }`}
            >
              {t === 'all' ? 'All Markets' : `${t} Markets`}
            </button>
          ))}
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Total Markets</p>
            <p className="text-lg font-semibold mt-1">{demoMarkets.length}</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">24h Volume (USDT)</p>
            <p className="text-lg font-semibold mt-1">$2.14B</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">BTC Dominance</p>
            <p className="text-lg font-semibold mt-1">52.3%</p>
          </div>
          <div className="bg-rzex-card rounded border border-rzex-border p-4">
            <p className="text-xs text-rzex-text-secondary">Active Traders</p>
            <p className="text-lg font-semibold mt-1">12,543</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-rzex-card rounded border border-rzex-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rzex-border">
                <th className="text-left px-4 py-3 text-xs text-rzex-text-secondary font-medium">Pair</th>
                <th
                  className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium cursor-pointer hover:text-rzex-text"
                  onClick={() => handleSort('price')}
                >
                  Last Price {sortBy === 'price' && (sortDesc ? '▼' : '▲')}
                </th>
                <th
                  className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium cursor-pointer hover:text-rzex-text"
                  onClick={() => handleSort('change')}
                >
                  24h Change {sortBy === 'change' && (sortDesc ? '▼' : '▲')}
                </th>
                <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium hidden md:table-cell">24h High</th>
                <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium hidden md:table-cell">24h Low</th>
                <th
                  className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium cursor-pointer hover:text-rzex-text"
                  onClick={() => handleSort('volume')}
                >
                  24h Volume {sortBy === 'volume' && (sortDesc ? '▼' : '▲')}
                </th>
                <th className="text-right px-4 py-3 text-xs text-rzex-text-secondary font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((market) => {
                const changeNum = parseFloat(market.change24h);
                return (
                  <tr key={market.pair} className="border-b border-rzex-border/50 hover:bg-rzex-border/20 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{market.pair.split('/')[0]}</span>
                        <span className="text-xs text-rzex-text-secondary">/{market.pair.split('/')[1]}</span>
                      </div>
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm">{parseFloat(market.lastPrice).toLocaleString()}</td>
                    <td className={`text-right px-4 py-3 font-mono text-sm ${changeNum >= 0 ? 'text-rzex-green' : 'text-rzex-red'}`}>
                      {changeNum >= 0 ? '+' : ''}{market.change24h}%
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm hidden md:table-cell text-rzex-text-secondary">
                      {parseFloat(market.high24h).toLocaleString()}
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm hidden md:table-cell text-rzex-text-secondary">
                      {parseFloat(market.low24h).toLocaleString()}
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-sm text-rzex-text-secondary">
                      {parseFloat(market.volume24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right px-4 py-3">
                      <Link
                        href={`/?pair=${market.pair}`}
                        className="text-rzex-accent text-sm hover:underline"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
