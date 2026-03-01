---
title: "RFC-002: Compositional Object System"
description: "Materials, skeletons, coverings, props, and creatures through composition"
status: proposed
implementation: 40
last_updated: 2026-03-01
area: rfc
---

# RFC-002: Compositional Object System

> **Status**: Proposed
> **Issue**: [#52](https://github.com/jbcom/strata-game-library/issues/52)
> **Epic**: [#50](https://github.com/jbcom/strata-game-library/issues/50)

## Summary

This RFC proposes a compositional system for defining game objects through materials, skeletons, coverings, props, and creatures.

## The Core Insight

> "Wooden boards bound by metal banding form a panel; enough panels in 3D space form an ammo crate."

All game objects can be decomposed into:

1. **Rigid shapes** (box, cylinder, sphere, mesh)
2. **Materials** (wood, metal, fur, stone)
3. **Composition rules** (how parts connect)

This insight enables:

- **Massive code reduction**: Define objects declaratively
- **Procedural variation**: Generate variations automatically
- **Efficient rendering**: Share materials, instance similar objects
- **Designer-friendly**: Non-programmers can create content

## Material System

### Material Types

| Type | Description | Examples | Key Properties |
|------|-------------|----------|----------------|
| **Solid** | Opaque uniform surfaces | Wood, Stone, Metal | roughness, metalness |
| **Shell** | Layered surface effects | Fur, Feathers, Scales | layers, length, density |
| **Volumetric** | Transparent/refractive | Crystal, Glass, Water | refraction, absorption |
| **Organic** | Subsurface scattering | Flesh, Leather, Wax | scatterColor, scatterDistance |

### Material Interface

```typescript
interface MaterialDefinition {
  id: string;
  type: 'solid' | 'shell' | 'volumetric' | 'organic';
  
  // Common visual properties
  baseColor: Color;
  roughness: number;        // 0-1
  metalness: number;        // 0-1
  normalScale?: number;
  
  // Textures (optional)
  maps?: {
    diffuse?: Texture;
    normal?: Texture;
    roughness?: Texture;
    metalness?: Texture;
    ao?: Texture;
  };
  
  // Type-specific properties
  shell?: ShellProperties;
  volumetric?: VolumetricProperties;
  organic?: OrganicProperties;
  
  // Physics properties
  physics?: {
    density: number;      // kg/m³
    friction: number;     // 0-1
    restitution: number;  // 0-1 (bounciness)
  };
}

interface ShellProperties {
  layers: number;           // Number of shell layers (4-64)
  length: number;           // Length of strands (0.01-0.5)
  density: number;          // Strands per unit (100-10000)
  thickness: number;        // Strand thickness
  curvature: number;        // How much strands curve
  colorVariation: number;   // Random color variation (0-1)
  pattern?: ShellPattern;   // Spots, stripes, etc.
}

interface VolumetricProperties {
  refraction: number;       // Index of refraction (1.0-2.5)
  absorption: Color;        // Light absorption color
  transparency: number;     // 0-1
  density?: number;         // For fog/smoke effects
}

interface OrganicProperties {
  scatterColor: Color;      // Subsurface scatter color
  scatterDistance: number;  // How far light penetrates
  thickness?: number;       // For thin materials like ears
}
```

### Built-in Materials

```typescript
// Material factory functions
const MATERIALS = {
  // Fur variants
  fur_otter: createFurMaterial({
    baseColor: '#4a3520',
    length: 0.03,
    density: 5000,
    wetness: 0.3,
  }),
  
  fur_fox: createFurMaterial({
    baseColor: '#c45a25',
    length: 0.05,
    density: 4000,
    pattern: { type: 'gradient', to: '#ffffff', position: 'belly' },
  }),
  
  // Metals
  metal_iron: createMetalMaterial({
    baseColor: '#666666',
    roughness: 0.4,
    metalness: 1.0,
  }),
  
  metal_gold: createMetalMaterial({
    baseColor: '#ffd700',
    roughness: 0.2,
    metalness: 1.0,
  }),
  
  // Woods
  wood_oak: createWoodMaterial({
    baseColor: '#8b4513',
    grain: 'oak',
    roughness: 0.6,
  }),
  
  wood_pine: createWoodMaterial({
    baseColor: '#deb887',
    grain: 'pine',
    roughness: 0.5,
  }),
  
  // Shells
  shell_turtle: createShellMaterial({
    baseColor: '#2d4a2d',
    pattern: 'hexagonal',
    segments: 13,
  }),
  
  // Crystals
  crystal_quartz: createCrystalMaterial({
    baseColor: '#e8e8e8',
    refraction: 1.5,
    transparency: 0.9,
  }),
  
  // Organic
  flesh_mammal: createOrganicMaterial({
    baseColor: '#ffdbac',
    scatterColor: '#ff8888',
    scatterDistance: 0.02,
  }),
};
```

## Skeleton System

### Skeleton Interface

```typescript
interface BoneDefinition {
  id: string;
  parent?: string;          // Parent bone ID
  position: Vector3;        // Relative to parent
  rotation?: Quaternion;
  
  // Shape for mesh generation
  shape: 'capsule' | 'box' | 'sphere' | 'cylinder' | 'custom';
  size: [number, number, number];
  
  // Physics (if ragdoll)
  physics?: {
    mass: number;
    constraints?: JointConstraints;
  };
}

interface SkeletonDefinition {
  id: string;
  type: 'biped' | 'quadruped' | 'serpentine' | 'avian' | 'aquatic' | 'custom';
  
  bones: BoneDefinition[];
  
  // Inverse Kinematics
  ikChains?: IKChainDefinition[];
  
  // Animation targets
  animationTargets?: {
    [name: string]: string[];  // Animation name -> affected bones
  };
}
```

### Skeleton Presets

```typescript
// Quadruped skeleton (otter, fox, rabbit, etc.)
function createQuadrupedSkeleton(options: {
  bodyLength: number;
  bodyWidth?: number;
  legRatio: number;       // Leg length relative to body
  tailLength: number;
  headSize: number;
  neckLength?: number;
}): SkeletonDefinition {
  return {
    id: 'quadruped',
    type: 'quadruped',
    bones: (() => {
      // Utility: convert Euler angles in degrees (x, y, z) to a quaternion { x, y, z, w }
      const eulerToQuat = (x: number, y: number, z: number) => {
        const toRad = (angle: number) => (angle * Math.PI) / 180;
        const rx = toRad(x);
        const ry = toRad(y);
        const rz = toRad(z);

        const cx = Math.cos(rx / 2);
        const sx = Math.sin(rx / 2);
        const cy = Math.cos(ry / 2);
        const sy = Math.sin(ry / 2);
        const cz = Math.cos(rz / 2);
        const sz = Math.sin(rz / 2);

        return {
          x: sx * cy * cz - cx * sy * sz,
          y: cx * sy * cz + sx * cy * sz,
          z: cx * cy * sz - sx * sy * cz,
          w: cx * cy * cz + sx * sy * sz,
        };
      };

      return [
        { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
        { id: 'spine_base', parent: 'root', shape: 'capsule', size: [options.bodyLength * 0.3, 0.1, 0.1], position: [0, 0, 0] },
        { id: 'spine_mid', parent: 'spine_base', shape: 'capsule', size: [options.bodyLength * 0.4, 0.12, 0.12], position: [options.bodyLength * 0.3, 0, 0] },
        { id: 'spine_upper', parent: 'spine_mid', shape: 'capsule', size: [options.bodyLength * 0.3, 0.1, 0.1], position: [options.bodyLength * 0.4, 0, 0] },
        // Neck and head
        { id: 'neck', parent: 'spine_upper', shape: 'capsule', size: [options.neckLength ?? 0.1, 0.06, 0.06], position: [options.bodyLength * 0.3, 0, 0] },
        { id: 'head', parent: 'neck', shape: 'sphere', size: [options.headSize, options.headSize * 0.8, options.headSize], position: [options.neckLength ?? 0.1, 0, 0] },
        // Legs (simplified)
        { id: 'leg_front_l', parent: 'spine_upper', shape: 'capsule', size: [0.02, options.bodyLength * options.legRatio, 0.02], position: [0.1, -0.05, 0.05] },
        { id: 'leg_front_r', parent: 'spine_upper', shape: 'capsule', size: [0.02, options.bodyLength * options.legRatio, 0.02], position: [0.1, -0.05, -0.05] },
        { id: 'leg_back_l', parent: 'spine_base', shape: 'capsule', size: [0.02, options.bodyLength * options.legRatio * 0.9, 0.02], position: [0, -0.05, 0.05] },
        { id: 'leg_back_r', parent: 'spine_base', shape: 'capsule', size: [0.02, options.bodyLength * options.legRatio * 0.9, 0.02], position: [0, -0.05, -0.05] },
        // Tail
        { id: 'tail_base', parent: 'spine_base', shape: 'capsule', size: [options.tailLength * 0.3, 0.03, 0.03], position: [-0.05, 0, 0], rotation: eulerToQuat(0, 0, -30) },
        { id: 'tail_mid', parent: 'tail_base', shape: 'capsule', size: [options.tailLength * 0.4, 0.025, 0.025], position: [-options.tailLength * 0.3, 0, 0] },
        { id: 'tail_tip', parent: 'tail_mid', shape: 'capsule', size: [options.tailLength * 0.3, 0.02, 0.02], position: [-options.tailLength * 0.4, 0, 0] },
      ];
    })(),
    ikChains: [
      { id: 'leg_front_l_ik', bones: ['leg_front_l'], target: 'front_left_foot' },
      { id: 'leg_front_r_ik', bones: ['leg_front_r'], target: 'front_right_foot' },
      { id: 'leg_back_l_ik', bones: ['leg_back_l'], target: 'back_left_foot' },
      { id: 'leg_back_r_ik', bones: ['leg_back_r'], target: 'back_right_foot' },
    ],
  };
}

// Additional presets
const SKELETONS = {
  biped: createBipedSkeleton({ height: 1.8 }),
  quadruped_small: createQuadrupedSkeleton({ bodyLength: 0.4, legRatio: 0.3, tailLength: 0.3, headSize: 0.1 }),
  quadruped_medium: createQuadrupedSkeleton({ bodyLength: 0.6, legRatio: 0.4, tailLength: 0.4, headSize: 0.15 }),
  quadruped_large: createQuadrupedSkeleton({ bodyLength: 1.2, legRatio: 0.5, tailLength: 0.6, headSize: 0.25 }),
  avian: createAvianSkeleton({ wingspan: 1.2, bodyLength: 0.3 }),
  serpentine: createSerpentineSkeleton({ length: 2.0, segments: 20 }),
};
```

## Covering System

### Covering Interface

```typescript
interface CoveringDefinition {
  skeleton: string;  // Reference to skeleton
  
  // Region-based material application
  regions: {
    [bonePattern: string]: {
      material: string;       // Material ID
      color?: Color;          // Override material base color
      scale?: number;         // Scale texture/pattern
      variation?: number;     // Random variation amount
    };
  };
  
  // Pattern overlays
  patterns?: PatternDefinition[];
  
  // Markings
  markings?: MarkingDefinition[];
}

interface PatternDefinition {
  type: 'spots' | 'stripes' | 'gradient' | 'patches';
  color: Color;
  coverage: number;     // 0-1
  size?: number;
  direction?: Vector3;  // For stripes/gradient
}

interface MarkingDefinition {
  type: 'mask' | 'collar' | 'socks' | 'custom';
  regions: string[];
  color: Color;
}
```

### Example Coverings

```typescript
// River Otter covering
const otterCovering: CoveringDefinition = {
  skeleton: 'quadruped_medium',
  regions: {
    'body*': { material: 'fur_otter', color: '#4a3520' },
    'spine*': { material: 'fur_otter', color: '#4a3520' },
    'belly': { material: 'fur_otter', color: '#8b7355', variation: 0.1 },
    'head': { material: 'fur_otter', color: '#4a3520' },
    'tail*': { material: 'fur_otter', color: '#3d2817' },
    'leg*': { material: 'fur_otter', color: '#3d2817' },
    'nose': { material: 'flesh_mammal', color: '#2d2d2d' },
  },
  markings: [
    { type: 'mask', regions: ['head'], color: '#8b7355' },
  ],
};

// Red Fox covering
const foxCovering: CoveringDefinition = {
  skeleton: 'quadruped_medium',
  regions: {
    '*': { material: 'fur_fox', color: '#c45a25' },
    'belly': { material: 'fur_fox', color: '#ffffff' },
    'tail_tip': { material: 'fur_fox', color: '#ffffff' },
  },
  markings: [
    { type: 'socks', regions: ['leg*'], color: '#2d2d2d' },
  ],
};
```

## Prop System

### Prop Interface

```typescript
interface PropDefinition {
  id: string;
  name: string;
  
  // Composition
  components: PropComponent[];
  
  // Physics
  physics?: {
    type: 'static' | 'dynamic' | 'kinematic';
    mass?: number;
    friction?: number;
    restitution?: number;
  };
  
  // Interaction
  interaction?: {
    type: 'container' | 'seat' | 'door' | 'switch' | 'collectible';
    capacity?: number;    // For containers
    contents?: string[];  // For containers
    action?: string;      // For switches
  };
  
  // Audio
  audio?: {
    impact?: string;      // Sound on collision
    interaction?: string; // Sound on interact
  };
}

interface PropComponent {
  shape: 'box' | 'cylinder' | 'sphere' | 'capsule' | 'mesh';
  size: [number, number, number];
  position: Vector3;
  rotation?: Quaternion;
  material: string;
  
  // For mesh shape
  mesh?: string;  // Path to GLB/mesh
}
```

### Prop Examples

```typescript
// Wooden Crate
const woodenCrate: PropDefinition = {
  id: 'crate_wooden',
  name: 'Wooden Crate',
  components: [
    // Wood panels (6 sides)
    { shape: 'box', size: [1, 0.05, 1], position: new Vector3(0, -0.475, 0), material: 'wood_oak' },
    { shape: 'box', size: [1, 0.05, 1], position: new Vector3(0, 0.475, 0), material: 'wood_oak' },
    { shape: 'box', size: [0.05, 0.9, 1], position: new Vector3(-0.475, 0, 0), material: 'wood_oak' },
    { shape: 'box', size: [0.05, 0.9, 1], position: new Vector3(0.475, 0, 0), material: 'wood_oak' },
    { shape: 'box', size: [0.9, 0.9, 0.05], position: new Vector3(0, 0, -0.475), material: 'wood_oak' },
    { shape: 'box', size: [0.9, 0.9, 0.05], position: new Vector3(0, 0, 0.475), material: 'wood_oak' },
    // Metal bands
    { shape: 'box', size: [1.05, 0.03, 0.02], position: new Vector3(0, 0.3, 0.49), material: 'metal_iron' },
    { shape: 'box', size: [1.05, 0.03, 0.02], position: new Vector3(0, -0.3, 0.49), material: 'metal_iron' },
    { shape: 'box', size: [0.02, 0.03, 1.05], position: new Vector3(0.49, 0.3, 0), material: 'metal_iron' },
    { shape: 'box', size: [0.02, 0.03, 1.05], position: new Vector3(0.49, -0.3, 0), material: 'metal_iron' },
  ],
  physics: { type: 'dynamic', mass: 25, friction: 0.6 },
  interaction: { type: 'container', capacity: 10 },
  audio: { impact: 'wood_thud', interaction: 'crate_open' },
};

// Simple Chair
const woodenChair: PropDefinition = {
  id: 'chair_wooden',
  name: 'Wooden Chair',
  components: [
    // Seat
    { shape: 'box', size: [0.45, 0.03, 0.45], position: new Vector3(0, 0.45, 0), material: 'wood_oak' },
    // Backrest
    { shape: 'box', size: [0.45, 0.5, 0.03], position: new Vector3(0, 0.72, -0.21), material: 'wood_oak' },
    // Legs
    { shape: 'box', size: [0.03, 0.45, 0.03], position: new Vector3(-0.19, 0.225, 0.19), material: 'wood_oak' },
    { shape: 'box', size: [0.03, 0.45, 0.03], position: new Vector3(0.19, 0.225, 0.19), material: 'wood_oak' },
    { shape: 'box', size: [0.03, 0.45, 0.03], position: new Vector3(-0.19, 0.225, -0.19), material: 'wood_oak' },
    { shape: 'box', size: [0.03, 0.45, 0.03], position: new Vector3(0.19, 0.225, -0.19), material: 'wood_oak' },
  ],
  physics: { type: 'dynamic', mass: 5, friction: 0.5 },
  interaction: { type: 'seat' },
};
```

## Creature System

### Creature Interface

```typescript
interface CreatureDefinition {
  id: string;
  name: string;
  description?: string;
  
  // Composition
  skeleton: string | SkeletonDefinition;
  covering: CoveringDefinition;
  
  // Scale
  scale?: number;
  scaleVariation?: number;  // Random variation
  
  // Stats
  stats: {
    health: number;
    speed: number;
    swimSpeed?: number;
    flySpeed?: number;
    stamina?: number;
    strength?: number;
  };
  
  // Behavior
  ai: AIPresetName | AIDefinition;
  
  // Animations
  animations: {
    idle: AnimationClip | string;
    walk: AnimationClip | string;
    run: AnimationClip | string;
    swim?: AnimationClip | string;
    fly?: AnimationClip | string;
    attack?: AnimationClip | string;
    death?: AnimationClip | string;
    [key: string]: AnimationClip | string | undefined;
  };
  
  // Spawning
  biomes: BiomeType[];
  spawnWeight: number;      // Relative spawn chance
  packSize?: [number, number];  // Min, max pack size
  timeOfDay?: ('day' | 'night' | 'dawn' | 'dusk')[];
  
  // Drops
  drops?: DropTable;
  
  // Sounds
  sounds?: {
    idle?: string[];
    alert?: string;
    attack?: string;
    hurt?: string;
    death?: string;
  };
}
```

### Creature Example

```typescript
const riverOtter: CreatureDefinition = {
  id: 'otter_river',
  name: 'River Otter',
  description: 'A playful aquatic mammal often seen fishing in rivers.',
  
  skeleton: 'quadruped_medium',
  covering: otterCovering,
  
  scale: 1.0,
  scaleVariation: 0.15,
  
  stats: {
    health: 50,
    speed: 6,
    swimSpeed: 12,
    stamina: 80,
  },
  
  ai: 'prey',  // Uses prey AI preset
  
  animations: {
    idle: 'otter_idle',
    walk: 'otter_walk',
    run: 'otter_run',
    swim: 'otter_swim',
    eat: 'otter_eat',
    play: 'otter_play',
  },
  
  biomes: ['marsh', 'river', 'lake'],
  spawnWeight: 0.4,
  packSize: [2, 6],
  timeOfDay: ['day', 'dawn', 'dusk'],
  
  drops: {
    guaranteed: [{ item: 'otter_pelt', count: 1 }],
    chance: [{ item: 'fish', count: [1, 3], probability: 0.3 }],
  },
  
  sounds: {
    idle: ['otter_chirp_1', 'otter_chirp_2', 'otter_squeak'],
    alert: 'otter_alert',
    hurt: 'otter_hurt',
  },
};
```

## Implementation Plan

1. **Week 1**: Material system and solid materials
2. **Week 1**: Shell materials (fur)
3. **Week 2**: Skeleton system and presets
4. **Week 2**: Covering system
5. **Week 3**: Prop system and presets
6. **Week 3**: Creature system

## Open Questions

1. **LOD for fur**: How to handle fur at distance? Switch to solid material?
2. **Procedural animation**: Should skeleton support procedural walk cycles?
3. **Material blending**: Can materials blend at region boundaries?

---

*Parent: [RFC Index](../README.md)*
