/**
 * ФАЙЛ: AdminProfilePage.jsx
 * ЧТО ЭТО: Страница: профиль админа.
 * ЗА ЧТО ОТВЕЧАЕТ: отдельный UI для ADMIN.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import './ProfilePage.css';
import './AdminProfilePage.css';

export default function AdminProfilePage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? { loading: 'Loading...', title: 'Update profile', mismatch: 'Passwords do not match', min: 'Password must be at least 6 characters', oldReq: 'Enter current password', saveErr: 'Save failed', success: 'Profile updated', old: 'Old password', oldPh: 'Enter old password', nw: 'New password', nwPh: 'Enter new password', repeat: 'Repeat', repeatPh: 'Repeat password', update: 'Update', updating: 'Updating...', logout: 'Log out', emailPh: 'Your email' }
    : lang === 'kk'
      ? { loading: 'Жүктелуде...', title: 'Профильді жаңарту', mismatch: 'Құпиясөздер сәйкес емес', min: 'Құпиясөз кемінде 6 таңба болуы керек', oldReq: 'Ағымдағы құпиясөзді енгізіңіз', saveErr: 'Сақтау қатесі', success: 'Профиль жаңартылды', old: 'Ескі құпиясөз', oldPh: 'Ескі құпиясөзді енгізіңіз', nw: 'Жаңа құпиясөз', nwPh: 'Жаңа құпиясөзді енгізіңіз', repeat: 'Қайталау', repeatPh: 'Құпиясөзді растаңыз', update: 'Жаңарту', updating: 'Жаңартылуда...', logout: 'Шығу', emailPh: 'Сіздің email' }
      : { loading: 'Загрузка...', title: 'Обновить профиль', mismatch: 'Пароли не совпадают', min: 'Пароль должен быть не менее 6 символов', oldReq: 'Введите текущий пароль', saveErr: 'Ошибка сохранения', success: 'Профиль обновлён', old: 'Старый пароль', oldPh: 'Введите старый пароль', nw: 'Новый пароль', nwPh: 'Введите новый пароль', repeat: 'Повторите', repeatPh: 'Потвердите пароль', update: 'Обновить', updating: 'Обновление...', logout: 'Выйти', emailPh: 'Ваш email' };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authApi.getProfile();
        if (user) {
          setEmail(user.email || '');
        }
      } catch {
        // Profile might not exist or user not authenticated
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword) {
      if (formData.newPassword !== formData.repeatPassword) {
        setError(tr.mismatch);
        return;
      }
      if (formData.newPassword.length < 6) {
        setError(tr.min);
        return;
      }
      if (!formData.oldPassword) {
        setError(tr.oldReq);
        return;
      }
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword || undefined,
      });
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', repeatPassword: '' });
    } catch (err) {
      setError(err.message || tr.saveErr);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  };

  if (loading && !email) {
    return (
      <div className="page admin-profile-page">
        <div className="admin-profile-card glass-card">
          <p className="admin-profile-page__loading">{tr.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-profile-page">
      <div className="admin-profile-page__header">
        <h1 className="admin-profile-page__title">{tr.title}</h1>
      </div>
      <div className="admin-profile-card glass-card">
        <form className="admin-profile-form" onSubmit={handleSubmit}>
          {error && <p className="admin-profile-form__error">{error}</p>}
          {success && <p className="admin-profile-form__success">{tr.success}</p>}

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="admin-profile-form__input admin-profile-form__input--readonly"
              placeholder={tr.emailPh}
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">{tr.old}</label>
            <input
              type="password"
              name="oldPassword"
              placeholder={tr.oldPh}
              value={formData.oldPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">{tr.nw}</label>
            <input
              type="password"
              name="newPassword"
              placeholder={tr.nwPh}
              value={formData.newPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="admin-profile-form__field">
            <label className="admin-profile-form__label">{tr.repeat}</label>
            <input
              type="password"
              name="repeatPassword"
              placeholder={tr.repeatPh}
              value={formData.repeatPassword}
              onChange={handleChange}
              className="admin-profile-form__input"
            />
          </div>

          <div className="profile-form__actions">
            <button
              type="submit"
              className="profile-form__submit ui-btn ui-btn--primary"
              disabled={loading}
            >
              {loading ? tr.updating : tr.update}
            </button>
            <button
              type="button"
              className="profile-form__logout ui-btn ui-btn--danger-soft"
              onClick={handleLogout}
            >
              {tr.logout}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
