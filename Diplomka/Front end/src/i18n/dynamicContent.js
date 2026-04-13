const PRODUCT_TEXT_MAP = {
  'Рацион питания на весь день': {
    kk: 'Бір күнге арналған тамақ рационы',
    en: 'Full-day meal plan',
  },
  'Пробный день': {
    kk: 'Сынақ күні',
    en: 'Trial day',
  },
};

const WORKOUT_TEXT_MAP = {
  'Силовая тренировка': { kk: 'Күш жаттығуы', en: 'Strength workout' },
  'Кардио HIIT': { kk: 'Кардио HIIT', en: 'Cardio HIIT' },
  'Йога и растяжка': { kk: 'Йога және созылу', en: 'Yoga and stretching' },
  'Функциональный тренинг': { kk: 'Функционалдық тренинг', en: 'Functional training' },
  'Базовые упражнения для набора мышечной массы': {
    kk: 'Бұлшықет массасын арттыруға арналған базалық жаттығулар',
    en: 'Basic exercises for muscle gain',
  },
  'Интенсивная интервальная тренировка для сжигания жира': {
    kk: 'Май жағуға арналған қарқынды интервалды жаттығу',
    en: 'High-intensity interval workout for fat burning',
  },
  'Расслабление и гибкость тела': {
    kk: 'Денені босаңсыту және икемділік',
    en: 'Relaxation and body flexibility',
  },
  'Упражнения для повседневной активности': {
    kk: 'Күнделікті белсенділікке арналған жаттығулар',
    en: 'Exercises for daily activity',
  },
};

const normalize = (value) => String(value || '').trim();

const translateByMap = (lang, text, map) => {
  const source = normalize(text);
  if (!source || lang === 'ru') return source;
  return map[source]?.[lang] || source;
};

export function translateProductText(lang, text) {
  return translateByMap(lang, text, PRODUCT_TEXT_MAP);
}

export function translateWorkoutText(lang, text) {
  return translateByMap(lang, text, WORKOUT_TEXT_MAP);
}
