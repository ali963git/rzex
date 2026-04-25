'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-rzex-card border-b border-rzex-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-rzex-accent font-bold text-xl tracking-wider">RZEX</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/trade" className="text-rzex-text-secondary hover:text-rzex-text text-sm transition">
              Trade
            </Link>
            <Link href="/markets" className="text-rzex-text-secondary hover:text-rzex-text text-sm transition">
              Markets
            </Link>
            <Link href="/wallet" className="text-rzex-text-secondary hover:text-rzex-text text-sm transition">
              Wallet
            </Link>
            <Link href="/orders" className="text-rzex-text-secondary hover:text-rzex-text text-sm transition">
              Orders
            </Link>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-rzex-text-secondary hover:text-rzex-text transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-rzex-accent text-rzex-bg px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition"
          >
            Register
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-rzex-text-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-rzex-border p-4 space-y-3">
          <Link href="/trade" className="block text-rzex-text-secondary hover:text-rzex-text text-sm">Trade</Link>
          <Link href="/markets" className="block text-rzex-text-secondary hover:text-rzex-text text-sm">Markets</Link>
          <Link href="/wallet" className="block text-rzex-text-secondary hover:text-rzex-text text-sm">Wallet</Link>
          <Link href="/orders" className="block text-rzex-text-secondary hover:text-rzex-text text-sm">Orders</Link>
        </nav>
      )}
    </header>
  );
}
