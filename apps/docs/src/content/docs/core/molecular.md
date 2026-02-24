---
title: Molecular Rendering
description: Scientific visualization for molecules, particles, and atomic structures
---

# 🔬 Molecular Rendering

Strata provides specialized rendering for molecular structures, particle systems, and scientific visualization.

## Quick Start

```tsx
import { MoleculeRenderer } from '@strata-game-library/core';

<MoleculeRenderer
  atoms={moleculeData.atoms}
  bonds={moleculeData.bonds}
/>
```

## Components

### `<MoleculeRenderer>`

Render molecular structures:

```tsx
import { MoleculeRenderer } from '@strata-game-library/core';

<MoleculeRenderer
  // Data
  atoms={[
    { element: 'C', position: [0, 0, 0] },
    { element: 'H', position: [1, 0, 0] },
    { element: 'H', position: [-0.5, 0.866, 0] },
    { element: 'H', position: [-0.5, -0.866, 0] },
    { element: 'H', position: [0, 0, 1] },
  ]}
  bonds={[
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 0, to: 4 },
  ]}

  // Visual style
  style="ball-and-stick"  // or "space-fill", "wireframe", "cartoon"

  // Sizing
  atomScale={1}
  bondRadius={0.1}

  // Colors
  colorScheme="element"  // or "chain", "residue", "custom"
/>
```

### `<AtomicParticles>`

GPU-instanced atomic particles:

```tsx
import { AtomicParticles } from '@strata-game-library/core';

<AtomicParticles
  count={10000}

  // Particle properties
  positions={particlePositions}
  velocities={particleVelocities}

  // Visual
  size={0.1}
  color="#00ffff"
  glow

  // Physics
  physics
  gravity={[0, 0, 0]}
  charge={-1}
/>
```

## Rendering Styles

### Ball-and-Stick

Classic molecular visualization:

```tsx
<MoleculeRenderer
  style="ball-and-stick"
  atomScale={0.3}       // Relative atom size
  bondRadius={0.1}      // Bond thickness
  bondStyle="cylinder"  // or "stick", "line"
/>
```

### Space-Fill (CPK)

Atoms at van der Waals radii:

```tsx
<MoleculeRenderer
  style="space-fill"
  atomScale={1}  // Full van der Waals radius
/>
```

### Wireframe

Lines only:

```tsx
<MoleculeRenderer
  style="wireframe"
  lineWidth={2}
  atomPoints  // Show atoms as points
/>
```

### Cartoon (Proteins)

Secondary structure visualization:

```tsx
<MoleculeRenderer
  style="cartoon"
  helixStyle="ribbon"
  sheetStyle="arrow"
  loopStyle="tube"
/>
```

## Color Schemes

### Element Colors (CPK)

```tsx
<MoleculeRenderer
  colorScheme="element"
  // Uses standard CPK colors:
  // C: gray, H: white, O: red, N: blue, S: yellow, etc.
/>
```

### Chain Colors

```tsx
<MoleculeRenderer
  colorScheme="chain"
  chainColors={['#ff0000', '#00ff00', '#0000ff', '#ffff00']}
/>
```

### Custom Colors

```tsx
<MoleculeRenderer
  colorScheme="custom"
  colorFunction={(atom) => {
    if (atom.charge > 0) return '#ff0000';
    if (atom.charge < 0) return '#0000ff';
    return '#ffffff';
  }}
/>
```

### Property-Based

```tsx
<MoleculeRenderer
  colorScheme="property"
  property="temperature"
  colorScale={['#0000ff', '#00ff00', '#ff0000']}
  propertyRange={[0, 100]}
/>
```

## Animation

### Vibration Modes

```tsx
<MoleculeRenderer
  animation="vibration"
  vibrationMode={0}       // Normal mode index
  vibrationAmplitude={0.1}
  vibrationSpeed={1}
/>
```

### Trajectory Playback

```tsx
<MoleculeRenderer
  animation="trajectory"
  trajectory={trajectoryData}
  frame={currentFrame}
  interpolate
/>
```

### Rotation

```tsx
<MoleculeRenderer
  autoRotate
  rotationSpeed={0.5}
  rotationAxis={[0, 1, 0]}
/>
```

## Loading Molecular Data

### PDB Files

```tsx
import { loadPDB } from '@strata-game-library/core/molecular';

const molecule = await loadPDB('/proteins/1crn.pdb');

<MoleculeRenderer
  atoms={molecule.atoms}
  bonds={molecule.bonds}
  residues={molecule.residues}
  chains={molecule.chains}
/>
```

### SDF/MOL Files

```tsx
import { loadSDF } from '@strata-game-library/core/molecular';

const molecule = await loadSDF('/molecules/caffeine.sdf');

<MoleculeRenderer
  atoms={molecule.atoms}
  bonds={molecule.bonds}
/>
```

### XYZ Files

```tsx
import { loadXYZ } from '@strata-game-library/core/molecular';

const trajectory = await loadXYZ('/trajectories/water.xyz');

<MoleculeRenderer
  atoms={trajectory.frames[0].atoms}
/>
```

## Particle Systems

### Electron Cloud

```tsx
import { ElectronCloud } from '@strata-game-library/core';

<ElectronCloud
  nucleusPosition={[0, 0, 0]}
  orbitalType="2p"
  electronCount={6}

  // Visual
  cloudDensity={1000}
  cloudOpacity={0.3}
  cloudColor="#0088ff"

  // Animation
  animated
  orbitSpeed={1}
/>
```

### Particle Field

```tsx
import { ParticleField } from '@strata-game-library/core';

<ParticleField
  count={5000}

  // Distribution
  shape="sphere"
  radius={10}

  // Properties
  velocityField={(position) => {
    return [
      -position[1],
      position[0],
      0
    ];
  }}

  // Forces
  forces={[
    { type: 'gravity', strength: -9.8, direction: [0, 1, 0] },
    { type: 'drag', strength: 0.1 }
  ]}

  // Visual
  pointSize={0.05}
  colorByVelocity
/>
```

## Scientific Visualization

### Isosurfaces

```tsx
import { Isosurface } from '@strata-game-library/core';

<Isosurface
  data={volumetricData}
  isoValue={0.5}
  color="#00ffff"
  opacity={0.7}

  // Quality
  resolution={64}
  smooth
/>
```

### Vector Fields

```tsx
import { VectorField } from '@strata-game-library/core';

<VectorField
  data={vectorFieldData}

  // Display
  style="arrows"  // or "streamlines", "glyphs"
  scale={1}
  colorByMagnitude

  // Density
  sampleDensity={[10, 10, 10]}
/>
```

## Performance

### Large Molecules

```tsx
// For proteins with 10,000+ atoms
<MoleculeRenderer
  atoms={largeProtein.atoms}

  // Optimization
  instancedRendering  // Use GPU instancing
  lodEnabled
  lodDistances={[50, 150, 500]}

  // Culling
  frustumCulling
  occlusionCulling
/>
```

### Many Particles

```tsx
// For simulations with 100,000+ particles
<AtomicParticles
  count={100000}

  // Use GPU compute
  gpuCompute
  computeShader={particleComputeShader}

  // Rendering
  pointSprites  // Faster than spheres
/>
```

## Related

- [Ray Marching](/core/raymarching/) - Volume rendering
- [Volumetrics](/core/volumetrics/) - Atmospheric effects
- [Shaders](/shaders/) - Custom visualization shaders
