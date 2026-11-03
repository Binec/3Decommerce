import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ModelViewerElement } from '../model-viewer';
import type { CatalogModel } from '../data/catalog';
import Icon from './Icon';

type ShopCardProps = {
  model: CatalogModel;
  inCart: boolean;
  onToggleCart: (id: string) => void;
  onSelect: (id: string) => void;
};

export default function ShopCard({ model, inCart, onToggleCart, onSelect }: ShopCardProps) {
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
          alt={`Vista 3D de ${model.title}`}
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
        {!loaded && <span className="shop-card-loading">Cargando 3D…</span>}
        <span className="shop-card-badge">{model.badge ?? 'Nuevo'}</span>
        <span className="shop-card-3d"><Icon name="cube" size={12} /> Gira en 3D</span>
      </div>

      <div className="shop-card-body">
        <span className="shop-card-cat">
          <span className="cat-dot" aria-hidden="true" />
          {model.catName}
        </span>
        <h3>{model.title}</h3>
        <div className="shop-card-price">
          <strong>{model.price}</strong>
          <span>IVA incluido</span>
        </div>
        <ul className="shop-card-meta">
          <li><Icon name="check" size={12} /> En existencia</li>
          <li><Icon name="check" size={12} /> Envío a todo México</li>
        </ul>
        <button
          type="button"
          className={`shop-card-add ${inCart ? 'is-added' : ''}`}
          onClick={() => onToggleCart(model.id)}
          aria-pressed={inCart}
        >
          <Icon name={inCart ? 'check' : 'cart'} size={16} />
          {inCart ? 'Agregado' : 'Agregar al carrito'}
        </button>
        <button
          type="button"
          className="shop-card-view"
          onClick={() => onSelect(model.id)}
          aria-haspopup="dialog"
          aria-label={`Ver ${model.title} en el visor 3D`}
        >
          <Icon name="expand" size={14} /> Ver detalle en 3D
        </button>
      </div>
    </article>
  );
}
