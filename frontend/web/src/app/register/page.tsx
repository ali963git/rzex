'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('rzex_token', data.data.token);
        localStorage.setItem('rzex_refresh_token', data.data.refreshToken);
        localStorage.setItem('rzex_user', JSON.stringify(data.data.user));
        router.push('/');
      } else {
        setError(data.error?.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, text: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, text: 'Weak', color: 'bg-rzex-red' };
    if (score <= 2) return { level: 2, text: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, text: 'Good', color: 'bg-rzex-blue' };
    return { level: 4, text: 'Strong', color: 'bg-rzex-green' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-rzex-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-rzex-accent font-bold text-3xl tracking-wider">RZEX</span>
          </Link>
          <p className="text-rzex-text-secondary mt-2">Create your trading account</p>
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
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-rzex-text-secondary mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="Choose a username"
                minLength={3}
                maxLength={30}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-rzex-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= strength.level ? strength.color : 'bg-rzex-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-rzex-text-secondary mt-1">{strength.text}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-rzex-text-secondary mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className="w-full bg-rzex-bg border border-rzex-border rounded px-3 py-2.5 text-rzex-text focus:border-rzex-accent focus:outline-none transition"
                placeholder="Confirm your password"
                required
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-rzex-text-secondary">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-rzex-border"
              />
              <span>
                I agree to the{' '}
                <Link href="#" className="text-rzex-accent hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="#" className="text-rzex-accent hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full bg-rzex-accent text-rzex-bg py-2.5 rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-rzex-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-rzex-accent hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
