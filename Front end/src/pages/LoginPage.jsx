import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailIcon, LockIcon, CloseIcon, GoogleIcon, VkIcon, YandexIcon } from '../shared/icons';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import { getLoginRedirectPath, normalizeRole } from '../utils/roles';
import './LoginPage.css';

export default function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate(getLoginRedirectPath(normalizeRole(localStorage.getItem('userRole'))), { replace: true });
    }
  }, [navigate]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(formData.email, formData.password);
      localStorage.setItem('token', token);
      const role = normalizeRole(user?.role);
      localStorage.setItem('userRole', role);
      window.dispatchEvent(new CustomEvent('userRoleUpdated'));
      navigate(getLoginRedirectPath(role), { replace: true });
    } catch (err) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="login-card__close" aria-label={t('common.close')}>
          <CloseIcon />
        </button>
        <h1 className="login-card__title">Calorie Tracker Pro</h1>
        <div className="login-card__tabs">
          <span className="login-card__tab login-card__tab--active">{t('auth.loginTab')}</span>
          <Link to="/registration" className="login-card__tab login-card__tab--inactive">
            {t('auth.registerTab')}
          </Link>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="login-form__error">{error}</p>}
          <div className="login-form__field">
            <label className="login-form__label">{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              className="login-form__input login-form__input--with-icon"
            />
            <span className="login-form__icon"><EmailIcon /></span>
          </div>
          <div className="login-form__field">
            <label className="login-form__label">{t('auth.password')}
            </label>
            <input
              type="password"
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              className="login-form__input login-form__input--with-icon"
            />
            <span className="login-form__icon"><LockIcon /></span>
          </div>
          <button type="submit" className="login-form__submit" disabled={loading}>
            {loading ? t('auth.loginLoading') : t('auth.loginButton')}
          </button>
          <div className="login-form__social">
            <div className="login-form__social-divider">
              <span className="login-form__social-line"></span>
              <span className="login-form__social-text">{t('auth.loginWith')}</span>
              <span className="login-form__social-line"></span>
            </div>
            <div className="login-form__social-icons">
              <button type="button" className="login-form__social-btn" aria-label={t('auth.googleLogin')}>
                <GoogleIcon />
              </button>
              <button type="button" className="login-form__social-btn" aria-label={t('auth.yandexLogin')}>
                <YandexIcon />
              </button>
              <button type="button" className="login-form__social-btn" aria-label={t('auth.vkLogin')}>
                <VkIcon />
              </button>
            </div>
          </div>
          <p className="login-form__footer">
            {t('auth.noAccount')} <Link to="/registration">{t('auth.registerLink')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
