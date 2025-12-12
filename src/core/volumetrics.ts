/**
 * Volumetric Effects - Core TypeScript (no React)
 *
 * Pure TypeScript functions for creating volumetric effect materials
 */

import * as THREE from 'three';
import {
    createUnderwaterOverlayUniforms,
    createVolumetricFogMeshUniforms,
    underwaterOverlayFragmentShader,
    underwaterOverlayVertexShader,
    volumetricFogMeshFragmentShader,
    volumetricFogMeshVertexShader,
} from '../shaders/volumetrics-components';

export interface VolumetricFogMeshMaterialOptions {
    color?: THREE.Color;
    density?: number;
    height?: number;
    cameraPosition?: THREE.Vector3;
    time?: number;
}

export interface UnderwaterOverlayMaterialOptions {
    waterColor?: THREE.Color;
    density?: number;
    causticStrength?: number;
    waterSurface?: number;
    cameraY?: number;
    time?: number;
}

/**
 * Create volumetric fog mesh material (pure TypeScript)
 */
export function createVolumetricFogMeshMaterial(
    options: VolumetricFogMeshMaterialOptions = {}
): THREE.ShaderMaterial {
    const {
        color = new THREE.Color(0.7, 0.8, 0.9),
        density = 0.02,
        height = 10,
        cameraPosition = new THREE.Vector3(0, 0, 0),
        time = 0,
    } = options;

    // Input validation
    if (density < 0) {
        throw new Error('createVolumetricFogMeshMaterial: density must be non-negative');
    }
    if (height <= 0) {
        throw new Error('createVolumetricFogMeshMaterial: height must be positive');
    }

    const uniforms = createVolumetricFogMeshUniforms(color, density, height, cameraPosition);
    uniforms.uTime.value = time;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: volumetricFogMeshVertexShader,
        fragmentShader: volumetricFogMeshFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
    });
}

/**
 * Create underwater overlay material (pure TypeScript)
 */
export function createUnderwaterOverlayMaterial(
    options: UnderwaterOverlayMaterialOptions = {}
): THREE.ShaderMaterial {
    const {
        waterColor = new THREE.Color(0.0, 0.3, 0.5),
        density = 0.1,
        causticStrength = 0.3,
        waterSurface = 0,
        cameraY = 0,
        time = 0,
    } = options;

    // Input validation
    if (density < 0) {
        throw new Error('createUnderwaterOverlayMaterial: density must be non-negative');
    }
    if (causticStrength < 0 || causticStrength > 1) {
        throw new Error('createUnderwaterOverlayMaterial: causticStrength must be between 0 and 1');
    }

    const uniforms = createUnderwaterOverlayUniforms(
        waterColor,
        density,
        causticStrength,
        waterSurface,
        cameraY
    );
    uniforms.uTime.value = time;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: underwaterOverlayVertexShader,
        fragmentShader: underwaterOverlayFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
    });
}
