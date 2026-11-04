import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';

test('logo returns to preview React homepage', () => {
  assert.match(rewriteLegacyNavigation('<a href="./index.html">Home</a>', '../#/'), /href="\.\.\/#\/"/);
});
test('collection returns to React catalog', () => {
  assert.match(rewriteLegacyNavigation('<a class="shared-index" href="./index.html">Collection</a>', '../#/'), /href="\.\.\/#\/collection"/);
});
test('product links enter the React details routes', () => {
  const s = rewriteLegacyNavigation('<a href="./venetian.html">V</a><a href="./insect-door.html">I</a><a href="./odd-door.html">O</a>', '../#/');
  assert.match(s, /href="\.\.\/#\/products\/venetian-blinds"/);
  assert.match(s, /href="\.\.\/#\/products\/idd-insect-doors"/);
  assert.match(s, /href="\.\.\/#\/products\/odd-insect-doors"/);
});
test('non-navigation code remains unchanged', () => {
  const s = '<script>const asset="./index.html"</script><a href="https://example.com">External</a>';
  assert.equal(rewriteLegacyNavigation(s, '../#/'), s);
});
