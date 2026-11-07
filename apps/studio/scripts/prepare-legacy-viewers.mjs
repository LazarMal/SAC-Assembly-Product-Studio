import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';

/** Node script for Pages build: <production directory> <preview directory>. */
const [, , productionDir, previewDir] = process.argv;
if (!productionDir || !previewDir) throw new Error('Provide production and preview directories');
const output = join(previewDir, 'viewers');
await mkdir(output, { recursive: true });
for (const file of ['venetian.html', 'insect-door.html', 'odd-door.html']) {
  const original = await readFile(join(productionDir, file), 'utf8');
  const adapted = rewriteLegacyNavigation(original, '../#/');
  if (!adapted.includes('href="../#/"') || !adapted.includes('../#/products/odd-insect-doors')) {
    throw new Error('Preview routes could not be validated in ' + file);
  }
  await writeFile(join(output, file), adapted, 'utf8');
  console.log('Prepared isolated viewer: ' + file);
}
