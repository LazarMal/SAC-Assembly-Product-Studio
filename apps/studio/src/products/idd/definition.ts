import type { ProductDefinition } from '../../features/configurator/contracts';
import { insectDoorOptions } from '../shared/insectDoorOptions';

export const definition: ProductDefinition = {
  id: 'idd',
  schemaVersion: '0.1.0-concept',
  accuracy: 'concept',
  capabilities: { assembly: true, explodedView: true, componentInspection: true, roomView: true },
  defaultSelection: {
    variant: 'single', width: 960, height: 2100, unit: 'mm', frameColor: 'RAL7016',
    guideShape: 'straight', guideFinish: 'aluminium', extra: 'none', stackSide: 'left'
  },
  options: [
    ...insectDoorOptions,
    { id: 'stackSide', label: 'Stack direction', kind: 'single-choice', values: [{ id: 'left', label: 'Left' }, { id: 'right', label: 'Right' }] }
  ]
};
