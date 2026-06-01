/**
 * ФАЙЛ: index.js
 * ЧТО ЭТО: Модуль AI-распознавания еды.
 * ЗА ЧТО ОТВЕЧАЕТ: выбор провайдера и analyzeFoodImage.
 */
import { analyzeFoodImage as mockAnalyze } from './MockVisionAdapter.js';
import { analyzeFoodImage as openaiAnalyze } from './OpenAIVisionAdapter.js';
import { analyzeFoodImage as geminiAnalyze } from './GeminiVisionAdapter.js';
import { getVisionProviderName } from './resolveProvider.js';

async function localAnalyze(input) {
  const { analyzeFoodImage } = await import('./LocalVisionAdapter.js');
  return analyzeFoodImage(input);
}

async function analyzeWithAuto(input) {
  const errors = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      return await geminiAnalyze(input);
    } catch (err) {
      console.warn('[vision] Gemini failed, trying next provider:', err.message);
      errors.push(err);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await openaiAnalyze(input);
    } catch (err) {
      console.warn('[vision] OpenAI failed, trying next provider:', err.message);
      errors.push(err);
    }
  }

  try {
    return await localAnalyze(input);
  } catch (err) {
    errors.push(err);
    throw errors[0] || err;
  }
}

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

  return analyzeWithAuto(input);
}

export { getVisionProviderName };
