/**
 * Read-only regression guard for the four original self-contained HTML pages.
 * Keep until every original route has passed new modular parity checks.
 * Usage: node scripts/audit-legacy.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'venetian.html', 'insect-door.html', 'odd-door.html'];
let failures = 0;

function fail(page, message) {
  console.error('FAIL ' + page + ': ' + message);
  failures++;
}

for (const page of pages) {
  const file = join(root, page);
  if (!existsSync(file)) {
    fail(page, 'file missing');
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/<!doctype html>/i.test(html) || !/<\/html\s*>/i.test(html)) fail(page, 'invalid HTML document boundaries');
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) fail(page, 'responsive viewport missing');
  if (!/<canvas\b/i.test(html)) fail(page, 'expected Canvas viewer missing');
  for (const destination of pages) {
    if (!html.includes('./' + destination)) fail(page, 'missing navigation to ' + destination);
  }
  for (const match of html.matchAll(/\bhref=["'](\.\/?[^"'#?]+\.html)(?:[?#][^"']*)?["']/gi)) {
    if (!existsSync(resolve(root, match[1]))) fail(page, 'broken relative link: ' + match[1]);
  }
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  if (!scripts.length) fail(page, 'missing inline JavaScript');
  scripts.forEach(([, attributes, js], index) => {
    if (/\bsrc\s*=/i.test(attributes)) return;
    if (/\btype=["'](?:application\/json|application\/ld\+json)["']/i.test(attributes)) return;
    try {
      new Script(js, { filename: page + ':script-' + (index + 1) });
    } catch (error) {
      fail(page, 'JS block ' + (index + 1) + ': ' + error.message);
    }
  });
  console.log('CHECK ' + page + ': ' + Math.round(Buffer.byteLength(html) / 1024) + ' KiB, ' + scripts.length + ' scripts');
}
if (failures) {
  console.error('Legacy audit failed with ' + failures + ' error(s).');
  process.exitCode = 1;
} else {
  console.log('Legacy static checks passed. Browser/visual/physical verification still required.');
}
