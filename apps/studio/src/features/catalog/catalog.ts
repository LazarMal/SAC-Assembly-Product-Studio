import type { CatalogEntry, ProductId } from './types';

/** Lightweight metadata only; do not import viewer/geometry from this file. */
export const catalog = [
  {
    id: 'venetian',
    slug: 'venetian-blinds',
    title: 'Venetian blinds',
    family: 'Light control',
    description: 'Fine-tune the light. Explore slat finishes, hardware and movement.',
    image: 'venetian.webp',
    imageAlt: 'Warm ivory Venetian blind in a domestic interior',
    legacyFile: 'venetian.html',
    feature: 'Light, precisely yours.'
  },
  {
    id: 'idd',
    slug: 'idd-insect-doors',
    title: 'Insect doors · IDD',
    family: 'In-reveal installation',
    description: 'A pleated insect screen, fitted neatly within your doorway.',
    image: 'idd.webp',
    imageAlt: 'Pleated insect door fitted inside an opening',
    legacyFile: 'insect-door.html',
    feature: 'Make room for fresh air.'
  },
  {
    id: 'odd',
    slug: 'odd-insect-doors',
    title: 'Insect doors · ODD',
    family: 'Surface mounting',
    description: 'The same thoughtful screen system with an external mounting surround.',
    image: 'odd.webp',
    imageAlt: 'Surface mounted pleated insect door with outer frame',
    legacyFile: 'odd-door.html',
    feature: 'A seamless welcome to outdoors.'
  }
] as const satisfies readonly CatalogEntry[];

export function findProduct(slug: string): CatalogEntry | undefined {
  return catalog.find((product) => product.slug === slug);
}

export const productModules: Record<ProductId, () => Promise<{ definition: import('../configurator/contracts').ProductDefinition }>> = {
  venetian: () => import('../../products/venetian/definition'),
  idd: () => import('../../products/idd/definition'),
  odd: () => import('../../products/odd/definition')
};
