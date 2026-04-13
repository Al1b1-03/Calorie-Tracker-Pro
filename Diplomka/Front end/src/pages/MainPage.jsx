import { useEffect, useState, useCallback } from 'react';
import { entriesApi } from '../api/entries';
import { useLanguage } from '../i18n/LanguageContext';
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
  const { lang } = useLanguage();
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
      }
    : lang === 'kk'
      ? {
          loadErr: 'Жазбаларды жүктеу қатесі', needProduct: 'Өнім атауын енгізіңіз', saveErr: 'Сақтау қатесі', delErr: 'Жою қатесі',
          add: 'Қосу', newEntry: 'Жаңа жазба', date: 'Күні', product: 'Өнім немесе тағам', productPh: 'Не жедіңіз?',
          calories: 'Калория саны', protein: 'Ақуыз (г)', fat: 'Май (г)', carbs: 'Көмірсу (г)',
          saving: 'Сақталуда...', save: 'Сақтау', allEntries: 'Барлық жазбалар', from: 'Бастап', to: 'Дейін',
          loading: 'Жүктелуде...', empty: 'Көрсету үшін жазба жоқ', del: 'Жою', stats: 'Статистика', today: 'Бүгін',
          norm: 'Норма', remaining: 'Қалды', total: 'Барлығы', chart: '7 күндік нәтиже', kkal: 'ккал',
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
    const age = Number(calcForm.age);
    const weight = Number(calcForm.weight);
    const height = Number(calcForm.height);
    if (!age || !weight || !height) return;

    const bmr =
      calcForm.gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMap = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const goalMap = {
      lose: 0.85,
      maintain: 1,
      gain: 1.12,
    };

    const calories = bmr * (activityMap[calcForm.activity] || 1.55) * (goalMap[calcForm.goal] || 1);
    const proteinPerKg = calcForm.goal === 'lose' ? 2 : 1.8;
    const protein = proteinPerKg * weight;
    const fat = 0.9 * weight;
    const carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);

    setCalcResult({
      calories: Math.round(calories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="main-page">
      <div className="main-page__grid">
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
            <p className="main-page__loading">{tr.loading}</p>
          ) : entries.length === 0 ? (
            <div className="main-page__empty-state">
              <span className="main-page__empty-emoji" aria-hidden>🍽️</span>
              <p className="main-page__empty-text">{tr.empty}</p>
            </div>
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

      <section className="main-page__stats">
        <h2 className="main-page__section-title">{tr.stats}</h2>
        <div className="main-page__stats-grid">
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">{tr.today}</span>
            <span className="main-page__stat-value">
              {stats?.today?.calories ?? 0} {tr.kkal}
            </span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">{tr.norm}</span>
            <span className="main-page__stat-value">{(stats?.norm ?? 2000)} {tr.kkal}</span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">{tr.remaining}</span>
            <span className="main-page__stat-value">
              {(stats?.remaining ?? 2000)} {tr.kkal}
            </span>
          </div>
          <div className="main-page__stat-card">
            <span className="main-page__stat-label">{tr.total}</span>
            <span className="main-page__stat-value">{(stats?.total ?? 0)} {tr.kkal}</span>
          </div>
        </div>
        <div className="main-page__macros">
          <span className="main-page__macro main-page__macro--protein">
            {tr.protein.split(' ')[0]}: {stats?.today?.protein ?? 0}
          </span>
          <span className="main-page__macro main-page__macro--fat">
            {tr.fat.split(' ')[0]}: {stats?.today?.fat ?? 0}
          </span>
          <span className="main-page__macro main-page__macro--carbs">
            {tr.carbs.split(' ')[0]}: {stats?.today?.carbs ?? 0}
          </span>
        </div>

        {chartData.length > 0 && (
          <div className="main-page__chart">
            <h3 className="main-page__chart-title">{tr.chart}</h3>
            <div className="main-page__chart-bars">
              {chartData.map(({ date, calories }) => {
                const norm = stats?.norm ?? 2000;
                const maxVal = Math.max(norm, ...chartData.map((d) => d.calories), 1);
                const heightPct = Math.round((calories / maxVal) * 100);
                const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString(locale, {
                  day: '2-digit',
                  month: '2-digit',
                });
                return (
                  <div key={date} className="main-page__chart-bar-wrap">
                    <div className="main-page__chart-bar-container">
                      <div
                        className="main-page__chart-bar"
                        style={{ height: `${heightPct}%` }}
                        title={`${dayLabel}: ${calories} ${tr.kkal}`}
                      />
                    </div>
                    <span className="main-page__chart-label">{dayLabel}</span>
                    <span className="main-page__chart-value">{calories}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
            <p><strong>{tr.resultCalories}:</strong> {calcResult.calories} {tr.kkal}</p>
            <p><strong>{tr.resultProtein}:</strong> {calcResult.protein} г</p>
            <p><strong>{tr.resultFat}:</strong> {calcResult.fat} г</p>
            <p><strong>{tr.resultCarbs}:</strong> {calcResult.carbs} г</p>
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

