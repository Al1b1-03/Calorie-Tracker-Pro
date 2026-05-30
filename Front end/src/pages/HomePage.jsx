import { useState, useEffect } from 'react';
import MainPage from './MainPage';
import AdminMainPage from './AdminMainPage';
import { isAdmin, normalizeRole } from '../utils/roles';

export default function HomePage() {
  const [userRole, setUserRole] = useState(() => normalizeRole(localStorage.getItem('userRole')));

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(normalizeRole(localStorage.getItem('userRole')));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  return isAdmin(userRole) ? <AdminMainPage /> : <MainPage />;
}
