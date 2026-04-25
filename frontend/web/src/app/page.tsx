'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import PairSelector from '@/components/trading/PairSelector';
import TradingChart from '@/components/trading/TradingChart';
import OrderBook from '@/components/trading/OrderBook';
import TradeForm from '@/components/trading/TradeForm';
import RecentTrades from '@/components/trading/RecentTrades';
import OpenOrders from '@/components/trading/OpenOrders';

// Demo data
const demoPairs = [
  { pair: 'BTC/USDT', lastPrice: '43250.50', change24h: '2.34', volume24h: '1234567890' },
  { pair: 'ETH/USDT', lastPrice: '2285.30', change24h: '-1.12', volume24h: '567890123' },
  { pair: 'BNB/USDT', lastPrice: '312.45', change24h: '0.89', volume24h: '123456789' },
  { pair: 'SOL/USDT', lastPrice: '98.75', change24h: '5.67', volume24h: '98765432' },
  { pair: 'XRP/USDT', lastPrice: '0.6234', change24h: '-0.45', volume24h: '45678901' },
];

function generateOrderBook() {
  const bids = Array.from({ length: 15 }, (_, i) => ({
    price: (43250 - i * 5 - Math.random() * 5).toFixed(2),
    quantity: (Math.random() * 2 + 0.01).toFixed(4),
  }));

  const asks = Array.from({ length: 15 }, (_, i) => ({
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

      <div className="p-2 grid grid-cols-12 gap-2">
        {/* Chart — Main Area */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-2">
          <TradingChart pair={selectedPair} />
          <OpenOrders orders={[]} />
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-2">
          <TradeForm pair={selectedPair} lastPrice={currentPair.lastPrice} />
          <OrderBook pair={selectedPair} bids={bids} asks={asks} />
          <RecentTrades trades={trades} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-rzex-border py-4 px-6 mt-4">
        <div className="flex items-center justify-between text-xs text-rzex-text-secondary">
          <span>&copy; 2024 RZEX. All rights reserved.</span>
          <div className="flex gap-4">
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
