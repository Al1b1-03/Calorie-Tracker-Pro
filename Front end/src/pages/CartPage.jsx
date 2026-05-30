import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopApi, getProductImageSrc } from '../api/shop';
import { useLanguage } from '../i18n/LanguageContext';
import { translateProductText } from '../i18n/dynamicContent';
import PageHero from '../components/ui/PageHero';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { useBodyClass } from '../hooks/useBodyClass';
import './CartPage.css';

const FALLBACK_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#e8e8e8" width="120" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="12">Нет фото</text></svg>'
  );

const TEST_CARD = '4242 4242 4242 4242';

export default function CartPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? { title: 'Cart', subtitle: 'Review items and complete checkout securely.', loadErr: 'Failed to load cart', updateErr: 'Update failed', delErr: 'Delete failed', cardReq: 'Enter card number', addrReq: 'Enter delivery address', payErr: 'Payment failed', success: 'Payment successful! Thanks for your order.', empty: 'Cart is empty', toShop: 'Go shopping', total: 'Total:', continue: 'Continue shopping', pay: 'Pay', payCard: 'Card payment', toPay: 'To pay:', address: 'Delivery address', addressPh: 'City, street, house, apartment', card: 'Card number', testCard: 'Test card:', cancel: 'Cancel', payNow: 'Pay', paying: 'Paying...', del: 'Delete' }
    : lang === 'kk'
      ? { title: 'Себет', subtitle: 'Тауарларды тексеріп, төлемді аяқтаңыз.', loadErr: 'Себетті жүктеу қатесі', updateErr: 'Жаңарту қатесі', delErr: 'Жою қатесі', cardReq: 'Карта нөмірін енгізіңіз', addrReq: 'Жеткізу мекенжайын енгізіңіз', payErr: 'Төлем қатесі', success: 'Төлем сәтті өтті! Тапсырысыңызға рақмет.', empty: 'Себет бос', toShop: 'Сатып алуға өту', total: 'Жалпы:', continue: 'Сатып алуды жалғастыру', pay: 'Төлеу', payCard: 'Картамен төлеу', toPay: 'Төлеуге:', address: 'Жеткізу мекенжайы', addressPh: 'Қала, көше, үй, пәтер', card: 'Карта нөмірі', testCard: 'Тест картасы:', cancel: 'Бас тарту', payNow: 'Төлеу', paying: 'Төленуде...', del: 'Жою' }
      : { title: 'Корзина', subtitle: 'Проверьте товары и оформите оплату.', loadErr: 'Ошибка загрузки корзины', updateErr: 'Ошибка обновления', delErr: 'Ошибка удаления', cardReq: 'Введите номер карты', addrReq: 'Укажите адрес доставки', payErr: 'Ошибка оплаты', success: 'Оплата прошла успешно! Спасибо за заказ.', empty: 'Корзина пуста', toShop: 'Перейти к покупкам', total: 'Итого:', continue: 'Продолжить покупки', pay: 'Оплатить', payCard: 'Оплата картой', toPay: 'К оплате:', address: 'Адрес доставки', addressPh: 'Город, улица, дом, квартира', card: 'Номер карты', testCard: 'Тестовая карта:', cancel: 'Отмена', payNow: 'Оплатить', paying: 'Оплата...', del: 'Удалить' };

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [address, setAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const loadCart = async () => {
    try {
      setError('');
      const { items: data, total: cartTotal } = await shopApi.getCart();
      setItems(data);
      setTotal(cartTotal);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [tr.loadErr]);

  useEffect(() => {
    const onCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', onCartUpdate);
    return () => window.removeEventListener('cartUpdated', onCartUpdate);
  }, []);

  useBodyClass('modal-open', showCheckout);

  const handleQuantityChange = async (item, newQuantity) => {
    const qty = Math.max(1, parseInt(newQuantity, 10) || 1);
    setActionLoading(item.id);
    try {
      const { item: updated } = await shopApi.updateCartItem(item.id, qty);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i))
      );
      setTotal((prev) => prev - item.subtotal + updated.subtotal);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || tr.updateErr);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (item) => {
    setActionLoading(item.id);
    try {
      await shopApi.removeFromCart(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotal((prev) => prev - item.subtotal);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || tr.delErr);
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (n) => new Intl.NumberFormat('ru-KZ').format(n);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const card = cardNumber.replace(/\s/g, '');
    const addr = address.trim();
    if (!card) {
      setError(tr.cardReq);
      return;
    }
    if (!addr) {
      setError(tr.addrReq);
      return;
    }
    setCheckoutLoading(true);
    setError('');
    try {
      await shopApi.checkout(card, addr);
      setCheckoutSuccess(true);
      setShowCheckout(false);
      setCardNumber('');
      setAddress('');
      loadCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || tr.payErr);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatCardInput = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  if (loading) {
    return (
      <div className="page cart-page">
        <PageHero title={tr.title} subtitle={tr.subtitle} />
        <SkeletonCardList count={3} />
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <PageHero title={tr.title} subtitle={tr.subtitle} />
      {checkoutSuccess && (
        <p className="cart-page__success">{tr.success}</p>
      )}
      {error && <p className="cart-page__error">{error}</p>}

      {items.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title={tr.empty}
          action={
            <Link to="/shop" className="ui-btn ui-btn--primary">
              {tr.toShop}
            </Link>
          }
        />
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item__image">
                  <img
                    src={getProductImageSrc(item) || FALLBACK_IMAGE}
                    alt={translateProductText(lang, item.name)}
                    className="cart-item__img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{translateProductText(lang, item.name)}</h3>
                  <p className="cart-item__price">{formatPrice(item.price)} ₸</p>
                </div>
                <div className="cart-item__quantity">
                  <button
                    type="button"
                    className="cart-item__qty-btn"
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={actionLoading === item.id || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-item__qty-btn"
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    disabled={actionLoading === item.id}
                  >
                    +
                  </button>
                </div>
                <p className="cart-item__subtotal">
                  {formatPrice(item.subtotal)} ₸
                </p>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => handleRemove(item)}
                  disabled={actionLoading === item.id}
                  aria-label={tr.del}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-page__footer">
            <p className="cart-page__total">
              {tr.total} <strong>{formatPrice(total)} ₸</strong>
            </p>
            <div className="cart-page__footer-actions">
              <Link to="/shop" className="cart-page__continue">
                {tr.continue}
              </Link>
              <button
                type="button"
                className="cart-page__pay-btn"
                onClick={() => setShowCheckout(true)}
              >
                {tr.pay}
              </button>
            </div>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="cart-checkout" onClick={() => setShowCheckout(false)}>
          <div
            className="cart-checkout__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="cart-checkout__title">{tr.payCard}</h2>
            <p className="cart-checkout__total">
              {tr.toPay} <strong>{formatPrice(total)} ₸</strong>
            </p>
            <form className="cart-checkout__form" onSubmit={handleCheckout}>
              <div className="cart-checkout__field">
                <label className="cart-checkout__label">{tr.address}</label>
                <input
                  type="text"
                  placeholder={tr.addressPh}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="cart-checkout__input"
                />
              </div>
              <div className="cart-checkout__field">
                <label className="cart-checkout__label">{tr.card}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                  className="cart-checkout__input"
                  maxLength={19}
                />
                <p className="cart-checkout__hint">
                  {tr.testCard}{' '}
                  <button
                    type="button"
                    className="cart-checkout__test-card"
                    onClick={() => setCardNumber(TEST_CARD)}
                  >
                    {TEST_CARD}
                  </button>
                </p>
              </div>
              <div className="cart-checkout__actions">
                <button
                  type="button"
                  className="cart-checkout__btn cart-checkout__btn--cancel"
                  onClick={() => setShowCheckout(false)}
                >
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  className="cart-checkout__btn cart-checkout__btn--pay"
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? tr.paying : `${tr.payNow} ${formatPrice(total)} ₸`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
