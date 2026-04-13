import pg from 'pg';

const { Pool } = pg;

// Локальная разработка: по умолчанию подключаемся к Postgres из docker-compose (порт 5433 на хосте)
// В docker-compose база поднята как сервис "db" с проброшенным портом 5433:5432,
// поэтому при локальном запуске бэкенда (npm run dev) он попадает в ту же БД, что и контейнеры.
const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5433/calorie_tracker';
const url = process.env.DATABASE_URL;
const connectionString =
  url && !url.includes('user:password') ? url : (process.env.DATABASE_URL = DEFAULT_URL);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = (text, params) => pool.query(text, params);

export default pool;
