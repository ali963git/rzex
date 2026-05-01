'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rzex_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('rzex_token');
    localStorage.removeItem('rzex_refresh_token');
    localStorage.removeItem('rzex_user');
    setUser(null);
    window.location.href = '/';
  }

  const navLinks = [
    { href: '/', label: 'Trade' },
    { href: '/markets', label: 'Markets' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/orders', label: 'Orders' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="bg-rzex-card border-b border-rzex-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-rzex-accent flex items-center justify-center">
              <span className="text-rzex-bg font-bold text-sm">RZ</span>
            </div>
            <span className="text-rzex-accent font-bold text-xl tracking-wider">RZEX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  pathname === link.href
                    ? 'text-rzex-accent bg-rzex-accent/10'
                    : 'text-rzex-text-secondary hover:text-rzex-text hover:bg-rzex-border/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rzex-accent/20 flex items-center justify-center">
                  <span className="text-rzex-accent text-xs font-bold">{user.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm text-rzex-text">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-rzex-text-secondary hover:text-rzex-red transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm py-1 ${
                pathname === link.href ? 'text-rzex-accent' : 'text-rzex-text-secondary hover:text-rzex-text'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
