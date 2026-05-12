import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RZEX — Cryptocurrency Trading Platform',
  description: 'Professional cryptocurrency trading platform with real-time market data, advanced order types, and secure wallet management.',
  keywords: ['cryptocurrency', 'trading', 'exchange', 'bitcoin', 'ethereum', 'RZEX'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" dir="ltr">
      <body className="bg-rzex-bg text-rzex-text min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
