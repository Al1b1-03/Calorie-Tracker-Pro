/**
 * ФАЙЛ: client.js
 * ЧТО ЭТО: HTTP-клиент API.
 * ЗА ЧТО ОТВЕЧАЕТ: fetch + JWT, базовый URL /api.
 */
function resolveApiBase() {
  if (import.meta.env.VITE_API_URL) {
    const raw = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.DEV ? '/api' : 'http://localhost:3003/api';
}

const API_BASE = resolveApiBase();

/** Статика (/uploads) всегда с backend :3003, если не задан свой VITE_API_URL */
const API_ORIGIN = import.meta.env.VITE_API_URL
  ? API_BASE.replace(/\/api\/?$/, '')
  : 'http://localhost:3003';

/** URL для статики backend (/uploads/...) */
export const getStaticUrl = (relativePath) => {
  const origin = API_ORIGIN;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${origin}${path}`;
};

/** Полный URL для запроса к API. Всегда используем прямой адрес backend. */
export const getApiUrl = (pathPart) => {
  let path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  if (!path.startsWith('/api')) path = `/api${path}`;
  const part = path.startsWith('/api') ? path.slice(4) || '/' : path;
  return `${API_BASE}${part}`;
};

export const request = async (endpoint, options = {}) => {
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!path.startsWith('/api')) path = `/api${path}`;
  const url = `${API_BASE}${path.startsWith('/api') ? path.slice(4) || '/' : path}`;
  const isDeleteNoBody = (options.method || '').toUpperCase() === 'DELETE' && options.body == null;
  const config = {
    headers: {
      ...(isDeleteNoBody ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
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
      throw new Error(
        'Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на http://localhost:3003'
      );
    }
    throw err;
  }
};
