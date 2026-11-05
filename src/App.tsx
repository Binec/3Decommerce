import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import BinecLogo from './components/BinecLogo';
import CatalogSection from './components/CatalogSection';
import CtaButton from './components/CtaButton';
import Icon from './components/Icon';
import ProductModal from './components/ProductModal';
import SampleRequest from './components/SampleRequest';
import LanguageToggle from './components/LanguageToggle';
import { allModels, productCategories } from './data/catalog';
import { localizeCategory, localizeModel, useLang } from './i18n';

const navItems = [
  { id: 'catalogo', es: 'Catálogo', en: 'Catalog', zh: '目录' },
  { id: 'especificaciones', es: 'Experiencia 3D', en: '3D Experience', zh: '3D 体验' },
  { id: 'contacto', es: 'Contacto', en: 'Contact', zh: '联系我们' },
];

const catalogBenefits = [
  {
    es: { title: 'Muestra tus productos desde cualquier ángulo', label: 'Visualización 360°' },
    en: { title: 'Show your products from every angle', label: '360° visualization' },
    zh: { title: '从任意角度展示您的产品', label: '360° 全景视图' },
  },
  {
    es: { title: 'Destaca lo que hace único a cada producto', label: 'Hotspots interactivos' },
    en: { title: 'Highlight what makes each product unique', label: 'Interactive hotspots' },
    zh: { title: '突出每件产品的独特之处', label: '交互式热点' },
  },
  {
    es: { title: 'Ayuda a encontrar el producto ideal', label: 'Navegación por categorías' },
    en: { title: 'Help customers find the right product', label: 'Category navigation' },
    zh: { title: '帮助客户找到合适的产品', label: '分类导航' },
  },
  {
    es: { title: 'Acerca la información a la decisión de compra', label: 'Información comercial integrada' },
    en: { title: 'Bring information closer to the buying decision', label: 'Built-in commercial information' },
    zh: { title: '让信息贴近购买决策', label: '整合的商业信息' },
  },
];

const ECOMMERCE_TOPIC = {
  es: 'Quiero convertir mi catálogo 3D en un ecommerce y vender en línea.',
  en: 'I want to turn my 3D catalog into an ecommerce store and sell online.',
  zh: '我想把我的 3D 目录变成电商商店，在线销售。',
};

function requestTopic(topic: string) {
  window.dispatchEvent(new CustomEvent('binec:request-topic', { detail: topic }));
}

// Número con lada de país (52) para que wa.me abra el chat correcto: 81 3073 8347.
const WHATSAPP_NUMBER = '528130738347';
const WHATSAPP_GENERAL_TEXT = {
  es: 'Hola, vi su catálogo 3D y me gustaría más información.',
  en: 'Hi, I saw your 3D catalog and would like more information.',
  zh: '您好，我看到了你们的 3D 目录，想了解更多信息。',
};
const waLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const ecommerceBenefits = [
  {
    es: { title: 'Compra en el mismo recorrido', label: 'Del modelo al carrito' },
    en: { title: 'Buy within the same journey', label: 'From model to cart' },
    zh: { title: '在同一流程中完成购买', label: '从模型到购物车' },
  },
  {
    es: { title: 'Producto, stock y precio en un solo lugar', label: 'Catálogo y tienda sincronizados' },
    en: { title: 'Product, stock and price in one place', label: 'Catalog and store in sync' },
    zh: { title: '产品、库存和价格集中管理', label: '目录与商店同步' },
  },
  {
    es: { title: 'Cobra en línea desde el primer día', label: 'Pagos y pedidos integrados' },
    en: { title: 'Get paid online from day one', label: 'Integrated payments and orders' },
    zh: { title: '第一天起即可在线收款', label: '整合的支付与订单' },
  },
];

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const priceValue = (price: string) => Number(price.replace(/[^0-9.]/g, ''));

const MOBILE_QUERY = '(max-width: 767px)';
const mobileModels = allModels.slice(0, 4);

function modelFromUrl() {
  const id = new URLSearchParams(window.location.search).get('modelo');
  const models = window.matchMedia(MOBILE_QUERY).matches ? mobileModels : allModels;
  return models.some((model) => model.id === id) ? id! : null;
}

