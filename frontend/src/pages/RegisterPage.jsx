import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Brand micro-identity */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            ShopScale.
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text-main)', marginBottom: '0.375rem', fontFamily: 'var(--font-brand)', fontWeight: 500 }}>
            Create an Account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Join ShopScale to start shopping
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
            {/* Name row */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="input-field"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                  maxLength={100}
                  placeholder="Jane"
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="input-field"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                  maxLength={100}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label" htmlFor="password">
                Password <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(min. 6 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              <UserPlus size={16} />
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
