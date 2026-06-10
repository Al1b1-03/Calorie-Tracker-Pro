/**
 * Проверка: бэкенд подключён к какой БД (локальная db или Render dpg-...).
 */
import 'dotenv/config';
import { getDatabaseHostLabel, validateDatabaseUrl } from '../src/config/databaseUrl.js';

const url = process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL;
const check = validateDatabaseUrl(url);
const host = getDatabaseHostLabel(url);

console.log('--- Проверка БД ---');
console.log('Host:', host);

if (!check.ok) {
  console.log('Статус: ОШИБКА —', check.message);
  process.exit(1);
}

if (host.includes('dpg-') || host.includes('render.com')) {
  console.log('Статус: Render PostgreSQL (синхронизация с продом)');
} else if (host === 'db') {
  console.log('Статус: локальный Docker Postgres (diplomka-db)');
} else {
  console.log('Статус: подключено к', host);
}

console.log('OK');
process.exit(0);
