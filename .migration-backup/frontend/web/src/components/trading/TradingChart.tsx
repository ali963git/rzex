'use client';

import React, { useEffect, useRef } from 'react';

interface TradingChartProps {
  pair: string;
}

export default function TradingChart({ pair }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: ReturnType<typeof import('lightweight-charts').createChart> | null = null;

    (async () => {
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts');

      if (!chartContainerRef.current) return;

      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1e2329' },
          textColor: '#848e9c',
        },
        grid: {
          vertLines: { color: '#2b3139' },
          horzLines: { color: '#2b3139' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: '#2b3139' },
        timeScale: { borderColor: '#2b3139', timeVisible: true },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderDownColor: '#f6465d',
        borderUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
        wickUpColor: '#0ecb81',
      });

      // Generate sample data
      const now = Math.floor(Date.now() / 1000);
      const data = [];
      let price = pair.includes('BTC') ? 43000 : pair.includes('ETH') ? 2200 : 100;

      for (let i = 200; i >= 0; i--) {
        const time = now - i * 3600;
        const open = price + (Math.random() - 0.5) * price * 0.02;
        const close = open + (Math.random() - 0.5) * price * 0.02;
        const high = Math.max(open, close) + Math.random() * price * 0.01;
        const low = Math.min(open, close) - Math.random() * price * 0.01;
        price = close;
        data.push({ time: time as import('lightweight-charts').UTCTimestamp, open, high, low, close });
      }

      candleSeries.setData(data);

      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });

      chart.priceScale('').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(
        data.map((d) => ({
          time: d.time,
          value: Math.random() * 1000 + 100,
          color: d.close >= d.open ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
        })),
      );

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chart && chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    })();

    return () => {
      if (chart) {
        chart.remove();
      }
    };
  }, [pair]);

  return (
    <div className="bg-rzex-card rounded border border-rzex-border">
      <div className="p-3 border-b border-rzex-border flex items-center justify-between">
        <h3 className="text-sm font-medium">{pair} Chart</h3>
        <div className="flex gap-2 text-xs">
          {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
            <button
              key={tf}
              className={`px-2 py-0.5 rounded transition ${
                tf === '1h'
                  ? 'bg-rzex-accent/20 text-rzex-accent'
                  : 'text-rzex-text-secondary hover:text-rzex-text'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
