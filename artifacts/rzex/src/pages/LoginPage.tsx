import React, { useState, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '../lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
  padding: '10px 12px', fontSize: '14px', color: '#eaecef', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.login(email, password);
      if (result.success) {
        setLocation('/');
      } else {
        setError(result.error?.message || 'Invalid email or password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '448px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#f0b90b', fontWeight: 'bold', fontSize: '30px', letterSpacing: '0.1em' }}>RZEX</span>
          </Link>
          <p style={{ color: '#848e9c', marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <div style={{ backgroundColor: '#1e2329', borderRadius: '8px', border: '1px solid #2b3139', padding: '24px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)', borderRadius: '4px', color: '#f6465d', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Enter your password"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#848e9c', cursor: 'pointer' }}>
                <input type="checkbox" style={{ borderRadius: '4px' }} />
                Remember me
              </label>
              <Link href="#" style={{ color: '#f0b90b', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', backgroundColor: '#f0b90b', color: '#0b0e11', padding: '10px', borderRadius: '4px',
                fontWeight: '600', fontSize: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#848e9c' }}>
            {"Don't have an account? "}
            <Link href="/register" style={{ color: '#f0b90b', textDecoration: 'none' }}>Register</Link>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#848e9c' }}>
          By signing in, you agree to our{' '}
          <Link href="#" style={{ color: '#f0b90b', textDecoration: 'none' }}>Terms of Service</Link>{' '}
          and{' '}
          <Link href="#" style={{ color: '#f0b90b', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
