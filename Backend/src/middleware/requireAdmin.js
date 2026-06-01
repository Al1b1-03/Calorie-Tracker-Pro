/**
 * ФАЙЛ: requireAdmin.js
 * ЧТО ЭТО: Реэкспорт requireAdmin.
 * ЗА ЧТО ОТВЕЧАЕТ: удобный импорт проверки прав админа.
 */
export { requireAdmin, requireSuperAdmin, requireAuth, loadUserRole } from './rbac.js';
