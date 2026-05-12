'use client';

import React, { useEffect, useRef } from 'react';

interface DepthChartProps {
  bids: Array<{ price: string; quantity: string }>;
  asks: Array<{ price: string; quantity: string }>;
}

export default function DepthChart({ bids, asks }: DepthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 10, bottom: 25, left: 10 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    // Accumulate quantities
    const bidAccum: Array<{ price: number; total: number }> = [];
    let bidTotal = 0;
    for (const bid of bids) {
      bidTotal += parseFloat(bid.quantity);
      bidAccum.push({ price: parseFloat(bid.price), total: bidTotal });
    }

    const askAccum: Array<{ price: number; total: number }> = [];
    let askTotal = 0;
    for (const ask of asks) {
      askTotal += parseFloat(ask.quantity);
      askAccum.push({ price: parseFloat(ask.price), total: askTotal });
    }

    const maxTotal = Math.max(bidTotal, askTotal, 1);
    const allPrices = [...bidAccum.map((b) => b.price), ...askAccum.map((a) => a.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    function priceToX(price: number): number {
      return padding.left + ((price - minPrice) / priceRange) * plotW;
    }

    function totalToY(total: number): number {
      return padding.top + plotH - (total / maxTotal) * plotH;
    }

    // Draw bid area
    if (bidAccum.length > 1) {
      ctx.beginPath();
      ctx.moveTo(priceToX(bidAccum[0].price), totalToY(0));
      for (const point of bidAccum) {
        ctx.lineTo(priceToX(point.price), totalToY(point.total));
      }
      ctx.lineTo(priceToX(bidAccum[bidAccum.length - 1].price), totalToY(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(14, 203, 129, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(priceToX(bidAccum[0].price), totalToY(bidAccum[0].total));
      for (const point of bidAccum) {
        ctx.lineTo(priceToX(point.price), totalToY(point.total));
      }
      ctx.strokeStyle = '#0ecb81';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw ask area
    if (askAccum.length > 1) {
      ctx.beginPath();
      ctx.moveTo(priceToX(askAccum[0].price), totalToY(0));
      for (const point of askAccum) {
        ctx.lineTo(priceToX(point.price), totalToY(point.total));
      }
      ctx.lineTo(priceToX(askAccum[askAccum.length - 1].price), totalToY(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(246, 70, 93, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(priceToX(askAccum[0].price), totalToY(askAccum[0].total));
      for (const point of askAccum) {
        ctx.lineTo(priceToX(point.price), totalToY(point.total));
      }
      ctx.strokeStyle = '#f6465d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw price labels
    ctx.fillStyle = '#848e9c';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const labelCount = 5;
    for (let i = 0; i <= labelCount; i++) {
      const price = minPrice + (priceRange * i) / labelCount;
      const x = priceToX(price);
      ctx.fillText(price.toFixed(0), x, h - 5);
    }
  }, [bids, asks]);

  return (
    <div className="bg-rzex-card rounded border border-rzex-border">
      <div className="p-3 border-b border-rzex-border">
        <h3 className="text-sm font-medium">Depth Chart</h3>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: '200px' }}
      />
    </div>
  );
}
