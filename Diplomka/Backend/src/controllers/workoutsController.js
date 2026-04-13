import fs from 'fs';
import path from 'path';
import { query } from '../config/database.js';
import { productsUploadsDir } from '../config/uploadsPath.js';

// Тренировки хранятся в таблице workouts. Админ добавляет/редактирует через POST/PATCH/DELETE /api/admin/workouts.
// Список для всех: GET /api/workouts (без авторизации).

const normalizeCategory = (v) => {
  const c = String(v || '').trim().toLowerCase();
  const allowed = ['arms', 'core', 'chest', 'back', 'legs', 'cardio', 'fullbody', 'other'];
  return allowed.includes(c) ? c : 'other';
};

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  shortDesc: row.short_desc ?? '',
  fullDescription: row.full_description ?? '',
  benefits: row.benefits ?? '',
  howTo: row.how_to ?? '',
  regime: row.regime ?? '',
  important: row.important ?? '',
  targetMuscles: row.target_muscles ?? '',
  duration: Number(row.duration) || 0,
  calories: Number(row.calories) || 0,
  difficulty: row.difficulty ?? 'Средняя',
  category: normalizeCategory(row.category),
  image: row.image_url,
  imageUrl: row.image_url,
  exercises: Array.isArray(row.exercises)
    ? row.exercises
    : row.exercises && typeof row.exercises === 'object'
      ? Object.values(row.exercises)
      : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listWorkouts = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises, created_at, updated_at
       FROM workouts
       ORDER BY id ASC`
    );
    const workouts = result.rows.map(mapRow);
    res.json({ workouts });
  } catch (err) {
    console.error('List workouts error:', err);
    res.status(500).json({ error: 'Ошибка загрузки тренировок' });
  }
};

const toInt = (v, def = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
};

export const createWorkout = async (req, res) => {
  try {
    const {
      title,
      shortDesc,
      fullDescription,
      benefits,
      howTo,
      regime,
      important,
      targetMuscles,
      duration,
      calories,
      difficulty,
      imageUrl,
      exercises,
      category,
    } =
      req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    const exercisesJson = Array.isArray(exercises) ? exercises : [];
    let exercisesStr = '[]';
    try {
      exercisesStr = JSON.stringify(exercisesJson);
    } catch {
      exercisesStr = '[]';
    }
    const result = await query(
      `INSERT INTO workouts (title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
       RETURNING id, title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises, created_at, updated_at`,
      [
        String(title).trim(),
        shortDesc ? String(shortDesc).trim() : null,
        fullDescription ? String(fullDescription).trim() : null,
        benefits ? String(benefits).trim() : null,
        howTo ? String(howTo).trim() : null,
        regime ? String(regime).trim() : null,
        important ? String(important).trim() : null,
        targetMuscles ? String(targetMuscles).trim() : null,
        toInt(duration, 30),
        toInt(calories, 0),
        difficulty ? String(difficulty).trim() : 'Средняя',
        normalizeCategory(category),
        imageUrl ? String(imageUrl).trim() : null,
        exercisesStr,
      ]
    );
    const row = result.rows[0];
    res.status(201).json({ workout: mapRow(row) });
  } catch (err) {
    console.error('Create workout error:', err);
    const msg =
      process.env.NODE_ENV !== 'production' && err.message
        ? `Ошибка создания тренировки: ${err.message}`
        : 'Ошибка создания тренировки';
    res.status(500).json({ error: msg });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    const {
      title,
      shortDesc,
      fullDescription,
      benefits,
      howTo,
      regime,
      important,
      targetMuscles,
      duration,
      calories,
      difficulty,
      imageUrl,
      exercises,
      category,
    } =
      req.body;
    const exercisesJson = Array.isArray(exercises) ? exercises : [];
    let result = await query(
      `UPDATE workouts
       SET title = COALESCE(NULLIF(TRIM($1), ''), title),
           short_desc = COALESCE($2, short_desc),
           full_description = COALESCE($3, full_description),
           benefits = COALESCE($4, benefits),
           how_to = COALESCE($5, how_to),
           regime = COALESCE($6, regime),
           important = COALESCE($7, important),
           target_muscles = COALESCE($8, target_muscles),
           duration = COALESCE($9::integer, duration),
           calories = COALESCE($10::integer, calories),
           difficulty = COALESCE(NULLIF(TRIM($11), ''), difficulty),
           category = COALESCE($12, category),
           image_url = COALESCE($13, image_url),
           exercises = COALESCE($14::jsonb, exercises),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING id, title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises, updated_at`,
      [
        title?.trim(),
        shortDesc != null ? String(shortDesc).trim() : null,
        fullDescription != null ? String(fullDescription).trim() : null,
        benefits != null ? String(benefits).trim() : null,
        howTo != null ? String(howTo).trim() : null,
        regime != null ? String(regime).trim() : null,
        important != null ? String(important).trim() : null,
        targetMuscles != null ? String(targetMuscles).trim() : null,
        duration != null ? toInt(duration) : null,
        calories != null ? toInt(calories) : null,
        difficulty?.trim(),
        category != null ? normalizeCategory(category) : null,
        imageUrl != null ? String(imageUrl).trim() : null,
        JSON.stringify(exercisesJson),
        id,
      ]
    );
    // Если по какой-то причине тренировка с таким id не найдена, создаём новую
    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO workouts (title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 30), COALESCE($10, 0), COALESCE(NULLIF(TRIM($11), ''), 'Средняя'), $12, $13, $14::jsonb)
         RETURNING id, title, short_desc, full_description, benefits, how_to, regime, important, target_muscles, duration, calories, difficulty, category, image_url, exercises, created_at, updated_at`,
        [
          String(title ?? '').trim(),
          shortDesc != null ? String(shortDesc).trim() : null,
          fullDescription != null ? String(fullDescription).trim() : null,
          benefits != null ? String(benefits).trim() : null,
          howTo != null ? String(howTo).trim() : null,
          regime != null ? String(regime).trim() : null,
          important != null ? String(important).trim() : null,
          targetMuscles != null ? String(targetMuscles).trim() : null,
          duration != null ? toInt(duration, 30) : null,
          calories != null ? toInt(calories, 0) : null,
          difficulty ?? 'Средняя',
          normalizeCategory(category),
          imageUrl != null ? String(imageUrl).trim() : null,
          JSON.stringify(exercisesJson),
        ]
      );
    }
    res.json({ workout: mapRow(result.rows[0]) });
  } catch (err) {
    console.error('Update workout error:', err);
    res.status(500).json({ error: 'Ошибка обновления тренировки' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    const result = await query('DELETE FROM workouts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Тренировка не найдена' });
    res.json({ message: 'Тренировка удалена' });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ error: 'Ошибка удаления тренировки' });
  }
};

export const uploadWorkoutImage = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const file = req.file;

    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    if (!file) {
      return res.status(400).json({ error: 'Выберите изображение' });
    }

    const imageUrl = `/uploads/products/${file.filename}`;

    const selectResult = await query('SELECT image_url FROM workouts WHERE id = $1', [id]);
    if (selectResult.rows.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }

    const oldPath = selectResult.rows[0].image_url;
    if (oldPath && !oldPath.startsWith('http')) {
      const oldFilename = path.basename(oldPath.replace(/\\/g, '/'));
      const fullPath = path.join(productsUploadsDir, oldFilename);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn('Could not delete old workout image:', e.message);
        }
      }
    }

    const result = await query(
      `UPDATE workouts
       SET image_url = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, short_desc, full_description, duration, calories, difficulty, image_url, exercises, updated_at`,
      [imageUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Тренировка не найдена' });
    }

    const row = result.rows[0];
    res.json({ workout: mapRow(row) });
  } catch (err) {
    console.error('Upload workout image error:', err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Ошибка загрузки изображения' });
  }
};

