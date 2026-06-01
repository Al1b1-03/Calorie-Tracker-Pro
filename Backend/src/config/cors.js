/**
 * CORS: localhost, Vercel (*.vercel.app), FRONTEND_URL из env.
 */
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const staticOrigins = new Set(defaultDevOrigins);

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((item) => {
    const trimmed = item.trim();
    if (trimmed) staticOrigins.add(trimmed);
  });
}

const vercelPreviewHosts = [
  'calorie-tracker-pro-smg1.vercel.app',
  'calorie-tracker-pro-smg1-git-main-al1b1-03s-projects.vercel.app',
  'calorie-tracker-pro-smg1-qfa2i606k-al1b1-03s-projects.vercel.app',
];

vercelPreviewHosts.forEach((host) => {
  staticOrigins.add(`https://${host}`);
});

function isLocalhost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (staticOrigins.has(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (isLocalhost(hostname)) return true;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }

  return false;
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
    } else {
      console.warn('[cors] blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
};
