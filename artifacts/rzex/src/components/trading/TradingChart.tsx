import React, { useEffect, useRef } from 'react';

interface TradingChartProps {
  pair: string;
}

export default function TradingChart({ pair }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: any = null;

    (async () => {
      const { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } = await import('lightweight-charts');

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

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderDownColor: '#f6465d',
        borderUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
        wickUpColor: '#0ecb81',
      });

      const now = Math.floor(Date.now() / 1000);
      const data: Array<{ time: any; open: number; high: number; low: number; close: number }> = [];
      let price = pair.includes('BTC') ? 43000 : pair.includes('ETH') ? 2200 : 100;

      for (let i = 200; i >= 0; i--) {
        const time = now - i * 3600;
        const open = price + (Math.random() - 0.5) * price * 0.02;
        const close = open + (Math.random() - 0.5) * price * 0.02;
        const high = Math.max(open, close) + Math.random() * price * 0.01;
        const low = Math.min(open, close) - Math.random() * price * 0.01;
        price = close;
        data.push({ time, open, high, low, close });
      }

      candleSeries.setData(data);

      const volumeSeries = chart.addSeries(HistogramSeries, {
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
      return () => window.removeEventListener('resize', handleResize);
    })();

    return () => {
      if (chart) chart.remove();
    };
  }, [pair]);

  return (
    <div style={{ backgroundColor: '#1e2329', borderRadius: '4px', border: '1px solid #2b3139' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #2b3139', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{pair} Chart</h3>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
          {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map((tf) => (
            <button
              key={tf}
              style={{
                padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: tf === '1h' ? 'rgba(240, 185, 11, 0.2)' : 'transparent',
                color: tf === '1h' ? '#f0b90b' : '#848e9c',
              }}
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
