import { useEffect, useState, useMemo } from 'react';
import { shopApi, getProductImageSrc } from '../api/shop';
import { useLanguage } from '../i18n/LanguageContext';
import { translateProductText } from '../i18n/dynamicContent';
import './ProductsShopPage.css';

const CATEGORY_LABELS = {
  ration: 'Рацион питания',
  vitamins: 'Витамины',
  dishes: 'Блюда и напитки',
};

const CATEGORY_ORDER = ['ration', 'vitamins', 'dishes'];

// Встроенный плейсхолдер (data URL), не требует интернета
const FALLBACK_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect fill="#e8e8e8" width="320" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="sans-serif" font-size="16">Нет фото</text></svg>'
  );

export default function ProductsShopPage() {
  const { lang } = useLanguage();
  const tr = lang === 'en'
    ? {
        categories: { ration: 'Nutrition', vitamins: 'Vitamins', dishes: 'Meals and drinks' },
        loadErr: 'Failed to load products', addErr: 'Failed to add to cart', title: 'Shop products', loading: 'Loading...',
        emptyCat: 'No products in this category yet', adding: 'Adding...', add: 'Add to cart', empty: 'No products in catalog',
      }
    : lang === 'kk'
      ? {
          categories: { ration: 'Тамақ рационы', vitamins: 'Дәрумендер', dishes: 'Тағамдар мен сусындар' },
          loadErr: 'Тауарларды жүктеу қатесі', addErr: 'Себетке қосу қатесі', title: 'Өнімдерді сатып алу', loading: 'Жүктелуде...',
          emptyCat: 'Бұл санатта әзірге тауар жоқ', adding: 'Қосылуда...', add: 'Себетке', empty: 'Каталогта тауар жоқ',
        }
      : {
          categories: { ration: 'Рацион питания', vitamins: 'Витамины', dishes: 'Блюда и напитки' },
          loadErr: 'Ошибка загрузки товаров', addErr: 'Ошибка добавления в корзину', title: 'Покупка продуктов', loading: 'Загрузка...',
          emptyCat: 'В этой категории пока нет товаров', adding: 'Добавление...', add: 'В корзину', empty: 'Нет товаров в каталоге',
        };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);

  const loadProducts = async () => {
    try {
      setError('');
      const { products: data } = await shopApi.getProducts();
      setProducts(data ?? []);
    } catch (err) {
      setError(err.message || tr.loadErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [tr.loadErr]);

  const byCategory = useMemo(() => {
    const map = { ration: [], vitamins: [], dishes: [] };
    const norm = (c) => (c && ['ration', 'vitamins', 'dishes'].includes(String(c).toLowerCase()) ? String(c).toLowerCase() : 'dishes');
    (products || []).forEach((p) => {
      const cat = norm(p.category);
      map[cat].push(p);
    });
    return CATEGORY_ORDER.map((key) => ({ key, label: tr.categories[key] || CATEGORY_LABELS[key], items: map[key] || [] }));
  }, [products, tr.categories]);

  const handleAddToCart = async (product, quantity = 1) => {
    setAddingId(product.id);
    try {
      await shopApi.addToCart(product.id, quantity);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      setError(err.message || tr.addErr);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <h1 className="shop-page__title">{tr.title}</h1>
        <p className="shop-page__loading">{tr.loading}</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <h1 className="shop-page__title">{tr.title}</h1>
      {error && <p className="shop-page__error">{error}</p>}

      {byCategory.map((section) => (
            <section key={section.key} className="shop-section">
              <h2 className="shop-section__title">{section.label}</h2>
              <div className="shop-grid">
                {section.items.length === 0 ? (
                  <p className="shop-section__empty">{tr.emptyCat}</p>
                ) : (
                section.items.map((product) => (
                  <div key={product.id} className="shop-card">
                    <div className="shop-card__image-wrap">
                      <img
                        src={getProductImageSrc(product) || FALLBACK_IMAGE}
                        alt={translateProductText(lang, product.name)}
                        className="shop-card__image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="shop-card__content">
                      <h3 className="shop-card__name">{translateProductText(lang, product.name)}</h3>
                      <p className="shop-card__price">{product.price ?? 0} ₸</p>
                      {Number(product.calories) ? (
                        <p className="shop-card__calories">{product.calories} Ккал</p>
                      ) : null}
                      {(Number(product.protein) || Number(product.fat) || Number(product.carbs)) ? (
                        <p className="shop-card__macros">
                          Б: {product.protein ?? 0} · Ж: {product.fat ?? 0} · У: {product.carbs ?? 0}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="shop-card__add-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                      >
                        {addingId === product.id ? tr.adding : tr.add}
                      </button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </section>
      ))}

      {products.length === 0 && !loading && (
        <p className="shop-page__empty">{tr.empty}</p>
      )}
    </div>
  );
}
