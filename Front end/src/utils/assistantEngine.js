const FOOD_KEYS = [
  'banana', 'apple', 'orange', 'chicken', 'rice', 'egg', 'oatmeal', 'cottage',
  'bread', 'potato', 'salmon', 'avocado',
];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim();
}

function hasAny(text, parts) {
  return parts.some((p) => text.includes(p));
}

function extractNumbers(text) {
  return text.match(/\d+(?:[.,]\d+)?/g)?.map((n) => Number(n.replace(',', '.'))) || [];
}

function formatNum(n) {
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function tpl(str, vars = {}) {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val ?? '')),
    str
  );
}

export const ASSISTANT_TOPICS = [
  { id: 'nutrition', questionKey: 'assistant.topics.nutrition.question', link: '/' },
  { id: 'aiCamera', questionKey: 'assistant.topics.aiCamera.question', link: '/ai-camera' },
  { id: 'workouts', questionKey: 'assistant.topics.workouts.question', link: '/workouts' },
  { id: 'shop', questionKey: 'assistant.topics.shop.question', link: '/shop' },
  { id: 'water', questionKey: 'assistant.topics.water.question', link: '/' },
  { id: 'profile', questionKey: 'assistant.topics.profile.question', link: '/profile' },
];

export function getWelcomeMessage(t, context = {}) {
  const name = context.userName ? `, ${context.userName}` : '';
  let text = tpl(context.isLoggedIn ? t('assistant.welcomeUser') : t('assistant.welcomeGuest'), { name });

  if (context.isLoggedIn && context.calorieNorm) {
    text += ` ${tpl(t('assistant.welcomeNorm'), { norm: formatNum(context.calorieNorm) })}`;
  }
  if (context.isLoggedIn && context.todayCalories != null && context.calorieNorm) {
    const left = formatNum(context.calorieNorm - context.todayCalories);
    text += ` ${tpl(t('assistant.welcomeToday'), {
      eaten: formatNum(context.todayCalories),
      left: left >= 0 ? left : 0,
    })}`;
  }
  return text;
}

