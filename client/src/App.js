import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Billing from './pages/Billing';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHackathons from './pages/admin/AdminHackathons';
import AdminHackathonForm from './pages/admin/AdminHackathonForm';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCompanyProfile from './pages/admin/AdminCompanyProfile';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { PageLoadingProvider } from './contexts/PageLoadingContext';

const NAV_SEGMENTS = new Set(['discover', 'team', 'hackathons', 'messages', 'profile', 'user', 'billing']);

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, onboardingLoading, onboardingCompleted } = useAuth();

  if (loading || onboardingLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Checking session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (!onboardingCompleted) {
      return <Navigate to="/register/welcome" replace />;
    }
    return <Navigate to="/discover" replace />;
  }

  return children;
}

const pageEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const firstSegment = location.pathname.split('/').filter(Boolean)[0] || 'home';
  // User profiles are viewed from Discover context — keep same key to avoid transition
  const routeKey = firstSegment === 'user' ? 'discover' : firstSegment;
  const showNav = NAV_SEGMENTS.has(firstSegment);

  const scrollClass = showNav ? 'page-scroll-container' : 'page-scroll-container--full';

  React.useEffect(() => {
    const container = document.querySelector(`.${scrollClass}`);
    if (container) container.scrollTop = 0;
  }, [location.pathname, scrollClass]);

  return (
    <>
      {showNav && <Navigation />}
      <div className={scrollClass}>
        <motion.div
          key={routeKey}
          initial={prefersReducedMotion ? false : pageEnter.initial}
          animate={pageEnter.animate}
        >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<Navigate to="/register/account" replace />} />
          <Route path="/register/:step" element={<Register />} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
          <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

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
      </motion.div>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ChatProvider>
            <PageLoadingProvider>
              <div className="App">
                <AnimatedRoutes />
              </div>
            </PageLoadingProvider>
          </ChatProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
