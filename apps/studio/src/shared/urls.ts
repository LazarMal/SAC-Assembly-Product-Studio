import type { LegacyFile } from '../features/catalog/types';

export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/**
 * New studio is hosted at /SAC-Assembly-Product-Studio/preview/.
 * Preview viewers are isolated copies with rewritten links; root production remains intact.
 * In dev, the Vite middleware serves the unchanged root HTML at /<file>.
 */
export function legacyViewerUrl(file: LegacyFile) {
  return import.meta.env.DEV ? `/${file}` : `${import.meta.env.BASE_URL}viewers/${file}`;
}
