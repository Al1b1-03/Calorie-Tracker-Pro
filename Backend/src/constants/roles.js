/**
 * ФАЙЛ: roles.js
 * ЧТО ЭТО: Роли пользователей.
 * ЗА ЧТО ОТВЕЧАЕТ: USER, ADMIN, SUPER_ADMIN и проверки isAdminRole.
 */
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const ALL_ROLES = Object.values(ROLES);

export const isAdminRole = (role) =>
  role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

export const isSuperAdminRole = (role) => role === ROLES.SUPER_ADMIN;

export const normalizeRole = (role) => {
  if (!role) return ROLES.USER;
  const upper = String(role).toUpperCase();
  if (upper === ROLES.SUPER_ADMIN) return ROLES.SUPER_ADMIN;
  if (upper === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.USER;
};
