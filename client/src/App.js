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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/team" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />

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
  );
}

export default App;
