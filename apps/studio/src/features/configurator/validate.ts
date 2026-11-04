import type { ProductDefinition, Selection, ValidationResult } from './contracts';

/** Schema-level checks only. Production constraints must come from validated PCF/CAD. */
export function validateSelection(definition: ProductDefinition, input: Selection): ValidationResult {
  const issues: string[] = [];
  for (const option of definition.options) {
    const value = input[option.id];
    if ((value === undefined || value === null || value === '') && option.required) {
      issues.push(`${option.label} is required`);
      continue;
    }
    if (value === undefined || value === null || value === '') continue;
    if (option.kind === 'single-choice') {
      if (typeof value !== 'string' || !option.values?.some((choice) => choice.id === value)) {
        issues.push(`${option.label} has an invalid choice`);
      }
    } else if (option.kind === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        issues.push(`${option.label} must be a number`);
        continue;
      }
      if (option.min !== undefined && value < option.min) issues.push(`${option.label} is below the minimum`);
      if (option.max !== undefined && value > option.max) issues.push(`${option.label} exceeds the maximum`);
    } else if (option.kind === 'toggle' && typeof value !== 'boolean') {
      issues.push(`${option.label} must be on or off`);
    } else if (option.kind === 'text' && typeof value !== 'string') {
      issues.push(`${option.label} must be text`);
    }
  }
  return { ok: issues.length === 0, issues };
}
