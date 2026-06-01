/**
 * ФАЙЛ: migrate.js
 * ЧТО ЭТО: Миграции базы данных.
 * ЗА ЧТО ОТВЕЧАЕТ: при старте сервера выполняет SQL из database/migrations/.
 */
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function isMigrationApplied(filename) {
  const result = await pool.query(
    'SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1',
    [filename]
  );
  return result.rows.length > 0;
}

async function markMigrationApplied(filename) {
  await pool.query(
    'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
    [filename]
  );
}

async function runSqlFile(label, filePath) {
  if (await isMigrationApplied(label)) {
    console.log(`[migrate] skip ${label}`);
    return;
  }

  const sql = readFileSync(filePath, 'utf-8');
  await pool.query(sql);
  await markMigrationApplied(label);
  console.log(`[migrate] applied ${label}`);
}

export const runMigrations = async () => {
  if (!process.env.DATABASE_URL?.trim()) {
    return;
  }

  try {
    await ensureMigrationsTable();

    const rootDir = join(__dirname, '../../database');
    await runSqlFile('init.sql', join(rootDir, 'init.sql'));

    const migrationsDir = join(rootDir, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      try {
        await runSqlFile(file, join(migrationsDir, file));
      } catch (e) {
        console.error(`Migration ${file} failed:`, e.message);
        throw new Error(`Migration ${file}: ${e.message}`);
      }
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
};
