/**
 * ФАЙЛ: AboutPage.jsx
 * ЧТО ЭТО: Страница: о проекте (/about).
 * ЗА ЧТО ОТВЕЧАЕТ: описание приложения.
 */
import { Link } from 'react-router-dom';
import './AboutPage.css';
import { useLanguage } from '../i18n/LanguageContext';

function StarRating({ count = 5 }) {
  return (
    <div className="about-page__stars" aria-label={`${count}/5`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
          />
        </svg>
      ))}
    </div>
  );
}

function ValueIcon({ type }) {
  const icons = {
    science: (
      <path
        d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    ),
    design: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    privacy: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </>
    ),
    shield: (
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </>
    ),
    support: (
      <>
        <path d="M4 12a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M12 20v-2M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <span className="about-page__icon-wrap" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {icons[type]}
      </svg>
    </span>
  );
}

export default function AboutPage() {
  const { t } = useLanguage();
  const isLoggedIn = !!localStorage.getItem('token');
  const startHref = isLoggedIn ? '/' : '/login';

  const metrics = [
    { value: t('aboutPage.metrics.aiValue'), label: t('aboutPage.metrics.aiLabel') },
    { value: t('aboutPage.metrics.modulesValue'), label: t('aboutPage.metrics.modulesLabel') },
    { value: t('aboutPage.metrics.accessValue'), label: t('aboutPage.metrics.accessLabel') },
    { value: t('aboutPage.metrics.usersValue'), label: t('aboutPage.metrics.usersLabel') },
  ];

  const values = [
    { icon: 'science', title: t('aboutPage.values.oneTitle'), text: t('aboutPage.values.oneText') },
    { icon: 'design', title: t('aboutPage.values.twoTitle'), text: t('aboutPage.values.twoText') },
    { icon: 'privacy', title: t('aboutPage.values.threeTitle'), text: t('aboutPage.values.threeText') },
  ];

  const steps = [
    { n: '01', title: t('aboutPage.steps.step1title'), text: t('aboutPage.steps.step1text') },
    { n: '02', title: t('aboutPage.steps.step2title'), text: t('aboutPage.steps.step2text') },
    { n: '03', title: t('aboutPage.steps.step3title'), text: t('aboutPage.steps.step3text') },
    { n: '04', title: t('aboutPage.steps.step4title'), text: t('aboutPage.steps.step4text') },
  ];

  const features = [
    { title: t('aboutPage.features.oneTitle'), text: t('aboutPage.features.oneText') },
    { title: t('aboutPage.features.twoTitle'), text: t('aboutPage.features.twoText') },
    { title: t('aboutPage.features.threeTitle'), text: t('aboutPage.features.threeText') },
    { title: t('aboutPage.features.fourTitle'), text: t('aboutPage.features.fourText') },
  ];

  const audience = [
    { title: t('aboutPage.audience.beginnersTitle'), text: t('aboutPage.audience.beginnersText') },
    { title: t('aboutPage.audience.busyTitle'), text: t('aboutPage.audience.busyText') },
    { title: t('aboutPage.audience.advancedTitle'), text: t('aboutPage.audience.advancedText') },
  ];

  const reviews = [
    {
      quote: t('aboutPage.reviews.r1quote'),
      name: t('aboutPage.reviews.r1name'),
      role: t('aboutPage.reviews.r1role'),
    },
    {
      quote: t('aboutPage.reviews.r2quote'),
      name: t('aboutPage.reviews.r2name'),
      role: t('aboutPage.reviews.r2role'),
    },
    {
      quote: t('aboutPage.reviews.r3quote'),
      name: t('aboutPage.reviews.r3name'),
      role: t('aboutPage.reviews.r3role'),
    },
  ];

  const trust = [
    { icon: 'shield', title: t('aboutPage.trust.privacyTitle'), text: t('aboutPage.trust.privacyText') },
    { icon: 'lock', title: t('aboutPage.trust.secureTitle'), text: t('aboutPage.trust.secureText') },
    { icon: 'support', title: t('aboutPage.trust.supportTitle'), text: t('aboutPage.trust.supportText') },
  ];

  return (
    <div className="page about-page">
      <section className="about-page__hero">
        <div className="about-page__hero-copy">
          <p className="about-page__eyebrow">{t('aboutPage.eyebrow')}</p>
          <h1 className="about-page__headline">
            {t('aboutPage.title')}
            <span className="about-page__headline-accent">{t('aboutPage.titleAccent')}</span>
          </h1>
          <p className="about-page__lead">{t('aboutPage.subtitle')}</p>
          <div className="about-page__cta-row">
            <Link to={startHref} className="about-page__btn about-page__btn--primary">
              {t('aboutPage.ctaStart')}
            </Link>
            <Link to="/ai-camera" className="about-page__btn about-page__btn--ghost">
              {t('aboutPage.ctaExplore')}
            </Link>
          </div>
        </div>
        <div className="about-page__hero-visual">
          <div className="about-page__hero-banner about-page__image-card--banner">
            <img
              className="about-page__image"
              src="/images/about/nutrition.png"
              alt={`${t('aboutPage.hero.nutritionTitle')}. ${t('aboutPage.hero.nutritionText')}`}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="about-page__metrics" aria-label={t('aboutPage.metrics.title')}>
        {metrics.map(({ value, label }) => (
          <div key={label} className="about-page__metric">
            <span className="about-page__metric-value">{value}</span>
            <span className="about-page__metric-label">{label}</span>
          </div>
        ))}
      </section>

      <section className="about-page__section">
        <header className="about-page__section-head">
          <p className="about-page__eyebrow">{t('aboutPage.showcase.eyebrow')}</p>
          <h2 className="about-page__section-title">{t('aboutPage.showcase.title')}</h2>
          <p className="about-page__section-desc">{t('aboutPage.showcase.subtitle')}</p>
        </header>
        <div className="about-page__bento">
          <article className="about-page__bento-card about-page__bento-card--wide about-page__image-card--banner">
            <img
              className="about-page__image"
              src="/images/about/nutrition.png"
              alt={t('aboutPage.hero.nutritionTitle')}
              loading="lazy"
            />
            <div className="about-page__bento-caption">
              <h3>{t('aboutPage.hero.nutritionTitle')}</h3>
              <p>{t('aboutPage.hero.nutritionText')}</p>
            </div>
          </article>
          <article className="about-page__bento-card">
            <img
              className="about-page__image"
              src="/images/about/workout.jpg"
              alt={t('aboutPage.hero.workoutCaption')}
              loading="lazy"
            />
            <div className="about-page__bento-caption">
              <h3>{t('aboutPage.hero.workoutCaption')}</h3>
            </div>
          </article>
          <article className="about-page__bento-card">
            <img
              className="about-page__image"
              src="/images/about/vitamins.png"
              alt={t('aboutPage.hero.vitaminsCaption')}
              loading="lazy"
            />
            <div className="about-page__bento-caption">
              <h3>{t('aboutPage.hero.vitaminsCaption')}</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="about-page__section about-page__section--surface">
        <header className="about-page__section-head about-page__section-head--center">
          <p className="about-page__eyebrow">{t('aboutPage.values.eyebrow')}</p>
          <h2 className="about-page__section-title">{t('aboutPage.values.title')}</h2>
        </header>
        <div className="about-page__values-grid">
          {values.map(({ icon, title, text }) => (
            <article key={title} className="about-page__value-card">
              <ValueIcon type={icon} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__section">
        <header className="about-page__section-head">
          <p className="about-page__eyebrow">{t('aboutPage.steps.eyebrow')}</p>
          <h2 className="about-page__section-title">{t('aboutPage.steps.title')}</h2>
        </header>
        <ol className="about-page__steps">
          {steps.map(({ n, title, text }) => (
            <li key={n} className="about-page__step">
              <span className="about-page__step-num">{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-page__section">
        <header className="about-page__section-head">
          <h2 className="about-page__section-title">{t('aboutPage.audience.title')}</h2>
        </header>
        <div className="about-page__audience-grid">
          {audience.map(({ title, text }) => (
            <article key={title} className="about-page__audience-card">
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__section about-page__section--surface">
        <header className="about-page__section-head">
          <h2 className="about-page__section-title">{t('aboutPage.features.title')}</h2>
        </header>
        <div className="about-page__features-grid">
          {features.map(({ title, text }) => (
            <article key={title} className="about-page__feature-card">
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__mission">
        <blockquote className="about-page__mission-quote">
          <p>{t('aboutPage.mission.text1')}</p>
        </blockquote>
        <p className="about-page__mission-note">{t('aboutPage.mission.text2')}</p>
        <cite className="about-page__mission-cite">{t('aboutPage.mission.title')}</cite>
      </section>

      <section className="about-page__section about-page__reviews">
        <header className="about-page__section-head about-page__section-head--center">
          <p className="about-page__eyebrow">{t('aboutPage.reviews.eyebrow')}</p>
          <h2 className="about-page__section-title">{t('aboutPage.reviews.title')}</h2>
          <p className="about-page__section-desc">{t('aboutPage.reviews.subtitle')}</p>
        </header>
        <div className="about-page__reviews-grid">
          {reviews.map(({ quote, name, role }) => (
            <article key={name} className="about-page__review-card">
              <StarRating />
              <p className="about-page__review-quote">&ldquo;{quote}&rdquo;</p>
              <footer className="about-page__review-author">
                <span className="about-page__review-avatar" aria-hidden>
                  {name.charAt(0)}
                </span>
                <div>
                  <strong>{name}</strong>
                  <span>{role}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__section">
        <header className="about-page__section-head about-page__section-head--center">
          <p className="about-page__eyebrow">{t('aboutPage.trust.eyebrow')}</p>
          <h2 className="about-page__section-title">{t('aboutPage.trust.title')}</h2>
        </header>
        <div className="about-page__trust-grid">
          {trust.map(({ icon, title, text }) => (
            <article key={title} className="about-page__trust-card">
              <ValueIcon type={icon} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page__cta-banner">
        <h2>{t('aboutPage.cta.title')}</h2>
        <p>{t('aboutPage.cta.subtitle')}</p>
        <Link to={startHref} className="about-page__btn about-page__btn--inverse">
          {t('aboutPage.cta.button')}
        </Link>
      </section>
    </div>
  );
}
