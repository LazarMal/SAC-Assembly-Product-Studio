import type { ProductId } from '../catalog/types';

export type Unit = 'mm' | 'cm' | 'm' | 'inch';
export type ViewMode = 'neutral' | 'studio' | 'room';
export type OptionValue = string | number | boolean | null;
export type Selection = Record<string, OptionValue>;
export type ComponentId = string;
export type ProductAccuracy = 'concept' | 'dimension-validated' | 'engineering-validated';

export type OptionDefinition = {
  id: string;
  label: string;
  kind: 'single-choice' | 'number' | 'toggle' | 'text';
  values?: readonly { id: string; label: string }[];
  unit?: Unit;
  min?: number;
  max?: number;
  required?: boolean;
};

export interface ProductDefinition {
  id: ProductId;
  schemaVersion: string;
  accuracy: ProductAccuracy;
  defaultSelection: Selection;
  options: readonly OptionDefinition[];
  capabilities: {
    assembly: boolean;
    explodedView: boolean;
    componentInspection: boolean;
    roomView: boolean;
  };
}

export interface ValidationResult {
  ok: boolean;
  issues: readonly string[];
}
