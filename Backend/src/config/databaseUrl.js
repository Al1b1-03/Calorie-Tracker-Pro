/**
 * Безопасный разбор DATABASE_URL для логов (без пароля).
 */
export function getDatabaseHostLabel(connectionString) {
  if (!connectionString) return '(not set)';
  try {
    const normalized = connectionString.replace(/^postgresql:/i, 'http:');
    const url = new URL(normalized);
    return url.hostname || '(unknown host)';
  } catch {
    return '(invalid DATABASE_URL)';
  }
}

export function resolveConnectionString() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || url.includes('user:password')) {
    return null;
  }
  return url;
}
