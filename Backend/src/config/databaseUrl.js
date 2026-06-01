/**
 * Безопасный разбор DATABASE_URL для логов и проверки (без пароля).
 */
const PLACEHOLDER_PATTERN =
  /user:password|USER:PASSWORD|@HOST\/|@base\/|@db:5432|your-super-secret/i;

const INVALID_HOSTS = new Set(['host', 'base', 'db', 'localhost', '127.0.0.1']);

function parseDbUrl(connectionString) {
  const raw = String(connectionString || '').trim();
  if (!raw) return null;
  try {
    const normalized = raw.replace(/^postgres(ql)?:/i, 'http:');
    return new URL(normalized);
  } catch {
    return null;
  }
}

export function getDatabaseHostLabel(connectionString) {
  const parsed = parseDbUrl(connectionString);
  if (!parsed?.hostname) return '(invalid DATABASE_URL)';
  return parsed.hostname;
}

export function validateDatabaseUrl(connectionString) {
  const raw = String(connectionString || '').trim();
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

  const parsed = parseDbUrl(raw);
  if (!parsed?.hostname) {
    return {
      ok: false,
      message:
        'DATABASE_URL is not a valid URL. Use postgres:// or postgresql:// from Render (Internal Database URL).',
    };
  }

  if (INVALID_HOSTS.has(parsed.hostname.toLowerCase())) {
    return {
      ok: false,
      message: `DATABASE_URL host "${parsed.hostname}" is not a real server. Use Internal Database URL from Render PostgreSQL (host like dpg-xxxxx-a).`,
    };
  }

  return { ok: true, host: parsed.hostname };
}

export function resolveConnectionString() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || PLACEHOLDER_PATTERN.test(url)) {
    return null;
  }
  const check = validateDatabaseUrl(url);
  if (!check.ok) {
    return null;
  }
  return url;
}
