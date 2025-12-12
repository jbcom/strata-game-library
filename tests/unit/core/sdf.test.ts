/**
 * SDF Core API Tests
 *
 * Tests the public contract of SDF functions
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
    calcNormal,
    fbm,
    noise3D,
    opIntersection,
    opSmoothUnion,
    opSubtraction,
    opUnion,
    sdBox,
    sdPlane,
    sdSphere,
} from '../../../src/core/sdf';

describe('SDF Primitives', () => {
    describe('sdSphere', () => {
        it('returns positive distance outside sphere', () => {
            const p = new THREE.Vector3(2, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1;
            const dist = sdSphere(p, center, radius);
            expect(dist).toBeCloseTo(1, 5);
        });

        it('returns negative distance inside sphere', () => {
            const p = new THREE.Vector3(0, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1;
            const dist = sdSphere(p, center, radius);
            expect(dist).toBeCloseTo(-1, 5);
        });

        it('returns zero on sphere surface', () => {
            const p = new THREE.Vector3(1, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1;
            const dist = sdSphere(p, center, radius);
            expect(dist).toBeCloseTo(0, 5);
        });
    });

    describe('sdBox', () => {
        it('returns positive distance outside box', () => {
            const p = new THREE.Vector3(2, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);
            const halfExtents = new THREE.Vector3(1, 1, 1);
            const dist = sdBox(p, center, halfExtents);
            expect(dist).toBeGreaterThan(0);
        });

        it('returns negative distance inside box', () => {
            const p = new THREE.Vector3(0, 0, 0);
            const center = new THREE.Vector3(0, 0, 0);
            const halfExtents = new THREE.Vector3(1, 1, 1);
            const dist = sdBox(p, center, halfExtents);
            expect(dist).toBeLessThan(0);
        });
    });

    describe('sdPlane', () => {
        it('returns positive distance above plane', () => {
            const p = new THREE.Vector3(0, 1, 0);
            const height = 0;
            const dist = sdPlane(p, height);
            expect(dist).toBe(1);
        });

        it('returns negative distance below plane', () => {
            const p = new THREE.Vector3(0, -1, 0);
            const height = 0;
            const dist = sdPlane(p, height);
            expect(dist).toBe(-1);
        });
    });
});

describe('SDF Operations', () => {
    it('opUnion returns minimum distance', () => {
        const d1 = 5;
        const d2 = 3;
        expect(opUnion(d1, d2)).toBe(3);
    });

    it('opSubtraction subtracts second from first', () => {
        const d1 = 5;
        const d2 = 3;
        // opSubtraction(a, b) = max(a, -b) - keeps points outside shape a OR inside shape b
        expect(opSubtraction(d1, d2)).toBe(5); // max(5, -3) = 5
        expect(opSubtraction(d1, -d2)).toBe(5); // max(5, 3) = 5
        expect(opSubtraction(-1, 2)).toBe(-1); // max(-1, -2) = -1
        expect(opSubtraction(2, -1)).toBe(2); // max(2, 1) = 2
    });

    it('opIntersection returns maximum distance', () => {
        const d1 = 5;
        const d2 = 3;
        expect(opIntersection(d1, d2)).toBe(5);
    });

    it('opSmoothUnion blends smoothly', () => {
        const d1 = 1;
        const d2 = 1;
        const k = 0.5;
        const result = opSmoothUnion(d1, d2, k);
        expect(result).toBeLessThan(1);
        expect(result).toBeGreaterThan(0);
    });
});

describe('Noise Functions', () => {
    describe('noise3D', () => {
        it('returns values in [0, 1] range', () => {
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const z = Math.random() * 100;
                const value = noise3D(x, y, z);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
            }
        });

        it('is deterministic for same inputs', () => {
            const x = 1.5;
            const y = 2.3;
            const z = 3.7;
            const v1 = noise3D(x, y, z);
            const v2 = noise3D(x, y, z);
            expect(v1).toBe(v2);
        });
    });

    describe('fbm', () => {
        it('returns values in [0, 1] range', () => {
            for (let i = 0; i < 10; i++) {
                const value = fbm(i, i, i);
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThanOrEqual(1);
            }
        });

        it('respects octaves parameter', () => {
            const x = 1,
                y = 2,
                z = 3;
            const fbm1 = fbm(x, y, z, 1);
            const fbm4 = fbm(x, y, z, 4);
            // More octaves should produce different (not necessarily larger) values
            expect(fbm1).not.toBe(fbm4);
        });
    });
});

describe('calcNormal', () => {
    it('returns normalized vector', () => {
        const center = new THREE.Vector3(0, 0, 0);
        const sdf = (p: THREE.Vector3) => sdSphere(p, center, 1);
        const p = new THREE.Vector3(1, 0, 0);
        const normal = calcNormal(p, sdf);
        expect(normal.length()).toBeCloseTo(1, 5);
    });

    it('points outward from surface', () => {
        const center = new THREE.Vector3(0, 0, 0);
        const sdf = (p: THREE.Vector3) => sdSphere(p, center, 1);
        const p = new THREE.Vector3(1, 0, 0);
        const normal = calcNormal(p, sdf);
        // Should point in positive X direction (outward)
        expect(normal.x).toBeGreaterThan(0);
    });
});
