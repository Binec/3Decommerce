import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import CatalogCard from './components/CatalogCard';
import BinecLogo from './components/BinecLogo';
import Icon from './components/Icon';
import ProductModal from './components/ProductModal';
import SampleRequest from './components/SampleRequest';
import { allModels, productCategories } from './data/catalog';

const navItems = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'especificaciones', label: 'Experiencia 3D' },
  { id: 'contacto', label: 'Contacto' },
];

const catalogBenefits = [
  {
    title: 'Muestra tus productos desde cualquier ángulo',
    label: 'Visualización 360°',
  },
  {
    title: 'Destaca lo que hace único a cada producto',
    label: 'Hotspots interactivos',
  },
  {
    title: 'Ayuda a encontrar el producto ideal',
    label: 'Navegación por categorías',
  },
  {
    title: 'Acerca la información a la decisión de compra',
    label: 'Información comercial integrada',
  },
];

const exampleProduct = allModels[0];
const exampleProductRows = [
  ['Categoría', exampleProduct.catName],
  ['Material', exampleProduct.bullets[0]],
  ['Compatibilidad', exampleProduct.bullets[1]],
  ['Geometría', exampleProduct.bullets[2]],
  ['Diseño', exampleProduct.bullets[3]],
  ['Precio de catálogo', exampleProduct.price],
];

const ECOMMERCE_TOPIC = 'Quiero convertir mi catálogo 3D en un ecommerce y vender en línea.';

function requestTopic(topic: string) {
  window.dispatchEvent(new CustomEvent('binec:request-topic', { detail: topic }));
}

