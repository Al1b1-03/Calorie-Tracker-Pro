/**
 * ФАЙЛ: shop.js
 * ЧТО ЭТО: API: магазин и корзина.
 * ЗА ЧТО ОТВЕЧАЕТ: товары, cart, checkout.
 */
import { request } from './client.js';

/** Origin бэкенда: картинки грузятся напрямую с backend. */
export const getApiOrigin = () =>
  (import.meta.env.VITE_API_URL || 'http://localhost:3003/api').replace(/\/api\/?$/, '') || 'http://localhost:3003';

/** URL картинки. Поддерживает: http(s)://..., /путь (фронт public), /api/uploads/products/xxx (бэкенд). */
export const getImageUrl = (imageUrl, imageFullUrl = null) => {
  const origin = getApiOrigin();
  const path = imageFullUrl || imageUrl;
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (trimmed.startsWith('http')) return trimmed;
  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized.includes('uploads/products/') || normalized.includes('uploads\\products\\')) {
    const filename = normalized.split(/[/\\]/).pop() || '';
    if (filename) return `${origin}/api/uploads/products/${filename}`;
  }
  if (/\.(png|jpe?g|gif|webp)$/i.test(normalized)) {
    const filename = normalized.replace(/^\/+/, '');
    if (filename.includes('uploads/') || filename.includes('products')) {
      return `${origin}/api/uploads/products/${filename.split(/[/\\]/).pop() || filename}`;
    }
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

export const shopApi = {
  getProducts: () => request('/products'),

  getCart: () => request('/cart'),

  addToCart: (productId, quantity = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (itemId, quantity) =>
    request(`/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (itemId) =>
    request(`/cart/${itemId}`, {
      method: 'DELETE',
    }),

  checkout: (cardNumber, address) =>
    request('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ cardNumber, address }),
    }),
};
