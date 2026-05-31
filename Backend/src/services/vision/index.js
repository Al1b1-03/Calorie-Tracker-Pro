import { analyzeFoodImage as mockAnalyze } from './MockVisionAdapter.js';
import { analyzeFoodImage as openaiAnalyze } from './OpenAIVisionAdapter.js';
import { analyzeFoodImage as geminiAnalyze } from './GeminiVisionAdapter.js';
import { analyzeFoodImage as localAnalyze } from './LocalVisionAdapter.js';
import { getVisionProviderName } from './resolveProvider.js';

console.info(`[vision] Active provider: ${getVisionProviderName()}`);

export async function analyzeFoodImage(input) {
  const provider = getVisionProviderName();

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

export { getVisionProviderName };
