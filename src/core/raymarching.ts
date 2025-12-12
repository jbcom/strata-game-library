/**
 * Ray Marching - Core TypeScript (no React)
 *
 * Pure TypeScript functions for ray marching setup
 */

import * as THREE from 'three';
import { raymarchingFragmentShader, raymarchingVertexShader } from '../shaders/raymarching';

export interface RaymarchingMaterialOptions {
    sdfFunction: string; // GLSL code for sceneSDF function
    maxSteps?: number;
    maxDistance?: number;
    minDistance?: number;
    backgroundColor?: THREE.ColorRepresentation;
    fogStrength?: number;
    fogColor?: THREE.ColorRepresentation;
    cameraPosition?: THREE.Vector3;
    cameraMatrix?: THREE.Matrix4;
    resolution?: THREE.Vector2;
    time?: number;
}

/**
 * Create ray marching material (pure TypeScript)
 */
export function createRaymarchingMaterial(
    options: RaymarchingMaterialOptions
): THREE.ShaderMaterial {
    const {
        sdfFunction,
        maxSteps = 100,
        maxDistance = 20.0,
        minDistance = 0.001,
        backgroundColor = 0x000000,
        fogStrength = 0.1,
        fogColor = 0x000000,
        cameraPosition = new THREE.Vector3(0, 0, 5),
        cameraMatrix = new THREE.Matrix4(),
        resolution = new THREE.Vector2(800, 600),
        time = 0,
    } = options;

    // Input validation
    if (!sdfFunction || typeof sdfFunction !== 'string') {
        throw new Error('createRaymarchingMaterial: sdfFunction must be a GLSL string');
    }
    if (maxSteps <= 0 || maxSteps > 256) {
        throw new Error('createRaymarchingMaterial: maxSteps must be between 1 and 256');
    }
    if (maxDistance <= 0) {
        throw new Error('createRaymarchingMaterial: maxDistance must be positive');
    }
    if (minDistance <= 0 || minDistance >= maxDistance) {
        throw new Error(
            'createRaymarchingMaterial: minDistance must be positive and less than maxDistance'
        );
    }

    // Inject SDF function into fragment shader
    const fragmentShader = raymarchingFragmentShader.replace(
        'float sceneSDF(vec3 p);',
        sdfFunction
    );

    return new THREE.ShaderMaterial({
        vertexShader: raymarchingVertexShader,
        fragmentShader,
        uniforms: {
            uCameraPosition: { value: cameraPosition },
            uCameraMatrix: { value: cameraMatrix },
            uResolution: { value: resolution },
            uTime: { value: time },
            uMaxSteps: { value: maxSteps },
            uMaxDistance: { value: maxDistance },
            uMinDistance: { value: minDistance },
            uBackgroundColor: { value: new THREE.Color(backgroundColor) },
            uFogStrength: { value: fogStrength },
            uFogColor: { value: new THREE.Color(fogColor) },
        },
    });
}

/**
 * Create fullscreen quad geometry for ray marching (pure TypeScript)
 */
export function createRaymarchingGeometry(): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(2, 2);
}
