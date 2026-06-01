/**
 * ФАЙЛ: RegistrationForm.jsx
 * ЧТО ЭТО: Форма регистрации.
 * ЗА ЧТО ОТВЕЧАЕТ: создание аккаунта USER.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailIcon, PhoneIcon, LockIcon } from '../shared/icons';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import { validateRegistration } from '../utils/validateRegistration';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const req = t('auth.requiredMark');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { ok, errors } = validateRegistration(formData, t);
    if (!ok) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
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
            <label className="registration-form__label" htmlFor="reg-firstName">
              {t('auth.firstName')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-firstName"
              type="text"
              name="firstName"
              placeholder={t('auth.firstNamePlaceholder')}
              value={formData.firstName}
              onChange={handleChange}
              className={`registration-form__input${fieldErrors.firstName ? ' registration-form__input--invalid' : ''}`}
              required
              autoComplete="given-name"
              aria-invalid={!!fieldErrors.firstName}
              aria-describedby={fieldErrors.firstName ? 'reg-firstName-err' : undefined}
            />
            {fieldErrors.firstName && (
              <p id="reg-firstName-err" className="registration-form__field-error" role="alert">
                {fieldErrors.firstName}
              </p>
            )}
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label" htmlFor="reg-lastName">
              {t('auth.lastName')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-lastName"
              type="text"
              name="lastName"
              placeholder={t('auth.lastNamePlaceholder')}
              value={formData.lastName}
              onChange={handleChange}
              className={`registration-form__input${fieldErrors.lastName ? ' registration-form__input--invalid' : ''}`}
              required
              autoComplete="family-name"
              aria-invalid={!!fieldErrors.lastName}
              aria-describedby={fieldErrors.lastName ? 'reg-lastName-err' : undefined}
            />
            {fieldErrors.lastName && (
              <p id="reg-lastName-err" className="registration-form__field-error" role="alert">
                {fieldErrors.lastName}
              </p>
            )}
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label" htmlFor="reg-phone">
              {t('auth.phone')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phone}
              onChange={handleChange}
              className={`registration-form__input registration-form__input--with-icon${fieldErrors.phone ? ' registration-form__input--invalid' : ''}`}
              required
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? 'reg-phone-err' : undefined}
            />
            <span className="registration-form__icon registration-form__icon--left">
              <PhoneIcon />
            </span>
            {fieldErrors.phone && (
              <p id="reg-phone-err" className="registration-form__field-error" role="alert">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label" htmlFor="reg-email">
              {t('auth.email')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              className={`registration-form__input registration-form__input--with-icon${fieldErrors.email ? ' registration-form__input--invalid' : ''}`}
              required
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'reg-email-err' : undefined}
            />
            <span className="registration-form__icon registration-form__icon--left">
              <EmailIcon />
            </span>
            {fieldErrors.email && (
              <p id="reg-email-err" className="registration-form__field-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label" htmlFor="reg-password">
              {t('auth.password')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder={t('auth.newPasswordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              className={`registration-form__input registration-form__input--with-icon${fieldErrors.password ? ' registration-form__input--invalid' : ''}`}
              required
              minLength={6}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'reg-password-err' : undefined}
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
            {fieldErrors.password && (
              <p id="reg-password-err" className="registration-form__field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="registration-form__field">
            <label className="registration-form__label" htmlFor="reg-confirmPassword">
              {t('auth.confirmPassword')} <span className="registration-form__required">{req}</span>
            </label>
            <input
              id="reg-confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder={t('auth.repeatPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`registration-form__input registration-form__input--with-icon${fieldErrors.confirmPassword ? ' registration-form__input--invalid' : ''}`}
              required
              minLength={6}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? 'reg-confirm-err' : undefined}
            />
            <span className="registration-form__icon registration-form__icon--left">
              <LockIcon />
            </span>
            {fieldErrors.confirmPassword && (
              <p id="reg-confirm-err" className="registration-form__field-error" role="alert">
                {fieldErrors.confirmPassword}
              </p>
            )}
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
