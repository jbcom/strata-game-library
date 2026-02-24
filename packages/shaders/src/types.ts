import type * as THREE from 'three';

/**
 * Common uniform types for Three.js shaders
 */
export type UniformValue<T = unknown> = { value: T };

export interface IUniforms {
  [uniform: string]: THREE.IUniform;
}

/**
 * Common color types for factory options
 */
export type ColorRepresentation = THREE.ColorRepresentation;

/**
 * Common vector types for factory options
 */
export type Vector2Representation = THREE.Vector2 | [number, number];
export type Vector3Representation = THREE.Vector3 | [number, number, number];
