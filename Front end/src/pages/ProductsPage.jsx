/**
 * ФАЙЛ: ProductsPage.jsx
 * ЧТО ЭТО: Страница: товары ADMIN.
 * ЗА ЧТО ОТВЕЧАЕТ: управление продуктами.
 */
import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { productsApi, getImageUrl, getProductImageSrc } from '../api/products';
import { useLanguage } from '../i18n/LanguageContext';
import { translateProductText } from '../i18n/dynamicContent';
import PageHero from '../components/ui/PageHero';
import { SkeletonCardList } from '../components/ui/Skeleton';
import { useBodyClass } from '../hooks/useBodyClass';
import './ProductsPage.css';
import './ProductsShopPage.css';

const CATEGORY_OPTIONS = [
  { value: 'ration', label: 'Рацион питания' },
  { value: 'vitamins', label: 'Витамины' },
  { value: 'dishes', label: 'Блюда и напитки' },
];

const CATEGORY_ORDER = ['ration', 'vitamins', 'dishes'];
const CATEGORY_LABELS = { ration: 'Рацион питания', vitamins: 'Витамины', dishes: 'Блюда и напитки' };

// Встроенный плейсхолдер (data URL), не требует интернета
const FALLBACK_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect fill="#e8e8e8" width="320" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="sans-serif" font-size="16">Нет фото</text></svg>'
  );

const INITIAL_FORM = {
  name: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  price: '',
  imageUrl: '',
  category: 'dishes',
  sortOrder: '',
};

