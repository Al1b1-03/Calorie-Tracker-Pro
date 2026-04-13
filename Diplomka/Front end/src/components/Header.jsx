import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { authApi } from '../api/auth';
import { LANGS } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
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

export default function Header() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));
  const { lang, setLang, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const langRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && !userRole) {
      authApi.getProfile().then(({ user }) => {
        if (user?.role) {
          localStorage.setItem('userRole', user.role);
          setUserRole(user.role);
        }
      }).catch(() => {});
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    const onRoleUpdate = () => setUserRole(localStorage.getItem('userRole'));
    window.addEventListener('userRoleUpdated', onRoleUpdate);
    return () => window.removeEventListener('userRoleUpdated', onRoleUpdate);
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!langRef.current) return;
      if (!langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isAdmin = userRole === 'admin';
  const languageDropdown = (
    <div className="header__lang-select-wrap header__lang-select-wrap--in-actions" ref={langRef}>
      <button
        type="button"
        className="header__lang-select"
        aria-label={t('header.language')}
        aria-expanded={isLangOpen}
        onClick={() => setIsLangOpen((prev) => !prev)}
      >
        {t(`lang.${lang}`)}
      </button>
      {isLangOpen && (
        <div className="header__lang-menu" role="listbox" aria-label={t('header.language')}>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={`header__lang-menu-item ${lang === code ? 'header__lang-menu-item--active' : ''}`}
              onClick={() => {
                setLang(code);
                setIsLangOpen(false);
              }}
            >
              {t(`lang.${code}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/logo.png" alt="" className="header__logo-img" />
          <span className="header__brand">
            {isAdmin ? t('header.brandAdmin') : <>{t('header.brandUser')}</>}
          </span>
        </Link>
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

        <nav
          id="main-navigation"
          className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}
        >
          <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
            {t('nav.about')}
          </NavLink>
          {isAdmin ? (
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
            </>
          ) : (
            <>
              <NavLink to="/shop" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                {t('nav.shop')}
              </NavLink>
              <NavLink to="/workouts" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>
                {t('nav.workouts')}
              </NavLink>
            </>
          )}
        </nav>
        <div className="header__actions">
          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <NavLink to="/cart" className="header__cart" aria-label={t('nav.cart')}>
                  <CartIcon />
                  <CartBadge />
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) => `header__profile-btn ${isActive ? 'header__profile-btn--active' : ''}`}
              >
                {t('nav.profile')}
              </NavLink>
              {languageDropdown}
            </>
          ) : (
            <>
              <Link to="/login" className="header__profile-btn">
                {t('nav.login')}
              </Link>
              {languageDropdown}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
