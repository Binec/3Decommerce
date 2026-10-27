import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ModelViewerElement } from '../model-viewer';
import type { CatalogModel } from '../data/catalog';
import Icon from './Icon';

type CatalogCardProps = {
  model: CatalogModel;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
};

export default function CatalogCard({ model, index, active, onSelect }: CatalogCardProps) {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handleLoad = () => setLoaded(true);
    const handleError = () => setFailed(true);
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [model.modelUrl]);

  return (
    <article
      className={`catalog-card ${active ? 'is-active' : ''}`}
      style={{ '--cat-color': model.catColor } as CSSProperties}
    >
      <div className="catalog-preview">
        <model-viewer
          ref={viewerRef}
          src={model.modelUrl}
          alt={`Vista 3D de ${model.title}`}
          camera-controls=""
          camera-orbit="20deg 70deg 105%"
          interaction-prompt="none"
          environment-image="neutral"
          exposure="1.1"
          shadow-intensity="0.8"
          loading="lazy"
          reveal="auto"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        />
        {!loaded && !failed && <span className="catalog-loading">Cargando 3D…</span>}
        {failed && (
          <a className="catalog-fallback" href={model.modelUrl} target="_blank" rel="noreferrer">
            Abrir archivo 3D <Icon name="arrow-up-right" size={14} />
          </a>
        )}
        <span className="catalog-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="catalog-3d-label"><Icon name="cube" size={13} /> 3D</span>
      </div>
      <div className="catalog-card-body">
        <div className="catalog-card-category">
          <span className="cat-dot" aria-hidden="true" />
          {model.catName}
        </div>
        <h3>{model.title}</h3>
        <p>{model.description}</p>
        <div className="catalog-card-footer">
          <div>
            <span>Precio de catálogo</span>
            <strong>{model.price}</strong>
          </div>
          <button
            type="button"
            onClick={() => onSelect(model.id)}
            aria-haspopup="dialog"
            aria-label={`Abrir ${model.title} en el visor 3D`}
          >
            <span>{active ? 'En el visor' : 'Explorar'}</span>
            <Icon name={active ? 'check' : 'arrow-up-right'} size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
