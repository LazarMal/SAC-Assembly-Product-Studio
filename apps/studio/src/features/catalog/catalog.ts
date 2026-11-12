import type { CatalogEntry, ProductId } from './types';

/** Lightweight metadata only; do not import viewer/geometry from this file. */
export const catalog = [
  {
    id: 'venetian',
    slug: 'venetian-blinds',
    title: 'Venetian blinds',
    family: 'Adjustable slat system',
    description: 'Choose slat widths, finishes, control hardware and movement.',
    image: 'venetian.webp',
    imageAlt: 'Warm ivory Venetian blind in a domestic interior',
    legacyFile: 'venetian.html',
    feature: 'Venetian blinds.'
  },
  {
    id: 'idd',
    slug: 'idd-insect-doors',
    title: 'Insect doors · IDD',
    family: 'In-reveal installation',
    description: 'A pleated insect screen fitted within the doorway opening.',
    image: 'idd.webp',
    imageAlt: 'Pleated insect door fitted inside an opening',
    legacyFile: 'insect-door.html',
    feature: 'In-reveal insect doors.'
  },
  {
    id: 'odd',
    slug: 'odd-insect-doors',
    title: 'Insect doors · ODD',
    family: 'Surface-mounted installation',
    description: 'A pleated screen with an outer mounting frame for the face of the opening.',
    image: 'odd.webp',
    imageAlt: 'Surface mounted pleated insect door with outer frame',
    legacyFile: 'odd-door.html',
    feature: 'Surface-mounted insect doors.'
  },
  {
    id: 'roller', slug: 'open-roller-blind', title: 'Open roller blind',
    family: 'Manual chain system', description: 'Explore the woven fabric, bracket assembly and manual chain drive.',
    image: 'roller.webp', imageAlt: 'Open roller blind mounted in a living room',
    legacyFile: 'open-roller.html', feature: 'Open roller blind.'
  }
] as const satisfies readonly CatalogEntry[];

export function findProduct(slug: string): CatalogEntry | undefined {
  return catalog.find((product) => product.slug === slug);
}

export const productModules: Record<ProductId, () => Promise<{ definition: import('../configurator/contracts').ProductDefinition }>> = {
  roller: () => import('../../products/roller/definition'),
  venetian: () => import('../../products/venetian/definition'),
  idd: () => import('../../products/idd/definition'),
  odd: () => import('../../products/odd/definition')
};
