import * as THREE from 'three';
import { describe, expect, test } from 'vitest';
import { createBulletHoleDecal, createDecal, type DecalOptions } from '../../../src/presets/decals';

describe('Decals', () => {
    test('should create decal with valid options', () => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const texture = new THREE.Texture();
        const options: DecalOptions = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 0.1),
            texture,
        };

        const decal = createDecal(geometry, options);

        expect(decal).toBeInstanceOf(THREE.Mesh);
        expect(decal.geometry).toBeDefined();
        expect(decal.material).toBeDefined();
    });

    test('should validate required parameters', () => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const texture = new THREE.Texture();

        expect(() => {
            createDecal(null as any, {
                position: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(),
                texture,
            });
        }).toThrow('geometry is required');

        expect(() => {
            createDecal(geometry, {
                position: null as any,
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(),
                texture,
            });
        }).toThrow('position is required');

        expect(() => {
            createDecal(geometry, {
                position: new THREE.Vector3(),
                rotation: null as any,
                scale: new THREE.Vector3(),
                texture,
            });
        }).toThrow('rotation is required');

        expect(() => {
            createDecal(geometry, {
                position: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                scale: null as any,
                texture,
            });
        }).toThrow('scale is required');

        expect(() => {
            createDecal(geometry, {
                position: new THREE.Vector3(),
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(),
                texture: null as any,
            });
        }).toThrow('texture is required');
    });

    test('should create bullet hole decal', () => {
        const position = new THREE.Vector3(0, 0, 0);
        const normal = new THREE.Vector3(0, 1, 0);
        const size = 0.1;

        const decal = createBulletHoleDecal(position, normal, size);

        expect(decal).toBeInstanceOf(THREE.Mesh);
        expect(decal.position).toEqual(position);
    });

    test('should handle custom material', () => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const texture = new THREE.Texture();
        const customMaterial = new THREE.MeshStandardMaterial({ map: texture });

        const decal = createDecal(geometry, {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 0.1),
            texture,
            material: customMaterial,
        });

        expect(decal.material).toBe(customMaterial);
    });

    test('should handle normal map', () => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const texture = new THREE.Texture();
        const normalMap = new THREE.Texture();

        const decal = createDecal(geometry, {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 0.1),
            texture,
            normalMap,
        });

        if (decal.material instanceof THREE.MeshPhongMaterial) {
            expect(decal.material.normalMap).toBe(normalMap);
        }
    });
});
