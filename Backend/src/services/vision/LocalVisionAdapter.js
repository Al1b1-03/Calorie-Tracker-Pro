import fs from 'fs';
import os from 'os';
import path from 'path';
import { pipeline, RawImage } from '@xenova/transformers';
import { FOOD_CATALOG, getCatalogLabels, resolveCatalogEntry } from './foodCatalog.js';
import { loadImageInput } from './loadImageInput.js';

let classifierPromise = null;

function getClassifier() {
  if (!classifierPromise) {
    const model = process.env.VISION_LOCAL_MODEL || 'Xenova/clip-vit-base-patch32';
    classifierPromise = pipeline('zero-shot-image-classification', model);
  }
  return classifierPromise;
}

async function bufferToRawImage(buffer, mimeType) {
  try {
    return await RawImage.fromBlob(new Blob([buffer], { type: mimeType || 'image/jpeg' }));
  } catch {
    const tmpPath = path.join(
      os.tmpdir(),
      `vision-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
    );
    fs.writeFileSync(tmpPath, buffer);
    try {
      return await RawImage.read(tmpPath);
    } finally {
      fs.unlink(tmpPath, () => {});
    }
  }
}

/**
 * @param {{ buffer?: Buffer, filename?: string, mimeType?: string, lang?: string }} input
 */
export async function analyzeFoodImage(input = {}) {
  const lang = input.lang || 'ru';
  const { buffer, mimeType } = await loadImageInput(input);
  const classifier = await getClassifier();
  const image = await bufferToRawImage(buffer, mimeType);
  const labels = getCatalogLabels();

  const results = await classifier(image, labels, { topk: 5 });

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Не удалось распознать блюдо на фото');
  }

  const top = results[0];
  const labelIndex = labels.indexOf(top.label);
  const catalogId = labelIndex >= 0 ? FOOD_CATALOG[labelIndex]?.id : null;
  const resolved = catalogId ? resolveCatalogEntry(catalogId, lang) : null;

  if (!resolved) {
    throw new Error('Не удалось определить категорию блюда');
  }

  const confidence = Math.min(1, Math.max(0, Number(top.score) || 0));

  return {
    ...resolved,
    confidence: Math.round(confidence * 100) / 100,
    provider: 'local',
    raw: {
      topMatches: results.map((item) => ({
        label: item.label,
        score: item.score,
        catalogId: FOOD_CATALOG[labels.indexOf(item.label)]?.id,
      })),
    },
  };
}

export function isLocalVisionReady() {
  return true;
}
