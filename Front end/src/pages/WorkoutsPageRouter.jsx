import { useState, useEffect } from 'react';
import WorkoutsPage from './WorkoutsPage';
import AdminWorkoutsPage from './AdminWorkoutsPage';
import { isAdmin, normalizeRole } from '../utils/roles';

export default function WorkoutsPageRouter() {
  const [userRole, setUserRole] = useState(() => normalizeRole(localStorage.getItem('userRole')));

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(normalizeRole(localStorage.getItem('userRole')));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  return isAdmin(userRole) ? <AdminWorkoutsPage /> : <WorkoutsPage />;
}
