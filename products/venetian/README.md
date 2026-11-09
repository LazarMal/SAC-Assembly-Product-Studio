# Venetian V3

Approved visual model release. Neutral and Studio use the Three.js model; Living room preserves the existing photo-registered renderer.

From this directory: npm ci, npm test, npm run build. The build updates root venetian.html; the existing GitHub Pages workflow publishes it.

src/model.js owns geometry/materials; src/kinematics.js owns movement; src/catalog-adapter.js connects rendering and feedback to existing controls. baseline/venetian.html preserves the original UI and room implementation.

V3 corrects surface/end-cap normal averaging, reduces reflections and adds brief component/profile indicators. Reference-led visualization, not manufacturing CAD. Dimensions and internal mechanism details require S.A.C. confirmation. Five geometry tests passed; browser checks used the software renderer. WebGL appearance remains device-dependent.
