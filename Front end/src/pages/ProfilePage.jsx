/**
 * ФАЙЛ: ProfilePage.jsx
 * ЧТО ЭТО: Страница: профиль.
 * ЗА ЧТО ОТВЕЧАЕТ: данные user/admin, нормы КБЖУ.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import AdminProfilePage from './AdminProfilePage';
import PageHero from '../components/ui/PageHero';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { calculateDailyNorms } from '../utils/calorieCalculator';
import { isAdmin, normalizeRole } from '../utils/roles';
import './ProfilePage.css';

function calcNorms(formData) {
  return calculateDailyNorms({
    ...formData,
    activityLevel: formData.activityLevel,
    goal: 'maintain',
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [calcSummary, setCalcSummary] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    calorieNorm: '',
    protein: '',
    fat: '',
    carbs: '',
    newPassword: '',
    repeatPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authApi.getProfile();
        if (user) {
          const role = normalizeRole(user.role);
          setUserRole(role);
          if (role) {
            localStorage.setItem('userRole', role);
            window.dispatchEvent(new CustomEvent('userRoleUpdated'));
          }
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || '',
            age: user.age?.toString() || '',
            weight: user.weight?.toString() || '',
            height: user.height?.toString() || '',
            activityLevel: user.activityLevel || '',
            calorieNorm: user.calorieNorm?.toString() || '',
            protein: user.protein?.toString() || '',
            fat: user.fat?.toString() || '',
            carbs: user.carbs?.toString() || '',
          }));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const initials = useMemo(() => {
    const a = (formData.firstName?.[0] || formData.email?.[0] || '?').toUpperCase();
    const b = (formData.lastName?.[0] || '').toUpperCase();
    return `${a}${b}`.trim();
  }, [formData.firstName, formData.lastName, formData.email]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleCalcNorms = async () => {
    const result = calcNorms(formData);
    if (!result) {
      setError(t('profile.calcNeedData'));
      return;
    }
    setError('');
    setCalcSummary(result);
    const nextForm = {
      ...formData,
      calorieNorm: String(result.calories),
      protein: String(result.protein),
      fat: String(result.fat),
      carbs: String(result.carbs),
    };
    setFormData(nextForm);
    setLoading(true);
    try {
      await authApi.updateProfile({
        gender: nextForm.gender,
        age: nextForm.age,
        weight: nextForm.weight,
        height: nextForm.height,
        activityLevel: nextForm.activityLevel,
        calorieNorm: result.calories,
        protein: result.protein,
        fat: result.fat,
        carbs: result.carbs,
      });
      setSuccess(true);
      window.dispatchEvent(new CustomEvent('profileNormsUpdated'));
    } catch (err) {
      setError(err.message || t('profile.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const nextPassword = String(formData.newPassword || '').trim();
    const repeatPassword = String(formData.repeatPassword || '').trim();
    const shouldChangePassword = nextPassword && repeatPassword;

    if (shouldChangePassword) {
      if (nextPassword !== repeatPassword) {
        setError(t('profile.passwordMismatch'));
        return;
      }
      if (nextPassword.length < 6) {
        setError(t('profile.passwordMin'));
        return;
      }
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        calorieNorm: formData.calorieNorm,
        protein: formData.protein,
        fat: formData.fat,
        carbs: formData.carbs,
        newPassword: shouldChangePassword ? nextPassword : undefined,
      });
      setSuccess(true);
      setFormData((prev) => ({ ...prev, newPassword: '', repeatPassword: '' }));
      window.dispatchEvent(new CustomEvent('profileNormsUpdated'));
    } catch (err) {
      setError(err.message || t('profile.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login', { replace: true });
  };

  if (loading && !formData.email && !isAdmin(userRole)) {
    return (
      <div className="page profile-page">
        <SkeletonCardList count={2} />
      </div>
    );
  }

  if (isAdmin(userRole)) {
    return <AdminProfilePage />;
  }

  const activityOptions = [
    { value: 'sedentary', label: t('profile.activitySedentary') },
    { value: 'light', label: t('profile.activityLight') },
    { value: 'moderate', label: t('profile.activityModerate') },
    { value: 'active', label: t('profile.activityActive') },
    { value: 'very_active', label: t('profile.activityVeryActive') },
  ];

  return (
    <div className="page profile-page">
      <PageHero eyebrow={t('nav.profile')} title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="profile-card glass-card">
        <div className="profile-card__hero">
          <div className="profile-card__avatar" aria-hidden>{initials}</div>
          <div>
            <p className="profile-card__name">
              {[formData.firstName, formData.lastName].filter(Boolean).join(' ') || formData.email}
            </p>
            <p className="profile-card__email">{formData.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <p className="profile-form__error" role="alert">{error}</p>}
          {success && <p className="profile-form__success">{t('profile.saved')}</p>}

          <h2 className="profile-form__section-title">{t('profile.account')}</h2>
          <div className="profile-form__row">
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.firstName')}</label>
              <input name="firstName" value={formData.firstName} readOnly className="profile-form__input profile-form__input--readonly" />
            </div>
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.lastName')}</label>
              <input name="lastName" value={formData.lastName} readOnly className="profile-form__input profile-form__input--readonly" />
            </div>
          </div>
          <div className="profile-form__row">
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.email')}</label>
              <input name="email" value={formData.email} readOnly className="profile-form__input profile-form__input--readonly" />
            </div>
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.phone')}</label>
              <input name="phone" value={formData.phone} readOnly className="profile-form__input profile-form__input--readonly" />
            </div>
          </div>

          <div className="profile-form__row">
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.gender')}</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="profile-form__input">
                <option value="">{t('profile.select')}</option>
                <option value="male">{t('profile.genderMale')}</option>
                <option value="female">{t('profile.genderFemale')}</option>
              </select>
            </div>
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.age')}</label>
              <input type="number" name="age" min="1" max="120" value={formData.age} onChange={handleChange} className="profile-form__input" />
            </div>
          </div>

          <div className="profile-form__row">
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.weight')}</label>
              <input type="number" name="weight" min="1" value={formData.weight} onChange={handleChange} className="profile-form__input" />
            </div>
            <div className="profile-form__field">
              <label className="profile-form__label">{t('profile.height')}</label>
              <input type="number" name="height" min="1" value={formData.height} onChange={handleChange} className="profile-form__input" />
            </div>
          </div>

          <div className="profile-form__field">
            <label className="profile-form__label">{t('profile.activity')}</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="profile-form__input">
              <option value="">{t('profile.select')}</option>
              {activityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button type="button" className="profile-form__calc-btn" onClick={handleCalcNorms}>
            {t('profile.calcNorms')}
          </button>

          {calcSummary && (
            <div className="profile-form__calc-summary">
              <p>{t('profile.calcSummaryCalories').replace('{calories}', String(calcSummary.calories))}</p>
              <p>{t('profile.calcSummaryIdeal').replace('{weight}', String(calcSummary.idealWeight))}</p>
              <p>{t('profile.calcSummaryBmi').replace('{bmi}', String(calcSummary.bmi))}</p>
              {calcSummary.healthyRange && (
                <p>{t('profile.calcSummaryRange')
                  .replace('{min}', String(calcSummary.healthyRange.min))
                  .replace('{max}', String(calcSummary.healthyRange.max))}</p>
              )}
            </div>
          )}

          <div className="profile-form__field">
            <label className="profile-form__label">{t('profile.calorieNorm')}</label>
            <input type="number" name="calorieNorm" min="0" value={formData.calorieNorm} onChange={handleChange} className="profile-form__input" />
          </div>

          <div className="profile-form__section">
            <h2 className="profile-form__section-title">{t('profile.macros')}</h2>
            <div className="profile-form__macros-inputs">
              <div className="profile-form__field">
                <label className="profile-form__label">{t('profile.protein')}</label>
                <input type="number" name="protein" min="0" value={formData.protein} onChange={handleChange} className="profile-form__input" />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">{t('profile.fat')}</label>
                <input type="number" name="fat" min="0" value={formData.fat} onChange={handleChange} className="profile-form__input" />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">{t('profile.carbs')}</label>
                <input type="number" name="carbs" min="0" value={formData.carbs} onChange={handleChange} className="profile-form__input" />
              </div>
            </div>
          </div>

          <div className="profile-form__section">
            <h2 className="profile-form__section-title">{t('profile.passwordSection')}</h2>
            <div className="profile-form__row">
              <div className="profile-form__field">
                <label className="profile-form__label">{t('profile.newPassword')}</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="profile-form__input" />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">{t('profile.repeatPassword')}</label>
                <input type="password" name="repeatPassword" value={formData.repeatPassword} onChange={handleChange} className="profile-form__input" />
              </div>
            </div>
          </div>

          <div className="profile-form__actions">
            <button type="submit" className="profile-form__submit ui-btn ui-btn--primary" disabled={loading}>
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
            <button type="button" className="profile-form__logout ui-btn ui-btn--danger-soft" onClick={handleLogout}>
              {t('profile.logout')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
