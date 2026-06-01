/**
 * ФАЙЛ: calorieCalculator.js
 * ЧТО ЭТО: Расчёт калорий.
 * ЗА ЧТО ОТВЕЧАЕТ: норма по росту/весу/активности.
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Goal adjustment on top of TDEE. */
export const GOAL_MULTIPLIERS = {
  lose: 0.85,
  maintain: 1,
  gain: 1.12,
};

/**
 * Mifflin–St Jeor BMR (kcal/day).
 * @param {{ gender?: string, age?: number|string, weight?: number|string, height?: number|string }}
 */
export function calculateBmr({ gender, age, weight, height }) {
  const a = Number(age);
  const w = Number(weight);
  const h = Number(height);
  if (!a || !w || !h) return null;

  return gender === 'male'
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;
}

/** BMI = weight(kg) / height(m)² */
export function calculateBmi(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h) return null;
  const hm = h / 100;
  return Math.round((w / (hm * hm)) * 10) / 10;
}

/**
 * Ideal weight (Devine formula), kg.
 * @param {{ gender?: string, heightCm?: number|string }}
 */
export function calculateIdealWeight({ gender, heightCm }) {
  const h = Number(heightCm);
  if (!h) return null;
  const base = gender === 'male' ? 50 : 45.5;
  return Math.round(base + 0.91 * (h - 152.4));
}

/** Healthy weight range by WHO BMI 18.5–24.9, kg. */
export function calculateHealthyWeightRange(heightCm) {
  const h = Number(heightCm);
  if (!h) return null;
  const hm = h / 100;
  return {
    min: Math.round(18.5 * hm * hm),
    max: Math.round(24.9 * hm * hm),
    optimal: Math.round(22 * hm * hm),
  };
}

/**
 * Full daily calorie & macro calculator.
 * @param {{
 *   gender?: string,
 *   age?: number|string,
 *   weight?: number|string,
 *   height?: number|string,
 *   activityLevel?: string,
 *   activity?: string,
 *   goal?: string,
 * }}
 */
export function calculateDailyNorms(input = {}) {
  const age = Number(input.age);
  const weight = Number(input.weight);
  const height = Number(input.height);
  const gender = input.gender || 'male';
  const activity = input.activityLevel || input.activity || 'moderate';
  const goal = input.goal || 'maintain';

  if (!age || !weight || !height) return null;

  const bmr = calculateBmr({ gender, age, weight, height });
  if (bmr == null) return null;

  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] || ACTIVITY_MULTIPLIERS.moderate);
  const calories = Math.round(tdee * (GOAL_MULTIPLIERS[goal] ?? GOAL_MULTIPLIERS.maintain));

  const proteinPerKg = goal === 'lose' ? 2 : 1.8;
  const protein = Math.round(proteinPerKg * weight);
  const fat = Math.round(0.9 * weight);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  const idealWeight = calculateIdealWeight({ gender, heightCm: height });
  const healthyRange = calculateHealthyWeightRange(height);
  const bmi = calculateBmi(weight, height);
  const weightDiff = idealWeight != null ? Math.round(weight - idealWeight) : null;

  let weightStatus = 'normal';
  if (healthyRange) {
    if (weight < healthyRange.min) weightStatus = 'under';
    else if (weight > healthyRange.max) weightStatus = 'over';
  }

  return {
    bmr: Math.round(bmr),
    calories,
    protein,
    fat,
    carbs,
    bmi,
    idealWeight,
    healthyRange,
    weightDiff,
    weightStatus,
  };
}
