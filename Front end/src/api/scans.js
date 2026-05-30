import { getApiUrl, getStaticUrl, request } from './client.js';

export const scansApi = {
  analyze: async (file, lang = 'ru') => {
    const formData = new FormData();
    formData.append('image', file, file.name || 'photo.jpg');
    formData.append('lang', lang);

    const url = getApiUrl('/scans/analyze');
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const contentType = response.headers.get('Content-Type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {};

    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error(data?.error || `Ошибка анализа (${response.status})`);
    }

    return data;
  },

  getList: (limit = 30) => request(`/scans?limit=${limit}`),

  confirm: (id, entryDate) =>
    request(`/scans/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(entryDate ? { entryDate } : {}),
    }),

  imageUrl: (path) => (path ? getStaticUrl(path) : null),
};
