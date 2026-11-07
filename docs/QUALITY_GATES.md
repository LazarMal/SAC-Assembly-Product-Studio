# Engineering quality gates

## Every pull request

- Type checks, formatter and lint once modular TypeScript is introduced.
- No broken product routes, responsive viewport or syntax errors in legacy pages.
- Review whether functionality and keyboard/touch controls have changed.
- Avoid large inline Base64 media in new code.
- All new fields must have a stable product/schema identifier and documented default.
- Assembly/inspection should expose an explicit visual effect; no misleading decorative highlight detached from the actual component.
- Verify reduced-motion behavior.

## Required browser smoke scenarios (automate in Playwright)

1. From catalog navigate to Venetian, IDD, ODD and back; verify direct page opening.
2. Neutral, Studio, Room tabs and Fit; desktop mouse and mobile touch.
3. Assembly replays in Neutral/Studio without unexpected mode switching.
4. Exploded View separates all relevant groups and reassembles cleanly.
5. Each Components selection highlights **the matching part**, not an arbitrary area.
6. Venetian tilt negative and positive extremes; slats visually close and reopening works.
7. IDD/ODD Single and Double; mesh movement; guide shape/finish; Brush and Magnet feedback.
8. Room minimum zoom never reveals black edges or shifts model away from window/door.
9. Export/review includes expected product configuration; no accidental order/checkout actions.
10. 360, 390, 768, 1440 and 1920 CSS px; no clipping/overlap or horizontal overflow.
11. Keyboard navigation, focus visibility, sensible labels/contrast, reduced-motion behavior.
12. No browser console errors in tested flows.

## Quality and performance metrics

- Track actual LCP, INP, CLS, total network transfer, JS compile/execute cost, frame pacing, peak GPU/JS memory.
- Test throttled mid-range mobile, not only high-end desktop.
- Product assets and runtime load on demand; benchmark initial catalog and individual product separately.
- Proposed budgets are hypotheses until we have baseline measured traces.
- A static audit passing is not evidence of visual/CAD/physics correctness.

## Deployment safety

- \`main\` runs live Pages deployment.
- \`refactor/modular-foundation\` cannot deploy to production until approved and merged.
- Use draft PRs and code reviews. Keep explicit rollback target pinned to baseline SHA.
