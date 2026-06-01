/**
 * ФАЙЛ: localRanker.js
 * ЧТО ЭТО: Ранжирование CLIP.
 * ЗА ЧТО ОТВЕЧАЕТ: двухэтапный выбор блюда по фото.
 */
const SOUP_IDS = new Set(['borscht', 'vegetable_soup', 'chicken_soup', 'lagman_soup', 'ramen']);
const SALAD_IDS = new Set([
  'greek_salad',
  'caesar_salad',
  'green_salad',
  'olivier_salad',
  'cabbage_salad',
]);
const BURGER_IDS = new Set(['cheeseburger', 'hamburger', 'chicken_burger']);
const SANDWICH_IDS = new Set(['sandwich', 'club_sandwich', 'shawarma', 'hot_dog']);

const MIN_TOP_SCORE = 0.06;
const CLOSE_MARGIN = 0.045;

/**
 * @param {ClipMatch[]} results
 * @param {Map<string, string>} labelToCatalogId
 */
export function aggregateScoresByCatalogId(results, labelToCatalogId) {
  /** @type {Map<string, number>} */
  const scores = new Map();

  for (const { label, score } of results) {
    const catalogId = labelToCatalogId.get(label);
    if (!catalogId) continue;
    const value = Number(score) || 0;
    const prev = scores.get(catalogId) ?? 0;
    if (value > prev) scores.set(catalogId, value);
  }

  return scores;
}

/**
 * @param {[string, number][]} ranked
 */
export function applyRankingBias(ranked) {
  if (ranked.length < 2) return ranked;

  const adjusted = [...ranked];
  const topId = adjusted[0][0];
  const topScore = adjusted[0][1];
  const secondId = adjusted[1][0];
  const secondScore = adjusted[1][1];
  const margin = topScore - secondScore;

  if (SOUP_IDS.has(topId) && SALAD_IDS.has(secondId) && margin < CLOSE_MARGIN && secondScore >= topScore * 0.82) {
    [adjusted[0], adjusted[1]] = [adjusted[1], adjusted[0]];
  }

  if (SANDWICH_IDS.has(topId) && BURGER_IDS.has(secondId) && margin < CLOSE_MARGIN && secondScore >= topScore * 0.88) {
    [adjusted[0], adjusted[1]] = [adjusted[1], adjusted[0]];
  }

  if (BURGER_IDS.has(topId) && SANDWICH_IDS.has(secondId) && margin < CLOSE_MARGIN * 0.75 && secondScore > topScore) {
    [adjusted[0], adjusted[1]] = [adjusted[1], adjusted[0]];
  }

  return adjusted;
}

/**
 * @param {number} topScore
 * @param {number} secondScore
 * @param {number} labelCount
 */
export function computeCalibratedConfidence(topScore, secondScore, labelCount) {
  const margin = Math.max(0, topScore - secondScore);
  const spreadBoost = Math.min(0.25, margin * 2.2);
  const countPenalty = labelCount > 24 ? 0.92 : 1;
  const raw = (topScore + spreadBoost) * countPenalty;
  return Math.min(0.97, Math.max(0.12, Math.round(raw * 100) / 100));
}

/**
 * @param {Map<string, number>} scores
 */
export function rankCatalogScores(scores) {
  return [...scores.entries()]
    .filter(([, score]) => score >= MIN_TOP_SCORE)
    .sort((a, b) => b[1] - a[1]);
}
