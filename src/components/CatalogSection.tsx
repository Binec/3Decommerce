import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import CatalogCard from './CatalogCard';
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
}: CatalogSectionProps) {
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
        className="catalog-section catalog-duplicate section-anchor"
        aria-label="Productos del catálogo 3D"
      >
        <div className="page-container">
          <div className="catalog-grid">
            {displayModels.map((model) => (
              <CatalogCard
                key={model.id}
                model={model}
                index={models.findIndex((item) => item.id === model.id)}
                active={selectedId === model.id}
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