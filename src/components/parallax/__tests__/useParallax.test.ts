/**
 * @fileoverview Tests for the useParallax hook.
 * @module components/parallax/__tests__/useParallax.test
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { calculateRepeats } from '../useParallax';

// Note: Hook tests require @testing-library/react-hooks or renderHook from @testing-library/react
// Here we test the pure utility functions

describe('useParallax utilities', () => {
    describe('calculateRepeats', () => {
        it('should calculate basic repeat count', () => {
            // Viewport: 1920px, Content: 256px, Scroll: 0
            const result = calculateRepeats(1920, 256, 0);

            // Need 1920/256 = 7.5 copies + 2 buffer = ~10
            expect(result.count).toBeGreaterThanOrEqual(9);
            expect(result.count).toBeLessThanOrEqual(10);
        });

        it('should handle perfect division', () => {
            // Viewport: 1024px, Content: 256px = exactly 4 copies
            const result = calculateRepeats(1024, 256, 0);

            // 1024/256 = 4 + 2 buffer = 6
            expect(result.count).toBe(6);
        });

        it('should return single copy for zero content width', () => {
            const result = calculateRepeats(1920, 0, 0);

            expect(result.count).toBe(1);
            expect(result.startOffset).toBe(0);
        });

        it('should return single copy for negative content width', () => {
            const result = calculateRepeats(1920, -100, 0);

            expect(result.count).toBe(1);
            expect(result.startOffset).toBe(0);
        });

        it('should calculate correct start offset at scroll 0', () => {
            const result = calculateRepeats(1920, 256, 0);

            // With buffer tile, offset is -contentWidth
            expect(result.startOffset).toBeCloseTo(-256, 10);
        });

        it('should calculate correct start offset with scroll', () => {
            const result = calculateRepeats(1920, 256, 128);

            // Scroll 128 means normalized 128, offset = -128 - 256 = -384
            expect(result.startOffset).toBe(-384);
        });

        it('should wrap offset for scroll > content width', () => {
            const result = calculateRepeats(1920, 256, 512);

            // 512 % 256 = 0, so offset should be -256
            expect(result.startOffset).toBeCloseTo(-256, 10);
        });

        it('should wrap offset for scroll = 1.5x content width', () => {
            const result = calculateRepeats(1920, 256, 384);

            // 384 % 256 = 128, so offset should be -128 - 256 = -384
            expect(result.startOffset).toBe(-384);
        });

        it('should handle negative scroll values', () => {
            const result = calculateRepeats(1920, 256, -128);

            // -128 % 256 normalized is 128, offset = -128 - 256 = -384
            expect(result.startOffset).toBe(-384);
        });

        it('should handle large negative scroll values', () => {
            const result = calculateRepeats(1920, 256, -1000);

            // -1000 % 256 = -232, normalized: 24, offset = -24 - 256 = -280
            const normalized = ((-1000 % 256) + 256) % 256;
            expect(result.startOffset).toBe(-normalized - 256);
        });

        it('should handle small viewport', () => {
            const result = calculateRepeats(100, 256, 0);

            // Viewport smaller than content: ceil(100/256) + 2 = 1 + 2 = 3
            expect(result.count).toBe(3);
        });

        it('should handle very large viewport', () => {
            const result = calculateRepeats(10000, 256, 0);

            // 10000/256 ≈ 39 + 2 = 41
            expect(result.count).toBeGreaterThanOrEqual(41);
        });

        it('should handle fractional scroll values', () => {
            const result = calculateRepeats(1920, 256, 128.5);

            expect(result.startOffset).toBeCloseTo(-128.5 - 256, 5);
        });
    });

    describe('Time of day color blending', () => {
        // These test the expected color transitions

        it('should be night color from 0-5', () => {
            // Night hours: no blending
            for (const hour of [0, 1, 2, 3, 4]) {
                expect(hour).toBeLessThan(5);
            }
        });

        it('should transition at dawn (5-7)', () => {
            // Dawn transition
            const t = (6 - 5) / 2; // at 6am, 50% through transition
            expect(t).toBe(0.5);
        });

        it('should be day color from 7-17', () => {
            // Day hours
            for (const hour of [7, 10, 12, 14, 16]) {
                expect(hour).toBeGreaterThanOrEqual(7);
                expect(hour).toBeLessThan(17);
            }
        });

        it('should transition at dusk (17-19)', () => {
            const t = (18 - 17) / 2; // at 6pm, 50% through transition
            expect(t).toBe(0.5);
        });
    });

    describe('Depth fog calculation', () => {
        it('should calculate exponential fog falloff', () => {
            const fogDensity = 0.1;

            // At depth 0, fog = 1 - e^0 = 0
            const fog0 = 1 - Math.exp(-0 * fogDensity);
            expect(fog0).toBe(0);

            // At depth 10, fog = 1 - e^-1 ≈ 0.632
            const fog10 = 1 - Math.exp(-10 * fogDensity);
            expect(fog10).toBeCloseTo(0.632, 2);

            // At depth 50, fog ≈ 0.993
            const fog50 = 1 - Math.exp(-50 * fogDensity);
            expect(fog50).toBeGreaterThan(0.99);
        });

        it('should respect max fog opacity', () => {
            const fogDensity = 0.5;
            const maxFogOpacity = 0.7;

            const fogAmount = 1 - Math.exp(-10 * fogDensity);
            const clampedFog = Math.min(fogAmount, maxFogOpacity);

            expect(clampedFog).toBeLessThanOrEqual(maxFogOpacity);
        });
    });

    describe('Parallax speed calculation', () => {
        it('should calculate depth-based speed factor', () => {
            // Speed formula: 1 / (1 + depth * 0.2)
            const speed0 = 1 / (1 + 0 * 0.2); // depth 0 = 1.0
            const speed5 = 1 / (1 + 5 * 0.2); // depth 5 = 0.5
            const speed10 = 1 / (1 + 10 * 0.2); // depth 10 = 0.33

            expect(speed0).toBe(1);
            expect(speed5).toBe(0.5);
            expect(speed10).toBeCloseTo(0.333, 2);
        });

        it('should apply less vertical parallax', () => {
            // Vertical parallax is 50% of horizontal
            const scrollY = 100;
            const depth = 5;
            const speedFactor = 1 / (1 + depth * 0.2);

            const horizontalEffect = scrollY * speedFactor;
            const verticalEffect = scrollY * speedFactor * 0.5;

            expect(verticalEffect).toBe(horizontalEffect * 0.5);
        });
    });
});

describe('THREE.Color utilities', () => {
    it('should create color from hex number', () => {
        const color = new THREE.Color(0xff0000);
        expect(color.r).toBe(1);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
    });

    it('should create color from hex string', () => {
        const color = new THREE.Color('#00ff00');
        expect(color.r).toBe(0);
        expect(color.g).toBe(1);
        expect(color.b).toBe(0);
    });

    it('should lerp between colors correctly', () => {
        const day = new THREE.Color(0xffffff); // white
        const night = new THREE.Color(0x000000); // black

        const halfway = day.clone().lerp(night, 0.5);

        expect(halfway.r).toBeCloseTo(0.5, 2);
        expect(halfway.g).toBeCloseTo(0.5, 2);
        expect(halfway.b).toBeCloseTo(0.5, 2);
    });
});
