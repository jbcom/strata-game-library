/**
 * Tests for noise utilities
 *
 * @module core/math/__tests__/noise
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createNoise2D,
    createNoise3D,
    createNoise4D,
    fbm2D,
    fbm3D,
    warpedNoise2D,
    warpedNoise3D,
    ridgedNoise2D,
    createTerrainNoise,
    TERRAIN_PRESETS,
} from '../noise';
import type { Noise2D, Noise3D } from '../types';

describe('createNoise2D', () => {
    describe('ideal case', () => {
        it('creates a 2D noise function', () => {
            const noise = createNoise2D();
            expect(typeof noise).toBe('function');
        });

        it('returns values in range [-1, 1]', () => {
            const noise = createNoise2D();
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 100 - 50;
                const y = Math.random() * 100 - 50;
                const value = noise(x, y);
                expect(value).toBeGreaterThanOrEqual(-1);
                expect(value).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('normal usage', () => {
        it('produces different values for different coordinates', () => {
            // Use seeded random for deterministic behavior
            let seed = 12345;
            const seededRandom = () => {
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                return seed / 0x7fffffff;
            };
            const noise = createNoise2D(seededRandom);
            const v1 = noise(0, 0);
            const v2 = noise(10, 10);
            const v3 = noise(0.5, 0.5);
            // At least one pair should be different
            const allSame = v1 === v2 && v2 === v3;
            expect(allSame).toBe(false);
        });

        it('produces same values for same coordinates', () => {
            const noise = createNoise2D();
            const v1 = noise(5.5, 3.2);
            const v2 = noise(5.5, 3.2);
            expect(v1).toBe(v2);
        });

        it('accepts custom random function for seeding', () => {
            const seed = 0.5;
            const noise = createNoise2D(() => seed);
            const value = noise(1, 1);
            expect(typeof value).toBe('number');
        });
    });

    describe('edge cases', () => {
        it('handles zero coordinates', () => {
            const noise = createNoise2D();
            const value = noise(0, 0);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });

        it('handles negative coordinates', () => {
            const noise = createNoise2D();
            const value = noise(-100, -200);
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });

        it('handles very large coordinates', () => {
            const noise = createNoise2D();
            const value = noise(1e6, 1e6);
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });

        it('handles very small coordinates', () => {
            const noise = createNoise2D();
            const value = noise(1e-10, 1e-10);
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });
    });
});

describe('createNoise3D', () => {
    describe('ideal case', () => {
        it('creates a 3D noise function', () => {
            const noise = createNoise3D();
            expect(typeof noise).toBe('function');
        });

        it('returns values in range [-1, 1]', () => {
            const noise = createNoise3D();
            for (let i = 0; i < 50; i++) {
                const value = noise(Math.random() * 100, Math.random() * 100, Math.random() * 100);
                expect(value).toBeGreaterThanOrEqual(-1);
                expect(value).toBeLessThanOrEqual(1);
            }
        });
    });
});

describe('createNoise4D', () => {
    describe('ideal case', () => {
        it('creates a 4D noise function', () => {
            const noise = createNoise4D();
            expect(typeof noise).toBe('function');
        });

        it('returns values in range [-1, 1]', () => {
            const noise = createNoise4D();
            for (let i = 0; i < 50; i++) {
                const value = noise(
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                );
                expect(value).toBeGreaterThanOrEqual(-1);
                expect(value).toBeLessThanOrEqual(1);
            }
        });
    });
});

describe('fbm2D', () => {
    let noise: Noise2D;

    beforeEach(() => {
        noise = createNoise2D();
    });

    describe('ideal case', () => {
        it('computes FBM with default config', () => {
            const value = fbm2D(noise, 1.0, 2.0);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });
    });

    describe('normal usage', () => {
        it('respects octaves configuration', () => {
            const v1 = fbm2D(noise, 5, 5, { octaves: 1 });
            const v2 = fbm2D(noise, 5, 5, { octaves: 6 });
            expect(typeof v1).toBe('number');
            expect(typeof v2).toBe('number');
        });

        it('applies frequency correctly', () => {
            const v1 = fbm2D(noise, 1, 1, { frequency: 0.1 });
            const v2 = fbm2D(noise, 1, 1, { frequency: 10 });
            expect(v1).not.toBe(v2);
        });

        it('applies persistence correctly', () => {
            const v1 = fbm2D(noise, 5, 5, { octaves: 4, persistence: 0.1 });
            const v2 = fbm2D(noise, 5, 5, { octaves: 4, persistence: 0.9 });
            expect(typeof v1).toBe('number');
            expect(typeof v2).toBe('number');
        });

        it('applies lacunarity correctly', () => {
            const v1 = fbm2D(noise, 5, 5, { octaves: 4, lacunarity: 1.5 });
            const v2 = fbm2D(noise, 5, 5, { octaves: 4, lacunarity: 3.0 });
            expect(typeof v1).toBe('number');
            expect(typeof v2).toBe('number');
        });
    });

    describe('edge cases', () => {
        it('handles 1 octave correctly', () => {
            const value = fbm2D(noise, 1, 1, { octaves: 1 });
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });

        it('handles high octave count', () => {
            const value = fbm2D(noise, 1, 1, { octaves: 16 });
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });
    });

    describe('error cases', () => {
        it('throws when octaves is less than 1', () => {
            expect(() => fbm2D(noise, 1, 1, { octaves: 0 })).toThrow(
                'fbm2D: octaves must be at least 1'
            );
        });

        it('throws when octaves is negative', () => {
            expect(() => fbm2D(noise, 1, 1, { octaves: -1 })).toThrow(
                'fbm2D: octaves must be at least 1'
            );
        });
    });
});

describe('fbm3D', () => {
    let noise: Noise3D;

    beforeEach(() => {
        noise = createNoise3D();
    });

    describe('ideal case', () => {
        it('computes 3D FBM correctly', () => {
            const value = fbm3D(noise, 1, 2, 3);
            expect(typeof value).toBe('number');
            expect(value).toBeGreaterThanOrEqual(-1);
            expect(value).toBeLessThanOrEqual(1);
        });
    });

    describe('error cases', () => {
        it('throws when octaves is less than 1', () => {
            expect(() => fbm3D(noise, 1, 1, 1, { octaves: 0 })).toThrow(
                'fbm3D: octaves must be at least 1'
            );
        });
    });
});

describe('warpedNoise2D', () => {
    it('applies domain warping', () => {
        const noise = createNoise2D();
        const value = warpedNoise2D(noise, 5, 5, 0.5);
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
    });

    it('produces different results with different warp strengths', () => {
        const noise = createNoise2D();
        const v1 = warpedNoise2D(noise, 5, 5, 0.1);
        const v2 = warpedNoise2D(noise, 5, 5, 1.0);
        expect(v1).not.toBe(v2);
    });
});

describe('warpedNoise3D', () => {
    it('applies domain warping in 3D', () => {
        const noise = createNoise3D();
        const value = warpedNoise3D(noise, 5, 5, 5, 0.5);
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
    });
});

describe('ridgedNoise2D', () => {
    it('returns ridged noise in [0, 1] range', () => {
        const noise = createNoise2D();
        for (let i = 0; i < 50; i++) {
            const value = ridgedNoise2D(noise, Math.random() * 100, Math.random() * 100);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
        }
    });
});

describe('TERRAIN_PRESETS', () => {
    it('contains expected presets', () => {
        expect(TERRAIN_PRESETS).toHaveProperty('mountains');
        expect(TERRAIN_PRESETS).toHaveProperty('hills');
        expect(TERRAIN_PRESETS).toHaveProperty('plains');
        expect(TERRAIN_PRESETS).toHaveProperty('desert');
        expect(TERRAIN_PRESETS).toHaveProperty('tundra');
        expect(TERRAIN_PRESETS).toHaveProperty('archipelago');
    });

    it('each preset has required properties', () => {
        for (const [name, preset] of Object.entries(TERRAIN_PRESETS)) {
            expect(preset.name).toBe(name);
            expect(preset.fbm).toBeDefined();
            expect(preset.fbm.octaves).toBeGreaterThan(0);
            expect(preset.amplitude).toBeGreaterThan(0);
        }
    });
});

describe('createTerrainNoise', () => {
    describe('ideal case', () => {
        it('creates terrain noise from preset name', () => {
            const getHeight = createTerrainNoise('mountains');
            expect(typeof getHeight).toBe('function');
            const height = getHeight(100, 200);
            expect(typeof height).toBe('number');
        });
    });

    describe('normal usage', () => {
        it('creates terrain noise from custom config', () => {
            const getHeight = createTerrainNoise({
                name: 'custom',
                fbm: { octaves: 4, frequency: 0.05, persistence: 0.5, lacunarity: 2 },
                amplitude: 10,
            });
            const height = getHeight(50, 50);
            expect(typeof height).toBe('number');
            expect(height).toBeGreaterThanOrEqual(0);
        });

        it('respects amplitude setting', () => {
            const lowAmp = createTerrainNoise({
                name: 'low',
                fbm: { octaves: 4, frequency: 0.05, persistence: 0.5, lacunarity: 2 },
                amplitude: 1,
            });
            const highAmp = createTerrainNoise({
                name: 'high',
                fbm: { octaves: 4, frequency: 0.05, persistence: 0.5, lacunarity: 2 },
                amplitude: 100,
            });

            const h1 = lowAmp(0, 0);
            const h2 = highAmp(0, 0);
            expect(h2).toBeGreaterThanOrEqual(h1);
        });

        it('applies warping when configured', () => {
            const noWarp = createTerrainNoise({
                name: 'nowarp',
                fbm: { octaves: 4, frequency: 0.05, persistence: 0.5, lacunarity: 2 },
                amplitude: 10,
                warp: false,
            });
            const withWarp = createTerrainNoise({
                name: 'warp',
                fbm: { octaves: 4, frequency: 0.05, persistence: 0.5, lacunarity: 2 },
                amplitude: 10,
                warp: true,
                warpStrength: 0.5,
            });

            const h1 = noWarp(10, 10);
            const h2 = withWarp(10, 10);
            expect(typeof h1).toBe('number');
            expect(typeof h2).toBe('number');
        });
    });

    describe('error cases', () => {
        it('throws for unknown preset name', () => {
            expect(() => createTerrainNoise('nonexistent')).toThrow(
                'createTerrainNoise: unknown preset "nonexistent"'
            );
        });
    });
});
