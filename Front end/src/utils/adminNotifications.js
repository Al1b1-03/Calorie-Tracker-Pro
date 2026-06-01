/**
 * ФАЙЛ: adminNotifications.js
 * ЧТО ЭТО: Бейджи админа.
 * ЗА ЧТО ОТВЕЧАЕТ: localStorage «просмотрено до id».
 */
const ORDERS_SEEN_ID_KEY = 'adminOrdersSeenId';
const SUPPORT_SEEN_ID_KEY = 'adminSupportSeenId';

export function getOrdersSeenId() {
  const raw = localStorage.getItem(ORDERS_SEEN_ID_KEY);
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id >= 0 ? id : 0;
}

export function getSupportSeenId() {
  const raw = localStorage.getItem(SUPPORT_SEEN_ID_KEY);
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id >= 0 ? id : 0;
}

export function markOrdersSeen(maxOrderId) {
  const id = Math.max(0, parseInt(maxOrderId, 10) || 0);
  localStorage.setItem(ORDERS_SEEN_ID_KEY, String(id));
  window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
}

export function markSupportSeen(maxMessageId) {
  const id = Math.max(0, parseInt(maxMessageId, 10) || 0);
  localStorage.setItem(SUPPORT_SEEN_ID_KEY, String(id));
  window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
}

export function notifyAdminCountsChanged() {
  window.dispatchEvent(new CustomEvent('adminNotificationsUpdated'));
}
