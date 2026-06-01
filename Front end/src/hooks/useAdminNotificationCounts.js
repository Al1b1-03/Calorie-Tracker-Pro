/**
 * ФАЙЛ: useAdminNotificationCounts.js
 * ЧТО ЭТО: Хук счётчиков админа.
 * ЗА ЧТО ОТВЕЧАЕТ: запасной вариант (основное в Header).
 */
import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { adminNotificationsApi } from '../api/adminNotifications';
import { getOrdersSeenId, getSupportSeenId } from '../utils/adminNotifications';
import { isAdmin, normalizeRole } from '../utils/roles';

export function useAdminNotificationCounts(enabled) {
  const [counts, setCounts] = useState({ orders: 0, support: 0 });
  const [authTick, setAuthTick] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled || !localStorage.getItem('token')) {
      setCounts({ orders: 0, support: 0 });
      return;
    }

    let role = normalizeRole(localStorage.getItem('userRole'));
    if (!isAdmin(role)) {
      try {
        const { user } = await authApi.getProfile();
        role = normalizeRole(user?.role);
        if (user?.role) {
          localStorage.setItem('userRole', role);
          window.dispatchEvent(new CustomEvent('userRoleUpdated'));
        }
      } catch {
        setCounts({ orders: 0, support: 0 });
        return;
      }
    }
    if (!isAdmin(role)) {
      setCounts({ orders: 0, support: 0 });
      return;
    }

    try {
      const data = await adminNotificationsApi.getCounts(
        getOrdersSeenId(),
        getSupportSeenId()
      );
      if (!data || typeof data !== 'object') return;
      setCounts({
        orders: Math.max(0, Number(data.orders) || 0),
        support: Math.max(0, Number(data.support) || 0),
      });
    } catch {
      setCounts({ orders: 0, support: 0 });
    }
  }, [enabled, authTick]);

  useEffect(() => {
    const bumpAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener('userRoleUpdated', bumpAuth);
    window.addEventListener('storage', bumpAuth);
    return () => {
      window.removeEventListener('userRoleUpdated', bumpAuth);
      window.removeEventListener('storage', bumpAuth);
    };
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('adminNotificationsUpdated', onUpdate);
    window.addEventListener('focus', onUpdate);
    const timer = enabled ? window.setInterval(refresh, 20000) : null;
    return () => {
      window.removeEventListener('adminNotificationsUpdated', onUpdate);
      window.removeEventListener('focus', onUpdate);
      if (timer) window.clearInterval(timer);
    };
  }, [enabled, refresh]);

  return counts;
}