export default function App() {
  const { lang, t, r } = useLang();
  const ecommerceTopic = ECOMMERCE_TOPIC[lang];
  const whatsappGeneral = waLink(WHATSAPP_GENERAL_TEXT[lang]);
  const ecommerceWhatsApp = waLink(ecommerceTopic);
  const exampleProduct = useMemo(() => localizeModel(allModels[0], lang), [lang]);
  const exampleProductRows = [
    [t('Categoría', 'Category'), exampleProduct.catName],
    [t('Material', 'Material'), exampleProduct.bullets[0]],
    [t('Compatibilidad', 'Compatibility'), exampleProduct.bullets[1]],
    [t('Geometría', 'Geometry'), exampleProduct.bullets[2]],
    [t('Diseño', 'Design'), exampleProduct.bullets[3]],
    [t('Precio de catálogo', 'Catalog price'), exampleProduct.price],
  ];
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [selectedId, setSelectedId] = useState(() => modelFromUrl() ?? allModels[0].id);
  const [modalOpen, setModalOpen] = useState(() => modelFromUrl() !== null);
  const [activeSection, setActiveSection] = useState('catalogo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');

  // Limit the source list before filtering or sorting so the last three stay hidden on mobile.
  const sourceModels = isMobile ? mobileModels : allModels;
  const catalogModels = useMemo(() => sourceModels.map((model) => localizeModel(model, lang)), [sourceModels, lang]);
  const catalogCategories = useMemo(() => productCategories
    .map((category) => localizeCategory({
      ...category,
      models: category.models.filter((model) => sourceModels.some((item) => item.id === model.id)),
    }, lang))
    .filter((category) => category.models.length > 0), [sourceModels, lang]);
  const activeCategoryFilter = catalogCategories.some((category) => category.id === categoryFilter)
    ? categoryFilter
    : 'todos';
  const selectedModel = catalogModels.find((model) => model.id === selectedId) ?? catalogModels[0];
  const selectedIndex = catalogModels.findIndex((model) => model.id === selectedModel.id);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const handleChange = () => setIsMobile(media.matches);
    media.addEventListener('change', handleChange);
    handleChange();
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (selectedId === selectedModel.id) return;
    setSelectedId(selectedModel.id);
    if (modalOpen) {
      const url = new URL(window.location.href);
      url.searchParams.set('modelo', selectedModel.id);
      window.history.replaceState({}, '', url);
    }
  }, [modalOpen, selectedId, selectedModel.id]);

  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Prepare before paint, then reveal each heading only the first time it enters view.
    const titles = document.querySelectorAll<HTMLElement>('[data-scroll-title]');
    titles.forEach((title) => {
      if (title.dataset.reveal !== 'visible') title.dataset.reveal = 'waiting';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const title = entry.target as HTMLElement;
        title.dataset.reveal = 'visible';
        observer.unobserve(title);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    titles.forEach((title) => {
      if (title.dataset.reveal !== 'visible') observer.observe(title);
    });

    return () => {
      observer.disconnect();
      titles.forEach((title) => {
        if (title.dataset.reveal === 'waiting') delete title.dataset.reveal;
      });
    };
  }, []);

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
    const nextIndex = (selectedIndex + direction + catalogModels.length) % catalogModels.length;
    const nextId = catalogModels[nextIndex].id;
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
    const result = catalogModels.filter((model) => {
      const inCategory = activeCategoryFilter === 'todos' || model.catId === activeCategoryFilter;
      const searchable = normalize(`${model.title} ${model.catName} ${model.description} ${model.bullets.join(' ')}`);
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return priceValue(a.price) - priceValue(b.price);
      if (sort === 'price-desc') return priceValue(b.price) - priceValue(a.price);
      if (sort === 'name') return a.title.localeCompare(b.title, lang === 'zh' ? 'zh-CN' : lang);
      return allModels.indexOf(a) - allModels.indexOf(b);
    });
  }, [activeCategoryFilter, catalogModels, query, sort, lang]);

  return (
    <div className="site-shell">
      <div className="top-line" />

      <header className="site-header">
        <div className="nav-container">
          <a href="#catalogo" className="brand" aria-label={t('BINEC, ir al catálogo', 'BINEC, go to the catalog')}>
            <BinecLogo />
          </a>

          <nav className="desktop-nav" aria-label={t('Navegación principal', 'Main navigation')}>
            {navItems.map((item) => (
              <a
                href={`#${item.id}`}
                key={item.id}
                className={activeSection === item.id ? 'is-active' : ''}
                aria-current={activeSection === item.id ? 'location' : undefined}
              >
                {t(item.es, item.en, item.zh)}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <CtaButton size="compact" className="nav-cta" onClick={() => requestSample()}>
              {t('Cotizar catálogo', 'Request a quote')}
            </CtaButton>
            <LanguageToggle />
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? t('Cerrar menú', 'Close menu') : t('Abrir menú', 'Open menu')}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label={t('Navegación móvil', 'Mobile navigation')}>
            {navItems.map((item) => (
              <a href={`#${item.id}`} key={item.id} onClick={() => setMobileMenuOpen(false)}>
                <span>{t(item.es, item.en, item.zh)}</span><Icon name="arrow-right" size={17} />
              </a>
            ))}
            <button type="button" onClick={() => { setMobileMenuOpen(false); requestSample(); }}>
              {t('Cotizar catálogo', 'Request a quote')} <Icon name="arrow-up-right" size={17} />
            </button>
          </nav>
        )}
      </header>

      <main>
        <CatalogSection
          variant="hero"
          models={catalogModels}
          categories={catalogCategories}
          filteredModels={filteredModels}
          selectedId={selectedModel.id}
          categoryFilter={activeCategoryFilter}
          query={query}
          sort={sort}
          onCategoryChange={setCategoryFilter}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onClearFilters={() => { setCategoryFilter('todos'); setQuery(''); }}
          onSelect={openProduct}
        />

        <section className="commerce-banner" aria-labelledby="commerce-title">
          <div className="page-container">
            <div className="commerce-card">
              <div className="commerce-main">
                <span className="commerce-eyebrow">
                  <span className="commerce-icon" aria-hidden="true"><Icon name="cart" size={17} /></span>
                  {t('Tu catálogo también puede vender', 'Your catalog can sell too')}
                </span>
                <h2 id="commerce-title" data-scroll-title="">{r(<>De catálogo 3D<br />a ecommerce.</>, <>From 3D catalog<br />to ecommerce.</>, <>从 3D 目录<br />到电商商店。</>)}</h2>
                <p>
                  {t(
                    'El mismo producto que se explora en 3D puede comprarse en línea. Agregamos carrito, precios, existencias y checkout para que el catálogo se convierta en una tienda lista para vender.',
                    'The same product explored in 3D can be bought online. We add a cart, pricing, stock and checkout so your catalog becomes a store ready to sell.',
                  )}
                </p>
                <div className="commerce-actions">
                  <CtaButton
                    icon="arrow-down"
                    onClick={() => {
                      requestTopic(ecommerceTopic);
                      document.getElementById('cotizacion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {t('Quiero vender en línea', 'I want to sell online')}
                  </CtaButton>
                  <a
                    className="button button-outline commerce-whatsapp"
                    href={ecommerceWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="whatsapp" size={17} /> {t('Preguntar por WhatsApp', 'Ask on WhatsApp')}
                  </a>
                </div>
              </div>

              <div className="commerce-aside">
                <span className="commerce-aside-label">{t('Lo que añadimos a tu catálogo 3D', 'What we add to your 3D catalog')}</span>
                <ul>
                  {ecommerceBenefits.map((benefit, index) => (
                    <li key={benefit.es.label}>
                      <span className="commerce-number">0{index + 1}</span>
                      <span>
                        <strong>{benefit[lang].title}</strong>
                        <small>{benefit[lang].label}</small>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="commerce-note">{t('Sin empezar de cero: reutilizamos lo que ya tienes.', 'No starting from scratch: we reuse what you already have.')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="especificaciones" className="specs-section section-anchor">
          <div className="page-container">
            <div className="section-heading">
              <div>
                <span className="section-index">03 / {t('Experiencia 3D', '3D Experience')}</span>
                <h2 data-scroll-title="">{r(<>Muestra mejor.<br />Vende mejor.</>, <>Show better.<br />Sell better.</>, <>展示更好。<br />销售更好。</>)}</h2>
              </div>
              <div className="section-heading-copy">
                <span>{t('Más claridad para decidir', 'More clarity to decide')}</span>
                <p>{t('Ayuda a tus clientes a entender el valor de tus productos con vistas 360°, detalles interactivos y la información comercial en un solo lugar.', 'Help your customers understand the value of your products with 360° views, interactive details and commercial information in one place.')}</p>
              </div>
            </div>

            <div className="specs-layout">
              <div className="feature-list">
                {catalogBenefits.map((benefit, index) => (
                  <div className="feature-row" key={benefit.es.title}>
                    <span className="feature-number">0{index + 1}</span>
                    <div>
                      <h3>{benefit[lang].title}</h3>
                      <p>{benefit[lang].label}</p>
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
                    <span>{t('Ejemplo de ficha de producto', 'Sample product sheet')}</span>
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
                  {t('Ver esta pieza en 3D', 'View this piece in 3D')} <Icon name="arrow-up-right" size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <CatalogSection
          variant="compact"
          onQuote={() => { requestTopic(ecommerceTopic); document.getElementById('cotizacion')?.scrollIntoView({ behavior: 'smooth' }); }}
          models={catalogModels}
          categories={catalogCategories}
          filteredModels={filteredModels}
          selectedId={selectedModel.id}
          categoryFilter={activeCategoryFilter}
          query={query}
          sort={sort}
          onCategoryChange={setCategoryFilter}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onClearFilters={() => { setCategoryFilter('todos'); setQuery(''); }}
          onSelect={openProduct}
        />

        <section id="contacto" className="contact-section section-anchor">
          <div className="page-container contact-layout">
            <div className="contact-intro">
              <span className="section-index"><span>(04)</span>&nbsp;&nbsp;{t('Contacto', 'Contact')}</span>
              <h2 data-scroll-title="">{r(<>Hagamos tu<br />catálogo 3D</>, <>Let's build your<br />3D catalog</>, <>一起打造您的<br />3D 目录</>)}<span className="accent-dot">.</span></h2>
              <p>{t('Cuéntanos qué vendes y qué quieres mostrar. En BINEC te ayudamos a definir un catálogo 3D a la medida de tu marca.', 'Tell us what you sell and what you want to showcase. At BINEC we help you define a 3D catalog tailored to your brand.')}</p>

              <div className="contact-links">
                <a className="contact-email" href="mailto:hola@bineccc.com">hola@bineccc.com</a>
                <a
                  className="contact-whatsapp"
                  href={whatsappGeneral}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('Escribir por WhatsApp al +52 813 073 8347', 'Message us on WhatsApp at +52 813 073 8347')}
                >
                  <span className="contact-whatsapp-badge"><Icon name="whatsapp" size={13} /></span>
                  <span>WhatsApp: +52 813 073 8347</span>
                  <span className="contact-whatsapp-arrow" aria-hidden="true">↗</span>
                </a>
              </div>

              <p className="contact-note">{t('Para marcas, fabricantes y distribuidores que quieren presentar mejor sus productos.', 'For brands, manufacturers and distributors who want to present their products better.')}</p>
            </div>

            <div id="cotizacion" className="contact-form"><SampleRequest /></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-main">
            <a href="#catalogo" className="brand" aria-label={t('BINEC, volver arriba', 'BINEC, back to top')}>
              <BinecLogo />
            </a>
            <p>{r(<>Catálogos 3D para mostrar mejor tus productos.<br />Diseño e interacción al servicio de tu marca.</>, <>3D catalogs to showcase your products better.<br />Design and interaction at the service of your brand.</>, <>用 3D 目录更好地展示您的产品。<br />以设计与交互服务您的品牌。</>)}</p>
            <nav aria-label={t('Navegación del pie de página', 'Footer navigation')}>
              {navItems.map((item) => <a href={`#${item.id}`} key={item.id}>{t(item.es, item.en, item.zh)}</a>)}
            </nav>
            <a href="#catalogo" className="back-to-top">{t('Volver arriba', 'Back to top')} <Icon name="arrow-up-right" size={17} /></a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} BINEC</span>
            <span>{t('Diseño · Tecnología · Experiencia', 'Design · Technology · Experience')}</span>
            <a href="https://bineccc.com/" target="_blank" rel="noopener noreferrer">bineccc.com <Icon name="arrow-up-right" size={13} /></a>
          </div>
        </div>
      </footer>

      <a
        className="wa-float"
        href={whatsappGeneral}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('Escribir por WhatsApp al 81 3073 8347', 'Message us on WhatsApp at 81 3073 8347')}
      >
        <span className="wa-float-text">
          <span className="wa-float-title">{t('Escribir por WhatsApp', 'Message us on WhatsApp')}</span>
          <span className="wa-float-number">81 3073 8347</span>
        </span>
        <span className="wa-float-icon"><Icon name="whatsapp" size={24} /></span>
      </a>

      {modalOpen && (
        <ProductModal
          model={selectedModel}
          models={catalogModels}
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
