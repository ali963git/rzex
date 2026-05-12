import React, { useState, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { api } from '../lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#0b0e11', border: '1px solid #2b3139', borderRadius: '4px',
  padding: '10px 12px', fontSize: '14px', color: '#eaecef', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
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
      const result = await api.register(formData.email, formData.username, formData.password);
      if (result.success) {
        setLocation('/');
      } else {
        setError(result.error?.message || 'Registration failed');
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
    if (score <= 1) return { level: 1, text: 'Weak', color: '#f6465d' };
    if (score <= 2) return { level: 2, text: 'Fair', color: '#eab308' };
    if (score <= 3) return { level: 3, text: 'Good', color: '#1e88e5' };
    return { level: 4, text: 'Strong', color: '#0ecb81' };
  };

  const strength = passwordStrength();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '448px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#f0b90b', fontWeight: 'bold', fontSize: '30px', letterSpacing: '0.1em' }}>RZEX</span>
          </Link>
          <p style={{ color: '#848e9c', marginTop: '8px' }}>Create your trading account</p>
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
              <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} style={inputStyle} placeholder="you@example.com" required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Username</label>
              <input type="text" value={formData.username} onChange={(e) => updateField('username', e.target.value)} style={inputStyle} placeholder="Choose a username" minLength={3} maxLength={30} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Password</label>
              <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} style={inputStyle} placeholder="Min. 8 characters" minLength={8} required />
              {formData.password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: i <= strength.level ? strength.color : '#2b3139' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#848e9c' }}>{strength.text}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#848e9c', marginBottom: '4px' }}>Confirm Password</label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} style={inputStyle} placeholder="Confirm your password" required />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#848e9c', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '2px' }} />
              <span>
                I agree to the{' '}
                <Link href="#" style={{ color: '#f0b90b', textDecoration: 'none' }}>Terms of Service</Link>{' '}
                and{' '}
                <Link href="#" style={{ color: '#f0b90b', textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              style={{
                width: '100%', backgroundColor: '#f0b90b', color: '#0b0e11', padding: '10px', borderRadius: '4px',
                fontWeight: '600', fontSize: '14px', border: 'none', cursor: loading || !agreed ? 'not-allowed' : 'pointer',
                opacity: loading || !agreed ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#848e9c' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#f0b90b', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
