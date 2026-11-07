# Incremental migration plan

## Phase 1 — foundation and baseline (current)

- [x] Record exact production commit and create a separate baseline branch.
- [x] Create and confirm a non-production migration branch.
- [x] Audit current four HTML entrypoints and identify duplicated layers.
- [x] Document target architecture, product data contract, and hybrid asset strategy.
- [x] Add initial no-dependency static legacy check and CI for migration PRs.
- [ ] Capture automated baseline screenshots and complete browser-level interactions for every product. **Phase 1 acceptance depends on this remaining item.**
- [ ] Confirm production rules and component photographs/drawings with S.A.C. before marking geometry accurate.

## Phase 2 — independent modular shell

- Introduce Vite + React + TypeScript and shared design tokens/accessible components.
- Separate catalog metadata from runtime product code; add route-level lazy imports.
- Add code formatting, lint/type checks, unit test framework and strict PR CI.
- Preserve old HTML routes as-is until new equivalents pass acceptance. No production deployment.

## Phase 3 — product-by-product parity

- Build viewer adapter for Canvas reference model, then optional Three.js/GLB upgrade.
- Migrate a single product and compare every option, mobile view, room anchoring, assembly/explode and exported configuration.
- Migrate the other products only after parity; avoid forcing different products into one unphysical geometry abstraction.
- Test direct deep links and GitHub Pages base path.

## Phase 4 — physical and performance accuracy

- Use CAD/real pictures/material samples supplied with rights; calibrate frames and scale.
- Keep glTF + optimized textures out of initial bundle; dynamic import per product.
- Monitor performance per device/network class and fix actual bottlenecks.

## Phase 5 — staged release and rollback

- Staging preview + review checklist, merge only after tests and product approval.
- Tag approved production version when Git tag tooling is available; keep snapshot branch/commit as fallback.
- Deploy via GitHub Actions on \`main\`; rollback to pinned commit if regression.

## Explicit non-goals

No CMS/backend/purchases/pricing/production-order automation in this refactor. No unrelated style overhaul; preserve the agreed premium visual language.