export default function ProductsPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? { addProduct: '+ Add product', loadErr: 'Failed to load products', needName: 'Enter product name', saveErr: 'Save failed', delErr: 'Delete failed', cancel: 'Cancel', save: 'Save', add: 'Add', saving: 'Saving...', edit: 'Edit', del: 'Delete', emptyCatalog: 'No products in this catalog yet', emptyAll: 'No products. Add the first one.', newProduct: 'New product', editProduct: 'Edit product', ration: 'Nutrition', vitamins: 'Vitamins', dishes: 'Meals and drinks' }
    : lang === 'kk'
      ? { addProduct: '+ Тауар қосу', loadErr: 'Тауарларды жүктеу қатесі', needName: 'Тауар атауын енгізіңіз', saveErr: 'Сақтау қатесі', delErr: 'Жою қатесі', cancel: 'Бас тарту', save: 'Сақтау', add: 'Қосу', saving: 'Сақталуда...', edit: 'Өңдеу', del: 'Жою', emptyCatalog: 'Бұл каталогта әзірге тауар жоқ', emptyAll: 'Тауар жоқ. Алғашқысын қосыңыз.', newProduct: 'Жаңа тауар', editProduct: 'Тауарды өңдеу', ration: 'Тамақ рационы', vitamins: 'Дәрумендер', dishes: 'Тағамдар мен сусындар' }
      : { addProduct: '+ Добавить товар', loadErr: 'Ошибка загрузки товаров', needName: 'Введите название товара', saveErr: 'Ошибка сохранения', delErr: 'Ошибка удаления', cancel: 'Отмена', save: 'Сохранить', add: 'Добавить', saving: 'Сохранение...', edit: 'Редактировать', del: 'Удалить', emptyCatalog: 'В этом каталоге пока нет товаров', emptyAll: 'Нет товаров. Добавьте первый.', newProduct: 'Новый товар', editProduct: 'Редактировать товар', ration: 'Рацион питания', vitamins: 'Витамины', dishes: 'Блюда и напитки' };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const loadProducts = async () => {
    try {
      setError('');
      const { products: data } = await productsApi.list();
      setProducts(data);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [tr.loadErr]);

  useBodyClass('modal-open', showForm);

  const setImageFromFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImagePreview(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      const file = e.target.files?.[0];
      if (file) setImageFromFile(file);
      else {
        setImageFile(null);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handlePaste = (e) => {
    const item = e.clipboardData?.items && [...e.clipboardData.items].find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) setImageFromFile(file);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      calories: product.calories?.toString() ?? '',
      protein: product.protein?.toString() ?? '',
      fat: product.fat?.toString() ?? '',
      carbs: product.carbs?.toString() ?? '',
      price: product.price?.toString() ?? '',
      imageUrl: product.imageUrl ?? '',
      category: product.category || 'dishes',
      sortOrder: product.sortOrder != null ? String(product.sortOrder) : '',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setImageFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(tr.needName);
      return;
    }

    setActionLoading(editingId ?? 'new');
    setError('');
    try {
      if (editingId) {
        await productsApi.update(editingId, {
          name: formData.name.trim(),
          calories: formData.calories ? parseInt(formData.calories, 10) : 0,
          protein: formData.protein ? parseFloat(formData.protein) : 0,
          fat: formData.fat ? parseFloat(formData.fat) : 0,
          carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
          price: formData.price ? parseFloat(formData.price) : 0,
          imageUrl: formData.imageUrl?.trim() || (editingId && !imageFile ? (products.find((p) => p.id === editingId)?.imageUrl ?? undefined) : undefined),
          category: formData.category || 'dishes',
          sortOrder: formData.sortOrder === '' ? 0 : parseInt(formData.sortOrder, 10) || 0,
        });
        if (imageFile) {
          await productsApi.uploadImage(editingId, imageFile);
        }
        const { products: refreshed } = await productsApi.list();
        setProducts(refreshed);
      } else {
        const numOrZero = (v) => {
          const n = v === '' || v == null ? 0 : Number(v);
          return Number.isNaN(n) ? 0 : Math.max(0, n);
        };
        const created = await productsApi.create({
          name: formData.name.trim(),
          calories: Math.floor(numOrZero(formData.calories)),
          protein: numOrZero(formData.protein),
          fat: numOrZero(formData.fat),
          carbs: numOrZero(formData.carbs),
          price: numOrZero(formData.price),
          imageUrl: formData.imageUrl?.trim() || undefined,
          category: formData.category || 'dishes',
          sortOrder: formData.sortOrder === '' ? 0 : Math.floor(numOrZero(formData.sortOrder)),
        });
        if (imageFile) {
          await productsApi.uploadImage(created.product.id, imageFile);
          const { products: refreshed } = await productsApi.list();
          setProducts(refreshed);
        } else {
          setProducts((prev) => [created.product, ...prev]);
        }
      }
      closeForm();
    } catch (err) {
      setError(err.message || tr.saveErr);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Удалить товар «${translateProductText(lang, product, 'name')}»?`)) return;
    setActionLoading(product.id);
    try {
      await productsApi.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message || tr.delErr);
    } finally {
      setActionLoading(null);
    }
  };

  const normalizeCategory = (c) => {
    const v = (c && String(c).toLowerCase()) || 'dishes';
    return CATEGORY_ORDER.includes(v) ? v : 'dishes';
  };

  const byCategory = useMemo(() => {
    const map = { ration: [], vitamins: [], dishes: [] };
    (products || []).forEach((p) => {
      const cat = normalizeCategory(p.category);
      map[cat].push(p);
    });
    return CATEGORY_ORDER.map((key) => ({
      key,
      label: ({ ration: tr.ration, vitamins: tr.vitamins, dishes: tr.dishes }[key]) || CATEGORY_LABELS[key],
      items: (map[key] || []).sort((a, b) => {
        const sa = Number(a.sortOrder ?? 0);
        const sb = Number(b.sortOrder ?? 0);
        if (sa !== sb) return sa - sb;
        return String(a.name || '').localeCompare(String(b.name || ''));
      }),
    }));
  }, [products, tr.dishes, tr.ration, tr.vitamins]);

  const adminTitle = lang === 'en' ? 'Products' : lang === 'kk' ? 'Тауарлар' : 'Товары';
  const adminSubtitle = lang === 'en' ? 'Manage catalog items' : lang === 'kk' ? 'Каталогты басқару' : 'Управление каталогом';

  if (loading) {
    return (
      <div className="products-page shop-page page">
        <div className="products-page__top">
          <PageHero eyebrow="Admin" title={adminTitle} subtitle={adminSubtitle} />
        </div>
        <SkeletonCardList count={6} />
      </div>
    );
  }

  return (
    <div className="products-page shop-page page">
      <div className="products-page__top">
        <PageHero eyebrow="Admin" title={adminTitle} subtitle={adminSubtitle} />
        <button
          type="button"
          className="products-page__add-btn"
          onClick={openAddForm}
        >
          {tr.addProduct}
        </button>
      </div>

      {error && <p className="products-page__error">{error}</p>}

      {showForm &&
        createPortal(
        <div className="products-modal" onClick={closeForm} role="presentation">
          <div
            className="products-modal__content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="products-modal-title"
          >
            <h2 className="products-modal__title" id="products-modal-title">
              {editingId ? tr.editProduct : tr.newProduct}
            </h2>
            <form className="products-form" onSubmit={handleSubmit} onPaste={handlePaste}>
              <div className="products-form__body">
              <div className="products-form__field products-form__field--span-2">
                <label className="products-form__label">Фото</label>
                <p className="products-form__hint">Выберите файл, вставьте из буфера (Ctrl+V) или введите ссылку на картинку.</p>
                <div className="products-form__image-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleChange}
                    className="products-form__file"
                  />
                  <span className="products-form__or">или ссылка (URL):</span>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="products-form__input"
                  />
                </div>
                {(imagePreview || (editingId && formData.imageUrl) || formData.imageUrl?.trim()) && (
                  <div className="products-form__preview">
                    <img
                      src={
                        imagePreview ||
                        (editingId && products.find((p) => p.id === editingId)?.imageDataUrl) ||
                        getImageUrl(
                          formData.imageUrl,
                          editingId ? products.find((p) => p.id === editingId)?.imageFullUrl : null
                        )
                      }
                      alt="Превью"
                      className="products-form__preview-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="products-form__field products-form__field--span-2">
                <label className="products-form__label">Название</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Название товара"
                  className="products-form__input"
                  autoFocus
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Категория</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="products-form__input"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Порядок в каталоге</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="products-form__input"
                  title="1 — первый, 2 — второй и т.д. (товары без числа будут ниже)"
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Цена (₸)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="products-form__input"
                />
              </div>
              <div className="products-form__field">
                <label className="products-form__label">Калории (Ккал)</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="products-form__input"
                />
              </div>
              <div className="products-form__field products-form__field--span-2">
                <div className="products-form__row">
                  <div className="products-form__field">
                    <label className="products-form__label">Белки (г)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.protein}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                  <div className="products-form__field">
                    <label className="products-form__label">Жиры (г)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.fat}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                  <div className="products-form__field">
                    <label className="products-form__label">Углеводы (г)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="products-form__input"
                    />
                  </div>
                </div>
              </div>
              </div>
              <div className="products-form__actions">
                <button
                  type="button"
                  className="products-form__btn products-form__btn--cancel"
                  onClick={closeForm}
                >
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  className="products-form__btn products-form__btn--submit"
                  disabled={actionLoading === (editingId ?? 'new')}
                >
                  {actionLoading === (editingId ?? 'new')
                    ? tr.saving
                    : editingId
                    ? tr.save
                    : tr.add}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {byCategory.map((section) => (
        <section key={section.key} className="shop-section">
          <h2 className="shop-section__title">{section.label}</h2>
          <div className="shop-grid">
            {section.items.length === 0 ? (
              <p className="shop-section__empty">{tr.emptyCatalog}</p>
            ) : (
              section.items.map((product) => (
                <div key={product.id} className="shop-card">
                  <div className="shop-card__image-wrap">
                    <img
                      src={getProductImageSrc(product) || FALLBACK_IMAGE}
                      alt={translateProductText(lang, product, 'name')}
                      className="shop-card__image"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="shop-card__content">
                    <h3 className="shop-card__name">{translateProductText(lang, product, 'name')}</h3>
                    <p className="shop-card__price">{product.price ?? 0} ₸</p>
                    {Number(product.calories) ? (
                      <p className="shop-card__calories">{product.calories} Ккал</p>
                    ) : null}
                    {(Number(product.protein) || Number(product.fat) || Number(product.carbs)) ? (
                      <p className="shop-card__macros">
                        Б: {product.protein ?? 0} · Ж: {product.fat ?? 0} · У: {product.carbs ?? 0}
                      </p>
                    ) : null}
                    <div className="catalog-card__actions">
                      <button
                        type="button"
                        className="catalog-card__btn catalog-card__btn--edit"
                        onClick={() => openEditForm(product)}
                        disabled={actionLoading === product.id}
                      >
                        {tr.edit}
                      </button>
                      <button
                        type="button"
                        className="catalog-card__btn catalog-card__btn--delete"
                        onClick={() => handleDelete(product)}
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id ? '...' : tr.del}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}

      {products.length === 0 && !loading && (
        <p className="products-page__empty">{tr.emptyAll}</p>
      )}
    </div>
  );
}
