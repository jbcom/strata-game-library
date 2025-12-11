/**
 * Fur Preset - Multi-layer fur rendering system
 *
 * Provides GPU-accelerated fur rendering using layered geometry
 * for characters, animals, and organic surfaces.
 */

import * as THREE from 'three';
import { furVertexShader, furFragmentShader } from './shaders';

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
 * Update fur uniforms for animation
 */
export function updateFurUniforms(furSystem: THREE.Group, time: number): void {
    if (!furSystem) {
        throw new Error('updateFurUniforms: furSystem is required');
    }

    furSystem.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
            const uniforms = child.material.uniforms;
            if (uniforms && uniforms.time) {
                uniforms.time.value = time;
            }
        }
    });
}
