// Original 3D assets and product content from the Ace Osteomedica catalogue.
const BASE = `${import.meta.env.BASE_URL}models/`;

export type Model = {
  id: string;
  title: string;
  price: string;
  description: string;
  bullets: string[];
  modelUrl: string;
  badge?: string;
};

export type Category = {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
  models: Model[];
};

export type CatalogModel = Model & {
  catId: string;
  catName: string;
  catShort: string;
  catColor: string;
};

export const productCategories: Category[] = [
  {
    id: 'placas',
    name: 'Placas LCP',
    short: 'Fijación poliaxial de titanio',
    icon: 'plate',
    color: '#2f6f6a',
    models: [
      {
        id: 'placa1',
        title: 'Placa Cloverleaf LCP POLY-AX 3.5 mm',
        price: '$ 10,799.60 MXN',
        badge: 'POLY-AX · Destacado',
        description:
          'La Placa Cloverleaf LCP POLY-AX de 3.5 mm ofrece una fijación confiable para procedimientos ortopédicos complejos. Fabricada en titanio de alta calidad y diseñada para ser compatible con tornillos de bloqueo y tornillos corticales de 3.5 mm.',
        bullets: [
          'Titanio Grado 5 · Ti-6Al-4V',
          'Compatible con tornillos de bloqueo 3.5 mm',
          'Orificios poliaxiales de ángulo variable 15°',
          'Diseño anatómico pre-contorneado',
        ],
        modelUrl: BASE + 'placa1.glb',
      },
      {
        id: 'placa2',
        title: 'Placa Modular de Bloqueo LCP',
        price: '$ 15,915.20 MXN',
        description:
          'Placa modular con perforaciones de precisión geométrica para fijación rígida óptima en fracturas periarticulares.',
        bullets: [
          'Flexibilidad posicional total',
          'Compresión dinámica LCP',
          'Bordes biselados atraumáticos',
          'Espesor reducido de bajo perfil',
        ],
        modelUrl: BASE + 'placa2.glb',
      },
    ],
  },
  {
    id: 'piezas',
    name: 'Instrumental',
    short: 'Componentes quirúrgicos de precisión',
    icon: 'instrument',
    color: '#9a5b2e',
    models: [
      {
        id: 'pieza1',
        title: 'Instrumento de Reducción Modular',
        price: '$ 5,672.40 MXN',
        badge: 'Alta precisión',
        description:
          'Componente de ensamble avanzado con geometría intrincada, ideal para instrumentales quirúrgicos de reducción y alineación ósea.',
        bullets: [
          'Terminado pulido espejo',
          'Rosca micrométrica interna',
          'Resistente a corrosión salina',
          'Autoclavable a 134 °C',
        ],
        modelUrl: BASE + 'pieza-mecanica.glb',
      },
      {
        id: 'tornillo',
        title: 'Tornillo Cortical de Bloqueo 3.5 mm',
        price: '$ 2,504.79 MXN',
        badge: 'Esencial',
        description:
          'Tornillo de roscado autocortante de precisión micrométrica. Excelente fijación y agarre óseo en tejido cortical.',
        bullets: [
          'Diámetro rosca 3.5 mm',
          'Cabeza cónica de bloqueo POLY-AX',
          'Ranura hexalobular para par de torsión',
          'Aleación Ti-6Al-4V',
        ],
        modelUrl: BASE + 'tornillo.glb',
      },
    ],
  },
  {
    id: 'llantas',
    name: 'Componentes',
    short: 'Piezas de referencia mecánica',
    icon: 'component',
    color: '#4a5aa8',
    models: [
      {
        id: 'llanta1',
        title: 'Componente Rotacional 01',
        price: '$ 4,129.60 MXN',
        description:
          'Elemento de soporte con radios forjados de alta densidad y acabado titanio. Estabilidad torsional y resistencia superior.',
        bullets: [
          'Fabricado en titanio de alta pureza',
          'Compatible con sistemas de rotación estándar',
          'Geometría optimizada por computadora',
          'Garantía directa de 12 meses',
        ],
        modelUrl: BASE + 'llanta1.glb',
      },
      {
        id: 'llanta2',
        title: 'Componente Rotacional 02',
        price: '$ 2,992.80 MXN',
        description:
          'Estructura de radios cruzados con aleación ligera. Excelente para configuraciones de soporte con baja fricción.',
        bullets: [
          'Estructura de bajo perfil',
          'Canales de fijación integrados',
          'Superficie pulida químicamente',
          'Envasado estéril individual',
        ],
        modelUrl: BASE + 'llanta2.glb',
      },
      {
        id: 'llanta3',
        title: 'Componente Rotacional 03',
        price: '$ 3,178.40 MXN',
        description:
          'Aleación de alto rendimiento con reducción de peso crítica. Soporta cargas cíclicas severas sin deformación.',
        bullets: [
          'Peso ultra ligero de titanio',
          'Resistencia a la fatiga incrementada',
          'Orificios de bloqueo poliaxiales',
          'Certificación ISO 13485',
        ],
        modelUrl: BASE + 'llanta3.glb',
      },
    ],
  },
];

export const allModels: CatalogModel[] = productCategories.flatMap((category) =>
  category.models.map((model) => ({
    ...model,
    catId: category.id,
    catName: category.name,
    catShort: category.short,
    catColor: category.color,
  })),
);

export function findModelLocation(modelId: string) {
  const categoryIndex = productCategories.findIndex((category) =>
    category.models.some((model) => model.id === modelId),
  );
  const modelIndex = productCategories[categoryIndex]?.models.findIndex(
    (model) => model.id === modelId,
  );

  return { categoryIndex, modelIndex: modelIndex ?? 0 };
}
