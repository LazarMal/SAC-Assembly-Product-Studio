import { test, expect } from 'vitest';
import { unifyProductNavigation } from './unified-product-navigation.mjs';

const base = `<html><head></head><body><header><nav class="shared-links"><a href="./insect-door.html">IDD</a></nav></header><nav class="tabs"><button>Configure</button></nav></body></html>`;

test('all viewers link to all four products including Roller', () => {
  for (const name of ['venetian', 'idd', 'odd']) {
    const page = unifyProductNavigation(base, name);
    expect((page.match(/<a\b[^>]*\bdata-product-link=/g) ?? []).length).toBe(5);
    expect(page).toContain('href="../#/products/open-roller-blind"');
    expect(page).toContain('href="../#/collection"');
    expect(page).toContain('class="current" aria-current="page"');
    expect(page).toContain('<nav class="tabs"><button>Configure</button></nav>');
  }
});

test('Roller uses the same centered top navigation, preserving panel tabs', () => {
  const source = base.replace('class="shared-links"', 'class="primary-nav"');
  const page = unifyProductNavigation(source, 'roller');
  expect(page).toContain('id="sac-unified-product-navigation"');
  expect(page).toContain('data-product-link="roller"');
  expect(page).toContain('translate(-50%,-50%)');
  expect(page).toContain('<nav class="tabs"><button>Configure</button></nav>');
});
