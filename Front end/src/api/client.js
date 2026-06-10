/**
 * HTTP-клиент API. Базовый URL — только VITE_API_URL (см. .env / Vercel).
 */
const API_BASE = String(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function getApiOrigin() {
  return API_BASE.replace(/\/api\/?$/, '') || '';
}

/** URL для статики backend (/uploads/...) */
export const getStaticUrl = (relativePath) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${getApiOrigin()}${path}`;
};

/** Полный URL для запроса к API. */
export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
};

export const request = async (endpoint, options = {}) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${path}`;

  const isDeleteNoBody = (options.method || '').toUpperCase() === 'DELETE' && options.body == null;
  const config = {
    ...options,
    headers: {
      ...(isDeleteNoBody ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  };
  if (isDeleteNoBody && config.body !== undefined) delete config.body;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('Content-Type') || '';
    const data =
      response.status === 204 || !contentType.includes('application/json')
        ? {}
        : await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.error ||
        (typeof data?.message === 'string' ? data.message : null) ||
        `Ошибка запроса (${response.status})`;
      if ((response.status === 401 || response.status === 403) && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const hint = API_BASE.startsWith('http')
        ? `Проверьте API: ${getApiOrigin()}/api/health`
        : 'Запустите backend: npm run docker:up или npm run dev в Backend';
      throw new Error(`Не удалось подключиться к серверу. ${hint}`);
    }
    throw err;
  }
};
