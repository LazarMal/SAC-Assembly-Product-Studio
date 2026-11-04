# Working locally and contributing

## Today (legacy static app)

\`\`\`sh
git clone https://github.com/LazarMal/SAC-Assembly-Product-Studio.git
cd SAC-Assembly-Product-Studio
git switch refactor/modular-foundation
python -m http.server 5500
# visit http://localhost:5500
\`\`\`

Windows alternative: \`py -m http.server 5500\`. The current app needs no \`npm install\`.

Run the read-only baseline guard:

\`\`\`sh
node scripts/audit-legacy.mjs
\`\`\`

Node 20+ recommended for local checks. This script requires no npm dependencies.

## Working rules

- Do not directly edit \`snapshot/three-product-baseline-2026-11-04\` or move the reference SHA.
- Do not commit to \`main\` for unreviewed refactors. Develop on a feature branch, open a draft PR, verify CI/browser tests.
- No generated massive one-file HTML for new product pages. New product integrations use typed modules after Phase 2.
- Avoid generic decorative labels/lines/dots; keep user-approved restrained, warm visual styling.
- Follow naming: stable lowercase kebab-case paths for assets/routes; PascalCase React components, camelCase functions, semantic IDs.
- Comments explain non-obvious physical/geometric decisions, not obvious language syntax.
- Before editing scene logic, document coordinate system, exact opening/parent transform, pivot points, and expected min/max zoom.

## Running the future modular app

Commands will be documented here **after** Phase 2 installs its real package manager/build files. Do not run imaginary \`npm\` scripts in the current branch.
