/**
 * Уровень сложности тренировки для CSS-модификаторов (easy / medium / hard).
 */
export function getWorkoutDifficultyLevel(difficulty) {
  const raw = (difficulty || '').toString().trim().toLowerCase();
  const d = raw.replace(/ё/g, 'е');
  if (/легк|easy/i.test(d)) return 'easy';
  if (/высок|сложн|hard|тяжел/i.test(d)) return 'hard';
  return 'medium';
}
