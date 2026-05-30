const MOCK_DISHES = [
  {
    dishName: 'Греческий салат',
    ingredients: ['помидоры', 'огурцы', 'фета', 'оливковое масло', 'лук'],
    estimatedWeightG: 280,
    calories: 320,
    protein: 12,
    fat: 24,
    carbs: 14,
    confidence: 0.86,
  },
  {
    dishName: 'Куриная грудка с рисом',
    ingredients: ['куриная грудка', 'рис', 'оливковое масло', 'специи'],
    estimatedWeightG: 350,
    calories: 485,
    protein: 42,
    fat: 12,
    carbs: 48,
    confidence: 0.91,
  },
  {
    dishName: 'Овсянка с бананом',
    ingredients: ['овсяные хлопья', 'банан', 'молоко', 'мёд'],
    estimatedWeightG: 300,
    calories: 380,
    protein: 14,
    fat: 9,
    carbs: 62,
    confidence: 0.88,
  },
  {
    dishName: 'Борщ домашний',
    ingredients: ['свёкла', 'капуста', 'картофель', 'говядина', 'сметана'],
    estimatedWeightG: 400,
    calories: 290,
    protein: 16,
    fat: 14,
    carbs: 28,
    confidence: 0.79,
  },
  {
    dishName: 'Сэндвич с индейкой',
    ingredients: ['цельнозерновой хлеб', 'индейка', 'сыр', 'салат', 'помидор'],
    estimatedWeightG: 220,
    calories: 410,
    protein: 28,
    fat: 15,
    carbs: 38,
    confidence: 0.84,
  },
];

/**
 * Demo mock — does NOT analyze the image. Use OpenAI or Gemini for real recognition.
 * @param {{ buffer?: Buffer, filename?: string }} input
 * @returns {Promise<import('./types.js').VisionAnalysisResult>}
 */
export async function analyzeFoodImage(input = {}) {
  const seed = (input.filename || '').length + (input.buffer?.length || 0);
  const index = Math.abs(seed) % MOCK_DISHES.length;
  const dish = MOCK_DISHES[index];

  await new Promise((r) => setTimeout(r, 600 + (seed % 400)));

  return {
    ...dish,
    provider: 'mock',
    raw: { mock: true, seed, note: 'Replace with OpenAI Vision or Gemini Vision' },
  };
}
