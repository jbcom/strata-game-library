import type * as THREE from 'three';

export interface PatternDefinition {
  type: 'spots' | 'stripes' | 'gradient' | 'patches';
  color: string | THREE.Color;
  coverage: number; // 0-1
  size?: number;
  direction?: [number, number, number] | THREE.Vector3; // For stripes/gradient
}

export interface MarkingDefinition {
  type: 'mask' | 'collar' | 'socks' | 'custom';
  regions: string[];
  color: string | THREE.Color;
}

export interface CoveringRegion {
  material: string; // Material ID
  color?: string | THREE.Color; // Override material base color
  scale?: number; // Scale texture/pattern
  variation?: number; // Random variation amount
}

export interface CoveringDefinition {
  skeleton: string; // Reference to skeleton ID

  /**
   * Region-based material application.
   * Keys are bone IDs or glob-style patterns (e.g., 'leg*', 'spine_*', '*').
   * Patterns are resolved by the system in order of specificity (exact match first, then longest pattern).
   */
  regions: {
    [bonePattern: string]: CoveringRegion;
  };

  // Pattern overlays
  patterns?: PatternDefinition[];

  // Markings
  markings?: MarkingDefinition[];
}

// Example Coverings from RFC
export const COVERINGS: Record<string, CoveringDefinition> = {
  otter: {
    skeleton: 'quadruped_medium',
    regions: {
      'spine*': { material: 'fur_otter', color: '#4a3520' },
      head: { material: 'fur_otter', color: '#4a3520' },
      'tail*': { material: 'fur_otter', color: '#3d2817' },
      'leg*': { material: 'fur_otter', color: '#3d2817' },
      '*': { material: 'fur_otter', color: '#4a3520' },
    },
    markings: [{ type: 'mask', regions: ['head'], color: '#8b7355' }],
  },
  fox: {
    skeleton: 'quadruped_medium',
    regions: {
      '*': { material: 'fur_fox', color: '#c45a25' },
      tail_tip: { material: 'fur_fox', color: '#ffffff' },
    },
    markings: [{ type: 'socks', regions: ['leg*'], color: '#2d2d2d' }],
  },
};
