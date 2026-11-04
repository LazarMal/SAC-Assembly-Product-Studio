import { describe, expect, it } from 'vitest';
import { parseIddSelection, toDoorConfiguration } from './iddSharedSelection';

const fixture = {
  schemaVersion: 1, productId: 'idd', variant: 'double', width: 2600, height: 2100,
  frameColor: 'RAL7016', guideShape: 'slope', guideFinish: 'aluminium',
  extra: 'magnet', stackSide: 'left', openPercent: 45, unit: 'mm',
  references: { reference1: 'ORDER-42', reference2: '', reference3: 'Client' }
};

describe('IDD shared configurator ↔ showroom contract', () => {
  it('keeps the total double width and other choices', () => {
    const saved = parseIddSelection(fixture);
    expect(saved).not.toBeNull();
    expect(saved?.width).toBe(2 * 1300);
    expect(saved?.references.reference1).toBe('ORDER-42');
    expect(saved && toDoorConfiguration(saved)).toMatchObject({
      variant: 'double', width: 2600, frameColor: 'RAL7016', extra: 'magnet'
    });
  });
  it('rejects double widths that are not a supported per-panel width', () => {
    expect(parseIddSelection({ ...fixture, width: 1300 })).toBeNull();
    expect(parseIddSelection({ ...fixture, width: 2500 })).toBeNull();
  });
  it('rejects invalid values or a different product/schema', () => {
    expect(parseIddSelection({ ...fixture, productId: 'odd' })).toBeNull();
    expect(parseIddSelection({ ...fixture, schemaVersion: 2 })).toBeNull();
    expect(parseIddSelection({ ...fixture, frameColor: 'unknown' })).toBeNull();
    expect(parseIddSelection({ ...fixture, openPercent: 101 })).toBeNull();
    expect(parseIddSelection({ ...fixture, height: Number.NaN })).toBeNull();
  });
  it('tolerates missing references and unit preference', () => {
    const { references, unit, ...withoutOptional } = fixture;
    expect(parseIddSelection(withoutOptional)).toMatchObject({
      unit: 'mm', references: { reference1: '', reference2: '', reference3: '' }
    });
    for (const frameColor of ['RAL7013', 'RAL7016', 'RAL7039', 'RAL9001', 'RAL9005', 'RAL9010', 'RAL9016']) {
      expect(parseIddSelection({ ...fixture, frameColor })?.frameColor).toBe(frameColor);
    }
  });
});
