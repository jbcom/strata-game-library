import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createFurSystem, FUR_GROUP_USER_DATA_KEY } from '../index';

describe('createFurSystem', () => {
    it('should set userData.isFurGroup to true', () => {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial();
        const furSystem = createFurSystem(geometry, material, { layerCount: 1 });

        expect(furSystem.userData[FUR_GROUP_USER_DATA_KEY]).toBe(true);
    });
});
