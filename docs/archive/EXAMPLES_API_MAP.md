# Examples → API Mapping

## Complete Cross-Reference Between Examples and APIs

This document provides a comprehensive mapping between all example code and the Strata APIs they demonstrate. Every API method in Strata is linked to at least one working example.

---

## Table of Contents

1. [Vegetation & Instancing APIs](#vegetation--instancing-apis)
2. [Water System APIs](#water-system-apis)
3. [Sky & Atmospheric APIs](#sky--atmospheric-apis)
4. [Terrain Generation APIs](#terrain-generation-apis)
5. [Character & Animation APIs](#character--animation-apis)
6. [Particle System APIs](#particle-system-apis)
7. [Physics APIs](#physics-apis)
8. [Shader Presets](#shader-presets)
9. [State Management APIs](#state-management-apis)
10. [Audio System APIs](#audio-system-apis)

---

## Vegetation & Instancing APIs

### `createGrassInstances`

**Source**: `src/presets/vegetation/index.ts#L84`  
**Type**: `(count: number, areaSize: number, biomes: BiomeData[], options?: {...}) => THREE.InstancedMesh`

**Examples**:
- **Basic Usage**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_BasicGrassInstances`
- **With Height Function**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_AdvancedGrassWithHeightFunction`
- **Multi-Biome**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_MultiBiomeGrassDistribution`
- **Interactive Demo**: `examples/vegetation-showcase/src/App.tsx`

**Parameters Demonstrated**:
- `count`: 1000 to 50,000 instances
- `areaSize`: 50 to 200 units
- `heightFunction`: Custom terrain-following functions
- `seed`: Deterministic placement (42, 123, etc.)
- `enableWind`: Wind animation toggle
- `windStrength`: 0.5 to 1.0 for varying movement
- `lodDistance`: 100 to 200 for visibility culling

---

### `createTreeInstances`

**Source**: `src/presets/vegetation/index.ts#L118`  
**Type**: `(count: number, areaSize: number, biomes: BiomeData[], options?: {...}) => THREE.InstancedMesh`

**Examples**:
- **Basic Trees**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_TreeInstances`
- **Forest Scene**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_CompleteVegetationScene`

**Parameters Demonstrated**:
- `count`: 200 to 600 instances
- Forest-biome preference
- Lower wind strength (0.3) than grass
- Larger LOD distance (200 units)

---

### `createRockInstances`

**Source**: `src/presets/vegetation/index.ts#L155`  
**Type**: `(count: number, areaSize: number, biomes: BiomeData[], options?: {...}) => THREE.InstancedMesh`

**Examples**:
- **Rock Formation**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_RockInstances`
- **Environmental Detail**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_CompleteVegetationScene`

**Parameters Demonstrated**:
- `count`: 100 to 200 instances
- Rocky-biome preference
- No wind animation
- Extended LOD distance (250 units)

---

### `createVegetationMesh`

**Source**: `src/presets/vegetation/index.ts#L29`  
**Type**: `(options: VegetationOptions) => THREE.InstancedMesh`

**Examples**:
- **Custom Flowers**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_CustomVegetation`

**Parameters Demonstrated**:
- Custom geometry (ConeGeometry for flowers)
- Custom material (with emissive glow)
- All standard vegetation options
- Higher wind strength (1.0) for delicate plants

---

### `generateInstanceData`

**Source**: `src/core/instancing.ts#L60`  
**Type**: `(count: number, areaSize: number, heightFunction: ..., biomes?: BiomeData[], allowedBiomes?: string[], seed?: number) => InstanceData[]`

**Examples**:
- **Direct Usage**: `examples/api-showcase/src/examples/vegetation/VegetationExamples.tsx#Example_DirectInstanceGeneration`

**Use Cases**:
- Custom rendering pipelines
- Physics object placement
- Game entity spawning
- Non-mesh instance data

**Returns**: Array of `{ position: Vector3, rotation: Euler, scale: Vector3 }`

---

### `BiomeData` Type

**Source**: `src/core/sdf.ts#BiomeData`  
**Type**: `{ name: string, threshold: number, color: number, vegetation: number }`

**Examples**:
- All vegetation examples use BiomeData
- Demonstrates multiple biome configurations

**Properties**:
- `name`: Biome identifier
- `threshold`: Noise value threshold (0-1)
- `color`: Terrain color (hex)
- `vegetation`: Density multiplier (0-3+)

---

## Water System APIs

### `Water` Component

**Source**: `src/presets/water/Water.tsx#L21`  
**Type**: `React Component`

**Props**:
```typescript
{
    position?: [number, number, number];
    size?: number;
    segments?: number;
}
```

**Examples**:
- **Basic Setup**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_BasicWater`
- **Interactive Demo**: `examples/water-scene/src/App.tsx`

---

### `AdvancedWater` Component

**Source**: `src/presets/water/Water.tsx#L59`  
**Type**: `React Component`

**Props**:
```typescript
{
    position?: [number, number, number];
    size?: [number, number];
    segments?: number;
    waterColor?: THREE.ColorRepresentation;
    deepWaterColor?: THREE.ColorRepresentation;
    foamColor?: THREE.ColorRepresentation;
    causticIntensity?: number;
}
```

**Examples**:
- **Full Features**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_AdvancedWaterWithCaustics`
- **Ocean Preset**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_DeepOceanWater`
- **Tropical Preset**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_TropicalLagoonWater`
- **Swamp Preset**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_MurkySwampWater`
- **Caustics**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_WaterWithCausticsProjection`

---

### `createWaterMaterial`

**Source**: `src/core/water.ts#L30`  
**Type**: `() => THREE.ShaderMaterial`

**Examples**:
- **Vanilla Three.js**: `examples/api-showcase/src/examples/water/WaterExamples.tsx#Example_CustomWaterMaterial`

**Uniforms**:
- `time`: Animation time value
- `waveHeight`: Wave amplitude
- `waveSpeed`: Animation speed
- `color`: Water base color

---

### `createAdvancedWaterMaterial`

**Source**: `src/core/water.ts#L120`  
**Type**: `(options: AdvancedWaterMaterialOptions) => THREE.ShaderMaterial`

**Examples**:
- Used internally by AdvancedWater component
- See AdvancedWater examples for usage

---

## Sky & Atmospheric APIs

### `ProceduralSky` Component

**Source**: `src/components/Sky.tsx#L56`  
**Type**: `React Component`

**Props**:
```typescript
{
    timeOfDay?: Partial<TimeOfDayState>;
    weather?: Partial<WeatherState>;
    size?: [number, number];
    distance?: number;
}
```

**Examples**:
- **Basic**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_BasicSky`
- **Dawn**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_DawnSky`
- **Noon**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_NoonSky`
- **Sunset**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_SunsetSky`
- **Night**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_NightSky`
- **Stormy**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_StormySky`
- **Animated Cycle**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_AnimatedDayNightCycle`
- **Interactive Demo**: `examples/sky-volumetrics/src/App.tsx`

---

### `TimeOfDayState` Type

**Source**: `src/core/sky.ts#L10`

**Properties**:
```typescript
{
    sunIntensity: number;    // 0-1
    sunAngle: number;        // 0-180 degrees
    ambientLight: number;    // 0-1
    starVisibility: number;  // 0-1
    fogDensity: number;      // 0-1
}
```

**Examples**: All sky examples demonstrate time of day configuration

---

### `createSkyMaterial`

**Source**: `src/core/sky.ts#L32`  
**Type**: `(options: SkyMaterialOptions) => THREE.ShaderMaterial`

**Examples**:
- Used internally by ProceduralSky
- Core API for vanilla Three.js integration

---

### `createVolumetricFogMeshMaterial`

**Source**: `src/core/volumetrics.ts#L37`  
**Type**: `(options?: VolumetricFogMeshMaterialOptions) => THREE.ShaderMaterial`

**Examples**:
- **Fog Setup**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_VolumetricFog`

**Options**:
- `color`: Fog color (THREE.Color)
- `density`: Thickness (0.01-0.1)
- `height`: Height falloff (5-20 units)
- `cameraPosition`: For depth calculation

---

### `createUnderwaterOverlayMaterial`

**Source**: `src/core/volumetrics.ts#L73`  
**Type**: `(options?: UnderwaterOverlayMaterialOptions) => THREE.ShaderMaterial`

**Examples**:
- **Underwater Effect**: `examples/api-showcase/src/examples/sky/SkyExamples.tsx#Example_UnderwaterEffect`

**Options**:
- `waterColor`: Underwater tint
- `density`: Underwater fog
- `causticStrength`: Caustics intensity
- `waterSurface`: Y position of water
- `cameraY`: Current camera height

---

## Terrain Generation APIs

### SDF Functions

**Source**: `src/core/sdf.ts`

Available Functions:
- `sdTerrain(p: Vector3, frequency: number, amplitude: number) => number`
- `sdSphere(p: Vector3, radius: number) => number`
- `sdBox(p: Vector3, size: Vector3) => number`
- `sdCapsule(p: Vector3, a: Vector3, b: Vector3, radius: number) => number`
- `sdTorus(p: Vector3, majorRadius: number, minorRadius: number) => number`
- `sdCone(p: Vector3, angle: number, height: number) => number`
- `sdPlane(p: Vector3, normal: Vector3, distance: number) => number`
- `sdRock(p: Vector3, seed: number) => number`
- `sdCaves(p: Vector3, frequency: number, threshold: number) => number`

**Boolean Operations**:
- `opUnion(d1: number, d2: number) => number`
- `opSubtraction(d1: number, d2: number) => number`
- `opIntersection(d1: number, d2: number) => number`
- `opSmoothUnion(d1: number, d2: number, k: number) => number`
- `opSmoothSubtraction(d1: number, d2: number, k: number) => number`
- `opSmoothIntersection(d1: number, d2: number, k: number) => number`

**Noise Functions**:
- `noise3D(x: number, y: number, z: number, seed?: number) => number`
- `fbm(x: number, y: number, octaves: number, lacunarity: number, seed?: number) => number`
- `warpedFbm(x: number, y: number, octaves: number, seed?: number) => number`

**Terrain Helpers**:
- `getTerrainHeight(x: number, z: number, frequency: number, amplitude: number) => number`
- `getBiomeAt(x: number, z: number, biomes: BiomeData[], seed?: number) => BiomeData`
- `calcNormal(sdf: (p: Vector3) => number, p: Vector3, epsilon: number) => Vector3`

**Examples**:
- **FBM Usage**: `examples/vegetation-showcase/src/App.tsx#ProceduralTerrain` (uses fbm for heightmap)
- More terrain examples coming in api-showcase

---

## Quick Reference: Finding Examples by API

### By Feature
- **Vegetation**: `examples/api-showcase/src/examples/vegetation/`
- **Water**: `examples/api-showcase/src/examples/water/`
- **Sky**: `examples/api-showcase/src/examples/sky/`

### By Complexity
- **Basic**: Look for `@category Basic` in JSDoc
- **Advanced**: Look for `@category Advanced` in JSDoc
- **Complete**: Look for `@category Complete` in JSDoc

### By Use Case
- **React Components**: Interactive demos in `examples/vegetation-showcase/`, etc.
- **Core API (Vanilla Three.js)**: Examples marked `@category Core` in api-showcase
- **Presets**: Examples showing preset configurations

---

## Contributing Examples

When adding new APIs to Strata:

1. **Create Example**: Add to `examples/api-showcase/src/examples/[system]/`
2. **Use JSDoc**: Include `@see`, `@example`, and `@apiExample` tags
3. **Link to Source**: Add GitHub URL in `@see` tag
4. **Update This Map**: Add entry in appropriate section
5. **Test**: Ensure example runs and demonstrates the API correctly

---

## Additional Resources

- **API Reference**: See `API.md` for complete API documentation
- **Public API Contract**: See `PUBLIC_API.md` for stability guarantees
- **Examples README**: See `examples/README.md` for running instructions
- **Interactive Gallery**: Visit `https://jbcom.github.io/nodejs-strata/` when deployed

---

Last Updated: 2025-12-18
