import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Loader from './components/Loader';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import StoresManagement from './pages/admin/StoresManagement';

// Normal User Pages
import UserStores from './pages/user/UserStores';

// Store Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

const HomeRedirect = () => {
  const { user, isAuthenticated, loading, getDashboardPathForRole } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Initializing application..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathForRole(user.role)} replace />;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />

          {/* System Administrator Routes */}
          <Route element={<RoleRoute allowedRoles={['SYSTEM_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/stores" element={<StoresManagement />} />
          </Route>

          {/* Normal User Routes */}
          <Route element={<RoleRoute allowedRoles={['NORMAL_USER']} />}>
            <Route path="/user/stores" element={<UserStores />} />
          </Route>

          {/* Store Owner Routes */}
          <Route element={<RoleRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
