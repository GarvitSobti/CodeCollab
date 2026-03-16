import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHackathons from './pages/admin/AdminHackathons';
import AdminHackathonForm from './pages/admin/AdminHackathonForm';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCompanyProfile from './pages/admin/AdminCompanyProfile';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Checking session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
            <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={(
                <AdminRouteGuard>
                  <AdminDashboard />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/hackathons"
              element={(
                <AdminRouteGuard>
                  <AdminHackathons />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/hackathons/new"
              element={(
                <AdminRouteGuard roles={['SUPER_ADMIN', 'EDITOR']}>
                  <AdminHackathonForm />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/hackathons/:id/edit"
              element={(
                <AdminRouteGuard roles={['SUPER_ADMIN', 'EDITOR']}>
                  <AdminHackathonForm />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/analytics/:id"
              element={(
                <AdminRouteGuard>
                  <AdminAnalytics />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/company"
              element={(
                <AdminRouteGuard roles={['SUPER_ADMIN', 'EDITOR']}>
                  <AdminCompanyProfile />
                </AdminRouteGuard>
              )}
            />
            <Route
              path="/admin/audit-logs"
              element={(
                <AdminRouteGuard>
                  <AdminAuditLogs />
                </AdminRouteGuard>
              )}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
