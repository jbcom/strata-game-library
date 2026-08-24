import { describe, expect, it } from 'vitest';
import { selectRandomRegion } from '../utils';

describe('selectRandomRegion', () => {
  it('returns null without regions', () => {
    expect(selectRandomRegion([])).toBeNull();
  });

  it('uses the supplied gameplay-random source deterministically', () => {
    const regions = ['north', 'centre', 'south'] as const;

    expect(selectRandomRegion(regions, () => 0)).toBe('north');
    expect(selectRandomRegion(regions, () => 0.5)).toBe('centre');
    expect(selectRandomRegion(regions, () => 0.999)).toBe('south');
  });

  it('never selects past the last region when a source returns one', () => {
    expect(selectRandomRegion(['only'], () => 1)).toBe('only');
  });
});
