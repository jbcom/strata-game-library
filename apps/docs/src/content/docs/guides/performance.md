---
title: Performance Tips
description: Optimization guide for Strata applications
---

# Performance Tips

Guidelines for optimizing Strata applications across different platforms.

## Platform Targets

| Platform | Target FPS | Key Constraints |
|----------|------------|-----------------|
| Mobile | 30-60 | GPU limited, thermal |
| Desktop | 60 | Balanced |
| High-end | 60-144 | Full quality |

## General Principles

### 1. Profile First

Always measure before optimizing:

```tsx
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf position="top-left" />
  {/* Your scene */}
</Canvas>
```

### 2. Use LOD

Enable level-of-detail for all systems:

```tsx
<Terrain lodLevels={3} lodDistances={[50, 150, 400]} />
<TreeInstances lodLevels={4} billboardDistance={200} />
<GrassInstances fadeStart={80} fadeEnd={100} />
```

### 3. Limit Draw Calls

Target < 100 draw calls on mobile:

```tsx
// ❌ Bad: Individual meshes
{trees.map(t => <TreeMesh position={t.pos} />)}

// ✅ Good: Instanced rendering
<TreeInstances count={trees.length} positions={treePositions} />
```

## Feature-Specific Optimization

### Terrain

```tsx
// Mobile
<Terrain resolution={32} chunkSize={64} viewDistance={2} />

// Desktop
<Terrain resolution={64} chunkSize={32} viewDistance={4} />
```

### Water

```tsx
// Mobile - disable expensive effects
<Water
  segments={64}
  reflections={false}
  caustics={false}
/>

// Desktop - enable effects
<AdvancedWater
  segments={128}
  reflections
  reflectionResolution={512}
  caustics
/>
```

### Vegetation

| Quality | Grass | Trees | Rocks |
|---------|-------|-------|-------|
| Mobile | 3,000 | 100 | 50 |
| Desktop | 15,000 | 500 | 200 |
| High-end | 50,000 | 2,000 | 500 |

### Volumetrics

```tsx
// Mobile
<VolumetricFogMesh steps={16} animated={false} />

// Desktop
<VolumetricFogMesh steps={32} animated />
```

### Sky

```tsx
// Mobile
<ProceduralSky stars={false} moon={false} />

// Desktop
<ProceduralSky stars starCount={5000} moon />
```

## Adaptive Quality

```tsx
import { useDevice } from '@strata-game-library/capacitor-plugin/react';

function AdaptiveScene() {
  const device = useDevice();
  const isMobile = device.deviceType === 'mobile';

  const quality = isMobile ? {
    grassCount: 3000,
    treeCount: 100,
    waterReflections: false,
    volumetricSteps: 16,
  } : {
    grassCount: 15000,
    treeCount: 500,
    waterReflections: true,
    volumetricSteps: 32,
  };

  return (
    <Canvas dpr={isMobile ? 1 : [1, 2]}>
      <GrassInstances count={quality.grassCount} />
      <TreeInstances count={quality.treeCount} />
      <Water reflections={quality.waterReflections} />
      <VolumetricFogMesh steps={quality.volumetricSteps} />
    </Canvas>
  );
}
```

## Common Issues

### Issue: Low FPS

1. Check draw call count (use r3f-perf)
2. Reduce instance counts
3. Lower texture resolutions
4. Disable post-processing

### Issue: Memory Warnings

1. Dispose unused geometries/materials
2. Use texture atlases
3. Implement object pooling
4. Lower texture resolutions

### Issue: Thermal Throttling

1. Cap frame rate to 30fps on mobile
2. Reduce shader complexity
3. Disable shadows
4. Use simpler effects

## Related

- [Architecture](/getting-started/architecture/)
- [Mobile Plugins](/mobile/)
