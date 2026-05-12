'use client';

import React from 'react';

interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: string;
  price: string;
  quantity: string;
  filled: string;
  status: string;
  time: string;
}

interface OpenOrdersProps {
  orders: Order[];
}

export default function OpenOrders({ orders }: OpenOrdersProps) {
  return (
    <div className="bg-rzex-card rounded border border-rzex-border">
      <div className="p-3 border-b border-rzex-border flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <button className="text-rzex-text border-b-2 border-rzex-accent pb-1">Open Orders ({orders.length})</button>
          <button className="text-rzex-text-secondary pb-1 hover:text-rzex-text transition">Order History</button>
          <button className="text-rzex-text-secondary pb-1 hover:text-rzex-text transition">Trade History</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-rzex-text-secondary">
              <th className="text-left py-2 px-3">Time</th>
              <th className="text-left">Pair</th>
              <th className="text-left">Side</th>
              <th className="text-left">Type</th>
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Filled</th>
              <th className="text-right">Status</th>
              <th className="text-right px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-rzex-text-secondary text-sm">
                  No open orders
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="text-xs hover:bg-rzex-border/30">
                  <td className="py-2 px-3 text-rzex-text-secondary">{order.time}</td>
                  <td>{order.pair}</td>
                  <td className={order.side === 'buy' ? 'text-rzex-green' : 'text-rzex-red'}>
                    {order.side.toUpperCase()}
                  </td>
                  <td className="capitalize">{order.type}</td>
                  <td className="text-right font-mono">{parseFloat(order.price).toFixed(2)}</td>
                  <td className="text-right font-mono">{parseFloat(order.quantity).toFixed(4)}</td>
                  <td className="text-right font-mono">{order.filled}%</td>
                  <td className="text-right capitalize">{order.status}</td>
                  <td className="text-right px-3">
                    <button className="text-rzex-red hover:underline">Cancel</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
