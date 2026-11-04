import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewriteLegacyNavigation } from './scripts/legacy-navigation.mjs';
import { decorateIddLegacyPreview } from './scripts/idd-legacy-sync.mjs';

const currentDir = dirname(fileURLToPath(import.meta.url));
const legacyRoot = resolve(currentDir, '../..');
const legacyNames = new Set(['venetian.html', 'insect-door.html', 'odd-door.html']);

// Development-only bridge: keep the unchanged legacy interactive viewers accessible
// while migrating each one to a typed module. Build output never includes legacy HTML.
function legacyPreviewBridge(): Plugin {
  return {
    name: 'legacy-preview-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const name = (request.url ?? '').split('?')[0]?.replace(/^\//, '');
        if (!name || !legacyNames.has(name)) return next();
        try {
          const content = readFileSync(resolve(legacyRoot, name), 'utf8');
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          const rewritten = rewriteLegacyNavigation(content, '/#/');
          response.end(name === 'insect-door.html' ? decorateIddLegacyPreview(rewritten) : rewritten);
        } catch {
          response.statusCode = 404;
          response.end(`Legacy preview unavailable: ${name}`);
        }
      });
    }
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), legacyPreviewBridge()],
  base: command === 'serve' ? '/' : '/SAC-Assembly-Product-Studio/studio/',
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: true, target: 'es2022' }
}));
