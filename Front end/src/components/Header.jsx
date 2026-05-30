import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import { LANGS } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { isAdmin, isSuperAdmin, normalizeRole } from '../utils/roles';
import './Header.css';

const CartIcon = () => (
  <svg
    className="header__cart-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M5 7h14l-1.5 10H6.5L5 7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7V5a3 3 0 016 0v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { items } = await import('../api/shop').then((m) => m.shopApi.getCart());
        setCount(items?.length ?? 0);
      } catch {
        setCount(0);
      }
    };
    if (localStorage.getItem('token')) fetchCount();
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      import('../api/shop').then((m) =>
        m.shopApi.getCart().then(({ items }) => setCount(items?.length ?? 0))
      );
    };
    window.addEventListener('cartUpdated', onUpdate);
    return () => window.removeEventListener('cartUpdated', onUpdate);
  }, []);

  if (count === 0) return null;
  return <span className="header__cart-badge">{count}</span>;
}

function LanguageSelector({ wrapClassName = '' }) {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!ref.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={`header__lang-select-wrap ${wrapClassName}`} ref={ref}>
      <button
        type="button"
        className="header__lang-select"
        aria-label={t('header.language')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {t(`lang.${lang}`)}
      </button>
      {isOpen && (
        <div className="header__lang-menu" role="listbox" aria-label={t('header.language')}>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={`header__lang-menu-item ${lang === code ? 'header__lang-menu-item--active' : ''}`}
              onClick={() => {
                setLang(code);
                setIsOpen(false);
              }}
            >
              {t(`lang.${code}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.[0]?.toUpperCase() ?? '';
  const last = lastName?.trim()?.[0]?.toUpperCase() ?? '';
  return `${first}${last}` || '?';
}

function DrawerProfileLink({ user, isLoggedIn, t }) {
  if (!isLoggedIn) {
    return (
      <Link to="/login" className="header__drawer-profile">
        <span className="header__drawer-avatar header__drawer-avatar--guest" aria-hidden>
          ?
        </span>
        <span className="header__drawer-profile-text">
          <span className="header__drawer-profile-name">{t('nav.login')}</span>
        </span>
      </Link>
    );
  }

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || t('nav.profile');

  return (
    <NavLink
      to="/profile"
      className={({ isActive }) =>
        `header__drawer-profile ${isActive ? 'header__drawer-profile--active' : ''}`
      }
      aria-label={t('nav.profile')}
    >
      <span className="header__drawer-avatar" aria-hidden>
        {initials}
      </span>
      <span className="header__drawer-profile-text">
        <span className="header__drawer-profile-name">{fullName}</span>
        <span className="header__drawer-profile-hint">{t('nav.profile')}</span>
      </span>
    </NavLink>
  );
}

function AuthActions({ isLoggedIn, isAdmin, t, variant = 'desktop' }) {
  const wrapClass =
    variant === 'mobile'
      ? 'header__lang-select-wrap header__lang-select-wrap--mobile'
      : 'header__lang-select-wrap';

  if (isLoggedIn) {
    return (
      <>
        {variant === 'desktop' && !isAdmin && (
          <NavLink
            to="/cart"
            className="header__cart"
            aria-label={t('nav.cart')}
          >
            <CartIcon />
            <CartBadge />
          </NavLink>
        )}
        {variant === 'desktop' && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `header__profile-btn ${isActive ? 'header__profile-btn--active' : ''}`
            }
          >
            {t('nav.profile')}
          </NavLink>
        )}
        <LanguageSelector wrapClassName={wrapClass} />
      </>
    );
  }

  return (
    <>
      {variant === 'desktop' && (
        <Link to="/login" className="header__profile-btn">
          {t('nav.login')}
        </Link>
      )}
      <LanguageSelector wrapClassName={wrapClass} />
    </>
  );
}

export default function Header() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [userRole, setUserRole] = useState(() => normalizeRole(localStorage.getItem('userRole')));
  const [user, setUser] = useState(null);
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      setUser(null);
      return;
    }
    authApi.getProfile().then(({ user: profileUser }) => {
      if (profileUser) {
        setUser(profileUser);
        if (profileUser.role) {
          const role = normalizeRole(profileUser.role);
          localStorage.setItem('userRole', role);
          setUserRole(role);
        }
      }
    }).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(normalizeRole(localStorage.getItem('userRole')));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMobileMenuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  const isAdminUser = isAdmin(userRole);
  const isSuperAdminUser = isSuperAdmin(userRole);

  const navLinks = isAdminUser ? (
    <>
      <NavLink to="/products" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.products')}
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.orders')}
      </NavLink>
      <NavLink to="/support" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.support')}
      </NavLink>
      <NavLink to="/users" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.users')}
      </NavLink>
      <NavLink to="/workouts" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.workouts')}
      </NavLink>
      {isSuperAdminUser && (
        <NavLink to="/admin-management" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
          {t('nav.adminManagement')}
        </NavLink>
      )}
    </>
  ) : (
    <>
      <NavLink to="/ai-camera" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.aiCamera')}
      </NavLink>
      <NavLink to="/shop" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.shop')}
      </NavLink>
      <NavLink to="/workouts" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.workouts')}
      </NavLink>
    </>
  );

  const drawerLinks = (
    <>
      <NavLink to="/" end className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.home')}
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
        {t('nav.about')}
      </NavLink>
      {navLinks}
      {isLoggedIn && !isAdminUser && (
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `header__nav-link header__nav-link--cart ${isActive ? 'header__nav-link--active' : ''}`
          }
        >
          <CartIcon />
          <span>{t('nav.cart')}</span>
          <CartBadge />
        </NavLink>
      )}
    </>
  );

  const mobileDrawer =
    isMobileMenuOpen &&
    createPortal(
      <>
        <button
          type="button"
          className="header__overlay"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <nav
          id="main-navigation"
          className="header__nav header__nav--drawer header__nav--open"
          aria-hidden={false}
        >
          <DrawerProfileLink user={user} isLoggedIn={isLoggedIn} t={t} />
          {drawerLinks}
          <div className="header__mobile-actions">
            <AuthActions
              isLoggedIn={isLoggedIn}
              isAdmin={isAdminUser}
              t={t}
              variant="mobile"
            />
          </div>
        </nav>
      </>,
      document.body
    );

  return (
    <header className={`header${isMobileMenuOpen ? ' header--menu-open' : ''}`}>
      {mobileDrawer}
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/logo.png" alt="" className="header__logo-img" />
          <span className="header__brand">
            {isAdminUser ? (
              t('header.brandAdmin')
            ) : (
              <>
                Calorie <span className="header__brand-tracker">Tracker</span> Pro
              </>
            )}
          </span>
        </Link>

        <button
          type="button"
          className="header__theme-btn header__theme-btn--mobile"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <button
          type="button"
          className={`header__burger ${isMobileMenuOpen ? 'header__burger--open' : ''}`}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="desktop-navigation" className="header__nav header__nav--inline">
          <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            {t('nav.about')}
          </NavLink>
          {navLinks}
        </nav>

        <div className="header__actions header__actions--desktop">
          <button
            type="button"
            className="header__theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <AuthActions isLoggedIn={isLoggedIn} isAdmin={isAdminUser} t={t} variant="desktop" />
        </div>
      </div>
    </header>
  );
}
