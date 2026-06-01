/**
 * ФАЙЛ: orders.js
 * ЧТО ЭТО: API: админ заказы.
 * ЗА ЧТО ОТВЕЧАЕТ: список и удаление заказов.
 */
import { request } from './client.js';

/**
 * API заказов (админ): список и удаление.
 * Все методы возвращают согласованный формат и не ломают UI при неожиданном ответе.
 */

/** Нормализует ответ списка заказов: всегда возвращает { orders: Array }. */
function normalizeOrdersResponse(res) {
  const list = Array.isArray(res?.orders) ? res.orders : [];
  return { orders: list };
}

export const ordersApi = {
  /**
   * Список заказов. Всегда возвращает { orders: Array }.
   * Ошибки сети/сервера пробрасываются из request().
   */
  list: async () => {
    const res = await request('/admin/orders');
    return normalizeOrdersResponse(res);
  },

  /**
   * Удаление заказа по id. Бросает ошибку при невалидном id.
   */
  delete: (id) => {
    const numId = id != null ? Number(id) : NaN;
    if (!Number.isInteger(numId) || numId < 1) {
      return Promise.reject(new Error('Некорректный id заказа'));
    }
    return request(`/admin/orders/${numId}`, {
      method: 'DELETE',
    });
  },
};
