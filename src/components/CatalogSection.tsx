import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import CatalogCard from './CatalogCard';
import ShopCard from './ShopCard';
import Icon from './Icon';
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
        aria-label="Tienda en línea 3D"
      >
        <div className="page-container">
          <div className="shop-banner">
            <span className="shop-banner-bg" aria-hidden="true">
              <Icon name="cart" size={420} strokeWidth={1.1} />
            </span>
            <div className="shop-banner-copy">
              <span className="shop-banner-tag"><Icon name="cart" size={14} /> 3D Ecommerce</span>
              <h2>Tu catálogo 3D<br />también <em>vende en línea</em><span className="accent-dot">.</span></h2>
              <p>Convierte cada modelo en un producto de tienda: tu cliente lo gira, lo revisa y lo compra sin salir de la página.</p>
            </div>
            <div className="shop-banner-side">
              <ul>
                <li><Icon name="check" size={14} /> Carrito y checkout en línea</li>
                <li><Icon name="check" size={14} /> Pago con tarjeta, SPEI y más</li>
                <li><Icon name="check" size={14} /> Modelos 3D en cada producto</li>
              </ul>
              {onQuote && (
                <button type="button" className="shop-banner-cta" onClick={onQuote}>
                  <Icon name="form" size={18} /> Llenar formulario <Icon name="arrow-right" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="shop-bar">
            <span>Demo de tienda · {displayModels.length} productos</span>
            <span className="shop-cart" aria-live="polite">
              <Icon name="cart" size={16} />
              {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
              {cart.length > 0 && <strong>${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>}
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
      aria-label="Catálogo 3D principal"
    >
      <div className="page-container">
        <div className="section-heading catalog-heading" data-scroll-title="">
          <div>
            <span className="section-index">01 / Catálogo 3D</span>
            <h1>Tu catálogo.<br />Ahora en 3D.</h1>
          </div>
          <div className="section-heading-copy">
            <span>Catálogos interactivos por BINEC</span>
            <p>Transforma tus productos en una experiencia que tus clientes puedan explorar. Abre un modelo de esta demo e imagina tu marca en 3D.</p>
          </div>
        </div>

        <div className="catalog-toolbar">
          <div className="category-filters" aria-label="Filtrar por categoría">
            <button
              type="button"
              className={categoryFilter === 'todos' ? 'is-active' : ''}
              onClick={() => onCategoryChange('todos')}
              aria-pressed={categoryFilter === 'todos'}
            >
              Todos <span>{models.length}</span>
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
              <span className="sr-only">Buscar en el catálogo</span>
              <Icon name="search" size={18} />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar modelo…"
                type="search"
              />
              {query && (
                <button type="button" onClick={() => onQueryChange('')} aria-label="Limpiar búsqueda">
                  <Icon name="close" size={15} />
                </button>
              )}
            </label>
            <label className="sort-field">
              <span className="sort-label" aria-hidden="true">Ordenar</span>
              <span className="sort-divider" aria-hidden="true" />
              <span className="sr-only">Ordenar catálogo</span>
              <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
                <option value="featured">Destacados</option>
                <option value="name">Nombre A–Z</option>
                <option value="price-asc">Precio: menor</option>
                <option value="price-desc">Precio: mayor</option>
              </select>
            </label>
          </div>
        </div>

        <div className="catalog-results-meta" aria-live="polite">
          <span>{filteredModels.length} {filteredModels.length === 1 ? 'resultado' : 'resultados'}</span>
          {(categoryFilter !== 'todos' || query) && (
            <button type="button" onClick={onClearFilters}>Limpiar filtros</button>
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
            <h3>No encontramos ese modelo</h3>
            <p>Pruebe con otra palabra o explore todas las categorías.</p>
            <button type="button" className="button button-dark" onClick={onClearFilters}>
              Ver todos los modelos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}