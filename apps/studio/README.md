# S.A.C. Product Studio — modular shell

This is **Phase 2 of an incremental migration**, not a rewrite of the production website. The legacy catalog and three configurators at the repository root stay intact. The new app lives independently under `apps/studio/` and provides a working React/TypeScript catalog and product pages with links to the unchanged interactive legacy viewers.

## Requirements

- Node.js 22.12+ (Vite 7 requires Node 20.19+ or 22.12+)
- npm

## Run locally

From the repository root:

```bash
cd apps/studio
npm install
npm run dev
```

Open the local URL printed by Vite. The local dev middleware also serves `/venetian.html`, `/insect-door.html`, `/odd-door.html` from the repository root so clicking **Open interactive configurator** works.

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Production preview builds use the GitHub Pages project base path `/SAC-Assembly-Product-Studio/studio/`, but the app is **not yet deployed to production**. Never change `main` or the existing Pages workflow as part of Phase 2.

## Design principles

- Registry in `src/features/catalog/catalog.ts` contains **metadata only**.
- Detailed product definitions in `src/products/*/definition.ts` are **dynamically imported** on the product route.
- `ProductDefinition` and `ViewerAdapter` are explicit contracts. The new viewer engine is intentionally not implemented in Phase 2; legacy viewers remain in use.
- PCF dimension limits and physical geometry are **illustrative pending approval**; do not use any data in this shell for manufacturing or billing.
- Reusable CSS variables/layout components are under `src/styles/` and `src/components/`.
- Product images are separately cacheable optimized WebP assets in `public/assets/`. No large inline Base64 images in new JS.
- Hash-based navigation is compatible with GitHub Pages (no server-side history rewrite).

## Navigation and URLs

Vite dev routes: `/#/`, `/#/collection`, `/#/products/odd-insect-doors`.

When eventually published at `https://lazarmal.github.io/SAC-Assembly-Product-Studio/studio/`, the `legacyViewerUrl` helper links up one directory to the existing unchanged standalone pages. Confirm every deep link before release.

## Next migration step

1. Add automated Playwright interaction/visual baselines to the root project.
2. Replace one product route using `ViewerAdapter`, initially adapting its existing Canvas renderer, not a simultaneous rewrite of all three.
3. Integrate CAD-calibrated GLB assets as verified samples arrive.

Avoid premature commerce, CRM, pricing, or BlindMatrix API design without approved requirements.
