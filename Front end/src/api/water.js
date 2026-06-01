/**
 * ФАЙЛ: water.js
 * ЧТО ЭТО: API: вода.
 * ЗА ЧТО ОТВЕЧАЕТ: учёт воды за день.
 */
import { request } from './client.js';

export const waterApi = {
  getToday: (date) => {
    const params = date ? `?date=${date}` : '';
    return request(`/water/today${params}`);
  },

  add: (amountMl, date) =>
    request('/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, ...(date ? { date } : {}) }),
    }),
};
