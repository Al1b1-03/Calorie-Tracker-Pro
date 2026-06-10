/**
 * Проверка единого API (Render) и опционально health локального backend.
 */
const RENDER_HEALTH = 'https://calorie-tracker-pro-1.onrender.com/api/health';
const LOCAL_HEALTH = 'http://127.0.0.1:3003/api/health';

async function check(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json().catch(() => ({}));
    console.log(`${label}: ${res.status}`, data);
    return res.ok;
  } catch (err) {
    console.error(`${label}: FAIL`, err.message);
    return false;
  }
}

const renderOk = await check('Render', RENDER_HEALTH);
await check('Local', LOCAL_HEALTH);

process.exit(renderOk ? 0 : 1);
