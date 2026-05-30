import { buildVisionPrompt } from './visionPrompt.js';
import { loadImageInput } from './loadImageInput.js';
import { parseVisionJson } from './parseVisionResponse.js';

/**
 * @param {{ buffer?: Buffer, filename?: string, mimeType?: string, lang?: string }} input
 */
export async function analyzeFoodImage(input = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in Backend/.env');
  }

  const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.0-flash';
  const lang = input.lang || 'ru';
  const { buffer, mimeType } = await loadImageInput(input);
  const base64 = buffer.toString('base64');

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildVisionPrompt(lang) },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || `Gemini Vision error (${response.status})`;
    throw new Error(message);
  }

  const rawText = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n');

  const parsed = parseVisionJson(rawText);

  return {
    ...parsed,
    provider: 'gemini',
    raw: payload,
  };
}
