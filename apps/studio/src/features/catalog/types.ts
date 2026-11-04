export type ProductId = 'venetian' | 'idd' | 'odd';
export type LegacyFile = 'venetian.html' | 'insect-door.html' | 'odd-door.html';

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
