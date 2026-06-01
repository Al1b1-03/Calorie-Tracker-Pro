/**
 * ФАЙЛ: LocalVisionAdapter.js
 * ЧТО ЭТО: Локальная модель CLIP.
 * ЗА ЧТО ОТВЕЧАЕТ: распознавание без API-ключей (Transformers.js).
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pipeline, RawImage, env } from '@xenova/transformers';
import {
  FOOD_CATALOG,
  FOOD_CATEGORIES,
  buildFineLabelMap,
  getCatalogByCategoryIds,
  resolveCatalogEntry,
} from './foodCatalog.js';
import { loadImageInput } from './loadImageInput.js';
import {
  aggregateScoresByCatalogId,
  applyRankingBias,
  computeCalibratedConfidence,
  rankCatalogScores,
} from './localRanker.js';

const DEFAULT_CACHE = path.join(process.cwd(), '.cache', 'huggingface');
const cacheDir = process.env.HF_HOME || process.env.TRANSFORMERS_CACHE || DEFAULT_CACHE;

env.cacheDir = cacheDir;
env.allowLocalModels = true;

let classifierPromise = null;

function getModelId() {
  return process.env.VISION_LOCAL_MODEL || 'Xenova/clip-vit-base-patch16';
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

/**
 * @param {import('@xenova/transformers').ZeroShotImageClassificationPipeline} classifier
 * @param {import('@xenova/transformers').RawImage} image
 */
async function detectCategories(classifier, image) {
  const categoryLabels = FOOD_CATEGORIES.map((item) => item.clipLabel);
  const results = await classifier(image, categoryLabels, { topk: 4 });

  if (!Array.isArray(results) || results.length === 0) {
    return FOOD_CATEGORIES.map((item) => item.id);
  }

  const topScore = Number(results[0]?.score) || 0;
  const categoryIds = [];

  for (const match of results) {
    const category = FOOD_CATEGORIES.find((item) => item.clipLabel === match.label);
    if (!category) continue;
    const score = Number(match.score) || 0;
    if (score >= topScore * 0.55 || score >= 0.1) {
      categoryIds.push(category.id);
    }
  }

  return categoryIds.length > 0 ? categoryIds : [FOOD_CATEGORIES[0].id];
}

/**
 * @param {import('@xenova/transformers').ZeroShotImageClassificationPipeline} classifier
 * @param {import('@xenova/transformers').RawImage} image
 * @param {string[]} categoryIds
 */
async function classifyWithinCategories(classifier, image, categoryIds, lang) {
  let pool = getCatalogByCategoryIds(categoryIds);
  if (pool.length < 4) {
    pool = FOOD_CATALOG;
  }

  const { labels, labelToCatalogId } = buildFineLabelMap(pool);
  const topk = Math.min(16, labels.length);
  let results = await classifier(image, labels, { topk });

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Не удалось распознать блюдо на фото');
  }

  let scores = aggregateScoresByCatalogId(results, labelToCatalogId);
  let ranked = applyRankingBias(rankCatalogScores(scores));

  if (ranked.length === 0) {
    const full = buildFineLabelMap(FOOD_CATALOG);
    results = await classifier(image, full.labels, { topk: Math.min(16, full.labels.length) });
    scores = aggregateScoresByCatalogId(results, full.labelToCatalogId);
    ranked = applyRankingBias(rankCatalogScores(scores));
  }

  if (ranked.length === 0) {
    throw new Error('Не удалось определить категорию блюда');
  }

  const [catalogId, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] ?? 0;
  const resolved = resolveCatalogEntry(catalogId, lang);

  if (!resolved) {
    throw new Error('Не удалось определить категорию блюда');
  }

  const alternatives = ranked.slice(1, 4).map(([id, score]) => {
    const item = resolveCatalogEntry(id, lang);
    return item ? { dishName: item.dishName, catalogId: id, score } : null;
  }).filter(Boolean);

  return {
    ranked,
    catalogId,
    topScore,
    secondScore,
    resolved,
    alternatives,
    poolSize: labels.length,
    clipMatches: results,
    labelToCatalogId,
    categoryIds,
  };
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

  const categoryIds = await detectCategories(classifier, image);
  const {
    ranked,
    catalogId,
    topScore,
    secondScore,
    resolved,
    alternatives,
    poolSize,
    clipMatches,
    labelToCatalogId,
    categoryIds: usedCategories,
  } = await classifyWithinCategories(classifier, image, categoryIds, lang);

  const localized = resolved;
  const confidence = computeCalibratedConfidence(topScore, secondScore, poolSize);

  return {
    ...localized,
    confidence,
    provider: 'local',
    raw: {
      categoryIds: usedCategories,
      catalogId,
      topScore,
      secondScore,
      alternatives: alternatives.map((alt) => ({
        ...alt,
        dishName:
          resolveCatalogEntry(alt.catalogId, lang)?.dishName || alt.dishName,
      })),
      topMatches: ranked.slice(0, 5).map(([id, score]) => ({
        catalogId: id,
        score,
        dishName: resolveCatalogEntry(id, lang)?.dishName,
      })),
      clipMatches: clipMatches.slice(0, 8).map((item) => ({
        label: item.label,
        score: item.score,
        catalogId: labelToCatalogId.get(item.label) || null,
      })),
    },
  };
}

export function isLocalVisionReady() {
  return Boolean(classifierPromise);
}
