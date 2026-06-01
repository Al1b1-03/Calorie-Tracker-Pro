/**
 * ФАЙЛ: AdminMainPage.jsx
 * ЧТО ЭТО: Страница: главная ADMIN.
 * ЗА ЧТО ОТВЕЧАЕТ: плитки разделов админки.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/users';
import { productsApi } from '../api/products';
import { ordersApi } from '../api/orders';
import { workoutsApi } from '../api/workouts';
import { supportApi } from '../api/support';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/ui/PageHero';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { isSuperAdmin, normalizeRole, ROLES } from '../utils/roles';
import './AdminMainPage.css';

const STAT_KEYS = [
  { key: 'users', to: '/users', icon: '👥', api: () => usersApi.list().then((r) => (Array.isArray(r?.users) ? r.users.filter((u) => normalizeRole(u.role) === ROLES.USER).length : 0)) },
  { key: 'products', to: '/products', icon: '🛒', api: () => productsApi.list().then((r) => (Array.isArray(r?.products) ? r.products.length : 0)) },
  { key: 'orders', to: '/orders', icon: '📦', api: () => ordersApi.list().then((r) => (Array.isArray(r?.orders) ? r.orders.length : 0)) },
  { key: 'support', to: '/support', icon: '💬', api: () => supportApi.listMessages().then((r) => (Array.isArray(r?.messages) ? r.messages.length : 0)) },
  { key: 'workouts', to: '/workouts', icon: '🏋️', api: () => workoutsApi.admin.list().then((r) => (Array.isArray(r?.workouts) ? r.workouts.length : 0)) },
];

export default function AdminMainPage() {
  const { t } = useLanguage();
  const userRole = normalizeRole(localStorage.getItem('userRole'));
  const showAdminManagement = isSuperAdmin(userRole);

  const stats = useMemo(
    () => {
      const items = STAT_KEYS.map((s) => ({
        ...s,
        label: t(`admin.${s.key}`),
      }));
      if (showAdminManagement) {
        items.push({
          key: 'adminManagement',
          to: '/admin-management',
          icon: '🛡️',
          label: t('admin.adminManagement'),
        });
      }
      return items;
    },
    [t, showAdminManagement]
  );

  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0, support: 0, workouts: 0, adminManagement: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    Promise.allSettled(stats.filter((s) => s.api).map((s) => s.api()))
      .then((results) => {
        if (cancelled) return;
        const next = {};
        let apiIndex = 0;
        stats.forEach((s) => {
          if (!s.api) {
            next[s.key] = '—';
            return;
          }
          const result = results[apiIndex++];
          next[s.key] = result.status === 'fulfilled' ? result.value : 0;
        });
        setCounts(next);
        if (results.every((r) => r.status === 'rejected')) {
          setError(t('admin.dataError'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [stats, t]);

  return (
    <div className="page admin-main">
      <PageHero eyebrow="Admin" title={t('admin.title')} subtitle={t('admin.subtitle')} />

      {error && <p className="admin-main__error" role="alert">{error}</p>}

      {loading ? (
        <SkeletonCardList count={3} />
      ) : (
        <div className="admin-main__grid">
          {stats.map(({ key, label, to, icon }) => (
            <Link key={key} to={to} className="admin-main__card glass-card">
              <span className="admin-main__card-icon" aria-hidden>{icon}</span>
              <span className="admin-main__card-label">{label}</span>
              <span className="admin-main__card-count">{counts[key] ?? 0}</span>
              <span className="admin-main__card-link">{t('admin.open')} →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
