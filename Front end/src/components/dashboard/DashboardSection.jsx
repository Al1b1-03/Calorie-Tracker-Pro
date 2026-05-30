import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entriesApi } from '../../api/entries';
import { waterApi } from '../../api/water';
import { authApi } from '../../api/auth';
import { useLanguage } from '../../i18n/LanguageContext';
import RingProgress from '../ui/RingProgress';
import { SkeletonCardList } from '../ui/Skeleton';
import './DashboardSection.css';

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function DashboardSection({ refreshKey = 0, onRefresh }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : lang === 'kk' ? 'kk-KZ' : 'ru-RU';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [water, setWater] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addingWater, setAddingWater] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, waterRes, chartRes, profileRes] = await Promise.all([
        entriesApi.getStats(),
        waterApi.getToday(),
        entriesApi.getChart(chartPeriod),
        authApi.getProfile().catch(() => ({ user: null })),
      ]);
      setStats(statsRes);
      setWater(waterRes);
      setChartData(chartRes.data || []);
      setProfile(profileRes.user);
    } catch {
      setStats({
        today: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        norm: 2000,
        remaining: 2000,
        macros: { protein: 150, fat: 65, carbs: 200 },
      });
      setWater({ totalMl: 0, goalMl: 2000, percent: 0 });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => {
    loadAll();
  }, [loadAll, refreshKey]);

  useEffect(() => {
    const onNormsUpdated = () => loadAll();
    window.addEventListener('profileNormsUpdated', onNormsUpdated);
    return () => window.removeEventListener('profileNormsUpdated', onNormsUpdated);
  }, [loadAll]);

  useEffect(() => {
    entriesApi.getChart(chartPeriod).then((res) => setChartData(res.data || [])).catch(() => {});
  }, [chartPeriod]);

  const bmi = useMemo(() => {
    const w = parseFloat(profile?.weight);
    const h = parseInt(profile?.height, 10);
    if (!w || !h) return null;
    const m = h / 100;
    const val = w / (m * m);
    let label = t('dashboard.bmiNormal');
    if (val < 18.5) label = t('dashboard.bmiLow');
    else if (val >= 25 && val < 30) label = t('dashboard.bmiOver');
    else if (val >= 30) label = t('dashboard.bmiObese');
    return { value: val.toFixed(1), label };
  }, [profile, t]);

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date(getLocalDateString() + 'T12:00:00');
    const map = new Map(chartData.map((d) => [d.date, d.calories || 0]));
    for (let i = 0; i < 30; i += 1) {
      const key = getLocalDateString(cursor);
      if ((map.get(key) ?? 0) <= 0) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [chartData]);

  const handleAddWater = async (ml) => {
    setAddingWater(true);
    try {
      const res = await waterApi.add(ml);
      setWater(res);
    } catch {
      /* ignore */
    } finally {
      setAddingWater(false);
    }
  };

  if (loading && !stats) {
    return (
      <section className="dashboard glass-card">
        <SkeletonCardList count={2} />
      </section>
    );
  }

  const norm = stats?.norm ?? 2000;
  const consumed = stats?.today?.calories ?? 0;
  const remaining = stats?.remaining ?? norm - consumed;
  const canEatToday = Math.max(0, remaining);
  const hasPersonalNorm = Number(profile?.calorieNorm) > 0;
  const proteinNorm = stats?.macros?.protein || profile?.protein || 150;
  const fatNorm = stats?.macros?.fat || profile?.fat || 65;
  const carbsNorm = stats?.macros?.carbs || profile?.carbs || 200;
  const maxChart = Math.max(norm, ...chartData.map((d) => d.calories), 1);

  return (
    <section className="dashboard glass-card" aria-label={t('dashboard.title')}>
      <div className="dashboard__hero-row">
        <div className="dashboard__rings">
          <RingProgress
            value={consumed}
            max={norm}
            size={168}
            stroke={14}
            label={`${canEatToday}`}
            sublabel={t('dashboard.canEatLabel')}
            color="var(--color-primary)"
          />
          <div className="dashboard__mini-rings">
            <RingProgress
              value={stats?.today?.protein ?? 0}
              max={proteinNorm}
              size={72}
              stroke={6}
              label={`${Math.round(stats?.today?.protein ?? 0)}`}
              sublabel={t('dashboard.protein')}
              color="#10b981"
              className="dashboard__mini-ring"
            />
            <RingProgress
              value={stats?.today?.fat ?? 0}
              max={fatNorm}
              size={72}
              stroke={6}
              label={`${Math.round(stats?.today?.fat ?? 0)}`}
              sublabel={t('dashboard.fat')}
              color="#f59e0b"
              className="dashboard__mini-ring"
            />
            <RingProgress
              value={stats?.today?.carbs ?? 0}
              max={carbsNorm}
              size={72}
              stroke={6}
              label={`${Math.round(stats?.today?.carbs ?? 0)}`}
              sublabel={t('dashboard.carbs')}
              color="#8b5cf6"
              className="dashboard__mini-ring"
            />
          </div>
        </div>

        <div className="dashboard__meta">
          <div className="dashboard__chip-row">
            <span className="dashboard__chip dashboard__chip--streak">
              🔥 {streak} {t('dashboard.days')}
            </span>
            {bmi && (
              <span className="dashboard__chip">
                {t('dashboard.bmi')}: {bmi.value} · {bmi.label}
              </span>
            )}
          </div>
          <p className="dashboard__remaining">
            {remaining >= 0
              ? `${t('dashboard.remaining')}: ${remaining} ${t('dashboard.kcal')}`
              : `${t('dashboard.over')}: ${Math.abs(remaining)} ${t('dashboard.kcal')}`}
          </p>
          {!hasPersonalNorm && (
            <Link to="/profile" className="dashboard__norm-cta">
              {t('dashboard.setNormAction')}
            </Link>
          )}
        </div>
      </div>

      <div className="dashboard__water">
        <div className="dashboard__water-head">
          <span className="dashboard__water-title">💧 {t('dashboard.water')}</span>
          <span className="dashboard__water-value">
            {(water?.totalMl ?? 0) / 1000}L / {(water?.goalMl ?? 2000) / 1000}L
          </span>
        </div>
        <div className="dashboard__water-bar">
          <div
            className="dashboard__water-fill"
            style={{ width: `${water?.percent ?? 0}%` }}
          />
        </div>
        <div className="dashboard__water-actions">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              type="button"
              className="dashboard__water-btn"
              disabled={addingWater}
              onClick={() => handleAddWater(ml)}
            >
              +{ml} ml
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard__actions">
        <Link to="/ai-camera" className="dashboard__action dashboard__action--primary">
          <CameraIcon />
          {t('nav.aiCamera')}
        </Link>
        <button
          type="button"
          className="dashboard__action"
          onClick={() => {
            loadAll();
            onRefresh?.();
          }}
        >
          {t('dashboard.refresh')}
        </button>
      </div>

      <div className="dashboard__chart">
        <div className="dashboard__chart-tabs">
          <button
            type="button"
            className={`dashboard__chart-tab ${chartPeriod === 'week' ? 'dashboard__chart-tab--active' : ''}`}
            onClick={() => setChartPeriod('week')}
          >
            {t('dashboard.week')}
          </button>
          <button
            type="button"
            className={`dashboard__chart-tab ${chartPeriod === 'month' ? 'dashboard__chart-tab--active' : ''}`}
            onClick={() => setChartPeriod('month')}
          >
            {t('dashboard.month')}
          </button>
        </div>
        {chartData.length > 0 ? (
          <div className="dashboard__chart-bars">
            {chartData.map(({ date, calories }) => {
              const heightPct = Math.round((calories / maxChart) * 100);
              const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString(locale, {
                day: '2-digit',
                month: chartPeriod === 'month' ? '2-digit' : 'short',
              });
              return (
                <div key={date} className="dashboard__chart-bar-wrap">
                  <div className="dashboard__chart-bar-container">
                    <div
                      className="dashboard__chart-bar"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                      title={`${dayLabel}: ${calories}`}
                    />
                  </div>
                  <span className="dashboard__chart-label">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="dashboard__chart-empty">{t('dashboard.noChart')}</p>
        )}
      </div>
    </section>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h3l1.5-2h7L17 8h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default memo(DashboardSection);
