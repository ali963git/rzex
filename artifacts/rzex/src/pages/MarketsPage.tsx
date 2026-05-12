import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import Header from '../components/layout/Header';

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
    if (tab !== 'all') markets = markets.filter((m) => m.pair.endsWith(`/${tab}`));
    if (search) {
      const q = search.toUpperCase();
      markets = markets.filter((m) => m.pair.includes(q));
    }
    markets = [...markets].sort((a, b) => {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11' }}>
      <Header />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Markets</h1>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pairs..."
              style={{
                backgroundColor: '#1e2329', border: '1px solid #2b3139', borderRadius: '4px',
                padding: '8px 12px 8px 32px', fontSize: '14px', color: '#eaecef', outline: 'none', width: '224px',
              }}
            />
            <svg style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#848e9c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {(['USDT', 'BTC', 'all'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', borderRadius: '4px', fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: tab === t ? 'rgba(240, 185, 11, 0.2)' : 'transparent',
                color: tab === t ? '#f0b90b' : '#848e9c',
              }}
            >
              {t === 'all' ? 'All Markets' : `${t} Markets`}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>Total Markets</p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{demoMarkets.length}</p>
          </div>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>24h Volume (USDT)</p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>$2.14B</p>
          </div>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>BTC Dominance</p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>52.3%</p>
          </div>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>Active Traders</p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>12,543</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2b3139' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Pair</th>
                <th onClick={() => handleSort('price')} style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500', cursor: 'pointer' }}>
                  Last Price {sortBy === 'price' && (sortDesc ? '▼' : '▲')}
                </th>
                <th onClick={() => handleSort('change')} style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500', cursor: 'pointer' }}>
                  24h Change {sortBy === 'change' && (sortDesc ? '▼' : '▲')}
                </th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>24h High</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>24h Low</th>
                <th onClick={() => handleSort('volume')} style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500', cursor: 'pointer' }}>
                  24h Volume {sortBy === 'volume' && (sortDesc ? '▼' : '▲')}
                </th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((market) => {
                const changeNum = parseFloat(market.change24h);
                return (
                  <tr key={market.pair} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{market.pair.split('/')[0]}</span>
                        <span style={{ fontSize: '12px', color: '#848e9c' }}>/{market.pair.split('/')[1]}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{parseFloat(market.lastPrice).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: changeNum >= 0 ? '#0ecb81' : '#f6465d' }}>
                      {changeNum >= 0 ? '+' : ''}{market.change24h}%
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>{parseFloat(market.high24h).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>{parseFloat(market.low24h).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>
                      {parseFloat(market.volume24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                      <Link href={`/?pair=${market.pair}`} style={{ color: '#f0b90b', fontSize: '14px', textDecoration: 'none' }}>
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
