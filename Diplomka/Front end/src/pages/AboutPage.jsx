import './MainPage.css';
import './AboutPage.css';
import { useLanguage } from '../i18n/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="main-page about-page">
      <section className="about-page__hero">
        <div className="about-page__hero-left">
          <h1 className="about-page__title">{t('aboutPage.title')}</h1>
          <p className="about-page__subtitle">
            {t('aboutPage.subtitle')}
          </p>
          <div className="about-page__highlights">
            <div className="about-page__highlight">
              <span className="about-page__highlight-badge">24/7</span>
              <p>{t('aboutPage.highlights.anytime')}</p>
            </div>
            <div className="about-page__highlight">
              <span className="about-page__highlight-badge">100%</span>
              <p>{t('aboutPage.highlights.health')}</p>
            </div>
          </div>
        </div>
        <div className="about-page__hero-right">
          <div className="about-page__image-card about-page__image-card--main">
            <div className="about-page__image about-page__image--nutrition" />
            <div className="about-page__image-overlay">
              <h2>{t('aboutPage.hero.nutritionTitle')}</h2>
              <p>{t('aboutPage.hero.nutritionText')}</p>
            </div>
          </div>
          <div className="about-page__image-row">
            <div className="about-page__image-card">
              <div className="about-page__image about-page__image--workout" />
              <p className="about-page__image-caption">{t('aboutPage.hero.workoutCaption')}</p>
            </div>
            <div className="about-page__image-card">
              <div className="about-page__image about-page__image--vitamins" />
              <p className="about-page__image-caption">{t('aboutPage.hero.vitaminsCaption')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__section">
        <div className="about-page__section-card">
          <h2>{t('aboutPage.audience.title')}</h2>
          <div className="about-page__pill-grid">
            <div className="about-page__pill">
              <h3>{t('aboutPage.audience.beginnersTitle')}</h3>
              <p>{t('aboutPage.audience.beginnersText')}</p>
            </div>
            <div className="about-page__pill">
              <h3>{t('aboutPage.audience.busyTitle')}</h3>
              <p>{t('aboutPage.audience.busyText')}</p>
            </div>
            <div className="about-page__pill">
              <h3>{t('aboutPage.audience.advancedTitle')}</h3>
              <p>{t('aboutPage.audience.advancedText')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__section about-page__section--grid">
        <div className="about-page__section-card about-page__section-card--accent">
          <h2>{t('aboutPage.features.title')}</h2>
          <ul className="about-page__list">
            <li>
              <strong>{t('aboutPage.features.oneTitle')}</strong> — {t('aboutPage.features.oneText')}
            </li>
            <li>
              <strong>{t('aboutPage.features.twoTitle')}</strong> — {t('aboutPage.features.twoText')}
            </li>
            <li>
              <strong>{t('aboutPage.features.threeTitle')}</strong> — {t('aboutPage.features.threeText')}
            </li>
            <li>
              <strong>{t('aboutPage.features.fourTitle')}</strong> — {t('aboutPage.features.fourText')}
            </li>
          </ul>
        </div>
        <div className="about-page__section-card">
          <h2>{t('aboutPage.mission.title')}</h2>
          <p className="about-page__text">
            {t('aboutPage.mission.text1')}
          </p>
          <p className="about-page__text">
            {t('aboutPage.mission.text2')}
          </p>
        </div>
      </section>

      <section className="about-page__section">
        <div className="about-page__section-card about-page__section-card--stats">
          <h2>{t('aboutPage.stats.title')}</h2>
          <div className="about-page__stats-grid">
            <div className="about-page__stat">
              <span className="about-page__stat-value">1</span>
              <span className="about-page__stat-label">{t('aboutPage.stats.one')}</span>
            </div>
            <div className="about-page__stat">
              <span className="about-page__stat-value">2</span>
              <span className="about-page__stat-label">{t('aboutPage.stats.two')}</span>
            </div>
            <div className="about-page__stat">
              <span className="about-page__stat-value">24/7</span>
              <span className="about-page__stat-label">{t('aboutPage.stats.three')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


