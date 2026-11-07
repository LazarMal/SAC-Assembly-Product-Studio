import { describe, expect, it } from 'vitest';
import { validateSelection } from './validate';
import { definition as odd } from '../../products/odd/definition';
import { definition as venetian } from '../../products/venetian/definition';

// Shape-only tests, not a substitute for production PCF rules.
describe('schema validator', () => {
  it('accepts a default Venetian configuration', () => {
    expect(validateSelection(venetian, venetian.defaultSelection).ok).toBe(true);
  });

  it('accepts a default ODD configuration', () => {
    expect(validateSelection(odd, odd.defaultSelection).ok).toBe(true);
  });

  it('rejects negative quantity and unknown frame color', () => {
    const result = validateSelection(odd, { ...odd.defaultSelection, quantity: -2, frameColor: 'not-real' });
    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(2);
  });
});
