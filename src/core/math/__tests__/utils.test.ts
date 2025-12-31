import { describe, expect, it } from 'vitest';
import { smootherstep, smoothstep } from '../utils';

describe('math/utils security', () => {
    it('smoothstep handles zero range (division by zero prevention)', () => {
        const edge = 5;

        // When edge0 === edge1
        // If x < edge, expect 0
        expect(smoothstep(edge, edge, edge - 1)).toBe(0);

        // If x > edge, expect 1
        expect(smoothstep(edge, edge, edge + 1)).toBe(1);

        // If x === edge (The NaN case)
        const result = smoothstep(edge, edge, edge);
        expect(result).not.toBeNaN();
        // Typically when edges are equal, step(edge, x) returns 1 if x >= edge.
    });

    it('smootherstep handles zero range (division by zero prevention)', () => {
        const edge = 10;

        expect(smootherstep(edge, edge, edge - 1)).toBe(0);
        expect(smootherstep(edge, edge, edge + 1)).toBe(1);

        const result = smootherstep(edge, edge, edge);
        expect(result).not.toBeNaN();
    });
});
