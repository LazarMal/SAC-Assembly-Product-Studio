# ADR 0001 — Hybrid modular product configurator

**Date:** 2026-11-04
**Status:** Accepted as a target architecture; implementation pending

## Context

The original site has one HTML/Canvas implementation per product. A planned catalog of 10–25 products needs shared UX, an accessible maintainable codebase, fast initial load and future CAD-calibrated realistic presentation.

## Decision

Adopt React, TypeScript, Vite, an explicit product definition/validation contract, independent adapters for Canvas and Three.js/React Three Fiber, and lazy-loaded per-product assets. Separate source geometry and source-of-truth PCF/CAD documents from web delivery artifacts.

Keep existing Canvas pages unchanged as the reference until modular parity is demonstrated. Accept both polished 2.5D fallback and physically measured GLB visualizations under the same UI.

## Consequences

Positive: consistent UI, independent modules, improved maintainability, lazy initial transfer, 3D upgrade path, cleaner tests.

Costs: migration labor, adapter complexity, extra testing, 3D asset preparation and performance validation. It does **not** make illustrative models engineering-accurate by itself.

## Rejected alternatives

- Keep appending a new large HTML file for each product.
- Rewrite all products simultaneously without rollback.
- Load all 3D scenes/models on the catalog homepage.
- Adopt a backend/commerce stack before any requirement exists.
