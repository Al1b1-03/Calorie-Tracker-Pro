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

const toLang = (lang) => (lang === 'kk' || lang === 'en' ? lang : 'ru');

const LANG_CANDIDATES = {
  ru: ['ru', 'russian'],
  en: ['en', 'eng', 'english'],
  kk: ['kk', 'kz', 'kaz', 'kazakh'],
};

function getLocalizedFromObject(value, lang) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const target = toLang(lang);
  const candidates = LANG_CANDIDATES[target] || LANG_CANDIDATES.ru;
  const allKeys = Object.keys(value);

  for (const alias of candidates) {
    const key = allKeys.find((k) => k.toLowerCase() === alias);
    if (key && normalize(value[key])) return normalize(value[key]);
  }

  for (const fallbackLang of ['ru', 'en', 'kk']) {
    for (const alias of LANG_CANDIDATES[fallbackLang]) {
      const key = allKeys.find((k) => k.toLowerCase() === alias);
      if (key && normalize(value[key])) return normalize(value[key]);
    }
  }
  return '';
}

function getLocalizedFromEntity(entity, field, lang) {
  if (!entity || typeof entity !== 'object') return '';
  const target = toLang(lang);
  const fieldRaw = String(field || '').trim();
  if (!fieldRaw) return '';
  const fieldLower = fieldRaw.toLowerCase();

  const keys = Object.keys(entity);
  const direct = keys.find((k) => k.toLowerCase() === fieldLower);
  if (direct) {
    const value = entity[direct];
    if (typeof value === 'object') {
      const nested = getLocalizedFromObject(value, target);
      if (nested) return nested;
    }
    if (normalize(value)) return normalize(value);
  }

  const suffixes = {
    ru: ['ru', 'russian'],
    en: ['en', 'eng', 'english'],
    kk: ['kk', 'kz', 'kaz', 'kazakh'],
  };

  const camelBase = fieldRaw.charAt(0).toUpperCase() + fieldRaw.slice(1);
  const buildVariants = (base, suffix) => [(`${base}_${suffix}`).toLowerCase(), (`${base}${suffix}`).toLowerCase()];

  const findByLang = (langCode) => {
    const variants = [];
    for (const suffix of suffixes[langCode]) {
      variants.push(...buildVariants(fieldRaw, suffix));
      variants.push(...buildVariants(camelBase, suffix));
    }
    for (const candidate of variants) {
      const key = keys.find((k) => k.toLowerCase() === candidate);
      if (key && normalize(entity[key])) return normalize(entity[key]);
    }
    return '';
  };

  return findByLang(target) || findByLang('ru') || findByLang('en') || findByLang('kk') || '';
}

function resolveLocalizedText(lang, valueOrEntity, field) {
  if (valueOrEntity && typeof valueOrEntity === 'object' && !Array.isArray(valueOrEntity)) {
    if (field) {
      const fromEntity = getLocalizedFromEntity(valueOrEntity, field, lang);
      if (fromEntity) return fromEntity;
    }
    const fromObject = getLocalizedFromObject(valueOrEntity, lang);
    if (fromObject) return fromObject;
    return '';
  }
  return normalize(valueOrEntity);
}

export function translateProductText(lang, valueOrEntity, field = '') {
  const source = resolveLocalizedText(lang, valueOrEntity, field);
  return translateByMap(lang, source, PRODUCT_TEXT_MAP);
}

export function translateWorkoutText(lang, valueOrEntity, field = '') {
  const source = resolveLocalizedText(lang, valueOrEntity, field);
  return translateByMap(lang, source, WORKOUT_TEXT_MAP);
}
