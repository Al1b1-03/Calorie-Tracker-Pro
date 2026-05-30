import { request } from './client.js';

export const adminManagementApi = {
  listAdmins: () => request('/admin/list-admins'),

  createAdmin: (data) =>
    request('/admin/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAdmin: (id) =>
    request(`/admin/${id}`, {
      method: 'DELETE',
    }),

  promoteUser: (userId) =>
    request(`/admin/promote/${userId}`, {
      method: 'PATCH',
    }),
};
