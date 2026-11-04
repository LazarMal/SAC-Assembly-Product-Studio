# Architecture target — S.A.C. Assembly Product Studio

Status: **proposed and documented in Phase 1; not yet implemented**.

## Guiding decisions

- A site with 3 or 25 products must load **catalog metadata first**, never every product engine/3D asset up front.
- All product pages share one UI and configuration contract. Domain-specific geometry and animations remain in product adapters.
- Build with **React + TypeScript + Vite** for the static site. Use **React Three Fiber / Three.js** for next-generation GLB models, not a forced all-at-once rewrite of working 2.5D viewers.
- One product = typed definition + rules + lazy-loaded viewer + material/asset manifest + tests. No new independently styled monolithic HTML page.
- Browser-first, accessible controls; camera interactions must preserve usable scroll and reduced-motion preference.
- Initially deploy a static build on GitHub Pages with \`base: '/SAC-Assembly-Product-Studio/'\`. Use hash-based client routes or a proven history fallback for GitHub Pages; preserve old \`.html\` bookmarks until redirects are verified.
- No backend, authentication, pricing engine, or CMS until justified by an actual requirement. Product data is versioned and read-only in the first iteration.

## Proposed folder layout (Phase 2+)

\`\`\`
src/
  app/                  # boot, providers, router and route-level lazy loading
  pages/                # home, catalog, product detail and not-found
  design-system/        # typography, tokens, primitives, responsive behavior
  features/
    catalog/            # filters, cards, metadata, lazy thumbnails
    configurator/       # schema-driven form, rules, state, export/review
    product-viewer/     # interface and Canvas/Three.js viewer adapters
    assembly/           # normalized animation timeline/inspection controls
  products/
    venetian/           # product definition, option rules and scene adapter
    idd/
    odd/
  shared/               # shared types, errors, units, geometry helpers, i18n
public/assets/
  images/               # AVIF/WebP posters, previews, measured room photos
  models/               # web-optimized GLB + separate source metadata
docs/
tests/
\`\`\`

## Boundaries

- UI may call \`ConfiguratorStore\` and the \`ViewerAdapter\` interface, **not** mutate a renderer's private objects.
- Product definitions may reference assets, capabilities, validation and bill-of-material codes; no DOM manipulation, fetch side effects or layout CSS.
- Viewer adapters accept normalized configuration snapshots and expose \`fit\`, \`focusPart\`, \`playAssembly\`, \`setExploded\`, \`dispose\`; they do not own cart/pricing or PCF parsing.
- PCF imports must go through a separate validated adapter; untrusted Excel/PCF field labels are not directly used as stable IDs.
- A feature/capability flag controls whether a product supports slat tilt, mesh opening, optional mounting, exploded view, etc. Do not invent unavailable options to fill a generic panel.
- Preserve the existing legacy HTML during migration as a rollback reference.

## Rendering and performance

- Catalog: static responsive poster thumbnails; route/component split; no off-screen WebGL contexts.
- Detail: initial poster and loading state, then import that product's JS/GLB only; preload on deliberate hover/focus only when appropriate.
- 3D: meter-based coordinate convention; correct parent transforms, physically based materials, clear object hierarchy; GLB/glTF with tested mesh/texture compression and progressive quality choices.
- Mobile: cap DPR, pause/dispose offscreen scenes, support touch, use lower detail where appropriate, monitor memory.
- Room view: photo/camera and mounted product must share a calibrated coordinate transform; no background gaps at minimum zoom.
- Prefer AVIF/WebP for photographs, caching and dimension-correct \`srcset\`; do not inline large imagery as Base64 in app bundles.
- Initial **targets**, not guarantees: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 on representative field/mobile data. Establish measured budgets for each GLB before migrating a product.

## Evolution plan

1. Snapshot baseline and specify contracts.
2. Introduce a Vite/TypeScript skeleton on migration branch, build and test it independently; do not replace working production URLs.
3. Implement shared design system, routing and catalog with fixtures and verified snapshots.
4. Migrate one product (start with IDD or Venetian), match behavior, then IDD/ODD as adapters, preserving actual differences in mounting.
5. Introduce verified CAD/GLB assets when available; compare materials, dimensions, mechanisms.
6. Ship to staging/preview, run regressions and performance checks, review, then merge to \`main\`.

## Out of scope now

Do **not** claim production CAD fidelity, real-time pricing, authoritative SKU generation, or BlindMatrix order submission. Those require a separate verified data and integration contract.