export function buildAssistantReply(question, t, context = {}, lang = 'ru') {
  const q = normalize(question);
  const numbers = extractNumbers(q);

  const reply = (textKey, vars, actions, chips) => ({
    text: tpl(t(textKey), vars),
    actions,
    chips,
  });

  const nav = (labelKey, to) => [{ label: t(labelKey), to }];

  // Greetings
  if (/(^|\s)(привет|здравств|салем|сәлем|hello|hi|hey)(\s|!|\.|$)/i.test(q)) {
    return {
      text: getWelcomeMessage(t, context),
      chips: ASSISTANT_TOPICS.slice(0, 4).map((topic) => ({
        label: t(`assistant.topics.${topic.id}.label`),
        question: t(topic.questionKey),
      })),
    };
  }

  if (hasAny(q, ['спасибо', 'рахмет', 'thanks', 'thank'])) {
    return reply('assistant.answers.thanks');
  }

  // Profile / today's progress
  if (hasAny(q, ['мой прогресс', 'сегодня', 'бүгін', 'today', 'progress', 'сколько съел', 'сколько ел'])) {
    if (!context.isLoggedIn) {
      return reply('assistant.answers.needLogin', {}, nav('assistant.actions.login', '/login'));
    }
    if (context.todayCalories == null) {
      return reply('assistant.answers.progressEmpty', {}, nav('assistant.actions.diary', '/'));
    }
    return reply(
      'assistant.answers.progress',
      {
        eaten: formatNum(context.todayCalories),
        norm: formatNum(context.calorieNorm || 0),
        left: formatNum(Math.max(0, (context.calorieNorm || 0) - context.todayCalories)),
        protein: formatNum(context.todayProtein || 0),
        fat: formatNum(context.todayFat || 0),
        carbs: formatNum(context.todayCarbs || 0),
      },
      nav('assistant.actions.diary', '/')
    );
  }

  if (hasAny(q, ['норма', 'калор', 'ккал', 'calorie', 'norm', 'дефицит', 'профицит', 'похуд', 'набор', 'mass', 'lose'])) {
    if (context.isLoggedIn && context.calorieNorm && hasAny(q, ['моя', 'мой', 'мне', 'my'])) {
      return reply(
        'assistant.answers.myNorm',
        {
          norm: formatNum(context.calorieNorm),
          protein: formatNum(context.protein || 0),
          fat: formatNum(context.fat || 0),
          carbs: formatNum(context.carbs || 0),
        },
        nav('assistant.actions.profile', '/profile')
      );
    }
    if (hasAny(q, ['дефицит', 'похуд', 'lose', 'weight loss', 'азайту'])) {
      return reply('assistant.answers.deficit', {}, nav('assistant.actions.calculator', '/'));
    }
    if (hasAny(q, ['набор', 'масса', 'gain', 'muscle', 'көбейту'])) {
      return reply('assistant.answers.surplus', {}, nav('assistant.actions.calculator', '/'));
    }
    if (hasAny(q, ['бжу', 'макро', 'macro', 'macros'])) {
      if (numbers.length >= 1) {
        const kcal = numbers[0];
        return reply('assistant.answers.macrosCalc', {
          kcal: formatNum(kcal),
          protein: formatNum((kcal * 0.3) / 4),
          fat: formatNum((kcal * 0.3) / 9),
          carbs: formatNum((kcal * 0.4) / 4),
        });
      }
      return reply('assistant.answers.macrosHint');
    }
  }

  // BMI
  if (hasAny(q, ['имт', 'bmi', 'индекс массы'])) {
    if (numbers.length < 2) {
      return reply('assistant.answers.bmiHint');
    }
    const [weight, heightCm] = numbers;
    const h = heightCm / 100;
    if (h <= 0 || weight <= 0) return reply('assistant.answers.bmiInvalid');
    const bmi = weight / (h * h);
    let labelKey = 'assistant.bmi.normal';
    if (bmi < 18.5) labelKey = 'assistant.bmi.under';
    else if (bmi >= 25 && bmi < 30) labelKey = 'assistant.bmi.over';
    else if (bmi >= 30) labelKey = 'assistant.bmi.obese';
    return reply('assistant.answers.bmiResult', { bmi: bmi.toFixed(1), label: t(labelKey) });
  }

  // Water
  if (hasAny(q, ['вод', 'су', 'water', 'гидрат'])) {
    if (context.isLoggedIn && context.waterMl != null) {
      return reply(
        'assistant.answers.waterProgress',
        {
          current: formatNum(context.waterMl),
          goal: formatNum(context.waterGoal || 2000),
        },
        nav('assistant.actions.dashboard', '/')
      );
    }
    return reply('assistant.answers.waterHow', {}, nav('assistant.actions.dashboard', '/'));
  }

  // AI Camera
  if (hasAny(q, ['камер', 'фото', 'скан', 'ai', 'camera', 'scan', 'recogn'])) {
    return reply('assistant.answers.aiCamera', {}, nav('assistant.actions.aiCamera', '/ai-camera'));
  }

  // Food calories
  if (hasAny(q, ['калор', 'ккал', 'kcal', 'calorie']) || FOOD_KEYS.some((k) => q.includes(k))) {
    const foodMap = {
      банан: 'banana', banana: 'banana',
      яблок: 'apple', apple: 'apple', alma: 'apple',
      апельсин: 'orange', orange: 'orange',
      куриц: 'chicken', chicken: 'chicken', тауық: 'chicken',
      рис: 'rice', rice: 'rice', күріш: 'rice',
      яйц: 'egg', egg: 'egg', жұмыртқа: 'egg',
      овсян: 'oatmeal', oatmeal: 'oatmeal',
      творог: 'cottage', cottage: 'cottage',
      хлеб: 'bread', bread: 'bread', нан: 'bread',
      картош: 'potato', potato: 'potato',
      лосос: 'salmon', salmon: 'salmon',
      авокад: 'avocado', avocado: 'avocado',
    };
    const found = Object.entries(foodMap).find(([key]) => q.includes(key));
    if (found) {
      return reply(`assistant.foods.${found[1]}`);
    }
    if (hasAny(q, ['калор', 'ккал', 'kcal'])) {
      return reply('assistant.answers.foodHint');
    }
  }

  // Diary / entries
  if (hasAny(q, ['дневник', 'запис', 'добавить', 'еда', 'meal', 'entry', 'journal', 'күнделік'])) {
    return reply('assistant.answers.diary', {}, [
      { label: t('assistant.actions.diary'), to: '/' },
      { label: t('assistant.actions.aiCamera'), to: '/ai-camera' },
    ]);
  }

  // Workouts
  if (hasAny(q, ['трениров', 'workout', 'пресс', 'спина', 'ног', 'кардио', 'жаттығ'])) {
    return reply('assistant.answers.workouts', {}, nav('assistant.actions.workouts', '/workouts'));
  }

  // Shop
  if (hasAny(q, ['магазин', 'товар', 'витамин', 'shop', 'catalog', 'дүкен', 'рацион'])) {
    return reply('assistant.answers.shop', {}, nav('assistant.actions.shop', '/shop'));
  }

  if (hasAny(q, ['заказ', 'корзин', 'оплат', 'достав', 'cart', 'checkout', 'order', 'сеbet'])) {
    return reply('assistant.answers.checkout', {}, [
      { label: t('assistant.actions.shop'), to: '/shop' },
      { label: t('assistant.actions.cart'), to: '/cart' },
    ]);
  }

  // Profile
  if (hasAny(q, ['профил', 'анкет', 'profile', 'рост', 'вес', 'возраст'])) {
    return reply('assistant.answers.profile', {}, nav('assistant.actions.profile', '/profile'));
  }

  // Calculator
  if (hasAny(q, ['калькулятор', 'рассчит', 'calculate', 'calculator', 'есепте'])) {
    return reply('assistant.answers.calculator', {}, nav('assistant.actions.calculator', '/'));
  }

  // Support / human
  if (hasAny(q, ['оператор', 'гид', 'поддерж', 'человек', 'support', 'help desk', 'operator'])) {
    return reply('assistant.answers.humanSupport');
  }

  // Fallback with topic chips
  return {
    text: t('assistant.answers.fallback'),
    chips: ASSISTANT_TOPICS.map((topic) => ({
      label: t(`assistant.topics.${topic.id}.label`),
      question: t(topic.questionKey),
    })),
  };
}
