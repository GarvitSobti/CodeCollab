import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRouteGuard({ children, roles = [] }) {
  const token = localStorage.getItem('admin_token');
  const rawAdmin = localStorage.getItem('admin_user');
  const admin = rawAdmin ? JSON.parse(rawAdmin) : null;

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(admin.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
