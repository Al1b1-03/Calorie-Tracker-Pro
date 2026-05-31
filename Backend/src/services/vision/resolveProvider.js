function resolveProvider() {
  const configured = (process.env.VISION_PROVIDER || 'auto').toLowerCase();

  if (configured === 'mock') return 'mock';
  if (configured === 'openai') return 'openai';
  if (configured === 'gemini') return 'gemini';
  if (configured === 'local') return 'local';

  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return 'local';
}

export function getVisionProviderName() {
  return resolveProvider();
}
