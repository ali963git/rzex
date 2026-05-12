import React, { useState } from 'react';
import Header from '../components/layout/Header';
import PairSelector from '../components/trading/PairSelector';
import MarketStats from '../components/trading/MarketStats';
import TradingChart from '../components/trading/TradingChart';
import OrderBook from '../components/trading/OrderBook';
import TradeForm from '../components/trading/TradeForm';
import RecentTrades from '../components/trading/RecentTrades';
import OpenOrders from '../components/trading/OpenOrders';
import DepthChart from '../components/trading/DepthChart';

const demoPairs = [
  { pair: 'BTC/USDT', lastPrice: '43250.50', change24h: '2.34', volume24h: '1234567890', high24h: '43800.00', low24h: '42100.00' },
  { pair: 'ETH/USDT', lastPrice: '2285.30', change24h: '-1.12', volume24h: '567890123', high24h: '2350.00', low24h: '2250.00' },
  { pair: 'BNB/USDT', lastPrice: '312.45', change24h: '0.89', volume24h: '123456789', high24h: '318.00', low24h: '305.00' },
  { pair: 'SOL/USDT', lastPrice: '98.75', change24h: '5.67', volume24h: '98765432', high24h: '102.00', low24h: '93.00' },
  { pair: 'XRP/USDT', lastPrice: '0.6234', change24h: '-0.45', volume24h: '45678901', high24h: '0.6400', low24h: '0.6100' },
];

function generateOrderBook() {
  const bids = Array.from({ length: 20 }, (_, i) => ({
    price: (43250 - i * 5 - Math.random() * 5).toFixed(2),
    quantity: (Math.random() * 2 + 0.01).toFixed(4),
  }));
  const asks = Array.from({ length: 20 }, (_, i) => ({
    price: (43255 + i * 5 + Math.random() * 5).toFixed(2),
    quantity: (Math.random() * 2 + 0.01).toFixed(4),
  }));
  return { bids, asks };
}

function generateTrades() {
  return Array.from({ length: 30 }, (_, i) => ({
    price: (43250 + (Math.random() - 0.5) * 50).toFixed(2),
    quantity: (Math.random() * 1.5 + 0.001).toFixed(4),
    time: new Date(Date.now() - i * 5000).toLocaleTimeString(),
    isBuyerMaker: Math.random() > 0.5,
  }));
}

export default function TradingPage() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const { bids, asks } = generateOrderBook();
  const trades = generateTrades();

  const currentPair = demoPairs.find(p => p.pair === selectedPair) || demoPairs[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11' }}>
      <Header />
      <PairSelector pairs={demoPairs} selectedPair={selectedPair} onSelect={setSelectedPair} />
      <MarketStats
        pair={currentPair.pair}
        lastPrice={currentPair.lastPrice}
        change24h={currentPair.change24h}
        high24h={currentPair.high24h}
        low24h={currentPair.low24h}
        volume24h={currentPair.volume24h}
      />

      <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px' }}>
        <div style={{ gridColumn: 'span 12' }} className="col-lg-3 col-xl-2">
          <OrderBook pair={selectedPair} bids={bids} asks={asks} />
        </div>

        <div style={{ gridColumn: 'span 12' }} className="col-lg-6 col-xl-7">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TradingChart pair={selectedPair} />
            <DepthChart bids={bids} asks={asks} />
            <OpenOrders orders={[]} />
          </div>
        </div>

        <div style={{ gridColumn: 'span 12' }} className="col-lg-3 col-xl-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TradeForm pair={selectedPair} lastPrice={currentPair.lastPrice} />
            <RecentTrades trades={trades} />
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #2b3139', padding: '16px 24px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#848e9c' }}>
          <span>&copy; 2024 RZEX. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/markets" style={{ color: '#848e9c', textDecoration: 'none' }}>Markets</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>API Docs</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 1024px) {
          .col-lg-3 { grid-column: span 3 !important; }
          .col-lg-6 { grid-column: span 6 !important; }
        }
        @media (min-width: 1280px) {
          .col-xl-2 { grid-column: span 2 !important; }
          .col-xl-7 { grid-column: span 7 !important; }
          .col-xl-3 { grid-column: span 3 !important; }
        }
      `}</style>
    </div>
  );
}