const WHATSAPP_NUMBER = '528130738347';
const ecommerceWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ECOMMERCE_TOPIC)}`;

const ecommerceBenefits = [
  {
    title: 'Compra en el mismo recorrido',
    label: 'Del modelo al carrito',
  },
  {
    title: 'Producto, stock y precio en un solo lugar',
    label: 'Catálogo y tienda sincronizados',
  },
  {
    title: 'Cobra en línea desde el primer día',
    label: 'Pagos y pedidos integrados',
  },
];

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const priceValue = (price: string) => Number(price.replace(/[^0-9.]/g, ''));

function modelFromUrl() {
  const id = new URLSearchParams(window.location.search).get('modelo');
  return allModels.some((model) => model.id === id) ? id! : null;
}

export default function App() {
  const [selectedId, setSelectedId] = useState(() => modelFromUrl() ?? allModels[0].id);
  const [modalOpen, setModalOpen] = useState(() => modelFromUrl() !== null);
  const [activeSection, setActiveSection] = useState('catalogo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');

  const selectedModel = allModels.find((model) => model.id === selectedId) ?? allModels[0];
  const selectedIndex = allModels.findIndex((model) => model.id === selectedModel.id);

  useEffect(() => {
    const updateActiveSection = () => {
      let current = 'catalogo';
      navItems.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 180) current = id;
      });
      setActiveSection(current);
    };
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  const syncUrl = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('modelo', id);
    else url.searchParams.delete('modelo');
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    const handleHistory = () => {
      const id = modelFromUrl();
      if (id) {
        setSelectedId(id);
        setModalOpen(true);
      } else {
        setModalOpen(false);
      }
    };
    window.addEventListener('popstate', handleHistory);
    return () => window.removeEventListener('popstate', handleHistory);
  }, []);

  const openProduct = (id: string) => {
    setSelectedId(id);
    setModalOpen(true);
    syncUrl(id);
  };

  const closeModal = () => {
    setModalOpen(false);
    syncUrl(null);
  };

  const stepProduct = (direction: number) => {
    const nextIndex = (selectedIndex + direction + allModels.length) % allModels.length;
    const nextId = allModels[nextIndex].id;
    setSelectedId(nextId);
    syncUrl(nextId);
  };

  const goToSection = (id: string) => {
    closeModal();
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const requestSample = () => {
    goToSection('contacto');
  };

  const filteredModels = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const result = allModels.filter((model) => {
      const inCategory = categoryFilter === 'todos' || model.catId === categoryFilter;
      const searchable = normalize(`${model.title} ${model.catName} ${model.description} ${model.bullets.join(' ')}`);
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return priceValue(a.price) - priceValue(b.price);
      if (sort === 'price-desc') return priceValue(b.price) - priceValue(a.price);
      if (sort === 'name') return a.title.localeCompare(b.title, 'es');
      return allModels.indexOf(a) - allModels.indexOf(b);
    });
  }, [categoryFilter, query, sort]);

  return (
    <div className="site-shell">
      <div className="top-line" />

      <header className="site-header">
        <div className="nav-container">
          <a href="#catalogo" className="brand" aria-label="BINEC, ir al catálogo">
            <BinecLogo />
          </a>

          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map((item) => (
              <a
                href={`#${item.id}`}
                key={item.id}
                className={activeSection === item.id ? 'is-active' : ''}
                aria-current={activeSection === item.id ? 'location' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button type="button" className="button button-dark nav-cta" onClick={() => requestSample()}>
              Cotizar catálogo <Icon name="arrow-up-right" size={16} />
            </button>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Navegación móvil">
            {navItems.map((item) => (
              <a href={`#${item.id}`} key={item.id} onClick={() => setMobileMenuOpen(false)}>
                <span>{item.label}</span><Icon name="arrow-right" size={17} />
              </a>
            ))}
            <button type="button" onClick={() => { setMobileMenuOpen(false); requestSample(); }}>
              Cotizar catálogo <Icon name="arrow-up-right" size={17} />
            </button>
          </nav>
        )}
      </header>

      <main>
        <section id="catalogo" className="catalog-section catalog-hero section-anchor">
          <div className="page-container">
            <div className="section-heading catalog-heading">
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
                <button type="button" className={categoryFilter === 'todos' ? 'is-active' : ''} onClick={() => setCategoryFilter('todos')} aria-pressed={categoryFilter === 'todos'}>
                  Todos <span>{allModels.length}</span>
                </button>
                {productCategories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={`cat-chip ${categoryFilter === category.id ? 'is-active' : ''}`}
                    style={{ '--cat-color': category.color } as CSSProperties}
                    onClick={() => setCategoryFilter(category.id)}
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
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar modelo…" type="search" />
                  {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><Icon name="close" size={15} /></button>}
                </label>
                <label className="sort-field">
                  <span className="sort-label" aria-hidden="true">Ordenar</span>
                  <span className="sort-divider" aria-hidden="true" />
                  <span className="sr-only">Ordenar catálogo</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
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
              {(categoryFilter !== 'todos' || query) && <button type="button" onClick={() => { setCategoryFilter('todos'); setQuery(''); }}>Limpiar filtros</button>}
            </div>

            {filteredModels.length > 0 ? (
              <div className="catalog-grid">
                {filteredModels.map((model) => (
                  <CatalogCard
                    key={model.id}
                    model={model}
                    index={allModels.findIndex((item) => item.id === model.id)}
                    active={selectedModel.id === model.id}
                    onSelect={openProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <Icon name="search" size={30} />
                <h3>No encontramos ese modelo</h3>
                <p>Pruebe con otra palabra o explore todas las categorías.</p>
                <button type="button" className="button button-dark" onClick={() => { setCategoryFilter('todos'); setQuery(''); }}>Ver todos los modelos</button>
              </div>
            )}
          </div>
        </section>

        <section className="commerce-banner" aria-labelledby="commerce-title">
          <div className="page-container">
            <div className="commerce-card">
              <div className="commerce-main">
                <span className="commerce-eyebrow">
                  <span className="commerce-icon" aria-hidden="true"><Icon name="cart" size={17} /></span>
                  Tu catálogo también puede vender
                </span>
                <h2 id="commerce-title">De catálogo 3D<br />a ecommerce.</h2>
                <p>
                  El mismo producto que se explora en 3D puede comprarse en línea.
                  Agregamos carrito, precios, existencias y checkout para que el catálogo
                  se convierta en una tienda lista para vender.
                </p>
                <div className="commerce-actions">
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={() => {
                      requestTopic(ECOMMERCE_TOPIC);
                      document.getElementById('cotizacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Quiero vender en línea <Icon name="arrow-up-right" size={17} />
                  </button>
                  <a
                    className="button button-outline commerce-whatsapp"
                    href={ecommerceWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="whatsapp" size={17} /> Preguntar por WhatsApp
                  </a>
                </div>
              </div>

              <div className="commerce-aside">
                <span className="commerce-aside-label">Lo que añadimos a tu catálogo 3D</span>
                <ul>
                  {ecommerceBenefits.map((benefit, index) => (
                    <li key={benefit.label}>
                      <span className="commerce-number">0{index + 1}</span>
                      <span>
                        <strong>{benefit.title}</strong>
                        <small>{benefit.label}</small>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="commerce-note">Sin empezar de cero: reutilizamos lo que ya tienes.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="especificaciones" className="specs-section section-anchor">
          <div className="page-container">
            <div className="section-heading">
              <div>
                <span className="section-index">02 / Experiencia 3D</span>
                <h2>Muestra mejor.<br />Vende mejor.</h2>
              </div>
              <div className="section-heading-copy">
                <span>Más claridad para decidir</span>
                <p>Ayuda a tus clientes a entender el valor de tus productos con vistas 360°, detalles interactivos y la información comercial en un solo lugar.</p>
              </div>
            </div>

            <div className="specs-layout">
              <div className="feature-list">
                {catalogBenefits.map((benefit, index) => (
                  <div className="feature-row" key={benefit.title}>
                    <span className="feature-number">0{index + 1}</span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.label}</p>
                    </div>
                    <span className="feature-check"><Icon name="check" size={17} /></span>
                  </div>
                ))}
              </div>

              <div
                className="technical-card product-example"
                style={{ '--cat-color': exampleProduct.catColor } as CSSProperties}
              >
                <div className="technical-card-heading">
                  <div>
                    <span>Ejemplo de ficha de producto</span>
                    <h3>{exampleProduct.title}</h3>
                  </div>
                  <Icon name="cube" size={28} />
                </div>
                <dl>
                  {exampleProductRows.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  className="technical-cta"
                  onClick={() => openProduct(exampleProduct.id)}
                  aria-haspopup="dialog"
                >
                  Ver esta pieza en 3D <Icon name="arrow-up-right" size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="contact-section section-anchor">
          <div className="page-container contact-layout">
            <div className="contact-intro">
              <span className="section-index">03 / Contacto</span>
              <h2>Hagamos tu<br />catálogo 3D.</h2>
              <p>Cuéntanos qué vendes y qué quieres mostrar. En BINEC te ayudamos a definir un catálogo 3D a la medida de tu marca.</p>

              <div className="contact-methods">
                <a href="mailto:hola@bineccc.com">
                  <span><Icon name="mail" size={20} /></span>
                  <div><small>Correo</small><strong>hola@bineccc.com</strong></div>
                  <Icon name="arrow-up-right" size={17} />
                </a>
                <a
                  href="https://wa.me/528130738347"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Escribir por WhatsApp al +52 813 073 8347"
                >
                  <span><Icon name="whatsapp" size={20} /></span>
                  <div><small>WhatsApp</small><strong>+52 813 073 8347</strong></div>
                  <Icon name="arrow-up-right" size={17} />
                </a>
              </div>

              <div className="contact-note">
                <Icon name="check" size={17} />
                <span>Para marcas, fabricantes y distribuidores que quieren presentar mejor sus productos.</span>
              </div>
            </div>

            <div id="cotizacion"><SampleRequest /></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-main">
            <a href="#catalogo" className="brand" aria-label="BINEC, volver arriba">
              <BinecLogo />
            </a>
            <p>Catálogos 3D para mostrar mejor tus productos.<br />Diseño e interacción al servicio de tu marca.</p>
            <nav aria-label="Navegación del pie de página">
              {navItems.map((item) => <a href={`#${item.id}`} key={item.id}>{item.label}</a>)}
            </nav>
            <a href="#catalogo" className="back-to-top">Volver arriba <Icon name="arrow-up-right" size={17} /></a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} BINEC</span>
            <span>Diseño · Tecnología · Experiencia</span>
            <a href="https://bineccc.com/" target="_blank" rel="noopener noreferrer">bineccc.com <Icon name="arrow-up-right" size={13} /></a>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <ProductModal
          model={selectedModel}
          index={selectedIndex}
          onClose={closeModal}
          onStep={stepProduct}
          onRequestSample={requestSample}
          onOpenSpecs={() => goToSection('especificaciones')}
        />
      )}
    </div>
  );
}
