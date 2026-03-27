import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, onboardingLoading, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (loading || onboardingLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!onboardingCompleted && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace state={{ from: location.pathname }} />;
  }

  return children;
}