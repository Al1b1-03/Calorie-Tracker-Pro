import { useState, useEffect } from 'react';
import { workoutsApi } from '../api/workouts';
import { getApiOrigin } from '../api/products';
import { useLanguage } from '../i18n/LanguageContext';
import { translateWorkoutText } from '../i18n/dynamicContent';
import PageHero from '../components/ui/PageHero';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { useBodyClass } from '../hooks/useBodyClass';
import './WorkoutsPage.css';

const WorkoutIcon = ({ id = 'workout-g' }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill={`url(#workout-gradient-${id})`} />
    <path
      d="M32 18v28M24 26h16M24 26l-4 12h4l4-4 4 4h4l-4-12M24 38h16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id={`workout-gradient-${id}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="0.5" stopColor="#8b5cf6" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

export default function WorkoutsPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? { title: 'Workouts', subtitle: 'Programs by muscle group with difficulty levels and exercise details.', all: 'All', arms: 'Arms', core: 'Core', chest: 'Chest', back: 'Back', legs: 'Legs', cardio: 'Cardio', fullbody: 'Full body', empty: 'No workouts in this category yet', details: 'Details', close: 'Close', short: 'SHORT:', benefits: 'WHAT IT DEVELOPS:', howTo: 'HOW TO DO:', regime: 'REGIME:', important: 'IMPORTANT:', rest: 'Rest:' }
    : lang === 'kk'
      ? { title: 'Жаттығулар', subtitle: 'Бұлшық топтары бойынша бағдарламалар — қиындық пен жаттығу сипаттамасымен.', all: 'Барлығы', arms: 'Қол', core: 'Пресс / Кор', chest: 'Кеуде', back: 'Арқа', legs: 'Аяқ', cardio: 'Кардио', fullbody: 'Толық дене', empty: 'Бұл санатта жаттығу жоқ', details: 'Толығырақ', close: 'Жабу', short: 'ҚЫСҚАША:', benefits: 'НЕ ДАМЫТАДЫ:', howTo: 'ҚАЛАЙ ОРЫНДАУ:', regime: 'РЕЖИМ:', important: 'МАҢЫЗДЫ:', rest: 'Демалыс:' }
      : { title: 'Тренировки', subtitle: 'Программы по группам мышц с уровнем сложности и подробным описанием упражнений.', all: 'Все', arms: 'Руки', core: 'Пресс / Кор', chest: 'Грудь', back: 'Спина', legs: 'Ноги', cardio: 'Кардио', fullbody: 'Всё тело', empty: 'В этой категории пока нет тренировок', details: 'Подробнее', close: 'Закрыть', short: 'КРАТКО:', benefits: 'ЧТО РАЗВИВАЕТ:', howTo: 'КАК ВЫПОЛНЯТЬ:', regime: 'РЕЖИМ:', important: 'ВАЖНО:', rest: 'Отдых:' };

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const apiOrigin = getApiOrigin();
  const [filter, setFilter] = useState('all');

  const getTargetMusclesChips = (workout) => {
    const raw = translateWorkoutText(lang, workout, 'targetMuscles') || workout?.targetMuscles;
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const getDifficultyLevel = (difficulty) => {
    const raw = (difficulty || '').toString().trim().toLowerCase();
    const d = raw.replace(/ё/g, 'е'); // нормализуем «лёгкая» -> «легкая»
    if (/легк|easy/i.test(d)) return 'easy'; // Лёгкая
    if (/высок|сложн|hard|тяжел/i.test(d)) return 'hard'; // Высокая / Сложная
    return 'medium';
  };

  const getWorkoutImageSrc = (workout) => {
    const raw = workout?.imageUrl || workout?.image;
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const filename = trimmed.split(/[/\\]/).pop();
    if (!filename) return null;
    return `${apiOrigin}/api/uploads/products/${filename}`;
  };

  useEffect(() => {
    workoutsApi
      .list()
      .then(({ workouts: data }) => setWorkouts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.warn('Workouts API:', err?.message || err);
        setWorkouts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useBodyClass('modal-open', !!selectedWorkout);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Calorie Tracker Pro - Тренировки';
    return () => { document.title = prev; };
  }, []);

  const openDetails = (workout) => setSelectedWorkout(workout);
  const closeDetails = () => setSelectedWorkout(null);

  const visibleWorkouts = workouts.filter((w) =>
    filter === 'all' ? true : (w.category || 'other') === filter
  );

  return (
    <div className="page workouts-page">
      <PageHero title={tr.title} subtitle={tr.subtitle} />
      <div className="workouts-filters" role="tablist" aria-label={tr.title}>
        <button
          type="button"
          className={`workouts-filter ${filter === 'all' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {tr.all}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'arms' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('arms')}
        >
          💪 {tr.arms}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'core' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('core')}
        >
          🔥 {tr.core}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'chest' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('chest')}
        >
          🏋️ {tr.chest}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'back' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('back')}
        >
          🔙 {tr.back}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'legs' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('legs')}
        >
          🦵 {tr.legs}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'cardio' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('cardio')}
        >
          🏃 {tr.cardio}
        </button>
        <button
          type="button"
          className={`workouts-filter ${filter === 'fullbody' ? 'workouts-filter--active' : ''}`}
          onClick={() => setFilter('fullbody')}
        >
          ⚡ {tr.fullbody}
        </button>
      </div>
      {loading && <SkeletonCardList count={6} />}
      {!loading && visibleWorkouts.length === 0 && (
        <EmptyState icon="💪" title={tr.empty} />
      )}
      {!loading && visibleWorkouts.length > 0 && (
      <div className="workouts-grid">
        {visibleWorkouts.map((workout) => (
          <div key={workout.id} className="workout-card">
            <div className="workout-card__image-wrap">
              {getWorkoutImageSrc(workout) ? (
                <img
                  src={getWorkoutImageSrc(workout)}
                  alt={translateWorkoutText(lang, workout, 'title')}
                  className="workout-card__image"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="workout-card__placeholder">
                  <WorkoutIcon id={workout.id} />
                </div>
              )}
            </div>
            <div className="workout-card__content">
              <h3 className="workout-card__name">{translateWorkoutText(lang, workout, 'title')}</h3>
              <p className="workout-card__desc">{translateWorkoutText(lang, workout, 'shortDesc')}</p>
              <div className="workout-card__meta">
                {workout.difficulty && (
                  <span
                    className={`workout-card__meta-item workout-card__meta-item--difficulty workout-card__meta-item--${getDifficultyLevel(workout.difficulty)}`}
                  >
                      {translateWorkoutText(lang, workout, 'difficulty')}
                  </span>
                )}
                {getTargetMusclesChips(workout).map((muscle) => (
                  <span key={muscle} className="workout-card__meta-item">
                    {muscle}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="workout-card__btn workout-card__btn--primary"
                onClick={() => openDetails(workout)}
              >
                {tr.details}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {selectedWorkout && (
        <div className="workout-modal" onClick={closeDetails}>
          <div className="workout-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="workout-modal__close"
              onClick={closeDetails}
              aria-label={tr.close}
            >
              ×
            </button>
            <div className="workout-modal__layout">
              <div className="workout-modal__left">
                <div className="workout-modal__left-illustration">
                  {getWorkoutImageSrc(selectedWorkout) ? (
                    <img
                      src={getWorkoutImageSrc(selectedWorkout)}
                      alt={translateWorkoutText(lang, selectedWorkout, 'title')}
                      className="workout-modal__left-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <WorkoutIcon id={selectedWorkout.id} />
                  )}
                </div>
                <div className="workout-modal__left-title">{translateWorkoutText(lang, selectedWorkout, 'title')}</div>
              </div>
              <div className="workout-modal__right">
                <h2 className="workout-modal__title">{translateWorkoutText(lang, selectedWorkout, 'title')}</h2>
                <div className="workout-modal__chips">
                  {selectedWorkout.difficulty && (
                    <span
                      className={`workout-chip workout-chip--difficulty workout-chip--difficulty-${getDifficultyLevel(selectedWorkout.difficulty)}`}
                    >
                      {translateWorkoutText(lang, selectedWorkout, 'difficulty')}
                    </span>
                  )}
                  {getTargetMusclesChips(selectedWorkout).map((muscle) => (
                    <span key={muscle} className="workout-chip workout-chip--muscle">
                      {muscle}
                    </span>
                  ))}
                </div>
                {selectedWorkout.shortDesc && (
                  <>
                    <h4 className="workout-modal__section-title">{tr.short}</h4>
                    <p className="workout-modal__desc">{translateWorkoutText(lang, selectedWorkout, 'shortDesc')}</p>
                  </>
                )}
                {(selectedWorkout.benefits || selectedWorkout.fullDescription) && (
                  <>
                    <h4 className="workout-modal__section-title">{tr.benefits}</h4>
                    <p className="workout-modal__desc">
                      {translateWorkoutText(lang, selectedWorkout, 'benefits') || translateWorkoutText(lang, selectedWorkout, 'fullDescription')}
                    </p>
                  </>
                )}
                {selectedWorkout.howTo && (
                  <>
                    <h4 className="workout-modal__section-title">{tr.howTo}</h4>
                    <p className="workout-modal__desc">{translateWorkoutText(lang, selectedWorkout, 'howTo')}</p>
                  </>
                )}
                {selectedWorkout.regime && (
                  <>
                    <h4 className="workout-modal__section-title">{tr.regime}</h4>
                    <p className="workout-modal__desc">{translateWorkoutText(lang, selectedWorkout, 'regime')}</p>
                  </>
                )}
                {selectedWorkout.important && (
                  <>
                    <h4 className="workout-modal__section-title">{tr.important}</h4>
                    <p className="workout-modal__desc">{translateWorkoutText(lang, selectedWorkout, 'important')}</p>
                  </>
                )}
                <div className="workout-modal__exercises">
                  {(selectedWorkout.exercises || []).map((ex, idx) => (
                    <div key={idx} className="workout-modal__exercise">
                      <div className="workout-modal__exercise-header">
                        <span className="workout-modal__exercise-name">{translateWorkoutText(lang, ex.name)}</span>
                        <span className="workout-modal__exercise-sets">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                      {ex.rest && ex.rest !== '—' && (
                        <span className="workout-modal__exercise-rest">{tr.rest} {translateWorkoutText(lang, ex.rest)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
