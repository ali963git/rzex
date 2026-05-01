'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('rzex_token', data.data.token);
        localStorage.setItem('rzex_refresh_token', data.data.refreshToken);
        localStorage.setItem('rzex_user', JSON.stringify(data.data.user));
        router.push('/');
      } else {
        setError(data.error?.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-rzex-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-rzex-accent font-bold text-3xl tracking-wider">RZEX</span>
          </Link>
          <p className="text-rzex-text-secondary mt-2">Sign in to your account</p>
        </div>

        <div className="bg-rzex-card rounded-lg border border-rzex-border p-6">
          {error && (
            <div className="mb-4 p-3 bg-rzex-red/10 border border-rzex-red/30 rounded text-rzex-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-rzex-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-rzex-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-rzex-text-secondary">
                <input type="checkbox" className="rounded border-rzex-border" />
                Remember me
              </label>
              <Link href="#" className="text-rzex-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rzex-accent text-rzex-bg py-2.5 rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-rzex-text-secondary">
            {"Don't have an account? "}
            <Link href="/register" className="text-rzex-accent hover:underline">
              Register
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-rzex-text-secondary">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-rzex-accent hover:underline">Terms of Service</Link>{' '}
          and{' '}
          <Link href="#" className="text-rzex-accent hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
