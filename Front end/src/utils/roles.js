/**
 * ФАЙЛ: roles.js
 * ЧТО ЭТО: Роли на клиенте.
 * ЗА ЧТО ОТВЕЧАЕТ: isAdmin, редирект после login.
 */
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const normalizeRole = (role) => {
  if (!role) return ROLES.USER;
  const upper = String(role).toUpperCase();
  if (upper === ROLES.SUPER_ADMIN) return ROLES.SUPER_ADMIN;
  if (upper === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.USER;
};

export const isAdmin = (role) => {
  const r = normalizeRole(role);
  return r === ROLES.ADMIN || r === ROLES.SUPER_ADMIN;
};

export const isSuperAdmin = (role) => normalizeRole(role) === ROLES.SUPER_ADMIN;

export const getAdminHomePath = () => '/products';

export const getLoginRedirectPath = (role) =>
  isAdmin(role) ? getAdminHomePath() : '/';
