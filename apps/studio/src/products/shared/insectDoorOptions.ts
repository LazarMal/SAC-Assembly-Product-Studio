import type { OptionDefinition } from '../../features/configurator/contracts';

/** Shared PCF-inspired choices. Production ranges and sourcing still need approval. */
export const insectDoorOptions: readonly OptionDefinition[] = [
  { id: 'variant', label: 'Door system', kind: 'single-choice', values: [{ id: 'single', label: 'Single' }, { id: 'double', label: 'Double' }], required: true },
  { id: 'width', label: 'Width', kind: 'number', unit: 'mm', min: 1, required: true },
  { id: 'height', label: 'Height', kind: 'number', unit: 'mm', min: 1, required: true },
  { id: 'unit', label: 'Display unit', kind: 'single-choice', values: ['mm', 'cm', 'm', 'inch'].map((unit) => ({ id: unit, label: unit })) },
  { id: 'frameColor', label: 'Frame RAL finish', kind: 'single-choice', required: true, values: [
    'RAL7013', 'RAL7016', 'RAL7039', 'RAL9001', 'RAL9005', 'RAL9010', 'RAL9016'
  ].map((ral) => ({ id: ral, label: ral })) },
  { id: 'guideShape', label: 'Guide shape', kind: 'single-choice', values: [{ id: 'straight', label: 'Straight' }, { id: 'slope', label: 'Slope' }] },
  { id: 'guideFinish', label: 'Guide finish', kind: 'single-choice', values: [{ id: 'grey', label: 'Grey' }, { id: 'aluminium', label: 'Aluminium' }, { id: 'black', label: 'Black' }] },
  { id: 'extra', label: 'Edge finish', kind: 'single-choice', values: [{ id: 'none', label: 'None' }, { id: 'brush', label: 'Brush' }, { id: 'magnet', label: 'Magnet' }] }
];
