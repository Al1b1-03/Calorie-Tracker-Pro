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
