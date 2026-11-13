import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';
import { decorateIddLegacyPreview } from './idd-legacy-sync.mjs';
import { decorateQuietDetails } from './quiet-details.mjs';
import { unifyProductNavigation } from './unified-product-navigation.mjs';

/** Node script for Pages build: <production directory> <preview directory>. */
const [, , productionDir, previewDir] = process.argv;
if (!productionDir || !previewDir) throw new Error('Provide production and preview directories');
const output = join(previewDir, 'viewers');
await mkdir(output, { recursive: true });
for (const file of ['venetian.html', 'insect-door.html', 'odd-door.html']) {
  const original = await readFile(join(productionDir, file), 'utf8');
  const rewritten = rewriteLegacyNavigation(original, '../#/');
  const synced = file === 'insect-door.html' ? decorateIddLegacyPreview(rewritten) : rewritten;
  const product = file === 'venetian.html' ? 'venetian' : file === 'insect-door.html' ? 'idd' : 'odd';
  const adapted = unifyProductNavigation(decorateQuietDetails(synced, product), product);
  if (!adapted.includes('href="../#/"') || !adapted.includes('../#/products/odd-insect-doors')) {
    throw new Error('Preview routes could not be validated in ' + file);
  }
  await writeFile(join(output, file), adapted, 'utf8');
  console.log('Prepared isolated viewer: ' + file);
}

// Vite has already copied Roller into public/viewers. Apply only the shared header.
const rollerPath = join(output, 'open-roller.html');
const roller = await readFile(rollerPath, 'utf8');
await writeFile(rollerPath, unifyProductNavigation(roller, 'roller'), 'utf8');
console.log('Prepared isolated viewer: open-roller.html');
