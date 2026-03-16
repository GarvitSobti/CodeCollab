import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const petalColors = ['var(--peach)', 'var(--coral)', 'var(--lavender)', 'var(--mint)', 'var(--sky)'];
const petalAngles = [270, 342, 54, 126, 198];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signInWithEmailPassword,
    registerWithEmailPassword,
    signInWithGoogle,
    signInWithGithub,
    logout,
    fetchProvidersByEmail,
  } = useAuth();

  const PROVIDER_NAMES = { 'google.com': 'Google', 'github.com': 'GitHub', password: 'email/password' };
  const friendlyProviders = (methods) => methods.map(m => PROVIDER_NAMES[m] || m).join(' or ');

  const handleDuplicateAccountError = async (emailAddr) => {
    if (!emailAddr) {
      setErrorMessage('An account already exists with this email using a different sign-in method.');
      return;
    }
    if (typeof fetchProvidersByEmail !== 'function') {
      setErrorMessage('An account already exists with this email using a different sign-in method.');
      return;
    }
    try {
      const methods = await fetchProvidersByEmail(emailAddr);
      if (methods.length) {
        setErrorMessage(`This email is already registered via ${friendlyProviders(methods)}. Please sign in with that instead.`);
      } else {
        setErrorMessage('An account already exists with this email using a different sign-in method.');
      }
    } catch {
      setErrorMessage('An account already exists with this email using a different sign-in method.');
    }
  };

  const redirectTo = location.state?.from || '/discover';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await registerWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error?.code === 'auth/account-exists-with-different-credential') {
        await handleDuplicateAccountError(email);
      } else {
        const message = error?.message || 'Authentication failed';
        setErrorMessage(message.replace('Firebase: ', '').replace(/\[[0-9;]*m/g, ''));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderSignIn = async (providerAction) => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await providerAction();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error?.message || 'Authentication failed';
      setErrorMessage(message.replace('Firebase: ', '').replace(/\[[0-9;]*m/g, ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>
      <div className="noise" />

      <div className="stagger" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12 }} onClick={() => navigate('/')}>
            <div style={{ width: 40, height: 40, position: 'relative' }}>
              {petalColors.map((bg, i) => {
                const r = 11;
                const angle = (petalAngles[i] * Math.PI) / 180;
                const x = 50 + r * Math.cos(angle);
                const y = 50 + r * Math.sin(angle);
                return <div key={i} style={{ position: 'absolute', width: 13, height: 13, borderRadius: '50%', background: bg, top: `${y}%`, left: `${x}%`, transform: 'translate(-50%,-50%)' }} />;
              })}
              <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--honey)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>CodeCollab</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>Find your perfect hackathon teammates</p>
        </div>

        {/* Card */}
        <div style={{ padding: '36px 32px', borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-heavy)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-body)', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-dark)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--peach)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-body)', marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-dark)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--peach)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,138,101,0.3)', transition: 'all 0.2s' }}>
              {isSubmitting ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {errorMessage && (
            <p style={{ marginTop: 12, fontSize: '0.76rem', color: '#d64545', fontWeight: 600 }}>
              {errorMessage}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, border: '1.5px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--coral)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
              onClick={() => handleProviderSignIn(signInWithGoogle)}
              disabled={isSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, border: '1.5px solid rgba(0,0,0,0.08)', background: '#24292f', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              onClick={() => handleProviderSignIn(signInWithGithub)}
              disabled={isSubmitting}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 20 }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              style={{ color: 'var(--peach)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setIsRegistering(prev => !prev)}
            >
              {isRegistering ? 'Sign in instead' : 'Create one with email'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
