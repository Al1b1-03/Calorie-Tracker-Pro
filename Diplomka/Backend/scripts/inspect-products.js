/**
 * Диагностика картинок товаров.
 * Запуск из папки Backend: node scripts/inspect-products.js
 */
import 'dotenv/config';
import { query } from '../src/config/database.js';

async function inspect() {
  try {
    const res = await query(
      `SELECT id, name, image_url
       FROM products
       ORDER BY id ASC
       LIMIT 50`
    );
    console.log('Всего товаров:', res.rows.length);
    for (const row of res.rows) {
      console.log(
        `#${row.id} "${row.name}": image_url=${row.image_url == null ? 'NULL' : `"${row.image_url}"`}`
      );
    }
    process.exit(0);
  } catch (err) {
    console.error('Ошибка при чтении товаров:', err.message);
    process.exit(1);
  }
}

inspect();

