import fs from 'fs';
import os from 'os';
import path from 'path';
import { pipeline, RawImage, env } from '@xenova/transformers';
import { FOOD_CATALOG, getCatalogLabels, resolveCatalogEntry } from './foodCatalog.js';
import { loadImageInput } from './loadImageInput.js';

const DEFAULT_CACHE = path.join(process.cwd(), '.cache', 'huggingface');
const cacheDir = process.env.HF_HOME || process.env.TRANSFORMERS_CACHE || DEFAULT_CACHE;

env.cacheDir = cacheDir;
env.allowLocalModels = true;

let classifierPromise = null;

function getModelId() {
  return process.env.VISION_LOCAL_MODEL || 'Xenova/clip-vit-base-patch32';
}

function modelHubCachePath(modelId) {
  return path.join(cacheDir, 'hub', `models--${modelId.replace(/\//g, '--')}`);
}

function clearModelCache(modelId) {
  const hubPath = modelHubCachePath(modelId);
  if (fs.existsSync(hubPath)) {
    fs.rmSync(hubPath, { recursive: true, force: true });
    console.warn(`[vision] Cleared incomplete model cache: ${hubPath}`);
  }
}

function isRetriableLoadError(err) {
  const msg = String(err?.message || err?.cause?.message || '');
  const code = err?.code || err?.cause?.code || '';
  return (
    msg.includes('terminated') ||
    msg.includes('other side closed') ||
    code === 'UND_ERR_SOCKET' ||
    msg.includes('ECONNRESET')
  );
}

async function loadClassifier(maxAttempts = 3) {
  const modelId = getModelId();
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await pipeline('zero-shot-image-classification', modelId);
    } catch (err) {
      lastErr = err;
      console.warn(
        `[vision] Model load attempt ${attempt}/${maxAttempts} failed:`,
        err.message
      );
      if (attempt < maxAttempts && isRetriableLoadError(err)) {
        clearModelCache(modelId);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      } else {
        break;
      }
    }
  }

  throw lastErr;
}

function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = loadClassifier().catch((err) => {
      classifierPromise = null;
      throw err;
    });
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

export async function warmupLocalVision() {
  console.info('[vision] Loading local CLIP model…');
  await getClassifier();
  console.info('[vision] Local CLIP model ready');
}

/**
 * @param {{ buffer?: Buffer, filename?: string, filePath?: string, mimeType?: string, lang?: string }} input
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
  return Boolean(classifierPromise);
}
