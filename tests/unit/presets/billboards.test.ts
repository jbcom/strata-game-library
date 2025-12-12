import * as THREE from 'three';
import { describe, expect, test } from 'vitest';
import {
    type BillboardOptions,
    createAnimatedBillboard,
    createBillboard,
    createBillboardInstances,
} from '../../../src/presets/billboards';

describe('Billboards', () => {
    test('should create billboard with default options', () => {
        const texture = new THREE.Texture();
        const billboard = createBillboard({ texture });

        expect(billboard).toBeInstanceOf(THREE.Mesh);
        expect(billboard.geometry).toBeInstanceOf(THREE.PlaneGeometry);
        expect(billboard.material).toBeInstanceOf(THREE.MeshBasicMaterial);
        expect(billboard.onBeforeRender).toBeDefined();
    });

    test('should create billboard with custom options', () => {
        const texture = new THREE.Texture();
        const options: BillboardOptions = {
            texture,
            size: { width: 2, height: 3 },
            color: new THREE.Color(1, 0, 0),
            transparent: false,
            opacity: 0.8,
            alphaTest: 0.5,
            side: THREE.FrontSide,
        };

        const billboard = createBillboard(options);

        expect(billboard).toBeDefined();
        const material = billboard.material as THREE.MeshBasicMaterial;
        expect(material.color).toEqual(options.color);
        expect(material.transparent).toBe(options.transparent);
        expect(material.opacity).toBe(options.opacity);
    });

    test('should validate texture requirement', () => {
        expect(() => {
            createBillboard({ texture: null as any });
        }).toThrow('texture is required');
    });

    test('should create instanced billboards', () => {
        const texture = new THREE.Texture();
        const count = 10;
        const positions = Array.from({ length: count }, (_, i) => new THREE.Vector3(i, 0, 0));

        const instances = createBillboardInstances(count, positions, { texture });

        expect(instances).toBeInstanceOf(THREE.InstancedMesh);
        expect(instances.count).toBe(count);
    });

    test('should validate instanced billboard parameters', () => {
        const texture = new THREE.Texture();

        expect(() => {
            createBillboardInstances(0, [], { texture });
        }).toThrow('count must be positive');

        expect(() => {
            createBillboardInstances(10, [], { texture });
        }).toThrow('positions array must have at least count elements');
    });

    test('should create animated billboard', () => {
        const texture = new THREE.Texture();
        const frameCount = { x: 4, y: 4 };
        const frameRate = 10;

        const billboard = createAnimatedBillboard(texture, frameCount, frameRate);

        expect(billboard).toBeInstanceOf(THREE.Mesh);
        expect(typeof billboard.update).toBe('function');
    });

    test('should update animated billboard', () => {
        const texture = new THREE.Texture();
        const frameCount = { x: 4, y: 4 };
        const frameRate = 10;

        const billboard = createAnimatedBillboard(texture, frameCount, frameRate);

        // Update should not throw
        expect(() => {
            billboard.update(0.1);
        }).not.toThrow();
    });

    test('should handle numeric size', () => {
        const texture = new THREE.Texture();
        const billboard = createBillboard({ texture, size: 2.5 });

        expect(billboard).toBeDefined();
        const geometry = billboard.geometry as THREE.PlaneGeometry;
        expect(geometry.parameters.width).toBe(2.5);
        expect(geometry.parameters.height).toBe(2.5);
    });

    test('should handle object size', () => {
        const texture = new THREE.Texture();
        const billboard = createBillboard({
            texture,
            size: { width: 2, height: 3 },
        });

        expect(billboard).toBeDefined();
        const geometry = billboard.geometry as THREE.PlaneGeometry;
        expect(geometry.parameters.width).toBe(2);
        expect(geometry.parameters.height).toBe(3);
    });
});
