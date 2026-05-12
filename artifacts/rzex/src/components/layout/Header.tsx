import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

interface User {
  id: string;
  username: string;
  email: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [location] = useLocation();

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
    localStorage.removeItem('rzex_user_id');
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
    <header style={{ backgroundColor: '#1e2329', borderBottom: '1px solid #2b3139', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#f0b90b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#0b0e11', fontWeight: 'bold', fontSize: '14px' }}>RZ</span>
            </div>
            <span style={{ color: '#f0b90b', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.1em' }}>RZEX</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: location === link.href ? '#f0b90b' : '#848e9c',
                  backgroundColor: location === link.href ? 'rgba(240, 185, 11, 0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(240, 185, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#f0b90b', fontSize: '12px', fontWeight: 'bold' }}>{user.username[0].toUpperCase()}</span>
                </div>
                <span style={{ fontSize: '14px', color: '#eaecef' }}>{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{ fontSize: '14px', color: '#848e9c', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                style={{ fontSize: '14px', color: '#848e9c', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                style={{ backgroundColor: '#f0b90b', color: '#0b0e11', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500', textDecoration: 'none', transition: 'opacity 0.2s' }}
              >
                Register
              </Link>
            </>
          )}

          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#848e9c', display: 'none' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-btn"
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

      {isMenuOpen && (
        <nav style={{ borderTop: '1px solid #2b3139', padding: '16px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                fontSize: '14px',
                padding: '8px 0',
                textDecoration: 'none',
                color: location === link.href ? '#f0b90b' : '#848e9c',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
