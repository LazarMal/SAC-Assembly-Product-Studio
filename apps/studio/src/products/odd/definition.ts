import type { ProductDefinition } from '../../features/configurator/contracts';
import { insectDoorOptions } from '../shared/insectDoorOptions';

/** ODD sits on the outside/on-face mounting surround, unlike IDD in-reveal mounting. */
export const definition: ProductDefinition = {
  id: 'odd',
  schemaVersion: '0.1.0-concept',
  accuracy: 'concept',
  capabilities: { assembly: true, explodedView: true, componentInspection: true, roomView: true },
  defaultSelection: {
    variant: 'single', width: 960, height: 2100, unit: 'mm', frameColor: 'RAL7016',
    guideShape: 'straight', guideFinish: 'aluminium', extra: 'none', quantity: 1,
    supplier: '', reference1: '', reference2: '', reference3: ''
  },
  options: [
    ...insectDoorOptions,
    { id: 'quantity', label: 'Quantity', kind: 'number', min: 1 },
    { id: 'supplier', label: 'Supplier (unconfirmed)', kind: 'text' },
    { id: 'reference1', label: 'ERP reference', kind: 'text' },
    { id: 'reference2', label: 'Shipping reference', kind: 'text' },
    { id: 'reference3', label: 'Internal reference', kind: 'text' }
  ]
};
