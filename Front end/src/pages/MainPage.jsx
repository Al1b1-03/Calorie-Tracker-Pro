import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { entriesApi } from '../api/entries';
import { authApi } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import PageHero from '../components/ui/PageHero';
import EmptyState from '../components/ui/EmptyState';
import DashboardSection from '../components/dashboard/DashboardSection';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { calculateDailyNorms } from '../utils/calorieCalculator';
import './MainPage.css';

/** Возвращает дату в формате YYYY-MM-DD по локальному времени (чтобы после 00:00 сразу была новая дата). */
function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MainPage() {
  const location = useLocation();
  const { lang, t: tGlobal } = useLanguage();
  const tr = lang === 'en'
    ? {
        loadErr: 'Failed to load entries', needProduct: 'Enter product name', saveErr: 'Save failed', delErr: 'Delete failed',
        add: 'Add', newEntry: 'New entry', date: 'Date', product: 'Product or meal', productPh: 'What did you eat?',
        calories: 'Calories amount', protein: 'Protein (g)', fat: 'Fat (g)', carbs: 'Carbs (g)',
        saving: 'Saving...', save: 'Save', allEntries: 'All entries', from: 'From', to: 'To',
        loading: 'Loading...', empty: 'No entries to display', del: 'Delete', stats: 'Statistics', today: 'Today',
        norm: 'Norm', remaining: 'Remaining', total: 'Total', chart: 'Performance for 7 days', kkal: 'kcal',
        calcTitle: 'Calories and macros calculator',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        age: 'Age',
        weight: 'Weight (kg)',
        height: 'Height (cm)',
        kg: 'kg',
        activity: 'Activity',
        goal: 'Goal',
        activitySedentary: 'Sedentary',
        activityLight: 'Light',
        activityModerate: 'Moderate',
        activityActive: 'Active',
        activityVeryActive: 'Very active',
        goalLose: 'Lose weight',
        goalMaintain: 'Maintain',
        goalGain: 'Gain muscle',
        calcButton: 'Calculate',
        resultCalories: 'Daily calories',
        resultProtein: 'Protein',
        resultFat: 'Fat',
        resultCarbs: 'Carbs',
        resultBmr: 'Basal metabolism (BMR)',
        resultIdealWeight: 'Ideal weight',
        resultHealthyRange: 'Healthy weight range',
        resultBmi: 'BMI',
        weightUnder: 'Below healthy range',
        weightNormal: 'Within healthy range',
        weightOver: 'Above healthy range',
        weightDiffPlus: 'Above ideal by {n} kg',
        weightDiffMinus: 'Below ideal by {n} kg',
        weightDiffOk: 'Matches ideal weight',
        smartInsights: 'Smart insights',
        streak: 'Streak',
        avg7d: 'Average for 7 days',
        recommendation: 'Recommendation',
        days: 'days',
        recLow: 'You are below the plan. Add one balanced meal with protein and complex carbs.',
        recOver: 'You are above the plan. Reduce late snacks and increase water intake.',
        recOnTrack: 'You are on track. Keep current routine and meal timing.',
        heroEyebrow: 'Nutrition',
        heroTitle: 'Your daily dashboard',
        heroSubtitle: 'Track meals, macros, and progress in one place.',
      }
    : lang === 'kk'
      ? {
          loadErr: 'Жазбаларды жүктеу қатесі', needProduct: 'Өнім атауын енгізіңіз', saveErr: 'Сақтау қатесі', delErr: 'Жою қатесі',
          add: 'Қосу', newEntry: 'Жаңа жазба', date: 'Күні', product: 'Өнім немесе тағам', productPh: 'Не жедіңіз?',
          calories: 'Калория саны', protein: 'Ақуыз (г)', fat: 'Май (г)', carbs: 'Көмірсу (г)',
          saving: 'Сақталуда...', save: 'Сақтау', allEntries: 'Барлық жазбалар', from: 'Бастап', to: 'Дейін',
          loading: 'Жүктелуде...', empty: 'Көрсету үшін жазба жоқ', del: 'Жою', stats: 'Статистика', today: 'Бүгін',
          norm: 'Норма', remaining: 'Қалды', total: 'Барлығы', chart: '7 күндік нәтиже', kkal: 'ккал',
          smartInsights: 'Ақылды талдау',
          streak: 'Қатар күндер',
          avg7d: '7 күндік орташа',
          recommendation: 'Ұсыныс',
          days: 'күн',
          recLow: 'Жоспардан төменсіз. Ақуыз бен күрделі көмірсуы бар бір теңгерімді ас қосыңыз.',
          recOver: 'Жоспардан жоғарысыз. Кешкі тіскебасарды азайтып, су ішуді көбейтіңіз.',
          recOnTrack: 'Сіз жоспар бойынша келесіз. Қазіргі режимді сақтаңыз.',
          heroEyebrow: 'Тамақтану',
          heroTitle: 'Күнделікті панель',
          heroSubtitle: 'Тамақты, макроларды және прогресті бір жерде бақылаңыз.',
        }
      : {
          loadErr: 'Ошибка загрузки записей', needProduct: 'Введите название продукта', saveErr: 'Ошибка сохранения', delErr: 'Ошибка удаления',
          add: 'Добавить', newEntry: 'Новая запись', date: 'Дата', product: 'Продукт или блюдо', productPh: 'Что вы съели?',
          calories: 'Количество калорий', protein: 'Белки (г)', fat: 'Жиры (г)', carbs: 'Углеводы (г)',
          saving: 'Сохранение...', save: 'Сохранить', allEntries: 'Все записи', from: 'От', to: 'До',
          loading: 'Загрузка...', empty: 'Нет записей для отображения', del: 'Удалить', stats: 'Статистика', today: 'Сегодня',
          norm: 'Норма', remaining: 'Осталось', total: 'Всего', chart: 'Результативность за 7 дней', kkal: 'Ккал',
          calcTitle: 'Калькулятор нормы калорий и БЖУ',
          gender: 'Пол',
          male: 'Мужской',
          female: 'Женский',
          age: 'Возраст',
          weight: 'Вес (кг)',
          height: 'Рост (см)',
          kg: 'кг',
          activity: 'Активность',
          goal: 'Цель',
          activitySedentary: 'Сидячая',
          activityLight: 'Лёгкая',
          activityModerate: 'Умеренная',
          activityActive: 'Высокая',
          activityVeryActive: 'Очень высокая',
          goalLose: 'Похудение',
          goalMaintain: 'Поддержание',
          goalGain: 'Набор массы',
          calcButton: 'Рассчитать',
          resultCalories: 'Норма калорий',
          resultProtein: 'Белки',
          resultFat: 'Жиры',
          resultCarbs: 'Углеводы',
          resultBmr: 'Базовый обмен (BMR)',
          resultIdealWeight: 'Идеальный вес',
          resultHealthyRange: 'Здоровый диапазон веса',
          resultBmi: 'ИМТ',
          weightUnder: 'Ниже нормы',
          weightNormal: 'В пределах нормы',
          weightOver: 'Выше нормы',
          weightDiffPlus: 'Выше идеала на {n} кг',
          weightDiffMinus: 'Ниже идеала на {n} кг',
          weightDiffOk: 'Соответствует идеальному весу',
          smartInsights: 'Умные инсайты',
          streak: 'Серия',
          avg7d: 'Среднее за 7 дней',
          recommendation: 'Рекомендация',
          days: 'дн.',
          recLow: 'Вы ниже плана. Добавьте один сбалансированный прием пищи с белком и сложными углеводами.',
          recOver: 'Вы выше плана. Сократите поздние перекусы и увеличьте потребление воды.',
          recOnTrack: 'Вы в целевом диапазоне. Сохраняйте текущий режим питания.',
          heroEyebrow: 'Питание',
          heroTitle: 'Ваш дневной дашборд',
          heroSubtitle: 'Учёт калорий, БЖУ и прогресса в одном месте.',
        };
  const locale = lang === 'en' ? 'en-US' : lang === 'kk' ? 'kk-KZ' : 'ru-RU';
  const [formData, setFormData] = useState({
    product: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    date: getLocalDateString(),
  });
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [calcForm, setCalcForm] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activity: 'moderate',
    goal: 'maintain',
  });
  const [calcResult, setCalcResult] = useState(null);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  const [applyingProfile, setApplyingProfile] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;
      const { entries: list } = await entriesApi.getList(params);
      setEntries(list);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  }, [filterDateFrom, filterDateTo, tr.loadErr]);

  const loadStats = useCallback(async () => {
    try {
      const data = await entriesApi.getStats();
      setStats(data);
    } catch {
      setStats({
        today: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        norm: 2000,
        remaining: 2000,
        total: 0,
        macros: { protein: 0, fat: 0, carbs: 0 },
      });
    }
  }, []);

  const loadChartData = useCallback(async () => {
    const today = new Date();
    const dateTo = getLocalDateString(today);
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    const dateFrom = getLocalDateString(from);
    try {
      const { entries: list } = await entriesApi.getList({ dateFrom, dateTo });
      const byDate = {};
      const day = new Date(dateFrom + 'T12:00:00');
      const end = new Date(dateTo + 'T12:00:00');
      while (day <= end) {
        const d = getLocalDateString(day);
        byDate[d] = 0;
        day.setDate(day.getDate() + 1);
      }
      list.forEach((e) => {
        const key = e.entryDate ? String(e.entryDate).slice(0, 10) : '';
        if (key && byDate[key] !== undefined) {
          byDate[key] += e.calories || 0;
        }
      });
      const data = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, calories]) => ({ date, calories }));
      setChartData(data);
    } catch {
      setChartData([]);
    }
  }, []);

  useEffect(() => {
    if (location.state?.diaryUpdated) {
      setDashboardRefresh((k) => k + 1);
      loadStats();
      loadChartData();
      loadEntries();
    }
  }, [location.state, loadEntries, loadStats, loadChartData]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product.trim()) {
      setError(tr.needProduct);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await entriesApi.create({
        productName: formData.product.trim(),
        calories: formData.calories,
        protein: formData.protein,
        fat: formData.fat,
        carbs: formData.carbs,
        entryDate: formData.date,
      });
      setFormData((prev) => ({
        ...prev,
        product: '',
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
      }));
      loadEntries();
      loadStats();
      loadChartData();
      setDashboardRefresh((k) => k + 1);
    } catch (err) {
      setError(err.message || tr.saveErr);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await entriesApi.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      loadStats();
      loadChartData();
      setDashboardRefresh((k) => k + 1);
    } catch (err) {
      setError(err.message || tr.delErr);
    }
  };

  const handleCalcChange = (e) => {
    const { name, value } = e.target;
    setCalcForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalcSubmit = (e) => {
    e.preventDefault();
    const result = calculateDailyNorms(calcForm);
    if (!result) return;
    setCalcResult(result);
  };

  const handleApplyToProfile = async () => {
    if (!calcResult) return;
    setApplyingProfile(true);
    setApplyMsg('');
    try {
      await authApi.updateProfile({
        gender: calcForm.gender,
        age: calcForm.age,
        weight: calcForm.weight,
        height: calcForm.height,
        activityLevel: calcForm.activity,
        calorieNorm: calcResult.calories,
        protein: calcResult.protein,
        fat: calcResult.fat,
        carbs: calcResult.carbs,
      });
      setApplyMsg(tGlobal('mainPage.applySuccess'));
      setDashboardRefresh((k) => k + 1);
      window.dispatchEvent(new CustomEvent('profileNormsUpdated'));
    } catch (err) {
      setApplyMsg(err.message || tGlobal('mainPage.applyError'));
    } finally {
      setApplyingProfile(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const insights = (() => {
    const norm = stats?.norm ?? 2000;
    const remaining = stats?.remaining ?? norm;
    const avg7 = chartData.length > 0
      ? Math.round(chartData.reduce((sum, day) => sum + (day.calories || 0), 0) / chartData.length)
      : 0;

    const todayKey = getLocalDateString();
    const caloriesByDate = new Map(chartData.map((item) => [item.date, item.calories || 0]));
    let streak = 0;
    const cursor = new Date(todayKey + 'T12:00:00');
    for (let i = 0; i < 30; i += 1) {
      const key = getLocalDateString(cursor);
      if ((caloriesByDate.get(key) ?? 0) <= 0) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    let recommendation = tr.recOnTrack;
    if (remaining > Math.max(250, norm * 0.2)) recommendation = tr.recLow;
    if (remaining < -Math.max(200, norm * 0.1)) recommendation = tr.recOver;

    return { streak, avg7, recommendation };
  })();

  return (
    <div className="page main-page">
      <PageHero
        eyebrow={tr.heroEyebrow}
        title={tr.heroTitle}
        subtitle={tr.heroSubtitle}
      />

      <DashboardSection
        refreshKey={dashboardRefresh}
        onRefresh={() => {
          loadStats();
          loadChartData();
        }}
      />

      <div className="main-page__grid ui-grid-2">
        <section className="main-page__new-entry">
          <div className="main-page__section-header">
            <button type="button" className="main-page__add-btn" aria-label={tr.add}>
              <AddIcon />
            </button>
            <h2 className="main-page__section-title">{tr.newEntry}</h2>
          </div>

          <form className="main-page__form" onSubmit={handleSubmit}>
            {error && <p className="main-page__error">{error}</p>}
            <div className="main-page__field">
              <label className="main-page__label">{tr.date}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__field">
              <label className="main-page__label">{tr.product}</label>
              <input
                type="text"
                name="product"
                placeholder={tr.productPh}
                value={formData.product}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__field">
              <label className="main-page__label">{tr.calories}</label>
              <input
                type="number"
                name="calories"
                placeholder="0"
                min="0"
                value={formData.calories}
                onChange={handleChange}
                className="main-page__input"
              />
            </div>

            <div className="main-page__fields-row">
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">{tr.protein}</label>
                <input
                  type="number"
                  name="protein"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">{tr.fat}</label>
                <input
                  type="number"
                  name="fat"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
              <div className="main-page__field main-page__field--small">
                <label className="main-page__label">{tr.carbs}</label>
                <input
                  type="number"
                  name="carbs"
                  placeholder="0"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={handleChange}
                  className="main-page__input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="main-page__submit"
              disabled={saving || !formData.product.trim()}
            >
              {saving ? tr.saving : tr.save}
            </button>
          </form>
        </section>

        <section className="main-page__records">
          <div className="main-page__section-header main-page__section-header--row">
            <h2 className="main-page__section-title">{tr.allEntries}</h2>
            <div className="main-page__filter-controls">
              <input
                type="date"
                className="main-page__filter-input"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                placeholder={tr.from}
              />
              <input
                type="date"
                className="main-page__filter-input"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                placeholder={tr.to}
              />
            </div>
          </div>

          {loading ? (
            <SkeletonCardList count={4} />
          ) : entries.length === 0 ? (
            <EmptyState icon="🍽️" title={tr.empty} description={tr.productPh} />
          ) : (
            <ul className="main-page__entries-list">
              {entries.map((entry) => (
                <li key={entry.id} className="main-page__entry">
                  <div className="main-page__entry-content">
                    <span className="main-page__entry-name">{entry.productName}</span>
                    <span className="main-page__entry-meta">
                      {formatDate(entry.entryDate)} · {entry.calories} {tr.kkal}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="main-page__entry-delete"
                    onClick={() => handleDelete(entry.id)}
                    aria-label={tr.del}
                  >
                    <DeleteIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="main-page__insights glass-card">
        <h2 className="main-page__section-title">{tr.smartInsights}</h2>
        <div className="main-page__insights-grid">
          <article className="main-page__insight-card">
            <p className="main-page__insight-label">{tr.streak}</p>
            <p className="main-page__insight-value">{insights.streak} {tr.days}</p>
          </article>
          <article className="main-page__insight-card">
            <p className="main-page__insight-label">{tr.avg7d}</p>
            <p className="main-page__insight-value">{insights.avg7} {tr.kkal}</p>
          </article>
          <article className="main-page__insight-card main-page__insight-card--wide">
            <p className="main-page__insight-label">{tr.recommendation}</p>
            <p className="main-page__insight-text">{insights.recommendation}</p>
          </article>
        </div>
      </section>

      <section className="main-page__calculator">
        <h2 className="main-page__section-title">{tr.calcTitle}</h2>
        <form className="main-page__calc-form" onSubmit={handleCalcSubmit}>
          <div className="main-page__calc-grid">
            <div className="main-page__field">
              <label className="main-page__label">{tr.gender}</label>
              <select name="gender" value={calcForm.gender} onChange={handleCalcChange} className="main-page__input">
                <option value="male">{tr.male}</option>
                <option value="female">{tr.female}</option>
              </select>
            </div>
            <div className="main-page__field">
              <label className="main-page__label">{tr.age}</label>
              <input type="number" min="1" name="age" value={calcForm.age} onChange={handleCalcChange} className="main-page__input" />
            </div>
            <div className="main-page__field">
              <label className="main-page__label">{tr.weight}</label>
              <input type="number" min="1" name="weight" value={calcForm.weight} onChange={handleCalcChange} className="main-page__input" />
            </div>
            <div className="main-page__field">
              <label className="main-page__label">{tr.height}</label>
              <input type="number" min="1" name="height" value={calcForm.height} onChange={handleCalcChange} className="main-page__input" />
            </div>
            <div className="main-page__field">
              <label className="main-page__label">{tr.activity}</label>
              <select name="activity" value={calcForm.activity} onChange={handleCalcChange} className="main-page__input">
                <option value="sedentary">{tr.activitySedentary}</option>
                <option value="light">{tr.activityLight}</option>
                <option value="moderate">{tr.activityModerate}</option>
                <option value="active">{tr.activityActive}</option>
                <option value="very_active">{tr.activityVeryActive}</option>
              </select>
            </div>
            <div className="main-page__field">
              <label className="main-page__label">{tr.goal}</label>
              <select name="goal" value={calcForm.goal} onChange={handleCalcChange} className="main-page__input">
                <option value="lose">{tr.goalLose}</option>
                <option value="maintain">{tr.goalMaintain}</option>
                <option value="gain">{tr.goalGain}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="main-page__submit">{tr.calcButton}</button>
        </form>
        {calcResult && (
          <div className="main-page__calc-result">
            <div className="main-page__calc-result-grid">
              <div className="main-page__calc-result-card main-page__calc-result-card--highlight">
                <span className="main-page__calc-result-label">{tr.resultCalories}</span>
                <strong className="main-page__calc-result-value">{calcResult.calories} {tr.kkal}</strong>
              </div>
              <div className="main-page__calc-result-card">
                <span className="main-page__calc-result-label">{tr.resultIdealWeight}</span>
                <strong className="main-page__calc-result-value">{calcResult.idealWeight} {tr.kg}</strong>
              </div>
              <div className="main-page__calc-result-card">
                <span className="main-page__calc-result-label">{tr.resultBmi}</span>
                <strong className="main-page__calc-result-value">{calcResult.bmi}</strong>
              </div>
              <div className="main-page__calc-result-card">
                <span className="main-page__calc-result-label">{tr.resultBmr}</span>
                <strong className="main-page__calc-result-value">{calcResult.bmr} {tr.kkal}</strong>
              </div>
            </div>
            {calcResult.healthyRange && (
              <p className="main-page__calc-result-line">
                <strong>{tr.resultHealthyRange}:</strong>{' '}
                {calcResult.healthyRange.min}–{calcResult.healthyRange.max} {tr.kg}
                {' · '}
                {calcResult.weightStatus === 'under' && tr.weightUnder}
                {calcResult.weightStatus === 'normal' && tr.weightNormal}
                {calcResult.weightStatus === 'over' && tr.weightOver}
              </p>
            )}
            {calcResult.weightDiff != null && (
              <p className="main-page__calc-result-line main-page__calc-result-line--muted">
                {calcResult.weightDiff === 0 && tr.weightDiffOk}
                {calcResult.weightDiff > 0 && tr.weightDiffPlus.replace('{n}', String(Math.abs(calcResult.weightDiff)))}
                {calcResult.weightDiff < 0 && tr.weightDiffMinus.replace('{n}', String(Math.abs(calcResult.weightDiff)))}
              </p>
            )}
            <p><strong>{tr.resultProtein}:</strong> {calcResult.protein} {tGlobal('mainPage.gram')}</p>
            <p><strong>{tr.resultFat}:</strong> {calcResult.fat} {tGlobal('mainPage.gram')}</p>
            <p><strong>{tr.resultCarbs}:</strong> {calcResult.carbs} {tGlobal('mainPage.gram')}</p>
            <button
              type="button"
              className="main-page__submit main-page__apply-profile"
              disabled={applyingProfile}
              onClick={handleApplyToProfile}
            >
              {applyingProfile ? tr.saving : tGlobal('mainPage.applyToProfile')}
            </button>
            {applyMsg && <p className="main-page__apply-msg">{applyMsg}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

