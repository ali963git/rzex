import React, { useState, useMemo } from 'react';
import Header from '../components/layout/Header';

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

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
  padding: '10px 12px', fontSize: '14px', color: '#eaecef', outline: 'none', boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
  padding: '10px 12px', fontSize: '14px', color: '#eaecef', outline: 'none', boxSizing: 'border-box',
};

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [hideSmall, setHideSmall] = useState(false);
  const [search, setSearch] = useState('');

  const totalUSD = useMemo(() => demoAssets.reduce((sum, a) => sum + parseFloat(a.usdValue.replace(/,/g, '')), 0), []);
  const totalBTC = useMemo(() => totalUSD / 43250.50, [totalUSD]);

  const filtered = useMemo(() => {
    let assets = demoAssets;
    if (hideSmall) assets = assets.filter((a) => parseFloat(a.usdValue.replace(/,/g, '')) > 1);
    if (search) {
      const q = search.toUpperCase();
      assets = assets.filter((a) => a.currency.includes(q) || a.name.toUpperCase().includes(q));
    }
    return assets;
  }, [hideSmall, search]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11' }}>
      <Header />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px' }}>Wallet</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '24px' }}>
            <p style={{ fontSize: '14px', color: '#848e9c', margin: '0 0 4px' }}>Total Balance</p>
            <p style={{ fontSize: '30px', fontWeight: 'bold', margin: '0 0 4px' }}>${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p style={{ fontSize: '14px', color: '#848e9c', margin: '0 0 16px' }}>{totalBTC.toFixed(8)} BTC</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setTab('deposit')} style={{ backgroundColor: '#f0b90b', color: '#0b0e11', padding: '8px 24px', borderRadius: '4px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Deposit
              </button>
              <button onClick={() => setTab('withdraw')} style={{ backgroundColor: '#2b3139', color: '#eaecef', padding: '8px 24px', borderRadius: '4px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Withdraw
              </button>
              <button style={{ backgroundColor: '#2b3139', color: '#eaecef', padding: '8px 24px', borderRadius: '4px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Transfer
              </button>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '24px' }}>
            <p style={{ fontSize: '14px', color: '#848e9c', margin: '0 0 4px' }}>24h PnL</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ecb81', margin: '0 0 4px' }}>+$1,234.56</p>
            <p style={{ fontSize: '14px', color: '#0ecb81', margin: '0 0 16px' }}>+1.82%</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#848e9c' }}>Available</span>
                <span>${(totalUSD * 0.85).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#848e9c' }}>In Orders</span>
                <span>${(totalUSD * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #2b3139' }}>
          {(['overview', 'deposit', 'withdraw', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', fontSize: '14px', textTransform: 'capitalize', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: 'transparent',
                borderBottom: `2px solid ${tab === t ? '#f0b90b' : 'transparent'}`,
                color: tab === t ? '#f0b90b' : '#848e9c',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  style={{ ...inputStyle, width: '192px', paddingLeft: '32px' }}
                />
                <svg style={{ position: 'absolute', left: '10px', top: '10px', width: '16px', height: '16px', color: '#848e9c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#848e9c', cursor: 'pointer' }}>
                <input type="checkbox" checked={hideSmall} onChange={(e) => setHideSmall(e.target.checked)} />
                Hide small balances
              </label>
            </div>
            <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2b3139' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Asset</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Total</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Available</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>In Orders</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>USD Value</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const total = parseFloat(asset.balance);
                    const locked = parseFloat(asset.locked);
                    const available = total - locked;
                    return (
                      <tr key={asset.currency} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(240, 185, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0b90b', fontSize: '12px', fontWeight: 'bold' }}>
                              {asset.currency.slice(0, 2)}
                            </div>
                            <div>
                              <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>{asset.currency}</p>
                              <p style={{ fontSize: '12px', color: '#848e9c', margin: 0 }}>{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{total.toFixed(8)}</td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>{available.toFixed(8)}</td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#848e9c' }}>{locked.toFixed(8)}</td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px' }}>${asset.usdValue}</td>
                        <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setTab('deposit')} style={{ color: '#f0b90b', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Deposit</button>
                            <button onClick={() => setTab('withdraw')} style={{ color: '#848e9c', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Withdraw</button>
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
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '24px', maxWidth: '512px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>Deposit Crypto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Select Coin</label>
                <select style={selectStyle}>
                  <option>BTC — Bitcoin</option>
                  <option>ETH — Ethereum</option>
                  <option>USDT — Tether</option>
                  <option>BNB — BNB</option>
                  <option>SOL — Solana</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Network</label>
                <select style={selectStyle}>
                  <option>Bitcoin (BTC)</option>
                  <option>BEP20 (BSC)</option>
                  <option>ERC20 (Ethereum)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Deposit Address</label>
                <div style={{ backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px', padding: '12px', fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                </div>
                <button style={{ marginTop: '8px', color: '#f0b90b', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>Copy Address</button>
              </div>
              <div style={{ backgroundColor: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.3)', borderRadius: '4px', padding: '12px', fontSize: '14px' }}>
                <p style={{ color: '#f0b90b', fontWeight: '500', margin: '0 0 4px' }}>Important</p>
                <ul style={{ color: '#848e9c', fontSize: '12px', margin: 0, paddingLeft: '16px' }}>
                  <li>Send only BTC to this address</li>
                  <li>Minimum deposit: 0.0001 BTC</li>
                  <li>Required confirmations: 2</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'withdraw' && (
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '24px', maxWidth: '512px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>Withdraw Crypto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Select Coin</label>
                <select style={selectStyle}>
                  <option>BTC — Bitcoin (Available: 0.44321000)</option>
                  <option>ETH — Ethereum (Available: 4.12340000)</option>
                  <option>USDT — Tether (Available: 13432.50000000)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Recipient Address</label>
                <input type="text" placeholder="Enter withdrawal address" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Network</label>
                <select style={selectStyle}>
                  <option>Bitcoin (BTC) — Fee: 0.0005 BTC</option>
                  <option>BEP20 (BSC) — Fee: 0.000005 BTC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" placeholder="0.00000000" style={{ ...inputStyle, paddingRight: '48px' }} />
                  <button style={{ position: 'absolute', right: '12px', top: '10px', color: '#f0b90b', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>MAX</button>
                </div>
                <p style={{ fontSize: '12px', color: '#848e9c', margin: '4px 0 0' }}>Available: 0.44321000 BTC</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#848e9c' }}>
                <span>Network Fee</span>
                <span>0.0005 BTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
                <span>You will receive</span>
                <span>— BTC</span>
              </div>
              <button style={{ width: '100%', backgroundColor: '#f0b90b', color: '#0b0e11', padding: '10px', borderRadius: '4px', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                Withdraw
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139', overflow: 'hidden' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2b3139' }}>
                  {['Type', 'Asset', 'Amount', 'Status', 'Date'].map((h, i) => (
                    <th key={h} style={{ textAlign: i < 2 ? 'left' : i === 4 ? 'right' : 'right', padding: '12px 16px', fontSize: '12px', color: '#848e9c', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Deposit', asset: 'BTC', amount: '+0.50000000', status: 'Completed', date: '2024-01-15 14:30' },
                  { type: 'Withdrawal', asset: 'ETH', amount: '-2.00000000', status: 'Completed', date: '2024-01-14 09:15' },
                  { type: 'Deposit', asset: 'USDT', amount: '+10000.00000000', status: 'Completed', date: '2024-01-13 18:45' },
                  { type: 'Withdrawal', asset: 'BTC', amount: '-0.05000000', status: 'Pending', date: '2024-01-12 12:00' },
                ].map((tx, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(43, 49, 57, 0.5)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: tx.type === 'Deposit' ? '#0ecb81' : '#f6465d' }}>{tx.type}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{tx.asset}</td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: tx.amount.startsWith('+') ? '#0ecb81' : '#f6465d' }}>{tx.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', backgroundColor: tx.status === 'Completed' ? 'rgba(14, 203, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: tx.status === 'Completed' ? '#0ecb81' : '#eab308' }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '14px', color: '#848e9c' }}>{tx.date}</td>
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
