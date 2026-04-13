import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/users';
import { productsApi } from '../api/products';
import { ordersApi } from '../api/orders';
import { workoutsApi } from '../api/workouts';
import { useLanguage } from '../i18n/LanguageContext';
import './AdminMainPage.css';

const STATS = [
  {
    key: 'users',
    label: 'Пользователи',
    to: '/users',
    api: () =>
      usersApi
        .list()
        .then((r) => (Array.isArray(r?.users) ? r.users.filter((u) => u.role !== 'admin').length : 0)),
  },
  {
    key: 'products',
    label: 'Товары',
    to: '/products',
    api: () =>
      productsApi
        .list()
        .then((r) => (Array.isArray(r?.products) ? r.products.length : 0)),
  },
  {
    key: 'orders',
    label: 'Заказы',
    to: '/orders',
    api: () =>
      ordersApi
        .list()
        .then((r) => (Array.isArray(r?.orders) ? r.orders.length : 0)),
  },
  {
    key: 'workouts',
    label: 'Тренировки',
    to: '/workouts',
    api: () =>
      workoutsApi.admin
        .list()
        .then((r) => (Array.isArray(r?.workouts) ? r.workouts.length : 0)),
  },
];

export default function AdminMainPage() {
  const { lang } = useLanguage();
  const t = {
    ru: { users: 'Пользователи', products: 'Товары', orders: 'Заказы', workouts: 'Тренировки', title: 'Панель администратора', subtitle: 'Управление приложением Calorie Tracker Pro', dataError: 'Данные не загрузились. Проверьте подключение к серверу.', loading: 'Загрузка...', open: 'Перейти ->' },
    kk: { users: 'Пайдаланушылар', products: 'Тауарлар', orders: 'Тапсырыстар', workouts: 'Жаттығулар', title: 'Әкімші панелі', subtitle: 'Calorie Tracker Pro қолданбасын басқару', dataError: 'Деректер жүктелмеді. Серверге қосылуды тексеріңіз.', loading: 'Жүктелуде...', open: 'Ашу ->' },
    en: { users: 'Users', products: 'Products', orders: 'Orders', workouts: 'Workouts', title: 'Admin dashboard', subtitle: 'Manage Calorie Tracker Pro application', dataError: 'Failed to load data. Check server connection.', loading: 'Loading...', open: 'Open ->' },
  }[lang] || {
    users: 'Пользователи', products: 'Товары', orders: 'Заказы', workouts: 'Тренировки', title: 'Панель администратора', subtitle: 'Управление приложением Calorie Tracker Pro', dataError: 'Данные не загрузились. Проверьте подключение к серверу.', loading: 'Загрузка...', open: 'Перейти ->'
  };

  const stats = useMemo(
    () => [
      { ...STATS[0], label: t.users },
      { ...STATS[1], label: t.products },
      { ...STATS[2], label: t.orders },
      { ...STATS[3], label: t.workouts },
    ],
    [t.orders, t.products, t.users, t.workouts]
  );

  const [counts, setCounts] = useState({ users: 0, products: 0, orders: 0, workouts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    Promise.allSettled(stats.map((s) => s.api()))
      .then((results) => {
        if (cancelled) return;
        const [u, p, o, w] = results.map((r) => (r.status === 'fulfilled' ? r.value : 0));
        setCounts({ users: u, products: p, orders: o, workouts: w });
        // Если хотя бы один запрос успешен, не пугаем сообщением.
        // Сообщение покажем только если не загрузилось вообще ничего.
        if (results.every((r) => r.status === 'rejected')) {
          setError(t.dataError);
        } else {
          setError('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t.dataError, stats]);

  return (
    <div className="admin-main">
      <h1 className="admin-main__title">{t.title}</h1>
      <p className="admin-main__subtitle">{t.subtitle}</p>

      {error && <p className="admin-main__error">{error}</p>}

      {loading ? (
        <p className="admin-main__loading">{t.loading}</p>
      ) : (
        <div className="admin-main__grid">
          {stats.map(({ key, label, to }) => (
            <Link key={key} to={to} className="admin-main__card">
              <span className="admin-main__card-label">{label}</span>
              <span className="admin-main__card-count">{counts[key] ?? 0}</span>
              <span className="admin-main__card-link">{t.open}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
