import { describe, expect, it } from 'vitest';
import { catalog, findProduct, productModules } from './catalog';

// Contract tests: no duplicate product IDs/slugs or missing legacy targets.
describe('catalog registry', () => {
  it('contains four unique products', () => {
    expect(catalog).toHaveLength(4);
    expect(new Set(catalog.map((p) => p.id)).size).toBe(catalog.length);
    expect(new Set(catalog.map((p) => p.slug)).size).toBe(catalog.length);
  });

  it('has lazy product modules and view targets', async () => {
    for (const product of catalog) {
      expect(findProduct(product.slug)?.id).toBe(product.id);
      expect(product.legacyFile).toMatch(/\.html$/);
      const module = await productModules[product.id]();
      expect(module.definition.id).toBe(product.id);
      expect(module.definition.accuracy).toBe('concept');
    }
  });
});
