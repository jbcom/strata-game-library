/**
 * Type definitions for the material system.
 *
 * Defines the interfaces for material properties including solid surfaces,
 * shell-based rendering (fur, grass), volumetric effects (crystals, glass),
 * and organic subsurface scattering (skin, flesh).
 *
 * @module MaterialTypes
 * @category Entities & Simulation
 */

import type * as THREE from 'three';

export type MaterialType = 'solid' | 'shell' | 'volumetric' | 'organic';

export interface ShellPattern {
  type: 'spots' | 'stripes' | 'gradient' | 'patches';
  color?: string | THREE.Color;
  to?: string | THREE.Color;
  position?: 'belly' | 'back' | 'top' | 'bottom';
  size?: number;
}

export interface ShellProperties {
  layers: number; // Number of shell layers (4-64)
  length: number; // Length of strands (0.01-0.5)
  density: number; // Strands per unit (100-10000)
  thickness: number; // Strand thickness
  curvature: number; // How much strands curve
  colorVariation: number; // Random color variation (0-1)
  pattern?: ShellPattern; // Spots, stripes, etc.
  wetness?: number; // 0-1
}

export interface VolumetricProperties {
  refraction: number; // Index of refraction (1.0-2.5)
  absorption: string | THREE.Color; // Light absorption color
  transparency: number; // 0-1
  density?: number; // For fog/smoke effects
}

export interface OrganicProperties {
  scatterColor: string | THREE.Color; // Subsurface scatter color
  scatterDistance: number; // How far light penetrates
  thickness?: number; // For thin materials like ears
}

export interface MaterialPhysics {
  density: number; // kg/m³
  friction: number; // 0-1
  restitution: number; // 0-1 (bounciness)
}

export interface MaterialDefinition {
  id: string;
  type: MaterialType;

  // Common visual properties
  baseColor: string | THREE.Color;
  roughness: number; // 0-1
  metalness: number; // 0-1
  normalScale?: number;

  // Textures (optional)
  maps?: {
    diffuse?: THREE.Texture | string;
    normal?: THREE.Texture | string;
    roughness?: THREE.Texture | string;
    metalness?: THREE.Texture | string;
    ao?: THREE.Texture | string;
  };

  // Type-specific properties
  shell?: ShellProperties;
  volumetric?: VolumetricProperties;
  organic?: OrganicProperties;

  // Physics properties
  physics?: MaterialPhysics;

  // Additional metadata
  grain?: 'oak' | 'pine' | 'birch' | 'mahogany'; // for wood
  pattern?: string; // for shell_turtle etc.
  segments?: number;
}
