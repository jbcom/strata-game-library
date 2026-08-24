# @jbcom/strata API Documentation

## Public API Contract

This library provides **three distinct entry points** with clear separation:

### 1. Core API (`@jbcom/strata/core` or `@jbcom/strata`)

**Pure TypeScript, zero dependencies on React or R3F**

#### SDF Primitives
```typescript
sdSphere(p: Vector3, center: Vector3, radius: number): number
sdBox(p: Vector3, center: Vector3, halfExtents: Vector3): number
sdPlane(p: Vector3, height: number): number
sdCapsule(p: Vector3, a: Vector3, b: Vector3, radius: number): number
sdTorus(p: Vector3, center: Vector3, majorRadius: number, minorRadius: number): number
sdCone(p: Vector3, center: Vector3, angle: number, height: number): number
```

#### SDF Operations
```typescript
opUnion(d1: number, d2: number): number
opSubtraction(d1: number, d2: number): number
opIntersection(d1: number, d2: number): number
opSmoothUnion(d1: number, d2: number, k: number): number
opSmoothSubtraction(d1: number, d2: number, k: number): number
opSmoothIntersection(d1: number, d2: number, k: number): number
```

#### Noise Functions
```typescript
noise3D(x: number, y: number, z: number): number
fbm(x: number, y: number, z: number, octaves?: number): number
warpedFbm(x: number, y: number, z: number, octaves?: number): number
```

#### Marching Cubes
```typescript
marchingCubes(
  sdf: (p: Vector3) => number,
  options: MarchingCubesOptions
): MarchingCubesResult

createGeometryFromMarchingCubes(result: MarchingCubesResult): BufferGeometry

generateTerrainChunk(
  sdf: (p: Vector3) => number,
  chunkPosition: Vector3,
  chunkSize: number,
  resolution: number
): TerrainChunk
```

#### Instancing (Pure TS)
```typescript
generateInstanceData(
  count: number,
  areaSize: number,
  heightFunc: (x: number, z: number) => number,
  biomes?: BiomeData[],
  allowedBiomes?: string[]
): InstanceData[]
```

#### Water Materials (Pure TS)
```typescript
createWaterMaterial(options?: WaterMaterialOptions): ShaderMaterial
createAdvancedWaterMaterial(options?: AdvancedWaterMaterialOptions): ShaderMaterial
createWaterGeometry(size: number, segments?: number): PlaneGeometry
```

#### Ray Marching (Pure TS)
```typescript
createRaymarchingMaterial(options: RaymarchingMaterialOptions): ShaderMaterial
createRaymarchingGeometry(): PlaneGeometry
```

### Sky (Pure TS)
```typescript
createSkyMaterial(options: SkyMaterialOptions): ShaderMaterial
createSkyGeometry(size?: [number, number]): PlaneGeometry
```

### Volumetrics (Pure TS)
```typescript
createVolumetricFogMeshMaterial(options: VolumetricFogMeshMaterialOptions): ShaderMaterial
createUnderwaterOverlayMaterial(options: UnderwaterOverlayMaterialOptions): ShaderMaterial
```

#### Utilities
```typescript
calcNormal(
  p: Vector3,
  sdfFunc: (p: Vector3) => number,
  epsilon?: number
): Vector3
```

### 2. React Components (`@jbcom/strata/components`)

**Requires `@react-three/fiber` and `@react-three/drei`**

```typescript
// Water
<Water position?: [number, number, number], size?: number, segments?: number />
<AdvancedWater {...AdvancedWaterProps} />

// Instancing
<GPUInstancedMesh {...GPUInstancedMeshProps} />
// NOTE: enableWind, windStrength, lodDistance props are reserved for future GPU implementation
<GrassInstances {...VegetationProps} />
<TreeInstances {...VegetationProps} />
<RockInstances {...VegetationProps} />

// Sky & Atmosphere
<ProceduralSky {...SkyProps} />

// Volumetric Effects
<VolumetricEffects {...VolumetricEffectsProps} />
<VolumetricFogMesh {...VolumetricFogMeshProps} />
<UnderwaterOverlay {...UnderwaterOverlayProps} />
<EnhancedFog {...EnhancedFogProps} />

// Ray Marching
<Raymarching sdfFunction: string, ...options />
```

### 3. Shaders (`@jbcom/strata/shaders`)

**GLSL shader strings and uniform factories**

```typescript
// Water
waterVertexShader: string
waterFragmentShader: string
advancedWaterVertexShader: string
advancedWaterFragmentShader: string
createWaterUniforms(): Uniforms
createAdvancedWaterUniforms(options): Uniforms

// Terrain
terrainVertexShader: string
terrainFragmentShader: string
createTerrainUniforms(options): Uniforms

// Sky
skyVertexShader: string
skyFragmentShader: string
createSkyUniforms(timeOfDay, weather, gyroTilt?): SkyUniforms

// Volumetrics
volumetricFogMeshVertexShader: string
volumetricFogMeshFragmentShader: string
underwaterOverlayVertexShader: string
underwaterOverlayFragmentShader: string
createVolumetricFogMeshUniforms(...): VolumetricFogMeshUniforms
createUnderwaterOverlayUniforms(...): UnderwaterOverlayUniforms

// Ray marching
raymarchingVertexShader: string
raymarchingFragmentShader: string

// Fur/Shell
furVertexShader: string
furFragmentShader: string
createFurUniforms(config): Uniforms
```

## Type Contracts

### InstanceData
```typescript
interface InstanceData {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}
```

### BiomeData
```typescript
interface BiomeData {
  type: string;
  center: Vector2;
  radius: number;
}
```

### MarchingCubesOptions
```typescript
interface MarchingCubesOptions {
  resolution: number;
  bounds: { min: Vector3; max: Vector3 };
  isoLevel?: number; // default: 0
}
```

## Guarantees

1. **Core API is framework-agnostic** - works with vanilla Three.js, React, Vue, etc.
2. **All SDF functions are pure** - no side effects, deterministic
3. **Type-safe** - full TypeScript definitions
4. **No external textures required** - all shaders have procedural fallbacks

## Breaking Changes Policy

- **Major version**: Breaking API changes
- **Minor version**: New features, backward compatible
- **Patch version**: Bug fixes only
