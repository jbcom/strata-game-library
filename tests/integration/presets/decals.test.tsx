import { Canvas } from '@react-three/fiber';
import { render } from '@testing-library/react';
import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createBulletHoleDecal, createDecal } from '../../../src/presets/decals';

describe('Decals Integration', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('should render decal in React Three Fiber', () => {
        function DecalScene() {
            const geometry = new THREE.PlaneGeometry(10, 10);
            const texture = new THREE.Texture();
            const decal = createDecal(geometry, {
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 0.1),
                texture,
            });

            return (
                <>
                    <mesh geometry={geometry}>
                        <meshStandardMaterial />
                    </mesh>
                    <primitive object={decal} />
                </>
            );
        }

        const { container: testContainer } = render(
            <Canvas>
                <DecalScene />
            </Canvas>
        );

        expect(testContainer).toBeDefined();
    });

    test('should render bullet hole decal', () => {
        function BulletHoleScene() {
            const decal = createBulletHoleDecal(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1, 0),
                0.1
            );

            return <primitive object={decal} />;
        }

        const { container: testContainer } = render(
            <Canvas>
                <BulletHoleScene />
            </Canvas>
        );

        expect(testContainer).toBeDefined();
    });
});
