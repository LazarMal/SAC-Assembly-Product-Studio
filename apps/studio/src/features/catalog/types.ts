export type ProductId = 'venetian' | 'idd' | 'odd' | 'roller';
export type LegacyFile = 'venetian.html' | 'insect-door.html' | 'odd-door.html' | 'open-roller.html';

export interface CatalogEntry {
  id: ProductId;
  slug: string;
  title: string;
  family: string;
  description: string;
  image: string;
  imageAlt: string;
  legacyFile: LegacyFile;
  feature: string;
}
