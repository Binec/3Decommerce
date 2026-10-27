import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type Point3 = { x: number; y: number; z: number };
type Hit3 = { toString(): string };

export interface ModelViewerElement extends HTMLElement {
  loaded: boolean;
  src: string;
  resetTurntableRotation: () => void;
  jumpCameraToGoal: () => void;
  updateHotspot: (config: { name: string; position?: string; normal?: string }) => void;
  queryHotspot: (name: string) => {
    position: Point3;
    normal: Point3;
    canvasPosition: Point3;
    facingCamera: boolean;
  } | null;
  positionAndNormalFromPoint: (x: number, y: number) => { position: Hit3; normal: Hit3 } | null;
  surfaceFromPoint: (x: number, y: number) => string | null;
  getDimensions: () => Point3;
  getBoundingBoxCenter: () => Point3;
}

type ModelViewerProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, ModelViewerElement> & {
  src?: string;
  alt?: string;
  'auto-rotate'?: boolean | '';
  'camera-controls'?: boolean | '';
  'camera-orbit'?: string;
  'shadow-intensity'?: string | number;
  'shadow-softness'?: string | number;
  exposure?: string | number;
  'environment-image'?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  ar?: boolean | '';
  'touch-action'?: string;
  'disable-zoom'?: boolean | '';
  'disable-tap'?: boolean | '';
  'auto-rotate-delay'?: string | number;
  'rotation-per-second'?: string;
  'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
  poster?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

export {};
