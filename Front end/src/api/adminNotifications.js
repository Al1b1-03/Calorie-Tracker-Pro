/**
 * ФАЙЛ: adminNotifications.js
 * ЧТО ЭТО: API: бейджи шапки.
 * ЗА ЧТО ОТВЕЧАЕТ: GET counts для заказов/поддержки.
 */
import { request } from './client.js';

export const adminNotificationsApi = {
  getCounts: (ordersAfterId = 0, supportAfterId = 0) => {
    const ordersId = Math.max(0, parseInt(ordersAfterId, 10) || 0);
    const supportId = Math.max(0, parseInt(supportAfterId, 10) || 0);
    return request(
      `/admin/notifications/counts?ordersAfterId=${ordersId}&supportAfterId=${supportId}`
    );
  },
};
