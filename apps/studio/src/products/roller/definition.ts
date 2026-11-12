import type { ProductDefinition } from '../../features/configurator/contracts';

export const definition: ProductDefinition = {
  id: 'roller', schemaVersion: '0.2.0-concept', accuracy: 'concept',
  capabilities: { assembly: true, explodedView: true, componentInspection: true, roomView: true },
  defaultSelection: { fabric: 'sage', control: 'chain', side: 'right' },
  options: [
    { id: 'fabric', label: 'Sample fabric', kind: 'single-choice', values: [
      { id: 'sage', label: 'Sage' }, { id: 'linen', label: 'Linen' },
      { id: 'chalk', label: 'Chalk' }, { id: 'graphite', label: 'Graphite' }
    ] },
    { id: 'control', label: 'Control', kind: 'single-choice', values: [{ id: 'chain', label: 'Manual chain' }] },
    { id: 'side', label: 'Control side (preview)', kind: 'single-choice', values: [
      { id: 'right', label: 'Right' }, { id: 'left', label: 'Left' }
    ] }
  ]
};
