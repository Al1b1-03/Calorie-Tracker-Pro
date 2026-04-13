import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const sqlPath = join(__dirname, '../../database/init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    await pool.query(sql);
    console.log('Init migration completed');

    const migrationsDir = join(__dirname, '../../database/migrations');
    try {
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        // Никогда автоматически не запускаем destructive-скрипт для workouts
        .filter((f) => f !== '016_drop_workouts.sql')
        .sort();
      for (const file of files) {
        try {
          const migrationSql = readFileSync(join(migrationsDir, file), 'utf-8');
          await pool.query(migrationSql);
          console.log(`Migration ${file} completed`);
        } catch (e) {
          console.error(`Migration ${file} failed:`, e.message);
          throw new Error(`Migration ${file}: ${e.message}`);
        }
      }
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
};

const WORKOUTS_TABLE_SQL = `
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
);
CREATE INDEX IF NOT EXISTS idx_workouts_title ON workouts(title);
`;

/** Создаёт таблицу workouts, если её ещё нет (после миграций). */
export const ensureWorkoutsTable = async () => {
  if (!process.env.DATABASE_URL) return;
  try {
    await pool.query(WORKOUTS_TABLE_SQL);
    console.log('Workouts table ready');
  } catch (err) {
    console.error('ensureWorkoutsTable failed:', err.message);
    throw err;
  }
};
