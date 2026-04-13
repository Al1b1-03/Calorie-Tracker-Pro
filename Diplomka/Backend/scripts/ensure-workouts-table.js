/**
 * Гарантированно создаёт таблицу workouts, если её нет.
 * Запуск из папки Backend: node scripts/ensure-workouts-table.js
 */
import 'dotenv/config';
import { ensureWorkoutsTable } from '../src/database/migrate.js';

ensureWorkoutsTable()
  .then(() => {
    console.log('Таблица workouts готова.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка:', err.message);
    process.exit(1);
  });
