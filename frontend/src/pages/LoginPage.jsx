import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Lock } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (err) {
      // Expose generic message — never expose server internals
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand micro-identity */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            ShopScale.
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text-main)', marginBottom: '0.375rem', fontFamily: 'var(--font-brand)', fontWeight: 500 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Sign in to continue to your account
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '2.5rem' }}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              <Lock size={15} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Demo info — visually separated, clearly labelled */}
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '0.375rem' }}>
            Demo / Viva Admin Credentials
          </strong>
          Email: admin@shopscale.com<br />
          Password: admin123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
