/**
 * tests/filter-resolution-fix.test.ts — the pixijs/pixijs#11467 workaround
 * (bioluminescent-sea's Filter.defaultOptions.resolution = 'inherit').
 */

import { describe, expect, it, vi } from 'vitest';
import { pixiMock } from './_pixi-mock';

vi.mock('pixi.js', () => pixiMock());

import { Filter } from 'pixi.js';
import { applyFilterResolutionFix } from '../src/index';

describe('applyFilterResolutionFix', () => {
  it("sets Filter.defaultOptions.resolution to 'inherit'", () => {
    const filter = Filter as unknown as { defaultOptions: { resolution: number | string } };
    expect(filter.defaultOptions.resolution).toBe(1);
    applyFilterResolutionFix();
    expect(filter.defaultOptions.resolution).toBe('inherit');
    // Idempotent by nature — calling again keeps the fix in place.
    applyFilterResolutionFix();
    expect(filter.defaultOptions.resolution).toBe('inherit');
  });
});
