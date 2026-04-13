import { request } from './client.js';

export const supportApi = {
  createMessage: ({ subject, message }) =>
    request('/support', {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    }),

  listMessages: () => request('/support/admin'),
  listMyMessages: () => request('/support/my'),

  updateStatus: (id, status) =>
    request(`/support/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteMessage: (id) =>
    request(`/support/admin/${id}`, {
      method: 'DELETE',
    }),

  replyMessage: (id, reply) =>
    request(`/support/admin/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply }),
    }),
};
