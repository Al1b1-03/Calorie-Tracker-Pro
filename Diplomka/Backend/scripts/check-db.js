/**
 * Проверка подключения к БД и наличия таблицы workouts.
 * Запуск из папки Backend: node scripts/check-db.js
 */
import 'dotenv/config';
import { query } from '../src/config/database.js';

const CREATE_WORKOUTS_TABLE = `
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_desc VARCHAR(500),
  full_description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  calories INTEGER NOT NULL DEFAULT 0,
  difficulty VARCHAR(50) DEFAULT 'Средняя',
  image_url VARCHAR(500),
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)`;
const CREATE_WORKOUTS_INDEX = `CREATE INDEX IF NOT EXISTS idx_workouts_title ON workouts(title)`;

async function checkDb() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL не задан. Создайте .env из .env.example');
    process.exit(1);
  }

  try {
    await query('SELECT 1');
    console.log('Подключение к БД: OK');

    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'workouts'
      )`
    );
    const workoutsExists = tableCheck.rows[0].exists;

    if (!workoutsExists) {
      console.log('Таблица workouts не найдена. Создаю...');
      await query(CREATE_WORKOUTS_TABLE);
      await query(CREATE_WORKOUTS_INDEX);
      console.log('Таблица workouts создана.');
    } else {
      const count = await query('SELECT COUNT(*) AS c FROM workouts');
      console.log('Таблица workouts: есть, записей:', count.rows[0].c);
    }

    const usersCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      )`
    );
    if (!usersCheck.rows[0].exists) {
      console.warn('Таблица users не найдена. Запустите миграции при старте сервера.');
    } else {
      console.log('Таблица users: есть');
    }

    console.log('Проверка БД завершена.');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка БД:', err.message);
    if (err.code) console.error('Код:', err.code);
    process.exit(1);
  }
}

checkDb();
