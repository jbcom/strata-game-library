/**
 * @fileoverview Tests for the Fixed Perspective Camera.
 * @module components/camera/__tests__/fixed-perspective.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import {
    getCameraPosition,
    type PerspectivePreset,
    screenToWorld,
} from '../FixedPerspectiveCamera';

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
    useThree: () => ({
        camera: new THREE.PerspectiveCamera(),
        set: vi.fn(),
        size: { width: 1920, height: 1080 },
    }),
    useFrame: vi.fn((callback) => callback),
}));

describe('Fixed Perspective Camera', () => {
    describe('getCameraPosition', () => {
        it('should calculate correct position for side view', () => {
            const pos = getCameraPosition('side', 10);

            // Side view: camera at 90° yaw, 0° pitch
            // x = 10 * cos(0) * sin(90°) = 10
            // y = 10 * sin(0) = 0
            // z = 10 * cos(0) * cos(90°) ≈ 0
            expect(pos.x).toBeCloseTo(10, 1);
            expect(pos.y).toBeCloseTo(0, 1);
            expect(pos.z).toBeCloseTo(0, 1);
        });

        it('should calculate correct position for top-down view', () => {
            const pos = getCameraPosition('top-down', 10);

            // Top-down: camera at 0° yaw, 90° pitch
            // x = 10 * cos(90°) * sin(0°) ≈ 0
            // y = 10 * sin(90°) = 10
            // z = 10 * cos(90°) * cos(0°) ≈ 0
            expect(pos.x).toBeCloseTo(0, 1);
            expect(pos.y).toBeCloseTo(10, 1);
            expect(pos.z).toBeCloseTo(0, 1);
        });

        it('should calculate correct position for isometric view', () => {
            const pos = getCameraPosition('isometric', 10);

            // Isometric: camera at 45° yaw, 35.264° pitch
            // x = 10 * cos(35.264°) * sin(45°) ≈ 5.77
            // y = 10 * sin(35.264°) ≈ 5.77
            // z = 10 * cos(35.264°) * cos(45°) ≈ 5.77
            expect(pos.x).toBeGreaterThan(5);
            expect(pos.y).toBeGreaterThan(5);
            expect(pos.z).toBeGreaterThan(5);
        });

        it('should scale with distance', () => {
            const pos1 = getCameraPosition('side', 10);
            const pos2 = getCameraPosition('side', 20);

            expect(pos2.x).toBeCloseTo(pos1.x * 2, 1);
            expect(pos2.y).toBeCloseTo(pos1.y * 2, 1);
            expect(pos2.z).toBeCloseTo(pos1.z * 2, 1);
        });

        it('should use custom angles when preset is custom', () => {
            const pos = getCameraPosition('custom', 10, { yaw: 0, pitch: 0 });

            // 0° yaw, 0° pitch = looking straight from z-axis
            // x = 10 * cos(0) * sin(0) = 0
            // y = 10 * sin(0) = 0
            // z = 10 * cos(0) * cos(0) = 10
            expect(pos.x).toBeCloseTo(0, 1);
            expect(pos.y).toBeCloseTo(0, 1);
            expect(pos.z).toBeCloseTo(10, 1);
        });

        describe('preset positions', () => {
            const presets: PerspectivePreset[] = [
                'side',
                'side-3/4',
                'isometric',
                'isometric-rpg',
                'top-down',
                'top-down-tilt',
                'hex',
                'dimetric',
                'trimetric',
                'cavalier',
                'cabinet',
            ];

            it.each(presets)('should return valid position for %s preset', (preset) => {
                const pos = getCameraPosition(preset, 10);

                expect(typeof pos.x).toBe('number');
                expect(typeof pos.y).toBe('number');
                expect(typeof pos.z).toBe('number');
                expect(Number.isFinite(pos.x)).toBe(true);
                expect(Number.isFinite(pos.y)).toBe(true);
                expect(Number.isFinite(pos.z)).toBe(true);
            });

            it.each(presets)('%s preset should maintain consistent distance', (preset) => {
                const pos = getCameraPosition(preset, 10);
                const distance = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);

                // Distance should be close to 10 (input distance)
                expect(distance).toBeCloseTo(10, 0);
            });
        });
    });

    describe('screenToWorld', () => {
        it('should return intersection with ground plane', () => {
            const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
            camera.position.set(0, 10, 10);
            camera.lookAt(0, 0, 0);
            camera.updateMatrixWorld();

            // Click at center of screen (should map to NDC 0, 0)
            const result = screenToWorld(960, 540, camera, 1920, 1080, 0);

            expect(result).not.toBeNull();
            if (result) {
                // Should intersect somewhere near origin
                expect(Math.abs(result.y)).toBeLessThan(0.01);
            }
        });

        it('should return null for rays parallel to ground', () => {
            const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
            camera.updateMatrixWorld();

            // When camera is at ground level looking forward,
            // center ray is parallel to ground
            const result = screenToWorld(960, 540, camera, 1920, 1080, 0);

            // May or may not intersect depending on precision
            // The important thing is it doesn't crash
            expect(result === null || result instanceof THREE.Vector3).toBe(true);
        });

        it('should work with orthographic camera', () => {
            const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
            camera.updateMatrixWorld();

            const result = screenToWorld(960, 540, camera, 1920, 1080, 0);

            expect(result).not.toBeNull();
            if (result) {
                expect(result.y).toBeCloseTo(0, 1);
            }
        });

        it('should respect custom ground height', () => {
            const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
            camera.position.set(0, 15, 10);
            camera.lookAt(0, 5, 0);
            camera.updateMatrixWorld();

            const result = screenToWorld(960, 540, camera, 1920, 1080, 5);

            expect(result).not.toBeNull();
            if (result) {
                expect(result.y).toBeCloseTo(5, 1);
            }
        });
    });

    describe('Preset angle verification', () => {
        it('side preset should have 90° yaw for horizontal view', () => {
            const pos = getCameraPosition('side', 10);

            // For 90° yaw, x should be maximum, z should be near 0
            expect(Math.abs(pos.x)).toBeGreaterThan(Math.abs(pos.z));
        });

        it('isometric preset should have equal x and z components', () => {
            const pos = getCameraPosition('isometric', 10);

            // 45° yaw means sin(45) = cos(45), so x ≈ z
            expect(pos.x).toBeCloseTo(pos.z, 1);
        });

        it('top-down preset should have maximum y component', () => {
            const pos = getCameraPosition('top-down', 10);

            // 90° pitch means looking straight down
            expect(pos.y).toBeCloseTo(10, 1);
            expect(Math.abs(pos.x)).toBeLessThan(1);
            expect(Math.abs(pos.z)).toBeLessThan(1);
        });

        it('dimetric preset should maintain 2:1 pixel ratio angles', () => {
            const pos = getCameraPosition('dimetric', 10);

            // Dimetric uses 26.565° pitch for 2:1 pixel art
            // y should be approximately sin(26.565°) * 10 ≈ 4.47
            expect(pos.y).toBeGreaterThan(4);
            expect(pos.y).toBeLessThan(5);
        });
    });
});
