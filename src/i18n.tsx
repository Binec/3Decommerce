import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CatalogModel, Category } from './data/catalog';
import { zhDict, modelsZh, categoriesZh } from './zh';

export type Lang = 'es' | 'en' | 'zh';

const STORAGE_KEY = 'binec-lang';

function initialLang(): Lang {
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'en' || param === 'es' || param === 'zh') return param;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es' || saved === 'zh') return saved;
  } catch {
    /* storage unavailable */
  }
  return 'es';
}

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Pick the string for the active language: t('Hola', 'Hello'). */
  t: (es: string, en: string, zh?: string) => string;
  /** Pick any value (e.g. JSX) per language. */
  r: <T,>(es: T, en: T, zh: T) => T;
};

const LangContext = createContext<LangContextValue>({
  lang: 'es',
  setLang: () => {},
  t: (es) => es,
  r: (es) => es,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.title = {
      es: 'BINEC - Catálogos 3D para tu marca',
      en: 'BINEC - 3D catalogs for your brand',
      zh: 'BINEC - 为您的品牌打造 3D 产品目录',
    }[lang];
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        {
          es: 'Presenta tus productos con un catálogo 3D de BINEC. Explora nuestra demo con vistas 360°, detalles interactivos y fichas de producto, y cotiza el catálogo de tu marca.',
          en: 'Showcase your products with a BINEC 3D catalog. Explore our demo with 360° views, interactive details and product sheets, and request a quote for your brand.',
          zh: '用 BINEC 的 3D 产品目录展示您的产品。体验 360° 视图、交互式细节和产品资料，并为您的品牌获取报价。',
        }[lang],
      );
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (es, en, zh) => (lang === 'en' ? en : lang === 'zh' ? zh ?? zhDict[en] ?? en : es),
      r: (es, en, zh) => (lang === 'en' ? en : lang === 'zh' ? zh : es),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/* ---------- Catalog content in English ---------- */

export type ModelEn = { title: string; description: string; bullets: string[]; badge?: string };

const modelsEn: Record<string, ModelEn> = {
  placa1: {
    title: 'Cloverleaf LCP POLY-AX Plate 3.5 mm',
    badge: 'POLY-AX · Featured',
    description:
      'The 3.5 mm Cloverleaf LCP POLY-AX plate delivers reliable fixation for complex orthopedic procedures. Made from high-quality titanium and designed to be compatible with 3.5 mm locking screws and cortical screws.',
    bullets: [
      'Grade 5 Titanium · Ti-6Al-4V',
      'Compatible with 3.5 mm locking screws',
      'Variable-angle polyaxial holes at 15°',
      'Pre-contoured anatomical design',
    ],
  },
  placa2: {
    title: 'LCP Modular Locking Plate',
    description:
      'Modular plate with geometrically precise perforations for optimal rigid fixation in periarticular fractures.',
    bullets: [
      'Full positional flexibility',
      'LCP dynamic compression',
      'Atraumatic beveled edges',
      'Reduced-thickness, low profile',
    ],
  },
  pieza1: {
    title: 'Modular Reduction Instrument',
    badge: 'High precision',
    description:
      'Advanced assembly component with intricate geometry, ideal for surgical reduction and bone alignment instruments.',
    bullets: [
      'Mirror-polished finish',
      'Internal micrometric thread',
      'Resistant to saline corrosion',
      'Autoclavable at 134 °C',
    ],
  },
  tornillo: {
    title: '3.5 mm Cortical Locking Screw',
    badge: 'Essential',
    description:
      'Self-tapping screw with micrometric precision threading. Excellent fixation and bone grip in cortical tissue.',
    bullets: [
      '3.5 mm thread diameter',
      'Conical POLY-AX locking head',
      'Hexalobular drive for torque',
      'Ti-6Al-4V alloy',
    ],
  },
  llanta1: {
    title: 'Rotational Component 01',
    description:
      'Support element with high-density forged spokes and a titanium finish. Torsional stability and superior strength.',
    bullets: [
      'Made from high-purity titanium',
      'Compatible with standard rotation systems',
      'Computer-optimized geometry',
      'Direct 12-month warranty',
    ],
  },
  llanta2: {
    title: 'Rotational Component 02',
    description:
      'Cross-spoke structure in lightweight alloy. Excellent for low-friction support configurations.',
    bullets: [
      'Low-profile structure',
      'Integrated fixation channels',
      'Chemically polished surface',
      'Individual sterile packaging',
    ],
  },
  llanta3: {
    title: 'Rotational Component 03',
    description:
      'High-performance alloy with critical weight reduction. Withstands severe cyclic loads without deformation.',
    bullets: [
      'Ultra-light titanium weight',
      'Increased fatigue resistance',
      'Polyaxial locking holes',
      'ISO 13485 certification',
    ],
  },
};

const categoriesEn: Record<string, { name: string; short: string }> = {
  placas: { name: 'LCP Plates', short: 'Polyaxial titanium fixation' },
  piezas: { name: 'Instruments', short: 'Precision surgical components' },
  llantas: { name: 'Components', short: 'Mechanical reference parts' },
};

export function localizeModel(model: CatalogModel, lang: Lang): CatalogModel {
  if (lang === 'es') return model;
  const en = (lang === 'zh' ? modelsZh : modelsEn)[model.id];
  const cat = (lang === 'zh' ? categoriesZh : categoriesEn)[model.catId];
  return {
    ...model,
    ...(en ?? {}),
    ...(cat ? { catName: cat.name, catShort: cat.short } : {}),
  };
}

export function localizeCategory(category: Category, lang: Lang): Category {
  if (lang === 'es') return category;
  const cat = (lang === 'zh' ? categoriesZh : categoriesEn)[category.id];
  const models = lang === 'zh' ? modelsZh : modelsEn;
  return {
    ...category,
    ...(cat ?? {}),
    models: category.models.map((model) => ({ ...model, ...(models[model.id] ?? {}) })),
  };
}
