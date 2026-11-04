import { test, expect } from 'vitest';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';

test('preview viewer logo routes to React homepage', () => {
  expect(rewriteLegacyNavigation('<a href="./index.html">Home</a>', '../#/')).toMatch(/href="\.\.\/#\/"/);
});
test('collection returns to React catalog', () => {
  expect(rewriteLegacyNavigation('<a class="shared-index" href="./index.html">Collection</a>', '../#/')).toMatch(/href="\.\.\/#\/collection"/);
});
test('every product returns through React details', () => {
  const result = rewriteLegacyNavigation('<a href="./venetian.html">V</a><a href="./insect-door.html">I</a><a href="./odd-door.html">O</a>', '../#/');
  expect(result).toMatch(/href="\.\.\/#\/products\/venetian-blinds"/);
  expect(result).toMatch(/href="\.\.\/#\/products\/idd-insect-doors"/);
  expect(result).toMatch(/href="\.\.\/#\/products\/odd-insect-doors"/);
});
test('external URLs and script content remain unchanged', () => {
  const input = '<script>const asset="./index.html"</script><a href="https://example.com">External</a>';
  expect(rewriteLegacyNavigation(input, '../#/')).toBe(input);
});
