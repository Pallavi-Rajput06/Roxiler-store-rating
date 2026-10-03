import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Verifying session authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const { user, loading, getDashboardPathForRole } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Checking authorization rights..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their own role-specific home page if they try entering another role's URL manually
    const redirectPath = getDashboardPathForRole(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
