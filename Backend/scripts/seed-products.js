/**
 * ФАЙЛ: seed-products.js
 * ЧТО ЭТО: CLI-скрипт.
 * ЗА ЧТО ОТВЕЧАЕТ: заполнить магазин товарами из JSON.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEED_PATH = path.join(__dirname, '../database/seed-products.json');

async function seed() {
  const dataPath = process.argv[2] || SEED_PATH;
  if (!fs.existsSync(dataPath)) {
    console.error('Файл не найден:', dataPath);
    process.exit(1);
  }

  let list;
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    list = JSON.parse(raw);
  } catch (err) {
    console.error('Ошибка чтения JSON:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(list) || list.length === 0) {
    console.log('Нет записей для загрузки.');
    process.exit(0);
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of list) {
    const name = (row.name || '').trim();
    if (!name) continue;

    const calories = Math.max(0, parseInt(row.calories, 10) || 0);
    const protein = Math.max(0, parseFloat(row.protein) || 0);
    const fat = Math.max(0, parseFloat(row.fat) || 0);
    const carbs = Math.max(0, parseFloat(row.carbs) || 0);
    const price = Math.max(0, parseFloat(row.price) || 0);
    const category = ['ration', 'vitamins', 'dishes'].includes(String(row.category || '').toLowerCase())
      ? String(row.category).toLowerCase()
      : 'dishes';
    const sortOrder = parseInt(row.sort_order, 10) || 0;

    try {
      const existing = await query('SELECT id FROM products WHERE name = $1', [name]);
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      await query(
        `INSERT INTO products (name, calories, protein, fat, carbs, price, image_url, category, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, $7, $8)`,
        [name, calories, protein, fat, carbs, price, category, sortOrder]
      );
      inserted++;
    } catch (err) {
      console.error('Ошибка при вставке "%s":', name, err.message);
    }
  }

  console.log('\nГотово. Добавлено:', inserted, ', пропущено (уже есть):', skipped);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Ошибка:', err.message);
  process.exit(1);
});
