/**
 * ФАЙЛ: parseVisionResponse.js
 * ЧТО ЭТО: Разбор ответа LLM.
 * ЗА ЧТО ОТВЕЧАЕТ: JSON → название, калории, уверенность.
 */
function stripMarkdownFence(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function pickNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampConfidence(value) {
  const n = pickNumber(value, 0.5);
  return Math.min(1, Math.max(0, Math.round(n * 100) / 100));
}

/**
 * @param {string} rawText
 * @returns {import('./types.js').VisionAnalysisResult}
 */
export function parseVisionJson(rawText) {
  const cleaned = stripMarkdownFence(rawText);
  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Vision model returned invalid JSON');
    }
    parsed = JSON.parse(match[0]);
  }

  const dishName = String(parsed.dishName || parsed.dish_name || '').trim();
  if (!dishName) {
    throw new Error('Vision model did not return dish name');
  }

  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    dishName,
    ingredients,
    estimatedWeightG: Math.round(pickNumber(parsed.estimatedWeightG ?? parsed.estimated_weight_g, 250)),
    calories: Math.round(pickNumber(parsed.calories, 0)),
    protein: Math.round(pickNumber(parsed.protein, 0) * 10) / 10,
    fat: Math.round(pickNumber(parsed.fat, 0) * 10) / 10,
    carbs: Math.round(pickNumber(parsed.carbs, 0) * 10) / 10,
    confidence: clampConfidence(parsed.confidence),
  };
}
