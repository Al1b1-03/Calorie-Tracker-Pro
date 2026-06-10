/**
 * Разбор DATABASE_URL (URL, libpq host=..., переменные Render).
 */
import parse from 'pg-connection-string';

// Шаблоны из .env.example — не путать с Docker-хостом "db" (@db:5432 в compose валиден)
const PLACEHOLDER_PATTERN =
  /user:password|USER:PASSWORD|@HOST\/|@base\/|your-super-secret/i;

const INVALID_HOSTS = new Set(['host', 'base']);

export function normalizeDatabaseUrl(connectionString) {
  return String(connectionString || '')
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/^["']+|["']+$/g, '');
}

function looksLikePostgresConfig(raw) {
  return (
    /^postgres(?:ql)?:\/\//i.test(raw) ||
    /^jdbc:postgres(?:ql)?:\/\//i.test(raw) ||
    /\bhost\s*=/i.test(raw)
  );
}

function toParseable(raw) {
  if (/^jdbc:postgres/i.test(raw)) {
    return raw.replace(/^jdbc:/i, '');
  }
  return raw;
}

function parseConfig(connectionString) {
  const raw = normalizeDatabaseUrl(connectionString);
  if (!raw || !looksLikePostgresConfig(raw)) return null;
  try {
    return parse(toParseable(raw));
  } catch {
    return null;
  }
}

/** Собрать URL из переменных Render / libpq. */
export function resolveDatabaseUrlFromEnv() {
  const direct = [
    process.env.DATABASE_URL,
    process.env.INTERNAL_DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRESQL_URL,
  ]
    .map(normalizeDatabaseUrl)
    .find((v) => v && !PLACEHOLDER_PATTERN.test(v));

  if (direct && looksLikePostgresConfig(direct)) {
    return direct;
  }

  const host =
    process.env.PGHOST ||
    process.env.POSTGRES_HOST ||
    process.env.DB_HOST;
  const user =
    process.env.PGUSER ||
    process.env.POSTGRES_USER ||
    process.env.DB_USER;
  const password =
    process.env.PGPASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.DB_PASSWORD;
  const database =
    process.env.PGDATABASE ||
    process.env.POSTGRES_DB ||
    process.env.DB_NAME;
  const port = process.env.PGPORT || process.env.POSTGRES_PORT || '5432';

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  return direct || null;
}

export function getDatabaseHostLabel(connectionString) {
  const config = parseConfig(connectionString);
  if (!config?.host) return '(unknown)';
  return config.host;
}

export function describeDatabaseUrlFormat(connectionString) {
  const raw = normalizeDatabaseUrl(connectionString);
  if (!raw) return 'empty';
  if (/^jdbc:postgres/i.test(raw)) return 'jdbc-url';
  if (/^postgres(?:ql)?:\/\//i.test(raw)) return 'postgres-url';
  if (/\bhost\s*=/i.test(raw)) return 'libpq';
  return `other (starts with: ${raw.slice(0, 16)}…)`;
}

export function validateDatabaseUrl(connectionString) {
  const raw = normalizeDatabaseUrl(connectionString);
  if (!raw) {
    return { ok: false, message: 'DATABASE_URL is empty' };
  }
  if (PLACEHOLDER_PATTERN.test(raw)) {
    return {
      ok: false,
      message:
        'DATABASE_URL is a template. In Render: PostgreSQL → Connections → Internal Database URL → copy full postgres://… string.',
    };
  }
  if (!looksLikePostgresConfig(raw)) {
    return {
      ok: false,
      message: `DATABASE_URL format not recognized (${describeDatabaseUrlFormat(raw)}). Paste full Internal Database URL from Render (starts with postgres://).`,
    };
  }

  const config = parseConfig(raw);
  if (!config?.host) {
    return {
      ok: false,
      message:
        'Cannot parse DATABASE_URL. Copy the full Internal Database URL from Render PostgreSQL (one line, no quotes).',
    };
  }

  const host = String(config.host).toLowerCase();
  if (INVALID_HOSTS.has(host)) {
    return {
      ok: false,
      message: `Host "${config.host}" is a placeholder. Use Internal Database URL (host like dpg-xxxxx-a) or Docker service "db".`,
    };
  }

  // На Render localhost в URL — ошибка конфигурации
  if (
    process.env.NODE_ENV === 'production' &&
    (host === 'localhost' || host === '127.0.0.1')
  ) {
    return {
      ok: false,
      message: `Host "${config.host}" is not valid on Render. Use Internal Database URL from PostgreSQL.`,
    };
  }

  return { ok: true, host: config.host };
}

export function resolveConnectionString() {
  const url = resolveDatabaseUrlFromEnv();
  if (!url || PLACEHOLDER_PATTERN.test(url)) {
    return null;
  }
  const check = validateDatabaseUrl(url);
  if (!check.ok) {
    return null;
  }
  return url;
}
