import { useEffect, useState } from 'react';
import { workoutsApi } from '../api/workouts';
import { getApiOrigin } from '../api/products';
import { useLanguage } from '../i18n/LanguageContext';
import './AdminWorkoutsPage.css';

const INITIAL_FORM = {
  title: '',
  shortDesc: '',
  benefits: '',
  howTo: '',
  regime: '',
  important: '',
  targetMuscles: '',
  duration: '30',
  calories: '0',
  difficulty: 'Средняя',
  category: 'other',
  imageUrl: '',
  exercises: [{ name: '', sets: '', reps: '', rest: '' }],
};

const DIFFICULTY_OPTIONS = ['Лёгкая', 'Средняя', 'Высокая'];
const CATEGORY_OPTIONS = [
  { value: 'other', label: 'Без категории' },
  { value: 'arms', label: '💪 Руки' },
  { value: 'core', label: '🔥 Пресс / Кор' },
  { value: 'chest', label: '🏋️ Грудь' },
  { value: 'back', label: '🔙 Спина' },
  { value: 'legs', label: '🦵 Ноги' },
  { value: 'cardio', label: '🏃 Кардио' },
  { value: 'fullbody', label: '⚡ Всё тело' },
];

export default function AdminWorkoutsPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? { title: 'Workout database', loading: 'Loading...', addWorkout: '+ Add workout', loadErr: 'Failed to load workouts', needTitle: 'Enter workout title', saveErr: 'Save failed', delErr: 'Delete failed', edit: 'Edit', del: 'Delete', close: 'Close', editWorkout: 'Edit workout', addWorkoutModal: 'Add workout', cancel: 'Cancel', save: 'Save', add: 'Add' }
    : lang === 'kk'
      ? { title: 'Жаттығулар базасы', loading: 'Жүктелуде...', addWorkout: '+ Жаттығу қосу', loadErr: 'Жаттығуларды жүктеу қатесі', needTitle: 'Жаттығу атауын енгізіңіз', saveErr: 'Сақтау қатесі', delErr: 'Жою қатесі', edit: 'Өзгерту', del: 'Жою', close: 'Жабу', editWorkout: 'Жаттығуды өңдеу', addWorkoutModal: 'Жаттығу қосу', cancel: 'Бас тарту', save: 'Сақтау', add: 'Қосу' }
      : { title: 'База тренировок', loading: 'Загрузка...', addWorkout: '+ Добавить тренировку', loadErr: 'Ошибка загрузки тренировок', needTitle: 'Введите название тренировки', saveErr: 'Ошибка сохранения', delErr: 'Ошибка удаления', edit: 'Изменить', del: 'Удалить', close: 'Закрыть', editWorkout: 'Редактировать тренировку', addWorkoutModal: 'Добавить тренировку', cancel: 'Отмена', save: 'Сохранить', add: 'Добавить' };
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const apiOrigin = getApiOrigin();

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

  const getTargetMusclesChips = (workout) => {
    const raw = workout?.targetMuscles || '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const loadWorkouts = async () => {
    try {
      setError('');
      const { workouts: data } = await workoutsApi.admin.list();
      setWorkouts(data ?? []);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [tr.loadErr]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Calorie Tracker Pro - База тренировок';
    return () => { document.title = prev; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '', reps: '', rest: '' }],
    }));
  };

  const removeExercise = (index) => {
    if (formData.exercises.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (workout) => {
    setEditingId(workout.id);
    setFormData({
      title: workout.title ?? '',
      shortDesc: workout.shortDesc ?? '',
      benefits: workout.benefits ?? '',
      howTo: workout.howTo ?? '',
      regime: workout.regime ?? '',
      important: workout.important ?? '',
      targetMuscles: workout.targetMuscles ?? '',
      duration: String(workout.duration ?? 30),
      calories: String(workout.calories ?? 0),
      difficulty: workout.difficulty ?? 'Средняя',
      category: workout.category || 'other',
      imageUrl: workout.imageUrl ?? workout.image ?? '',
      exercises:
        (workout.exercises?.length && workout.exercises.map((ex) => ({
          name: ex.name ?? '',
          sets: ex.sets ?? '',
          reps: ex.reps ?? '',
          rest: ex.rest ?? '—',
        }))) ||
        [{ name: '', sets: '', reps: '', rest: '' }],
    });
    setImageFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(tr.needTitle);
      return;
    }
    setActionLoading(editingId ?? 'new');
    setError('');
    try {
      const payload = {
        title: formData.title.trim(),
        shortDesc: formData.shortDesc.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        howTo: formData.howTo.trim() || undefined,
        regime: formData.regime.trim() || undefined,
        important: formData.important.trim() || undefined,
        targetMuscles: formData.targetMuscles.trim() || undefined,
        // duration и calories больше не редактируются в форме
        difficulty: formData.difficulty,
        category: formData.category || 'other',
        imageUrl: formData.imageUrl.trim() || undefined,
      };
      if (editingId) {
        let updatedWorkout;
        const { workout } = await workoutsApi.admin.update(editingId, payload);
        updatedWorkout = workout;
        if (imageFile) {
          const res = await workoutsApi.admin.uploadImage(editingId, imageFile);
          updatedWorkout = res.workout;
        }
        setWorkouts((prev) => prev.map((w) => (w.id === editingId ? updatedWorkout : w)));
      } else {
        let createdWorkout;
        const { workout } = await workoutsApi.admin.create(payload);
        createdWorkout = workout;
        if (imageFile) {
          const res = await workoutsApi.admin.uploadImage(workout.id, imageFile);
          createdWorkout = res.workout;
        }
        // Добавляем в конец списка, чтобы порядок совпадал с ORDER BY id ASC на сервере
        setWorkouts((prev) => [...prev, createdWorkout]);
      }
      closeForm();
    } catch (err) {
      setError(err.message || tr.saveErr);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (workout) => {
    if (!window.confirm(`Удалить тренировку «${workout.title}»?`)) return;
    setActionLoading(workout.id);
    try {
      await workoutsApi.admin.delete(workout.id);
      setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
    } catch (err) {
      setError(err.message || tr.delErr);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-workouts">
        <h1 className="admin-workouts__title">{tr.title}</h1>
        <p className="admin-workouts__loading">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="admin-workouts">
      <div className="admin-workouts__header">
        <h1 className="admin-workouts__title">{tr.title}</h1>
        <button type="button" className="admin-workouts__add-btn" onClick={openAdd}>
          {tr.addWorkout}
        </button>
      </div>
      {error && <p className="admin-workouts__error">{error}</p>}

      <div className="admin-workouts__grid">
        {workouts.map((workout) => (
          <div key={workout.id} className="admin-workouts__card">
            <div className="admin-workouts__card-image">
              {getWorkoutImageSrc(workout) ? (
                <img
                  src={getWorkoutImageSrc(workout)}
                  alt={workout.title}
                  className="admin-workouts__card-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <div className="admin-workouts__card-body">
              <h3 className="admin-workouts__card-name">{workout.title}</h3>
              {workout.shortDesc && (
                <p className="admin-workouts__card-meta">
                  {workout.shortDesc}
                </p>
              )}
              <div className="admin-workouts__card-tags">
                <span className="admin-workouts__tag admin-workouts__tag--difficulty">
                  {workout.difficulty}
                </span>
                {getTargetMusclesChips(workout).map((muscle) => (
                  <span key={muscle} className="admin-workouts__tag admin-workouts__tag--muscle">
                    {muscle}
                  </span>
                ))}
              </div>
              <div className="admin-workouts__card-actions">
                <button
                  type="button"
                  className="admin-workouts__btn admin-workouts__btn--edit"
                  onClick={() => openEdit(workout)}
                  disabled={actionLoading !== null}
                >
                  {tr.edit}
                </button>
                <button
                  type="button"
                  className="admin-workouts__btn admin-workouts__btn--delete"
                  onClick={() => handleDelete(workout)}
                  disabled={actionLoading === workout.id}
                >
                  {actionLoading === workout.id ? '...' : tr.del}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="admin-workouts__modal" onClick={closeForm}>
          <div className="admin-workouts__modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admin-workouts__modal-close"
              onClick={closeForm}
              aria-label={tr.close}
            >
              ×
            </button>
            <h2 className="admin-workouts__modal-title">
              {editingId ? tr.editWorkout : tr.addWorkoutModal}
            </h2>
            <form onSubmit={handleSubmit} className="admin-workouts__form">
              <label className="admin-workouts__label">
                Название *
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="admin-workouts__input"
                  required
                />
              </label>
              <label className="admin-workouts__label">
                Краткое описание
                <input
                  type="text"
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  className="admin-workouts__input"
                />
              </label>
              <div className="admin-workouts__details-grid">
                <label className="admin-workouts__label">
                  Что развивает
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    className="admin-workouts__input admin-workouts__textarea"
                    rows={3}
                  />
                </label>
                <label className="admin-workouts__label">
                  Как выполнять
                  <textarea
                    name="howTo"
                    value={formData.howTo}
                    onChange={handleChange}
                    className="admin-workouts__input admin-workouts__textarea"
                    rows={3}
                  />
                </label>
                <label className="admin-workouts__label">
                  Режим
                  <textarea
                    name="regime"
                    value={formData.regime}
                    onChange={handleChange}
                    className="admin-workouts__input admin-workouts__textarea"
                    rows={2}
                  />
                </label>
                <label className="admin-workouts__label">
                  Важно
                  <textarea
                    name="important"
                    value={formData.important}
                    onChange={handleChange}
                    className="admin-workouts__input admin-workouts__textarea"
                    rows={2}
                  />
                </label>
                <label className="admin-workouts__label">
                  Целевые мышцы
                  <input
                    type="text"
                    name="targetMuscles"
                    value={formData.targetMuscles}
                    onChange={handleChange}
                    className="admin-workouts__input"
                    placeholder="Например: Бицепс, Предплечья"
                  />
                </label>
              </div>
              <div className="admin-workouts__row">
                <label className="admin-workouts__label">
                  Сложность
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="admin-workouts__input"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-workouts__label">
                  Категория
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="admin-workouts__input"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="admin-workouts__label">
                URL изображения
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="admin-workouts__input"
                  placeholder="https://..."
                />
              </label>
              <label className="admin-workouts__label">
                Или загрузить файл
                <input
                  type="file"
                  accept="image/*"
                  className="admin-workouts__input"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                  }}
                />
              </label>

              <div className="admin-workouts__form-actions">
                <button type="button" className="admin-workouts__btn admin-workouts__btn--secondary" onClick={closeForm}>
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  className="admin-workouts__btn admin-workouts__btn--save"
                  disabled={actionLoading !== null}
                >
                  {actionLoading !== null ? '...' : editingId ? tr.save : tr.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
