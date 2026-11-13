import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { decorateIddLegacyPreview } from './idd-legacy-sync.mjs';
import { decorateQuietDetails } from './quiet-details.mjs';
import { rewriteLegacyNavigation } from './legacy-navigation.mjs';

for(const [file,product] of [['venetian.html','venetian'],['insect-door.html','idd'],['odd-door.html','odd']]){
 test(product+' uses one inline detail status and preserves source HTML',()=>{
  const original=readFileSync(resolve(process.cwd(),'../../'+file),'utf8');
  const adapted=decorateQuietDetails(
    file==='insect-door.html'?
      decorateIddLegacyPreview(rewriteLegacyNavigation(original,'../#/')):
      rewriteLegacyNavigation(original,'../#/'),product
  );
  expect(adapted).toContain('id="sac-quiet-details-style"');
  expect(adapted).toContain("sacQuietDock.className='sac-quiet-dock'");
  expect(adapted).toContain('clearTimeout(sacQuietDebounce)');
  expect(adapted).toContain('sacQuietButton.addEventListener');
  expect(adapted).not.toContain("sacCard.className='sac-detail-card'");
  expect(original).not.toContain('sac-quiet-details-style');
  // All inline script blocks must remain syntactically valid.
  for(const match of adapted.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
    expect(()=>new Script(match[1])).not.toThrow();
  }
 });
}
test('unrecognised products fail safely',()=>{
 expect(()=>decorateQuietDetails('<html></html>','other')).toThrow(/Unsupported preview product/);
});
test('missing expected markup fails at build time',()=>{
 expect(()=>decorateQuietDetails('<html><head></head><body></body></html>','idd')).toThrow(/anchor unavailable/);
});
