'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import PairSelector from '@/components/trading/PairSelector';
import MarketStats from '@/components/trading/MarketStats';
import TradingChart from '@/components/trading/TradingChart';
import OrderBook from '@/components/trading/OrderBook';
import TradeForm from '@/components/trading/TradeForm';
import RecentTrades from '@/components/trading/RecentTrades';
import OpenOrders from '@/components/trading/OpenOrders';
import DepthChart from '@/components/trading/DepthChart';

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
    <div className="min-h-screen bg-rzex-bg">
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

      <div className="p-2 grid grid-cols-12 gap-2">
        {/* Left: Order Book */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 space-y-2">
          <OrderBook pair={selectedPair} bids={bids} asks={asks} />
        </div>

        {/* Center: Chart + Orders */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-7 space-y-2">
          <TradingChart pair={selectedPair} />
          <DepthChart bids={bids} asks={asks} />
          <OpenOrders orders={[]} />
        </div>

        {/* Right: Trade Form + Trades */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-3 space-y-2">
          <TradeForm pair={selectedPair} lastPrice={currentPair.lastPrice} />
          <RecentTrades trades={trades} />
        </div>
      </div>

      <footer className="border-t border-rzex-border py-4 px-6 mt-4">
        <div className="flex items-center justify-between text-xs text-rzex-text-secondary">
          <span>&copy; 2024 RZEX. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/markets" className="hover:text-rzex-text transition">Markets</a>
            <a href="#" className="hover:text-rzex-text transition">API Docs</a>
            <a href="#" className="hover:text-rzex-text transition">Terms</a>
            <a href="#" className="hover:text-rzex-text transition">Privacy</a>
            <a href="#" className="hover:text-rzex-text transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
