import { buildVisionPrompt } from './visionPrompt.js';
import { loadImageInput } from './loadImageInput.js';
import { parseVisionJson } from './parseVisionResponse.js';

/**
 * @param {{ buffer?: Buffer, filename?: string, mimeType?: string, lang?: string }} input
 */
export async function analyzeFoodImage(input = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in Backend/.env');
  }

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o';
  const lang = input.lang || 'ru';
  const { buffer, mimeType } = await loadImageInput(input);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You analyze food photos and return strict JSON only.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: buildVisionPrompt(lang) },
            {
              type: 'image_url',
              image_url: { url: dataUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 900,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI Vision error (${response.status})`;
    throw new Error(message);
  }

  const rawText = payload?.choices?.[0]?.message?.content;
  const parsed = parseVisionJson(rawText);

  return {
    ...parsed,
    provider: 'openai',
    raw: payload,
  };
}
