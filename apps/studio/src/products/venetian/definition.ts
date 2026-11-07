import type { ProductDefinition } from '../../features/configurator/contracts';

export const definition: ProductDefinition = {
  id: 'venetian',
  schemaVersion: '0.1.0-concept',
  accuracy: 'concept',
  capabilities: { assembly: true, explodedView: true, componentInspection: true, roomView: true },
  defaultSelection: {
    slatWidth: '25', slatFinish: 'ivory', hardwareFinish: 'graphite',
    control: 'chain', controlSide: 'right', mounting: 'wall', tapes: false, guides: false
  },
  options: [
    { id: 'slatWidth', label: 'Slat profile', kind: 'single-choice', values: [{ id: '25', label: '25 mm' }, { id: '35', label: '35 mm' }, { id: '50', label: '50 mm' }], required: true },
    { id: 'slatFinish', label: 'Slat finish', kind: 'single-choice', values: [
      { id: 'ivory', label: 'Warm ivory' }, { id: 'white', label: 'White' }, { id: 'silver', label: 'Silver' },
      { id: 'graphite', label: 'Graphite' }, { id: 'bronze', label: 'Bronze' }, { id: 'black', label: 'Black' }
    ], required: true },
    { id: 'hardwareFinish', label: 'Hardware', kind: 'single-choice', values: [
      { id: 'white', label: 'White' }, { id: 'silver', label: 'Silver' }, { id: 'graphite', label: 'Graphite' }
    ] },
    { id: 'control', label: 'Control type', kind: 'single-choice', values: [{ id: 'chain', label: 'Chain' }, { id: 'wand', label: 'Wand' }] },
    { id: 'controlSide', label: 'Control side', kind: 'single-choice', values: [{ id: 'left', label: 'Left' }, { id: 'right', label: 'Right' }] },
    { id: 'mounting', label: 'Mounting', kind: 'single-choice', values: [{ id: 'wall', label: 'Wall' }, { id: 'ceiling', label: 'Ceiling' }] },
    { id: 'tapes', label: 'Decorative ladder tapes', kind: 'toggle' },
    { id: 'guides', label: 'Side guides', kind: 'toggle' }
  ]
};
