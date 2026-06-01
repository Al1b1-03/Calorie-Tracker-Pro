/**
 * ФАЙЛ: resolveProvider.js
 * ЧТО ЭТО: Выбор провайдера vision.
 * ЗА ЧТО ОТВЕЧАЕТ: auto, local, openai, gemini из .env.
 */
function resolveProvider() {
  const configured = (process.env.VISION_PROVIDER || 'auto').toLowerCase();

  if (configured === 'mock') return 'mock';
  if (configured === 'openai') return 'openai';
  if (configured === 'gemini') return 'gemini';
  if (configured === 'local') return 'local';
  if (configured === 'auto') return 'auto';

  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return 'local';
}

export function getVisionProviderName() {
  return resolveProvider();
}
