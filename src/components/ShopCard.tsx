import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ModelViewerElement } from '../model-viewer';
import type { CatalogModel } from '../data/catalog';
import Icon from './Icon';
import { useLang } from '../i18n';

type ShopCardProps = {
  model: CatalogModel;
  inCart: boolean;
  onToggleCart: (id: string) => void;
  onSelect: (id: string) => void;
};

export default function ShopCard({ model, inCart, onToggleCart, onSelect }: ShopCardProps) {
  const { t } = useLang();
  const viewerRef = useRef<ModelViewerElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handleLoad = () => setLoaded(true);
    viewer.addEventListener('load', handleLoad);
    return () => viewer.removeEventListener('load', handleLoad);
  }, [model.modelUrl]);

  return (
    <article className="shop-card" style={{ '--cat-color': model.catColor } as CSSProperties}>
      <div className="shop-card-media">
        <model-viewer
          ref={viewerRef}
          src={model.modelUrl}
          alt={t(`Vista 3D de ${model.title}`, `3D view of ${model.title}`, `${model.title} 的 3D 视图`)}
          camera-controls=""
          auto-rotate=""
          camera-orbit="20deg 70deg 105%"
          interaction-prompt="none"
          environment-image="neutral"
          exposure="1.1"
          shadow-intensity="0.8"
          loading="lazy"
          reveal="auto"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        />
        {!loaded && <span className="shop-card-loading">{t('Cargando 3D…', 'Loading 3D…')}</span>}
        <span className="shop-card-badge">{model.badge ?? t('Nuevo', 'New')}</span>
        <span className="shop-card-3d"><Icon name="cube" size={12} /> {t('Gira en 3D', 'Rotate in 3D')}</span>
      </div>

      <div className="shop-card-body">
        <span className="shop-card-cat">
          <span className="cat-dot" aria-hidden="true" />
          {model.catName}
        </span>
        <h3>{model.title}</h3>
        <div className="shop-card-price">
          <strong>{model.price}</strong>
          <span>{t('IVA incluido', 'VAT included')}</span>
        </div>
        <ul className="shop-card-meta">
          <li><Icon name="check" size={12} /> {t('En existencia', 'In stock')}</li>
          <li><Icon name="check" size={12} /> {t('Envío a todo México', 'Shipping across Mexico')}</li>
        </ul>
        <button
          type="button"
          className={`shop-card-add ${inCart ? 'is-added' : ''}`}
          onClick={() => onToggleCart(model.id)}
          aria-pressed={inCart}
        >
          <Icon name={inCart ? 'check' : 'cart'} size={16} />
          {inCart ? t('Agregado', 'Added') : t('Agregar al carrito', 'Add to cart')}
        </button>
        <button
          type="button"
          className="shop-card-view"
          onClick={() => onSelect(model.id)}
          aria-haspopup="dialog"
          aria-label={t(`Ver ${model.title} en el visor 3D`, `View ${model.title} in the 3D viewer`, `在 3D 查看器中查看 ${model.title}`)}
        >
          <Icon name="expand" size={14} /> {t('Ver detalle en 3D', 'View 3D detail')}
        </button>
      </div>
    </article>
  );
}
