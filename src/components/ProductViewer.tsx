import { useEffect, useRef, useState } from 'react';
import type { ModelViewerElement } from '../model-viewer';
import type { CatalogModel } from '../data/catalog';
import Icon from './Icon';

type Anchor = {
  position: string;
  normal: string;
  /** Screen-space x of the anchor when sampled, used to unfold labels inward. */
  nx: number;
};

type SurfaceHit = {
  nx: number;
  ny: number;
  anchor: Omit<Anchor, 'nx'>;
};

type Point = { x: number; y: number; z: number };

type ViewerElement = ModelViewerElement;

type ProductViewerProps = {
  model: CatalogModel;
};

const GRID_COLS = 13;
const GRID_ROWS = 11;
const HOTSPOT_COUNT = 3;

/** Unit vector pointing roughly at the default camera (orbit 20deg 70deg). */
const CAMERA_NORMAL = '0.32 0.34 0.88';

function parseVector(value: string): Point | null {
  const parts = value.split(' ').map((part) => parseFloat(part));
  if (parts.length < 3 || parts.some((part) => Number.isNaN(parts[0]) || Number.isNaN(part))) return null;
  return { x: parts[0], y: parts[1], z: parts[2] };
}

/**
 * Cast a grid of rays at the rendered model and keep the surface points that
 * were actually hit. Coordinates come back in model space, so the resulting
 * hotspots rotate and translate together with the geometry.
 */
function collectSurfaceHits(viewer: ViewerElement, relativeCoordinates: boolean) {
  const rect = viewer.getBoundingClientRect();
  const hits: SurfaceHit[] = [];
  if (!rect.width || !rect.height) return hits;

  for (let row = 1; row < GRID_ROWS; row += 1) {
    for (let col = 1; col < GRID_COLS; col += 1) {
      const localX = (rect.width * col) / GRID_COLS;
      const localY = (rect.height * row) / GRID_ROWS;
      const depth = localY / rect.height;

      // Skip the bottom of the frame where only the ground shadow can be hit.
      if (depth > 0.88) continue;

      const hit = viewer.positionAndNormalFromPoint(
        relativeCoordinates ? localX : rect.left + localX,
        relativeCoordinates ? localY : rect.top + localY,
      );
      if (!hit) continue;

      const normal = parseVector(hit.normal.toString());
      if (normal && normal.y > 0.985 && depth > 0.7) continue;

      hits.push({
        nx: localX / rect.width,
        ny: localY / rect.height,
        anchor: { position: hit.position.toString(), normal: hit.normal.toString() },
      });
    }
  }
  return hits;
}

function distance(a: { nx: number; ny: number }, b: { nx: number; ny: number }) {
  return Math.hypot(a.nx - b.nx, a.ny - b.ny);
}

