import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('superadmin@innovatex.example');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login(email, password);
      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_user', JSON.stringify(response.admin));
      localStorage.setItem('admin_company', JSON.stringify(response.company));
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          boxShadow: 'var(--shadow-card)',
          padding: 28,
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Company Admin Login</h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: 20 }}>
          Access hackathon management and analytics.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.12)',
            color: 'var(--coral)',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 12,
            fontSize: '0.82rem'
          }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', marginBottom: 12 }}
        />

        <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', marginBottom: 16 }}
        />

        <button
          disabled={loading}
          type="submit"
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 12,
            padding: '11px 14px',
            color: 'white',
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
