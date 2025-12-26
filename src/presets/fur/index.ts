/**
 * Fur Preset - Multi-layer fur rendering system
 *
 * Provides GPU-accelerated fur rendering using layered geometry
 * for characters, animals, and organic surfaces.
 */

import * as THREE from 'three';
import { furFragmentShader, furVertexShader } from './shaders';

/**
 * Key used in THREE.Group.userData to identify a fur system group.
 */
export const FUR_GROUP_USER_DATA_KEY = 'isFurGroup';

export interface FurOptions {
    baseColor?: THREE.ColorRepresentation;
    tipColor?: THREE.ColorRepresentation;
    layerCount?: number;
    spacing?: number;
    windStrength?: number;
    gravityDroop?: number;
}

export interface FurUniforms {
    layerOffset: { value: number };
    spacing: { value: number };
    colorBase: { value: THREE.Color };
    colorTip: { value: THREE.Color };
    time: { value: number };
}

/**
 * Create fur material for a single shell layer
 */
export function createFurMaterial(
    layerIndex: number,
    totalLayers: number,
    options: FurOptions = {}
): THREE.ShaderMaterial {
    const {
        baseColor = 0x3e2723,
        tipColor = 0x795548,
        spacing = 0.02,
        windStrength = 0.5,
        gravityDroop = 0.03,
    } = options;

    const layerOffset = layerIndex / totalLayers;

    return new THREE.ShaderMaterial({
        vertexShader: furVertexShader,
        fragmentShader: furFragmentShader,
        uniforms: {
            layerOffset: { value: layerOffset },
            spacing: { value: spacing },
            colorBase: { value: new THREE.Color(baseColor) },
            colorTip: { value: new THREE.Color(tipColor) },
            time: { value: 0 },
            windStrength: { value: windStrength },
            gravityDroop: { value: gravityDroop },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
}

/**
 * Create complete fur system with all shell layers
 */
export function createFurSystem(
    geometry: THREE.BufferGeometry,
    baseMaterial: THREE.Material,
    options: FurOptions = {}
): THREE.Group {
    const { layerCount = 6 } = options;

    if (!geometry) {
        throw new Error('createFurSystem: geometry is required');
    }
    if (!baseMaterial) {
        throw new Error('createFurSystem: baseMaterial is required');
    }
    if (layerCount <= 0 || !Number.isInteger(layerCount)) {
        throw new Error('createFurSystem: layerCount must be a positive integer');
    }

    const group = new THREE.Group();
    // Mark as fur group for detection
    group.userData[FUR_GROUP_USER_DATA_KEY] = true;

    // Base mesh
    const baseMesh = new THREE.Mesh(geometry, baseMaterial);
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // Add fur shells
    for (let i = 1; i <= layerCount; i++) {
        const furMaterial = createFurMaterial(i, layerCount, options);
        const shell = new THREE.Mesh(geometry, furMaterial);
        baseMesh.add(shell);
    }

    return group;
}

/**
 * Update fur uniforms for animation.
 *
 * Automatically detects fur meshes within the provided group and updates their
 * time-based uniforms for wind and movement effects.
 *
 * @param furSystem - The group containing fur shells (returned by createFurSystem)
 * @param time - Current animation time in seconds
 */
export function updateFurUniforms(furSystem: THREE.Object3D, time: number): void {
    if (!furSystem) {
        throw new Error('updateFurUniforms: furSystem is required');
    }

    // Optimization: Cache fur materials on the object to avoid traversal
    let furMaterials = furSystem.userData.cachedFurMaterials as THREE.ShaderMaterial[] | undefined;

    if (!furMaterials) {
        const materials: THREE.ShaderMaterial[] = [];
        furSystem.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                if (child.material.uniforms?.time) {
                    materials.push(child.material);
                }
            }
        });
        furMaterials = materials;
        furSystem.userData.cachedFurMaterials = furMaterials;
    }

    for (const material of furMaterials) {
        material.uniforms.time.value = time;
    }
}

/**
 * Invalidate the cached fur materials, forcing a re-traversal on next update.
 * Call this if the fur system's structure changes after creation.
 *
 * @param furSystem - The fur system object
 */
export function invalidateFurCache(furSystem: THREE.Object3D): void {
    if (furSystem?.userData) {
        delete furSystem.userData.cachedFurMaterials;
    }
}
