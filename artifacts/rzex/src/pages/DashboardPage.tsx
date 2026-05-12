import React from 'react';
import { Link } from 'wouter';
import Header from '../components/layout/Header';

const portfolioData = [
  { asset: 'BTC', allocation: 34.2, value: '$23,491', change: '+2.34%', color: '#f97316' },
  { asset: 'ETH', allocation: 17.0, value: '$11,706', change: '-1.12%', color: '#3b82f6' },
  { asset: 'USDT', allocation: 22.5, value: '$15,433', change: '+0.01%', color: '#22c55e' },
  { asset: 'BNB', allocation: 5.6, value: '$3,858', change: '+0.89%', color: '#eab308' },
  { asset: 'SOL', allocation: 6.6, value: '$4,511', change: '+5.67%', color: '#a855f7' },
  { asset: 'Others', allocation: 14.1, value: '$10,109', change: '+1.23%', color: '#6b7280' },
];

const recentActivity = [
  { action: 'Buy BTC/USDT', amount: '0.2000 BTC', value: '$8,620.00', time: '2 hours ago', type: 'buy' },
  { action: 'Sell ETH/USDT', amount: '5.0000 ETH', value: '$11,500.00', time: '5 hours ago', type: 'sell' },
  { action: 'Deposit USDT', amount: '10,000 USDT', value: '$10,000.00', time: '1 day ago', type: 'deposit' },
  { action: 'Buy SOL/USDT', amount: '25.0000 SOL', value: '$2,437.50', time: '2 days ago', type: 'buy' },
  { action: 'Withdraw BTC', amount: '0.0500 BTC', value: '$2,162.50', time: '3 days ago', type: 'withdraw' },
];

const activityColors: Record<string, string> = {
  buy: '#0ecb81',
  sell: '#f6465d',
  deposit: '#1e88e5',
  withdraw: '#f0b90b',
};

const activityBg: Record<string, string> = {
  buy: 'rgba(14, 203, 129, 0.2)',
  sell: 'rgba(246, 70, 93, 0.2)',
  deposit: 'rgba(30, 136, 229, 0.2)',
  withdraw: 'rgba(240, 185, 11, 0.2)',
};

function ActivityIcon({ type }: { type: string }) {
  return (
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: activityBg[type], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg style={{ width: '16px', height: '16px', color: activityColors[type] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {type === 'buy' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
        {type === 'sell' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
        {type === 'deposit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
        {type === 'withdraw' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11' }}>
      <Header />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ fontSize: '14px', color: '#848e9c', margin: 0 }}>Welcome back to RZEX</p>
          </div>
          <Link href="/" style={{ backgroundColor: '#f0b90b', color: '#0b0e11', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
            Start Trading
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Portfolio Value', value: '$69,108.21', sub: '+$1,234.56 (1.82%)', subColor: '#0ecb81' },
            { label: "Today's PnL", value: '+$856.32', valueColor: '#0ecb81', sub: 'Unrealized', subColor: '#848e9c' },
            { label: 'Open Positions', value: '3', sub: '$32,950 value', subColor: '#848e9c' },
            { label: 'Account Level', value: 'VIP 1', sub: '0.1% maker / 0.1% taker', subColor: '#f0b90b' },
          ].map((card) => (
            <div key={card.label} style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '20px' }}>
              <p style={{ fontSize: '12px', color: '#848e9c', margin: '0 0 4px' }}>{card.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px', color: (card as any).valueColor || '#eaecef' }}>{card.value}</p>
              <p style={{ fontSize: '14px', margin: 0, color: card.subColor }}>{card.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>Portfolio Allocation</h2>
            <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              {portfolioData.map((item) => (
                <div key={item.asset} style={{ width: `${item.allocation}%`, backgroundColor: item.color }} title={`${item.asset}: ${item.allocation}%`} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {portfolioData.map((item) => (
                <div key={item.asset} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{item.asset} <span style={{ color: '#848e9c' }}>({item.allocation}%)</span></p>
                    <p style={{ fontSize: '12px', color: '#848e9c', margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { href: '/wallet', icon: 'M12 4v16m8-8H4', label: 'Deposit', sub: 'Add funds to your wallet', bg: 'rgba(14, 203, 129, 0.2)', color: '#0ecb81' },
                { href: '/wallet', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', label: 'Transfer', sub: 'Move between wallets', bg: 'rgba(30, 136, 229, 0.2)', color: '#1e88e5' },
                { href: '/markets', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Markets', sub: 'Explore trading pairs', bg: 'rgba(240, 185, 11, 0.2)', color: '#f0b90b' },
              ].map((action) => (
                <Link key={action.label} href={action.href} style={{ display: 'block', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px', padding: '12px', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg style={{ width: '20px', height: '20px', color: action.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '14px', margin: 0, color: '#eaecef' }}>{action.label}</p>
                      <p style={{ fontSize: '12px', color: '#848e9c', margin: 0 }}>{action.sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #2b3139' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Recent Activity</h2>
              <Link href="/orders" style={{ color: '#f0b90b', fontSize: '14px', textDecoration: 'none' }}>View All</Link>
            </div>
            <div>
              {recentActivity.map((activity, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(43, 49, 57, 0.5)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ActivityIcon type={activity.type} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{activity.action}</p>
                      <p style={{ fontSize: '12px', color: '#848e9c', margin: 0 }}>{activity.amount}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontFamily: 'monospace', margin: 0 }}>{activity.value}</p>
                    <p style={{ fontSize: '12px', color: '#848e9c', margin: 0 }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '2FA Enabled', sub: 'Active', subColor: '#0ecb81', bg: 'rgba(14, 203, 129, 0.2)', iconColor: '#0ecb81' },
            { icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2', label: 'KYC Verification', sub: 'Level 1 Verified', subColor: '#f0b90b', bg: 'rgba(240, 185, 11, 0.2)', iconColor: '#f0b90b' },
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Anti-Phishing', sub: 'Code: RZEX-2024', subColor: '#1e88e5', bg: 'rgba(30, 136, 229, 0.2)', iconColor: '#1e88e5' },
          ].map((item) => (
            <div key={item.label} style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '20px', height: '20px', color: item.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '12px', margin: 0, color: item.subColor }}>{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
