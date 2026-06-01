/**
 * ФАЙЛ: scansController.js
 * ЧТО ЭТО: Контроллер: AI-камера.
 * ЗА ЧТО ОТВЕЧАЕТ: recognize, история сканов, в дневник.
 */
import { query } from '../config/database.js';
import { analyzeFoodImage } from '../services/vision/index.js';
import { mapVisionError } from '../services/vision/visionErrors.js';

function parseRawResponse(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const mapScanRow = (row) => {
  const raw = parseRawResponse(row.raw_response);
  const alternatives = Array.isArray(raw.alternatives)
    ? raw.alternatives
        .map((item) => ({
          dishName: item?.dishName || '',
          catalogId: item?.catalogId || null,
          score: typeof item?.score === 'number' ? item.score : null,
        }))
        .filter((item) => item.dishName)
    : [];

  return {
    id: row.id,
    imageUrl: row.image_url,
    dishName: row.dish_name,
    ingredients: row.ingredients || [],
    estimatedWeightG: row.estimated_weight_g,
    calories: row.calories,
    protein: parseFloat(row.protein),
    fat: parseFloat(row.fat),
    carbs: parseFloat(row.carbs),
    confidence: parseFloat(row.confidence),
    provider: row.provider,
    status: row.status,
    entryId: row.entry_id,
    createdAt: row.created_at,
    alternatives,
  };
};

export const analyzeScan = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) {
      return res.status(400).json({ error: 'Загрузите фото блюда' });
    }

    const imageUrl = `/uploads/scans/${req.file.filename}`;
    const analysis = await analyzeFoodImage({
      buffer: req.file.buffer,
      filename: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype || 'image/jpeg',
      lang: req.body?.lang || 'ru',
    });

    const result = await query(
      `INSERT INTO food_scans (
        user_id, image_url, dish_name, ingredients, estimated_weight_g,
        calories, protein, fat, carbs, confidence, provider, raw_response, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
      [
        userId,
        imageUrl,
        analysis.dishName,
        JSON.stringify(analysis.ingredients),
        analysis.estimatedWeightG,
        analysis.calories,
        analysis.protein,
        analysis.fat,
        analysis.carbs,
        analysis.confidence,
        analysis.provider,
        JSON.stringify(analysis.raw || {}),
      ]
    );

    res.status(201).json({ scan: mapScanRow(result.rows[0]) });
  } catch (err) {
    console.error('Analyze scan error:', err);
    if (err.code === '42P01') {
      return res.status(503).json({
        error: 'Таблица сканирований не создана. Перезапустите backend для применения миграций.',
      });
    }
    res.status(500).json({ error: mapVisionError(err) });
  }
};

export const getScans = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const result = await query(
      `SELECT * FROM food_scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    res.json({ scans: result.rows.map(mapScanRow) });
  } catch (err) {
    console.error('Get scans error:', err);
    res.status(500).json({ error: 'Ошибка загрузки истории сканирований' });
  }
};

export const getScanById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM food_scans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сканирование не найдено' });
    }
    res.json({ scan: mapScanRow(result.rows[0]) });
  } catch (err) {
    console.error('Get scan error:', err);
    res.status(500).json({ error: 'Ошибка загрузки сканирования' });
  }
};

export const confirmScan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { entryDate } = req.body;

    const scanResult = await query(
      'SELECT * FROM food_scans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (scanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Сканирование не найдено' });
    }

    const scan = scanResult.rows[0];
    if (scan.status === 'confirmed' && scan.entry_id) {
      return res.json({
        scan: mapScanRow(scan),
        message: 'Уже добавлено в дневник',
      });
    }

    const date =
      entryDate ||
      new Date().toISOString().split('T')[0];

    const entryResult = await query(
      `INSERT INTO food_entries (user_id, product_name, calories, protein, fat, carbs, entry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        userId,
        scan.dish_name,
        scan.calories,
        scan.protein,
        scan.fat,
        scan.carbs,
        date,
      ]
    );

    const entryId = entryResult.rows[0].id;
    const updated = await query(
      `UPDATE food_scans SET status = 'confirmed', entry_id = $1 WHERE id = $2 RETURNING *`,
      [entryId, id]
    );

    res.json({
      scan: mapScanRow(updated.rows[0]),
      entryId,
      message: 'Добавлено в дневник питания',
    });
  } catch (err) {
    console.error('Confirm scan error:', err);
    res.status(500).json({ error: 'Ошибка при добавлении в дневник' });
  }
};