/** Farthest-point sampling: three anchors that stay visually separated. */
function pickSpreadAnchors(hits: SurfaceHit[]) {
  const chosen = [
    hits.reduce((closest, candidate) =>
      distance(candidate, { nx: 0.5, ny: 0.45 }) < distance(closest, { nx: 0.5, ny: 0.45 }) ? candidate : closest,
    ),
  ];

  while (chosen.length < Math.min(HOTSPOT_COUNT, hits.length)) {
    let best: (typeof hits)[number] | null = null;
    let bestScore = -1;
    for (const candidate of hits) {
      if (chosen.includes(candidate)) continue;
      const score = Math.min(...chosen.map((existing) => distance(candidate, existing)));
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    if (!best) break;
    chosen.push(best);
  }

  return chosen
    .sort((a, b) => a.nx - b.nx || a.ny - b.ny)
    .map((entry) => ({ ...entry.anchor, nx: entry.nx }));
}

/** Bounding-box anchors, used when the raycast cannot find enough surface. */
function fallbackAnchors(viewer: ViewerElement): Anchor[] | null {
  try {
    const center = viewer.getBoundingBoxCenter();
    const size = viewer.getDimensions();
    if (!size.x || !size.y || !size.z) return null;
    const place = (x: number, y: number, z: number, nx: number) => ({
      position: `${(center.x + x).toFixed(5)} ${(center.y + y).toFixed(5)} ${(center.z + z).toFixed(5)}`,
      normal: CAMERA_NORMAL,
      nx,
    });
    return [
      place(-size.x * 0.32, size.y * 0.14, size.z * 0.3, 0.32),
      place(size.x * 0.32, size.y * 0.02, size.z * 0.3, 0.68),
      place(-size.x * 0.05, -size.y * 0.28, size.z * 0.3, 0.5),
    ];
  } catch {
    return null;
  }
}

function sampleAnchors(viewer: ViewerElement): Anchor[] | null {
  const rect = viewer.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  try {
    let hits = collectSurfaceHits(viewer, false);
    if (hits.length < HOTSPOT_COUNT) hits = collectSurfaceHits(viewer, true);
    if (hits.length < HOTSPOT_COUNT) return null;
    return pickSpreadAnchors(hits);
  } catch {
    return null;
  }
}

export default function ProductViewer({ model }: ProductViewerProps) {
  const viewerRef = useRef<ViewerElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const [autoRotate, setAutoRotate] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [showHotspots, setShowHotspots] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<number | null>(null);
  const [pinnedHotspot, setPinnedHotspot] = useState<number | null>(null);
  const [anchors, setAnchors] = useState<Anchor[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const schedule = (delay: number, callback: () => void) => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push(id);
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (!viewer) return;

    const resolveAnchors = () => {
      const next = sampleAnchors(viewer);
      if (next) {
        setAnchors(next);
        return true;
      }
      return false;
    };

    const handleLoad = () => {
      setProgress(100);
      setStatus('ready');
      setAnchors(null);
      // Give the intro camera a moment to settle, then anchor to real geometry.
      schedule(800, () => {
        if (resolveAnchors()) return;
        schedule(750, () => {
          if (resolveAnchors()) return;
          setAnchors(fallbackAnchors(viewer));
        });
      });
    };

    const handleError = () => {
      setAnchors(null);
      setStatus('error');
    };

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress?: number }>).detail;
      if (typeof detail?.totalProgress === 'number') {
        setProgress(Math.round(detail.totalProgress * 100));
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('progress', handleProgress);

    // Fast or cached models can finish before this effect attaches listeners.
    if (viewer.loaded) handleLoad();

    // Watchdogs: blocked CDN script or a model that never arrives.
    schedule(5000, () => {
      if (!customElements.get('model-viewer')) setStatus('error');
    });
    schedule(18000, () => {
      setStatus((current) => (current === 'loading' ? 'error' : current));
    });

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('progress', handleProgress);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [attempt, model.modelUrl]);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  const resetCamera = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setAttribute('camera-orbit', '20deg 70deg 105%');
    viewer.resetTurntableRotation?.();
    viewer.jumpCameraToGoal?.();
  };

  const toggleFullscreen = async () => {
    if (!frameRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await frameRef.current.requestFullscreen();
    }
  };

  const bullets = model.bullets.slice(0, HOTSPOT_COUNT);
  // Hover wins while the pointer is over a bullet; a tap stays open afterwards.
  const selectedHotspot = hoveredHotspot ?? pinnedHotspot;

  return (
    <div ref={frameRef} className="viewer-frame">
      <model-viewer
        key={`${model.id}-${attempt}`}
        ref={viewerRef}
        src={model.modelUrl}
        alt={`Modelo 3D interactivo: ${model.title}`}
        auto-rotate={autoRotate ? '' : undefined}
        camera-controls=""
        camera-orbit="20deg 70deg 105%"
        shadow-intensity="1.35"
        shadow-softness="1"
        exposure="1.15"
        environment-image="neutral"
        interaction-prompt="none"
        disable-tap=""
        rotation-per-second="18deg"
        loading="eager"
        reveal="auto"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {showHotspots &&
          anchors?.map((anchor, index) => (
            <button
              key={`${model.id}-bullet-${index}`}
              type="button"
              slot={`hotspot-${index}`}
              data-position={anchor.position}
              data-normal={anchor.normal}
              data-side={anchor.nx > 0.58 ? 'left' : 'right'}
              data-visibility-attribute="visible"
              className={`model-hotspot ${selectedHotspot === index ? 'is-selected' : ''}`}
              onClick={() => setPinnedHotspot((current) => (current === index ? null : index))}
              onMouseEnter={() => setHoveredHotspot(index)}
              onMouseLeave={() => setHoveredHotspot(null)}
              onFocus={() => setHoveredHotspot(index)}
              onBlur={() => setHoveredHotspot(null)}
              aria-label={`Característica ${index + 1}: ${bullets[index]}`}
              aria-expanded={selectedHotspot === index}
            >
              <span className="hotspot-number">0{index + 1}</span>
              <span className="hotspot-label">{bullets[index]}</span>
            </button>
          ))}
      </model-viewer>

      <div className="viewer-topbar">
        <div className="viewer-badges">
          <span className="viewer-badge viewer-badge-primary">{model.catName}</span>
        </div>
        <div className="viewer-controls" aria-label="Controles del modelo 3D">
          <button
            type="button"
            className={`icon-button ${autoRotate ? 'is-active' : ''}`}
            onClick={() => setAutoRotate((value) => !value)}
            aria-label={autoRotate ? 'Pausar rotación automática' : 'Activar rotación automática'}
            data-tooltip={autoRotate ? 'Pausar rotación' : 'Rotar modelo'}
          >
            <Icon name={autoRotate ? 'pause' : 'play'} size={17} />
          </button>
          <button
            type="button"
            className={`icon-button ${showHotspots ? 'is-active' : ''}`}
            onClick={() => setShowHotspots((value) => !value)}
            aria-label={showHotspots ? 'Ocultar características' : 'Mostrar características'}
            aria-pressed={showHotspots}
            data-tooltip="Características"
          >
            <Icon name="scan" size={17} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={resetCamera}
            aria-label="Restablecer vista del modelo"
            data-tooltip="Restablecer vista"
          >
            <Icon name="reset" size={17} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            data-tooltip={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <Icon name={isFullscreen ? 'minimize' : 'expand'} size={17} />
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="viewer-loading" role="status" aria-live="polite">
          <div className="loading-cube"><Icon name="cube" size={28} /></div>
          <span>Cargando geometría 3D</span>
          <div className="loading-track"><span style={{ width: `${Math.max(progress, 4)}%` }} /></div>
          <small>{progress}%</small>
        </div>
      )}

      {status === 'error' && (
        <div className="viewer-error" role="alert">
          <Icon name="cube" size={30} />
          <strong>No se pudo cargar el modelo</strong>
          <span>Comprueba tu conexión e inténtalo de nuevo.</span>
          <div>
            <button
              type="button"
              onClick={() => {
                setStatus('loading');
                setProgress(0);
                setAnchors(null);
                setAttempt((value) => value + 1);
              }}
            >
              Reintentar
            </button>
            <a href={model.modelUrl} target="_blank" rel="noreferrer">Abrir GLB</a>
          </div>
        </div>
      )}

      <div className="viewer-gesture-hint">
        <Icon name="mouse" size={14} />
        <span>Arrastra para girar · Scroll para acercar</span>
      </div>

    </div>
  );
}
