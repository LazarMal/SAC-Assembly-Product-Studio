# Legacy baseline — 2026-11-04

## Snapshot and scope

- Production branch: \`main\`.
- Frozen starting commit: \`1b27c698dbe07812c785ff4173baa6f00d9d8d8d\`.
- Reference branch: \`snapshot/three-product-baseline-2026-11-04\`.
- Migration branch: \`refactor/modular-foundation\`.
- Live deployment: GitHub Pages, project path \`/SAC-Assembly-Product-Studio/\`; only \`main\` triggers the existing Pages deployment.
- The reference branch is a **snapshot by convention**, not technically immutable. Do not commit to it. The commit SHA is the durable reference even if somebody changes the branch.

## Current production structure

| File | Approx. uncompressed HTML | Purpose |
| --- | ---: | --- |
| \`index.html\` | 600 KB | Home, scroll storytelling, catalog |
| \`venetian.html\` | 204 KB | Venetian blind configurator |
| \`insect-door.html\` | 447 KB | IDD inside-opening pleated insect door |
| \`odd-door.html\` | 452 KB | ODD outside/on-face mounting pleated door |

All four pages contain embedded JavaScript and CSS and use embedded image data. There is no Node build, no server-side API, no checkout or authentication. Existing rendering is 2.5D/Canvas-based concept visualization, **not validated CAD**.

## Parity inventory before cutover

- Common: navigation between all four pages, readable configuration tabs, responsive desktop/mobile, Room/Studio/Neutral modes, fit/reset, zoom, assembly, exploded view, component inspection, configuration review/export.
- Home: scroll-driven Venetian animation; product catalog cards and cross-product navigation.
- Venetian: slat profile and finish, hardware color, controls, lifting, bidirectional tilt, decorative ladder tapes, side guides, mounted room view and component focus.
- IDD: Single/Double, widths, height/unit, colors, guide shape and finish, Magnet/Brush, pulling mesh, mount inside reveal, inspection, assembly/explode.
- ODD: IDD-like door mechanics plus **outside/face mounting frame**, Single/Double, PCF frame/guidance/extra choices, quantity, supplier and references.
- ODD data notes: supplier list is not yet confirmed; dimensions/limits are demo assumptions; validate against S.A.C. production information.
- Room alignment, mobile touch gestures, image framing and subtle component changes must be checked visually in both configurations, not by static text tests alone.

## Known risks

1. Repeated markup/styles and tightly coupled imperative scripts across HTML files.
2. Inline Base64 photography inflates parse and delivery cost and prevents separate image caching.
3. Configuration state, controls, rendering and animation timing are interleaved.
4. Canvas draw order and approximate mounting geometry may diverge from physical products.
5. File-per-product scaling is inconvenient at 15–25 products.
6. No automatic browser-level regression suite or measured performance budget.
7. Product data is not yet sourced from an authoritative, versioned PCF/CAD pipeline.

## Baseline guard

Run \`node scripts/audit-legacy.mjs\` on the migration branch to check document boundaries, links, viewport and inline JavaScript syntax. This is a minimal **static** gate only: it does not claim to validate animations, geometry, accessibility or performance. Add Playwright visual/interaction baselines before replacing a legacy route.
