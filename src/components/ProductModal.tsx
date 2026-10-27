import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { CatalogModel } from '../data/catalog';
import CtaButton from './CtaButton';
import Icon from './Icon';
import ProductViewer from './ProductViewer';

type ProductModalProps = {
  model: CatalogModel;
  models: CatalogModel[];
  index: number;
  onClose: () => void;
  onStep: (direction: number) => void;
  onRequestSample: () => void;
  onOpenSpecs: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProductModal({
  model,
  models,
  index,
  onClose,
  onStep,
  onRequestSample,
  onOpenSpecs,
}: ProductModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onClose, onStep });
  handlers.current = { onClose, onStep };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handlers.current.onClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handlers.current.onStep(1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlers.current.onStep(-1);
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const previous = models[(index - 1 + models.length) % models.length];
  const next = models[(index + 1) % models.length];

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Visor 3D — ${model.title}`}
        ref={panelRef}
        style={{ '--cat-color': model.catColor } as CSSProperties}
      >
        <div className="modal-bar">
          <div className="modal-bar-label">
            <strong>Visor 3D</strong>
            <span className="modal-bar-sep" aria-hidden="true" />
            <span className="modal-cat"><span className="cat-dot" aria-hidden="true" />{model.catName}</span>
            <span>
              {String(index + 1).padStart(2, '0')} / {String(models.length).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Cerrar el visor (tecla Esc)"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-viewer">
            <ProductViewer key={model.id} model={model} />
          </div>

          <aside className="modal-info">
            <span className="modal-eyebrow">{model.catShort}</span>
            <h2><span>{model.title}</span></h2>
            <div className="modal-tech">{model.bullets[0]} · {model.bullets[2]}</div>
            <p>{model.description}</p>

            <ul className="modal-bullets">
              {model.bullets.map((bullet, bulletIndex) => (
                <li key={bullet}>
                  <span>{String(bulletIndex + 1).padStart(2, '0')}</span>
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="modal-price">
              <span>Precio de catálogo</span>
              <strong>{model.price}</strong>
            </div>

            <div className="modal-actions">
              <CtaButton onClick={onRequestSample}>Quiero un catálogo así</CtaButton>
              <button type="button" className="button button-outline" onClick={onOpenSpecs}>
                Experiencia 3D <Icon name="arrow-right" size={16} />
              </button>
            </div>

            <div className="modal-pager">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label={`Producto anterior: ${previous.title}`}
                title={previous.title}
              >
                <Icon name="chevron-left" size={18} />
              </button>
              <span>Anterior / Siguiente producto</span>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label={`Producto siguiente: ${next.title}`}
                title={next.title}
              >
                <Icon name="chevron-right" size={18} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
