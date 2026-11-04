import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { decorateIddLegacyPreview } from './idd-legacy-sync.mjs';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';

test('the deployed IDD copy exposes selection sync and a visible 3D link', () => {
  const original = readFileSync(resolve(process.cwd(), '../../insect-door.html'), 'utf8');
  const adapted = decorateIddLegacyPreview(rewriteLegacyNavigation(original, '../#/'));
  expect(adapted).toContain('id="sac-idd-open-3d"');
  expect(adapted).toContain('href="../#/products/idd-insect-doors/3d"');
  expect(adapted).toContain('window.SAC_IDD_BRIDGE');
  expect(adapted).toContain('const sacRestored=sacApply(sacStored)');
  expect(adapted).toContain('if(!sacRestored)setTimeout(()=>playAssembly(true),320)');
  expect(adapted).toContain('href="../#/collection"');
  expect(original).not.toContain('sac-idd-open-3d');
});
test('incompatible source markup fails at build time rather than losing synchronization', () => {
  expect(() => decorateIddLegacyPreview('<html><head></head><body></body></html>'))
    .toThrow(/anchor missing or ambiguous/);
});
