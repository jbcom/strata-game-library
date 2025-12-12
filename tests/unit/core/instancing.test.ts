/**
 * Instancing Core API Tests
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { type BiomeData, generateInstanceData } from '../../../src/core/instancing';

describe('generateInstanceData', () => {
    it('generates requested number of instances', () => {
        const instances = generateInstanceData(
            10,
            100,
            () => 0, // Flat terrain
            undefined,
            undefined
        );

        expect(instances.length).toBe(10);
    });

    it('respects biome filtering', () => {
        const biomes: BiomeData[] = [
            { type: 'forest', center: new THREE.Vector2(0, 0), radius: 50 },
            { type: 'desert', center: new THREE.Vector2(100, 100), radius: 50 },
        ];

        const instances = generateInstanceData(20, 200, () => 0, biomes, ['forest']);

        // All instances should be in forest biome (closest biome semantics)
        // The default getBiomeAt returns the closest biome by center distance,
        // not by whether the point is within the radius
        instances.forEach((instance) => {
            const distToForest = Math.sqrt(instance.position.x ** 2 + instance.position.z ** 2);
            const distToDesert = Math.sqrt(
                (instance.position.x - 100) ** 2 + (instance.position.z - 100) ** 2
            );
            // Each instance should be closer to forest center than desert center
            expect(distToForest).toBeLessThan(distToDesert);
        });
    });

    it('respects height function', () => {
        const heightFunc = (x: number, _z: number) => Math.sin(x * 0.1) * 2;

        const instances = generateInstanceData(10, 50, heightFunc);

        instances.forEach((instance) => {
            const expectedY = heightFunc(instance.position.x, instance.position.z);
            expect(instance.position.y).toBeCloseTo(expectedY, 1);
        });
    });

    it('skips underwater positions', () => {
        const instances = generateInstanceData(
            20,
            50,
            () => -1, // All underwater
            undefined,
            undefined
        );

        // Should have fewer instances due to underwater filtering
        expect(instances.length).toBeLessThan(20);
    });

    it('generates valid instance data structure', () => {
        const instances = generateInstanceData(5, 10, () => 0);

        instances.forEach((instance) => {
            expect(instance.position).toBeInstanceOf(THREE.Vector3);
            expect(instance.rotation).toBeInstanceOf(THREE.Euler);
            expect(instance.scale).toBeInstanceOf(THREE.Vector3);
            expect(instance.scale.x).toBeGreaterThan(0);
        });
    });
});
