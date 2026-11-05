import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import CatalogCard from './CatalogCard';
import ShopCard from './ShopCard';
import Icon from './Icon';
import { useLang } from '../i18n';
import type { CatalogModel, Category } from '../data/catalog';

type CatalogSectionProps = {
  variant: 'hero' | 'compact';
  models: CatalogModel[];
  categories: Category[];
  filteredModels: CatalogModel[];
  selectedId: string;
  categoryFilter: string;
  query: string;
  sort: string;
  onCategoryChange: (id: string) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
  onSelect: (id: string) => void;
  onQuote?: () => void;
};

export default function CatalogSection({
  variant,
  models,
  categories,
  filteredModels,
  selectedId,
  categoryFilter,
  query,
  sort,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  onClearFilters,
  onSelect,
  onQuote,
}: CatalogSectionProps) {
  const { lang, t, r } = useLang();
  const [cart, setCart] = useState<string[]>([]);
  const toggleCart = (id: string) =>
    setCart((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  const cartTotal = models
    .filter((item) => cart.includes(item.id))
    .reduce((sum, item) => sum + (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0), 0);
  const [isDesktopRow, setIsDesktopRow] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches,
  );
  const isHero = variant === 'hero';

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setIsDesktopRow(media.matches);
    media.addEventListener('change', handleChange);
    handleChange();
    return () => media.removeEventListener('change', handleChange);
  }, []);

  // Desktop keeps a single row in the duplicated gallery: five cards only.
  const displayModels = isHero
    ? filteredModels
    : (isDesktopRow ? filteredModels.slice(0, 5) : filteredModels);

  if (!isHero) {
    if (filteredModels.length === 0) return null;

    return (
      <section
        id="catalogo-alternativo"
        className="shop-section section-anchor"
        aria-label={t('Tienda en línea 3D', '3D online store')}
      >
        <div className="page-container">
          <div className="shop-banner">
            <span className="shop-banner-bg" aria-hidden="true">
              <Icon name="cart" size={420} strokeWidth={1.1} />
            </span>
            <div className="shop-banner-copy">
              <span className="shop-banner-tag"><Icon name="cart" size={14} /> {t('3D Ecommerce', '3D Ecommerce', '3D 电商')}</span>
              <h2>{r(<>Tu catálogo 3D<br />también <em>vende en línea</em></>, <>Your 3D catalog<br />also <em>sells online</em></>, <>您的 3D 目录<br />也能<em>在线销售</em></>)}<span className="accent-dot">.</span></h2>
              <p>{t('Convierte cada modelo en un producto de tienda: tu cliente lo gira, lo revisa y lo compra sin salir de la página.', 'Turn every model into a store product: your customer rotates it, reviews it and buys it without leaving the page.')}</p>
            </div>
            <div className="shop-banner-side">
              <ul>
                <li><Icon name="check" size={14} /> {t('Carrito y checkout en línea', 'Online cart and checkout')}</li>
                <li><Icon name="check" size={14} /> {t('Pago con tarjeta, SPEI y más', 'Card, SPEI and other payments')}</li>
                <li><Icon name="check" size={14} /> {t('Modelos 3D en cada producto', '3D models on every product')}</li>
              </ul>
              {onQuote && (
                <button type="button" className="shop-banner-cta" onClick={onQuote}>
                  <Icon name="form" size={18} /> {t('Llenar formulario', 'Fill out the form')} <Icon name="arrow-right" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="shop-bar">
            <span>{t('Demo de tienda', 'Store demo')} · {displayModels.length} {t('productos', 'products')}</span>
            <span className="shop-cart" aria-live="polite">
              <Icon name="cart" size={16} />
              {cart.length} {cart.length === 1 ? t('artículo', 'item') : t('artículos', 'items')}
              {cart.length > 0 && <strong>${cartTotal.toLocaleString(lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'es-MX', { minimumFractionDigits: 2 })} MXN</strong>}
            </span>
          </div>

          <div className="shop-grid">
            {displayModels.map((model) => (
              <ShopCard
                key={model.id}
                model={model}
                inCart={cart.includes(model.id)}
                onToggleCart={toggleCart}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="catalogo"
      className="catalog-section catalog-hero section-anchor"
      aria-label={t('Catálogo 3D principal', 'Main 3D catalog')}
    >
      <div className="page-container">
        <div className="section-heading catalog-heading" data-scroll-title="">
          <div>
            <span className="section-index">01 / {t('Catálogo 3D', '3D Catalog')}</span>
            <h1>{r(<>Tu catálogo.<br />Ahora en 3D.</>, <>Your catalog.<br />Now in 3D.</>, <>您的目录。<br />现在进入 3D。</>)}</h1>
          </div>
          <div className="section-heading-copy">
            <span>{t('Catálogos interactivos por BINEC', 'Interactive catalogs by BINEC')}</span>
            <p>{t('Transforma tus productos en una experiencia que tus clientes puedan explorar. Abre un modelo de esta demo e imagina tu marca en 3D.', 'Turn your products into an experience your customers can explore. Open a model from this demo and imagine your brand in 3D.')}</p>
          </div>
        </div>

        <div className="catalog-toolbar">
          <div className="category-filters" aria-label={t('Filtrar por categoría', 'Filter by category')}>
            <button
              type="button"
              className={categoryFilter === 'todos' ? 'is-active' : ''}
              onClick={() => onCategoryChange('todos')}
              aria-pressed={categoryFilter === 'todos'}
            >
              {t('Todos', 'All')} <span>{models.length}</span>
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`cat-chip ${categoryFilter === category.id ? 'is-active' : ''}`}
                style={{ '--cat-color': category.color } as CSSProperties}
                onClick={() => onCategoryChange(category.id)}
                aria-pressed={categoryFilter === category.id}
              >
                <span className="cat-dot" aria-hidden="true" />
                {category.name} <span>{category.models.length}</span>
              </button>
            ))}
          </div>

          <div className="catalog-tools">
            <label className="search-field">
              <span className="sr-only">{t('Buscar en el catálogo', 'Search the catalog')}</span>
              <Icon name="search" size={18} />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={t('Buscar modelo…', 'Search model…')}
                type="search"
              />
              {query && (
                <button type="button" onClick={() => onQueryChange('')} aria-label={t('Limpiar búsqueda', 'Clear search')}>
                  <Icon name="close" size={15} />
                </button>
              )}
            </label>
            <label className="sort-field">
              <span className="sort-label" aria-hidden="true">{t('Ordenar', 'Sort')}</span>
              <span className="sort-divider" aria-hidden="true" />
              <span className="sr-only">{t('Ordenar catálogo', 'Sort catalog')}</span>
              <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
                <option value="featured">{t('Destacados', 'Featured')}</option>
                <option value="name">{t('Nombre A–Z', 'Name A–Z')}</option>
                <option value="price-asc">{t('Precio: menor', 'Price: low to high')}</option>
                <option value="price-desc">{t('Precio: mayor', 'Price: high to low')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="catalog-results-meta" aria-live="polite">
          <span>{filteredModels.length} {filteredModels.length === 1 ? t('resultado', 'result') : t('resultados', 'results')}</span>
          {(categoryFilter !== 'todos' || query) && (
            <button type="button" onClick={onClearFilters}>{t('Limpiar filtros', 'Clear filters')}</button>
          )}
        </div>

        {filteredModels.length > 0 ? (
          <div className="catalog-grid">
            {filteredModels.map((model) => (
              <CatalogCard
                key={model.id}
                model={model}
                index={models.findIndex((item) => item.id === model.id)}
                active={selectedId === model.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Icon name="search" size={30} />
            <h3>{t('No encontramos ese modelo', 'We couldn\'t find that model')}</h3>
            <p>{t('Pruebe con otra palabra o explore todas las categorías.', 'Try another word or explore all categories.')}</p>
            <button type="button" className="button button-dark" onClick={onClearFilters}>
              {t('Ver todos los modelos', 'View all models')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}