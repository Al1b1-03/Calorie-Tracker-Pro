import { analyzeFoodImage as mockAnalyze } from './MockVisionAdapter.js';
import { analyzeFoodImage as openaiAnalyze } from './OpenAIVisionAdapter.js';
import { analyzeFoodImage as geminiAnalyze } from './GeminiVisionAdapter.js';
import { analyzeFoodImage as localAnalyze } from './LocalVisionAdapter.js';

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

const provider = resolveProvider();

console.info(`[vision] Active provider: ${provider}`);

export async function analyzeFoodImage(input) {
  if (provider === 'openai') {
    return openaiAnalyze(input);
  }
  if (provider === 'gemini') {
    return geminiAnalyze(input);
  }
  if (provider === 'local') {
    return localAnalyze(input);
  }
  if (provider === 'mock') {
    return mockAnalyze(input);
  }

  throw new Error('Vision provider is not configured');
}

export function getVisionProviderName() {
  return provider;
}
