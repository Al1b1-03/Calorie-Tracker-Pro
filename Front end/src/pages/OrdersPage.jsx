import { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders';
import { useLanguage } from '../i18n/LanguageContext';
import { translateProductText } from '../i18n/dynamicContent';
import './OrdersPage.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_LABELS = {
  paid: 'Оплачен',
  pending: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function OrdersPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? {
        title: 'Orders', loading: 'Loading...', loadErr: 'Failed to load orders', delErr: 'Failed to delete order',
        client: 'Client', address: 'Address', hide: 'Hide items', show: 'Show items', delTitle: 'Delete order', del: 'Delete',
        product: 'Product', qty: 'Qty', price: 'Price', sum: 'Total', empty: 'No orders',
        delConfirm: 'Delete order',
      }
    : lang === 'kk'
      ? {
          title: 'Тапсырыстар', loading: 'Жүктелуде...', loadErr: 'Тапсырыстарды жүктеу қатесі', delErr: 'Тапсырысты жою қатесі',
          client: 'Клиент', address: 'Мекенжай', hide: 'Тауарларды жасыру', show: 'Тауарларды көрсету', delTitle: 'Тапсырысты жою', del: 'Жою',
          product: 'Тауар', qty: 'Саны', price: 'Бағасы', sum: 'Сомасы', empty: 'Тапсырыстар жоқ',
          delConfirm: 'Тапсырысты жою',
        }
      : {
          title: 'Заказы', loading: 'Загрузка...', loadErr: 'Ошибка загрузки заказов', delErr: 'Ошибка удаления заказа',
          client: 'Клиент', address: 'Адрес', hide: 'Скрыть товары', show: 'Показать товары', delTitle: 'Удалить заказ', del: 'Удалить',
          product: 'Товар', qty: 'Кол-во', price: 'Цена', sum: 'Сумма', empty: 'Нет заказов',
          delConfirm: 'Удалить заказ',
        };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadOrders = async () => {
    try {
      setError('');
      const { orders: data } = await ordersApi.list();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [tr.loadErr]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`${tr.delConfirm} #${order.id}?`)) return;
    const id = Number(order.id);
    if (!id) return;
    setDeletingId(id);
    setError('');
    try {
      await ordersApi.delete(id);
      setOrders((prev) => prev.filter((o) => Number(o.id) !== id));
    } catch (err) {
      setError(err?.message || tr.delErr);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <h1 className="orders-page__title">{tr.title}</h1>
        <p className="orders-page__loading">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-page__title">{tr.title}</h1>
      {error && <p className="orders-page__error">{error}</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="orders-card">
            <div className="orders-card__top">
              <div className="orders-card__head">
                <span className="orders-card__id">#{order.id}</span>
                <span className="orders-card__date">{formatDate(order.createdAt)}</span>
                <span className={`orders-card__status orders-card__status--${order.status}`}>
                  {(
                    lang === 'en'
                      ? { paid: 'Paid', pending: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
                      : lang === 'kk'
                        ? { paid: 'Төленген', pending: 'Өңделуде', shipped: 'Жөнелтілді', delivered: 'Жеткізілді', cancelled: 'Бас тартылды' }
                        : STATUS_LABELS
                  )[order.status] ?? order.status}
                </span>
                <span className="orders-card__total">{order.total?.toFixed(0) ?? 0} ₸</span>
              </div>
              <div className="orders-card__details">
                <span className="orders-card__detail" title={order.userEmail}>
                  <span className="orders-card__detail-label">{tr.client}</span>
                  {order.userFullName}
                </span>
                {order.address && (
                  <span className="orders-card__detail">
                    <span className="orders-card__detail-label">{tr.address}</span>
                    {order.address}
                  </span>
                )}
              </div>
            </div>
            <div className="orders-card__actions">
              <button
                type="button"
                className="orders-card__toggle"
                onClick={() => toggleExpand(order.id)}
                aria-expanded={expandedId === order.id}
              >
                {expandedId === order.id ? tr.hide : tr.show}
              </button>
              <button
                type="button"
                className="orders-card__delete"
                onClick={() => handleDelete(order)}
                disabled={deletingId === Number(order.id)}
                title={tr.delTitle}
              >
                {deletingId === Number(order.id) ? '...' : tr.del}
              </button>
            </div>
            {expandedId === order.id && (
              <div className="orders-card__items">
                <ul className="orders-items-cards">
                  {order.items?.map((item, idx) => (
                    <li key={idx} className="orders-item-card">
                      <p className="orders-item-card__name">
                        {translateProductText(lang, item.productName)}
                      </p>
                      <div className="orders-item-card__row">
                        <span>{tr.qty}: {item.quantity}</span>
                        <span>{tr.price}: {item.price?.toFixed(0)} ₸</span>
                        <span>{tr.sum}: {(item.price * item.quantity)?.toFixed(0)} ₸</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <table className="orders-items-table">
                  <thead>
                    <tr>
                      <th>{tr.product}</th>
                      <th>{tr.qty}</th>
                      <th>{tr.price}</th>
                      <th>{tr.sum}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{translateProductText(lang, item.productName)}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price?.toFixed(0)} ₸</td>
                        <td>{(item.price * item.quantity)?.toFixed(0)} ₸</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <p className="orders-page__empty">{tr.empty}</p>
      )}
    </div>
  );
}
