# Product contract and source-data rules

Version 0: architectural specification, not yet a published TypeScript package.

## Separate three concerns

1. **Catalog metadata**: stable \`id\`, slug, names, cover media, product family, summary; available before the viewer bundle loads.
2. **Configuration schema and business rules**: typed option IDs and labels, defaults, dependencies, mutually exclusive choices, dimensions with units, valid combinations, normalized selection and export; authoritative provenance.
3. **Scene description**: GLB/geometry assets, material slots, anchors, inspectable component IDs, mounting transformations, animation tracks/capabilities and fallbacks.

Do not use display labels or RAL names as implicit IDs; e.g. \`guide.shape = "slope"\`, \`guide.finish = "aluminium"\` are independent fields. Keep configuration units normalized internally (millimeters), with UI conversions at the boundary.

## Proposed TypeScript concepts

\`\`\`ts
type ProductId = "venetian" | "idd" | "odd" | string;
type ProductVersion = string;
type ComponentId = string;
type ViewMode = "neutral" | "studio" | "room";
type Unit = "mm" | "cm" | "m" | "inch";
type Selection = Record<string, string | number | boolean | null>;

interface CatalogProduct {
  id: ProductId;
  slug: string;
  name: string;
  family: string;
  cover: { src: string; width: number; height: number; alt: string };
}

interface ProductDefinition {
  id: ProductId;
  schemaVersion: ProductVersion;
  defaultSelection: Selection;
  capabilities: {
    assembly: boolean;
    explodedView: boolean;
    componentInspection: boolean;
    roomView: boolean;
  };
  validate(selection: Selection): { ok: boolean; issues: string[] };
}

interface ViewerAdapter {
  setConfiguration(selection: Readonly<Selection>): void;
  setView(mode: ViewMode): void;
  focusPart(part: ComponentId): void;
  setExploded(active: boolean): void;
  playAssembly(): Promise<void>;
  fit(): void;
  dispose(): void;
}
\`\`\`

An immutable or versioned configuration object must include \`productId\`, \`schemaVersion\`, \`selection\`, optional \`sourceRevision\` and a timestamp on export. Migrations should preserve old exports by version-aware parsing.

## Product-specific notes

- Venetian: slat size/color, hardware finish, mounting, lift and bidirectional tilt, chain/wand controls, tapes/guides.
- IDD: Single/Double, left/right stack, pleated mesh travel, inside-opening mount, frame/guide/extra choices.
- ODD: Single/Double, outside/on-face mounting and mitred surround (verify exact sections); extra PCF fields for supplier, quantity and references.
- PCF data currently captured from screenshots is a **demonstration**, not a signed-off production schema. Ask for original files and confirmed size rules/parts before manufacturing or price calculations.
- For each product store provenance for measured dimensions, color swatches, real material names, optional parts, and approvals. Mark illustrative assumptions.

## 3D asset contract

- \`GLB\` units and coordinate systems must be explicitly documented (default: meters, +Y up).
- Stable semantic mesh/component IDs for \`headrail\`, \`bottomRail\`, \`frameLeft\`, \`meshLeft\`, \`controlChain\`, etc. as applicable; no random generated names used as APIs.
- Mechanical parent/child hierarchy: moving strips/frames share valid pivots and anchors; mounted models bind to a measured opening.
- Model source (STEP/DXF/Blender), dimensions, material samples, texture source and rights/license recorded alongside exports.
- Distinguish modeled accuracy levels: concept, dimension-validated, and engineering-validated. Current viewers are concept-level.
