import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailIcon, PhoneIcon, LockIcon } from '../shared/icons';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import './RegistrationForm.css';

export default function RegistrationForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    try {
      await authApi.register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <h1 className="registration-card__title">Calorie Tracker Pro</h1>

        <div className="registration-card__tabs">
          <Link
            to="/login"
            className="registration-card__tab registration-card__tab--inactive"
          >
            {t('auth.loginTab')}
          </Link>
          <span className="registration-card__tab registration-card__tab--active">
            {t('auth.registerTab')}
          </span>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          {success && (
            <p className="registration-form__success">
              {t('auth.registerSuccess')}
            </p>
          )}
          {error && <p className="registration-form__error">{error}</p>}
          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.firstName')}</label>
            <input
              type="text"
              name="firstName"
              placeholder={t('auth.firstNamePlaceholder')}
              value={formData.firstName}
              onChange={handleChange}
              className="registration-form__input"
            />
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.lastName')}</label>
            <input
              type="text"
              name="lastName"
              placeholder={t('auth.lastNamePlaceholder')}
              value={formData.lastName}
              onChange={handleChange}
              className="registration-form__input"
            />
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.phone')}</label>
            <input
              type="tel"
              name="phone"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phone}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <PhoneIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <EmailIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              placeholder={t('auth.newPasswordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t('auth.repeatPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="registration-form__input registration-form__input--with-icon"
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
          </div>

          <button type="submit" className="registration-form__submit" disabled={loading || success}>
            {loading ? t('auth.registerLoading') : t('auth.registerButton')}
          </button>

          <p className="registration-form__footer">
            {t('auth.hasAccount')} <Link to="/login">{t('auth.loginButton')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
