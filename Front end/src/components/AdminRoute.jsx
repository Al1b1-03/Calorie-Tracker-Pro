import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import { isAdmin, normalizeRole } from '../utils/roles';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const [userRole, setUserRole] = useState(() => normalizeRole(localStorage.getItem('userRole')));
  const [checking, setChecking] = useState(!localStorage.getItem('userRole') && !!token);
  const location = useLocation();

  useEffect(() => {
    if (token && !localStorage.getItem('userRole')) {
      authApi
        .getProfile()
        .then(({ user }) => {
          const role = normalizeRole(user?.role);
          localStorage.setItem('userRole', role);
          setUserRole(role);
        })
        .catch(() => setUserRole('USER'))
        .finally(() => setChecking(false));
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (checking) {
    return <div className="admin-route-loading">Загрузка...</div>;
  }

  if (!isAdmin(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
