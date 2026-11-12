# S.A.C. Open roller blind — review model
Open Collection → Open roller blind → Configure product in Product Studio. The viewer and GLB are independent of external services. The GLB contains the assembled review pose in metres. The HTML supports orbit, zoom, drop, sample colours, component inspection, exploded state and assembly.
 
## Rebuild
Node 22+. Run npm ci, npm test, npm run build (writes apps/studio/public/viewers/open-roller.html), and optionally node export.mjs. Geometry and millimetre assumptions are in src/model.js. The framework-independent geometry factory returns a Three.js group and a pose controller. The package runs independently of the production catalog.

## Evidence and limits
The bracket-and-chain installation and assembly videos support the forked side plate, perforated mounting flange, removable cap, retaining slide, split drive insert and looped bead chain. Their exterior proportions are estimated from perspective views. The supplied technical illustrations have no dimension callouts. The separate long profile and small fixing plate were not identified on this assembly and were excluded pending BOM confirmation. Tube bore, wall, retainers, idle end, bottom bar, fabric thickness, colours and default 780 mm roller span are review assumptions. The 25 mm nominal tube is provisional. Assembly animation is for component inspection, not a fitting guide. Verify finished bracket spacing, tube cross-section, clutch insertion length, idle end and hem-bar sections against dimensioned drawings or a measured sample before treating this as manufacturing geometry.
