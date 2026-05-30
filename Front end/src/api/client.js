// Базовый URL API: всегда ходим напрямую на backend, без proxy.
const RAW_API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3003/api').replace(/\/$/, '');
const API_BASE = RAW_API_BASE.endsWith('/api') ? RAW_API_BASE : `${RAW_API_BASE}/api`;

/** URL для статики backend (/uploads/...) */
export const getStaticUrl = (relativePath) => {
  const origin = API_BASE.replace(/\/api\/?$/, '');
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
      // Недействительный или истёкший токен — сбрасываем сессию и отправляем на вход
      if ((response.status === 401 || response.status === 403) && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
          return;
        }
      }
      const message =
        data?.error ||
        (typeof data?.message === 'string' ? data.message : null) ||
        `Ошибка запроса (${response.status})`;
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
