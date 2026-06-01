/**
 * Безопасный разбор DATABASE_URL (pg-connection-string — как в node-pg).
 */
import parse from 'pg-connection-string';

const PLACEHOLDER_PATTERN =
  /user:password|USER:PASSWORD|@HOST\/|@base\/|@db:5432|your-super-secret/i;

const INVALID_HOSTS = new Set(['host', 'base', 'db', 'localhost', '127.0.0.1']);

export function normalizeDatabaseUrl(connectionString) {
  return String(connectionString || '')
    .trim()
    .replace(/^["']+|["']+$/g, '');
}

function parseConfig(connectionString) {
  const raw = normalizeDatabaseUrl(connectionString);
  if (!raw) return null;
  if (!/^postgres(?:ql)?:\/\//i.test(raw)) {
    return null;
  }
  try {
    return parse(raw);
  } catch {
    return null;
  }
}

export function getDatabaseHostLabel(connectionString) {
  const config = parseConfig(connectionString);
  if (!config?.host) return '(invalid DATABASE_URL)';
  return config.host;
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
        'DATABASE_URL looks like a template (HOST/base/user:password). Paste Internal Database URL from Render PostgreSQL.',
    };
  }
  if (!/^postgres(?:ql)?:\/\//i.test(raw)) {
    return {
      ok: false,
      message:
        'DATABASE_URL must start with postgres:// or postgresql:// (Internal Database URL from Render).',
    };
  }

  const config = parseConfig(raw);
  if (!config?.host) {
    return {
      ok: false,
      message:
        'Cannot parse DATABASE_URL. Copy the full Internal Database URL from Render (one line, no quotes).',
    };
  }

  const host = String(config.host).toLowerCase();
  if (INVALID_HOSTS.has(host)) {
    return {
      ok: false,
      message: `DATABASE_URL host "${config.host}" is not a real server. Use Internal URL (host like dpg-xxxxx-a).`,
    };
  }

  return { ok: true, host: config.host };
}

export function resolveConnectionString() {
  const url = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (!url || PLACEHOLDER_PATTERN.test(url)) {
    return null;
  }
  const check = validateDatabaseUrl(url);
  if (!check.ok) {
    return null;
  }
  return url;
}
