# Contributing to S.A.C. Product Studio

Read \`docs/ARCHITECTURE.md\`, \`docs/BASELINE.md\` and \`docs/QUALITY_GATES.md\` first.

- **Production:** \`main\` deploys automatically to GitHub Pages.
- **Frozen reference:** \`snapshot/three-product-baseline-2026-11-04\`; do not edit.
- **Migration:** \`refactor/modular-foundation\`; work through a draft PR.
- Run \`node scripts/audit-legacy.mjs\` until the original HTML entrypoints are fully replaced.
- Changes to models/options must preserve product distinction and mark unverified data.
- Changes to shared controls must work on desktop/mobile and preserve accessible interactions.
- Keep new assets separate; lazy-load them by product. Avoid embedding large Base64 images in JavaScript.
- No production merge before browser regression, performance and rollback checks pass.

See \`docs/DEVELOPMENT.md\` for the current local setup.
