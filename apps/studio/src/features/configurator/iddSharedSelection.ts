import type { DoorConfiguration } from '../viewer3d/createDoorViewer';
import { RAL_HEX } from '../../products/shared/ralColors';

export const IDD_STORAGE_KEY = 'sac-idd-shared-selection-v1';

export type IddUnit = 'mm' | 'cm' | 'm' | 'inch';
export type IddReferences = { reference1: string; reference2: string; reference3: string };
export interface SharedIddSelection extends DoorConfiguration {
  productId: 'idd';
  schemaVersion: 1;
  unit: IddUnit;
  openPercent: number;
  references: IddReferences;
}

const PER_PANEL_WIDTHS = [960, 1300, 1600, 1900] as const;
const RAL_KEYS = Object.keys(RAL_HEX);
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function choice<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.includes(value as T);
}
function refs(value: unknown): IddReferences {
  const r = record(value) ? value : {};
  const read = (key: keyof IddReferences) =>
    typeof r[key] === 'string' ? (r[key] as string).slice(0, 100) : '';
  return { reference1: read('reference1'), reference2: read('reference2'), reference3: read('reference3') };
}

/** A versioned, validated display snapshot; never a manufacturing specification. */
export function parseIddSelection(value: unknown): SharedIddSelection | null {
  if (!record(value) || value.productId !== 'idd' || value.schemaVersion !== 1) return null;
  if (!choice(value.variant, ['single', 'double'] as const)) return null;
  const divisor = value.variant === 'double' ? 2 : 1;
  if (typeof value.width !== 'number' ||
      !PER_PANEL_WIDTHS.includes(value.width / divisor as typeof PER_PANEL_WIDTHS[number])) return null;
  if (typeof value.height !== 'number' || !Number.isFinite(value.height) ||
      value.height < 1200 || value.height > 3000) return null;
  if (!choice(value.frameColor, RAL_KEYS)) return null;
  if (!choice(value.guideShape, ['straight', 'slope'] as const)) return null;
  if (!choice(value.guideFinish, ['grey', 'aluminium', 'black'] as const)) return null;
  if (!choice(value.extra, ['none', 'brush', 'magnet'] as const)) return null;
  if (!choice(value.stackSide, ['left', 'right'] as const)) return null;
  if (typeof value.openPercent !== 'number' || !Number.isFinite(value.openPercent) ||
      value.openPercent < 0 || value.openPercent > 100) return null;
  const unit = choice(value.unit, ['mm', 'cm', 'm', 'inch'] as const) ? value.unit : 'mm';
  return {
    productId: 'idd', schemaVersion: 1,
    variant: value.variant, width: value.width, height: value.height,
    frameColor: value.frameColor, guideShape: value.guideShape,
    guideFinish: value.guideFinish, extra: value.extra, stackSide: value.stackSide,
    openPercent: value.openPercent, unit, references: refs(value.references)
  };
}

export function readIddSelection(): SharedIddSelection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(IDD_STORAGE_KEY);
    return raw === null ? null : parseIddSelection(JSON.parse(raw));
  } catch { return null; }
}
export function writeIddSelection(selection: SharedIddSelection): boolean {
  const valid = parseIddSelection(selection);
  if (!valid || typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(IDD_STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch { return false; }
}
export function toDoorConfiguration(selection: SharedIddSelection): DoorConfiguration {
  const { variant, width, height, frameColor, guideShape, guideFinish, extra, stackSide } = selection;
  return { variant, width, height, frameColor, guideShape, guideFinish, extra, stackSide };
}
