/**
 * ФАЙЛ: AdminManagementPage.jsx
 * ЧТО ЭТО: Страница: супер-админ.
 * ЗА ЧТО ОТВЕЧАЕТ: создание/удаление админов.
 */
import { useEffect, useState } from 'react';
import { adminManagementApi } from '../api/adminManagement';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/ui/PageHero';
import { ROLES, normalizeRole } from '../utils/roles';
import './AdminManagementPage.css';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function AdminManagementPage() {
  const { t } = useLanguage();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    try {
      setError('');
      const { admins: adminList } = await adminManagementApi.listAdmins();
      setAdmins(adminList || []);
    } catch (err) {
      setError(err.message || t('adminManagement.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading('create');
    setError('');
    setSuccess('');
    try {
      await adminManagementApi.createAdmin(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess(t('adminManagement.createSuccess'));
      await loadData();
    } catch (err) {
      setError(err.message || t('adminManagement.createError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (admin) => {
    if (normalizeRole(admin.role) === ROLES.SUPER_ADMIN) return;
    if (!window.confirm(t('adminManagement.confirmDelete').replace('{name}', admin.fullName))) {
      return;
    }
    setActionLoading(admin.id);
    setError('');
    setSuccess('');
    try {
      await adminManagementApi.deleteAdmin(admin.id);
      setSuccess(t('adminManagement.deleteSuccess'));
      await loadData();
    } catch (err) {
      setError(err.message || t('adminManagement.deleteError'));
    } finally {
      setActionLoading(null);
    }
  };

  const roleLabel = (role) => {
    const r = normalizeRole(role);
    if (r === ROLES.SUPER_ADMIN) return t('adminManagement.roleSuper');
    if (r === ROLES.ADMIN) return t('adminManagement.roleAdmin');
    return t('adminManagement.roleUser');
  };

  return (
    <div className="page admin-management">
      <PageHero
        eyebrow={t('adminManagement.eyebrow')}
        title={t('adminManagement.title')}
        subtitle={t('adminManagement.subtitle')}
      />

      {error && <p className="admin-management__message admin-management__message--error">{error}</p>}
      {success && <p className="admin-management__message admin-management__message--success">{success}</p>}

      <div className="admin-management__toolbar">
        <button
          type="button"
          className="admin-management__btn admin-management__btn--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? t('adminManagement.cancelCreate') : t('adminManagement.create')}
        </button>
      </div>

      {showForm && (
        <form className="admin-management__form glass-card" onSubmit={handleCreate}>
          <h2 className="admin-management__section-title">{t('adminManagement.createTitle')}</h2>
          <div className="admin-management__form-grid">
            <label className="admin-management__field">
              <span>{t('adminManagement.firstName')}</span>
              <input name="firstName" value={form.firstName} onChange={handleFormChange} required />
            </label>
            <label className="admin-management__field">
              <span>{t('adminManagement.lastName')}</span>
              <input name="lastName" value={form.lastName} onChange={handleFormChange} required />
            </label>
            <label className="admin-management__field">
              <span>{t('adminManagement.email')}</span>
              <input type="email" name="email" value={form.email} onChange={handleFormChange} required />
            </label>
            <label className="admin-management__field">
              <span>{t('adminManagement.phone')}</span>
              <input name="phone" value={form.phone} onChange={handleFormChange} />
            </label>
            <label className="admin-management__field admin-management__field--wide">
              <span>{t('adminManagement.password')}</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                minLength={6}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="admin-management__btn admin-management__btn--primary"
            disabled={actionLoading === 'create'}
          >
            {actionLoading === 'create' ? '...' : t('adminManagement.submitCreate')}
          </button>
        </form>
      )}

      <section className="admin-management__section">
        <h2 className="admin-management__section-title">{t('adminManagement.adminsTitle')}</h2>
        {loading ? (
          <p className="admin-management__loading">{t('adminManagement.loading')}</p>
        ) : (
          <div className="admin-management__grid">
            {admins.map((admin) => {
              const isSuper = normalizeRole(admin.role) === ROLES.SUPER_ADMIN;
              return (
                <article key={admin.id} className="admin-management__card glass-card">
                  <div className="admin-management__card-head">
                    <strong>{admin.fullName}</strong>
                    <span className={`admin-management__badge ${isSuper ? 'admin-management__badge--super' : ''}`}>
                      {roleLabel(admin.role)}
                    </span>
                  </div>
                  <p className="admin-management__meta">{admin.email}</p>
                  {!isSuper && (
                    <button
                      type="button"
                      className="admin-management__btn admin-management__btn--danger"
                      onClick={() => handleDelete(admin)}
                      disabled={actionLoading === admin.id}
                    >
                      {actionLoading === admin.id ? '...' : t('adminManagement.delete')}
                    </button>
                  )}
                </article>
              );
            })}
            {admins.length === 0 && (
              <p className="admin-management__empty">{t('adminManagement.noAdmins')}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
