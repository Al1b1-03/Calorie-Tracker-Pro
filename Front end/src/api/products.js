/**
 * ФАЙЛ: products.js
 * ЧТО ЭТО: API: админ товары.
 * ЗА ЧТО ОТВЕЧАЕТ: CRUD продуктов.
 */
import { request, getApiUrl } from './client.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

/** Origin бэкенда для картинок (хост без /api). */
export const getApiOrigin = () =>
  (API_BASE.replace(/\/$/, '')).replace(/\/api\/?$/, '') || 'http://localhost:3003';

/** URL картинки. Поддерживает: http(s)://..., /путь (фронт public), /api/uploads/products/xxx (бэкенд). */
export const getImageUrl = (imageUrl, imageFullUrl = null) => {
  const origin = getApiOrigin();
  const path = imageFullUrl || imageUrl;
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (trimmed.startsWith('http')) return trimmed;
  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  // Путь к файлу на бэкенде (загруженные фото товаров)
  if (normalized.includes('uploads/products/') || normalized.includes('uploads\\products\\')) {
    const filename = normalized.split(/[/\\]/).pop() || '';
    if (filename) return `${origin}/api/uploads/products/${filename}`;
  }
  if (/\.(png|jpe?g|gif|webp)$/i.test(normalized)) {
    const filename = normalized.replace(/^\/+/, '');
    if (filename.includes('uploads/') || filename.includes('products')) {
      return `${origin}/api/uploads/products/${filename.split(/[/\\]/).pop() || filename}`;
    }
    // Путь от корня фронта (public), например /vitamin-b1-fallback.png — оставляем как есть
    return normalized;
  }
  return normalized.startsWith('/') ? normalized : `${origin}${normalized}`;
};

/** Для картинки товара: data URL, внешняя ссылка или путь к локальному файлу (/api/uploads/products/...). */
export const getProductImageSrc = (product) => {
  if (product?.imageDataUrl) return product.imageDataUrl;
  const url = product?.imageFullUrl || product?.imageUrl;
  if (url && typeof url === 'string' && url.trim()) {
    return getImageUrl(product.imageUrl, product.imageFullUrl);
  }
  return null;
};

export const productsApi = {
  list: () => request('/admin/products'),

  create: (data) =>
    request('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        calories: data.calories ?? 0,
        protein: data.protein ?? 0,
        fat: data.fat ?? 0,
        carbs: data.carbs ?? 0,
        price: data.price ?? 0,
        imageUrl: data.imageUrl || undefined,
        category: data.category || 'dishes',
        sortOrder: data.sortOrder ?? 0,
      }),
    }),

  update: (id, data) => {
    const category = (data.category != null && String(data.category).trim() !== '')
      ? String(data.category).trim().toLowerCase()
      : 'dishes';
    const validCategory = ['ration', 'vitamins', 'dishes'].includes(category) ? category : 'dishes';
    return request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        price: data.price,
        imageUrl: data.imageUrl,
        category: validCategory,
        sortOrder: data.sortOrder,
      }),
    });
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const url = getApiUrl(`/admin/products/${id}/image`);
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Ошибка загрузки');
    return data;
  },

  delete: (id) =>
    request(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
};
