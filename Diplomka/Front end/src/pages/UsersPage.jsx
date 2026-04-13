import { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import './UsersPage.css';

export default function UsersPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? {
        title: 'User accounts', loading: 'Loading...', loadErr: 'Failed to load users', banErr: 'Ban action failed', delErr: 'Delete action failed',
        name: 'User name:', email: 'Email:', banned: 'User is banned', notBanned: 'User is not banned',
        unban: 'Unban', ban: 'Ban', del: 'Delete', cantBlockAdmin: 'Cannot block admin', cantDeleteAdmin: 'Cannot delete admin', empty: 'No users',
        confirmDelete: 'Delete user',
      }
    : lang === 'kk'
      ? {
          title: 'Пайдаланушы аккаунттары', loading: 'Жүктелуде...', loadErr: 'Пайдаланушыларды жүктеу қатесі', banErr: 'Бұғаттау әрекеті қатесі', delErr: 'Жою әрекеті қатесі',
          name: 'Пайдаланушы аты:', email: 'Email:', banned: 'Пайдаланушы бұғатталған', notBanned: 'Пайдаланушы бұғатталмаған',
          unban: 'Бұғаттан шығару', ban: 'Бұғаттау', del: 'Жою', cantBlockAdmin: 'Әкімшіні бұғаттауға болмайды', cantDeleteAdmin: 'Әкімшіні жоюға болмайды', empty: 'Пайдаланушылар жоқ',
          confirmDelete: 'Пайдаланушыны жою',
        }
      : {
          title: 'Учетные записи пользователей', loading: 'Загрузка...', loadErr: 'Ошибка загрузки пользователей', banErr: 'Ошибка при блокировке', delErr: 'Ошибка при удалении',
          name: 'Имя пользователя:', email: 'Email:', banned: 'Пользователь забанен', notBanned: 'Пользователь не забанен',
          unban: 'Разбанить', ban: 'Бан', del: 'Удалить', cantBlockAdmin: 'Нельзя заблокировать администратора', cantDeleteAdmin: 'Нельзя удалить администратора', empty: 'Нет пользователей',
          confirmDelete: 'Удалить пользователя',
        };

  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      setError('');
      const [{ users: data }, profile] = await Promise.all([
        usersApi.list(),
        authApi.getProfile().catch(() => ({ user: null })),
      ]);
      setUsers(data);
      if (profile?.user?.id) setCurrentUserId(profile.user.id);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [tr.loadErr]);

  const visibleUsers = users.filter(
    (u) => u.role !== 'admin' && (currentUserId == null || u.id !== currentUserId)
  );

  const handleBan = async (user) => {
    setActionLoading(user.id);
    try {
      await usersApi.ban(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBanned: !u.isBanned } : u
        )
      );
    } catch (err) {
      setError(err.message || tr.banErr);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`${tr.confirmDelete} ${user.fullName} (${user.email})?`)) {
      return;
    }
    setActionLoading(user.id);
    try {
      await usersApi.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message || tr.delErr);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="users-page">
        <h1 className="users-page__title">{tr.title}</h1>
        <p className="users-page__loading">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <h1 className="users-page__title">{tr.title}</h1>
      {error && <p className="users-page__error">{error}</p>}

      <div className="users-grid">
        {visibleUsers.map((user) => (
          <div key={user.id} className="users-card">
            <div className="users-card__field">
              <span className="users-card__label">{tr.name}</span>
              <span className="users-card__value">{user.fullName}</span>
            </div>
            <div className="users-card__field">
              <span className="users-card__label">{tr.email}</span>
              <span className="users-card__value">{user.email}</span>
            </div>
            <p
              className={`users-card__status ${user.isBanned ? 'users-card__status--banned' : ''}`}
            >
              {user.isBanned ? tr.banned : tr.notBanned}
            </p>
            <div className="users-card__actions">
              <button
                type="button"
                className="users-card__btn users-card__btn--ban"
                onClick={() => handleBan(user)}
                disabled={actionLoading === user.id || user.role === 'admin'}
                title={user.role === 'admin' ? tr.cantBlockAdmin : ''}
              >
                {actionLoading === user.id ? '...' : user.isBanned ? tr.unban : tr.ban}
              </button>
              <button
                type="button"
                className="users-card__btn users-card__btn--delete"
                onClick={() => handleDelete(user)}
                disabled={actionLoading === user.id || user.role === 'admin'}
                title={user.role === 'admin' ? tr.cantDeleteAdmin : ''}
              >
                {actionLoading === user.id ? '...' : tr.del}
              </button>
            </div>
          </div>
        ))}
      </div>

      {visibleUsers.length === 0 && !loading && (
        <p className="users-page__empty">{tr.empty}</p>
      )}
    </div>
  );
}
