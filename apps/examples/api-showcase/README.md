# Strata API Showcase

## Complete API Documentation with Live Examples

This showcase provides **comprehensive, JSDoc-linked examples** for every API in Strata. Each example is properly documented with direct links to the source code, making it easy to understand both the usage and implementation.

## 🎯 Purpose

- **API-First Documentation**: Every example is directly tied to specific API methods via JSDoc annotations
- **Learn by Example**: See real, working code for every feature
- **Copy-Paste Ready**: All examples are production-quality and ready to use
- **Source-Linked**: Direct links to GitHub source code for each API
- **Comprehensive Coverage**: Examples for basic, advanced, and complete use cases

## 📚 Example Categories

### Vegetation System

**File**: `src/examples/vegetation/VegetationExamples.tsx`

Covers the complete vegetation instancing API:

- `createGrassInstances` - Basic and advanced grass placement
- `createTreeInstances` - Tree generation with biomes
- `createRockInstances` - Environmental rock placement
- `createVegetationMesh` - Custom vegetation types
- `generateInstanceData` - Low-level instance generation
- **Complete Scene Examples** - Multi-layer vegetation setups

**API Methods Demonstrated**:

```typescript
@see createGrassInstances
@see createTreeInstances
@see createRockInstances
@see createVegetationMesh
@see generateInstanceData
@see BiomeData type system
```

### Water System

**File**: `src/examples/water/WaterExamples.tsx`

Comprehensive water rendering examples:

- `Water` - Basic animated water component
- `AdvancedWater` - Caustics, foam, and fresnel effects
- `createWaterMaterial` - Core material API
- `createAdvancedWaterMaterial` - Advanced shader features
- **Preset Configurations** - Ocean, lagoon, swamp water
- **Caustics Projection** - Underwater light effects
- **Complete Scene Integration** - Best practices

**API Methods Demonstrated**:

```typescript
@see Water Component
@see AdvancedWater Component
@see createWaterMaterial
@see createAdvancedWaterMaterial
```

### Sky & Volumetrics

**File**: `src/examples/sky/SkyExamples.tsx`

Full atmospheric system coverage:

- `ProceduralSky` - Day/night cycle system
- **Time of Day Presets** - Dawn, noon, sunset, night
- **Weather System** - Storm, fog, and atmospheric effects
- `createSkyMaterial` - Core sky shader
- `createVolumetricFogMeshMaterial` - 3D fog effects
- `createUnderwaterOverlayMaterial` - Underwater visuals
- **Animated Cycles** - Full day/night animation
- **Complete Atmospheric Setup** - Production-ready scenes

**API Methods Demonstrated**:

```typescript
@see ProceduralSky
@see TimeOfDayState
@see WeatherState
@see createVolumetricFogMeshMaterial
@see createUnderwaterOverlayMaterial
```

## 🏗️ Structure

Each example file follows a consistent structure:

```typescript
/**
 * @fileoverview [System] API Examples
 *
 * Complete examples for all [system]-related APIs in Strata.
 *
 * @module examples/[system]
 */

/**
 * Example N: [Feature Name]
 *
 * [Description of what this demonstrates]
 *
 * @example
 * ```tsx
 * // Copy-paste ready code example
 * ```
 *
 * @see {@link [GitHub URL] API Method Name}
 *
 * @category [Basic|Advanced|Complete]
 * @apiExample [API Method]
 */
export function Example_FeatureName() {
    // Implementation

    return {
        // Returns metadata about the example
        component: 'ComponentName',
        description: 'What this does',
        apiCalls: ['method1', 'method2'],
        features: ['feature1', 'feature2'],
    };
}
```

## 📖 Using the Examples

### 1. Browse by API Method

Each example explicitly states which API methods it demonstrates:

```typescript
/**
 * @apiExample createGrassInstances
 */
export function Example_BasicGrassInstances() {
    // Shows createGrassInstances usage
}
```

### 2. Follow GitHub Links

Every example includes direct links to source code:

```typescript
/**
 * @see {@link https://github.com/jbcom/strata-game-library/blob/main/src/presets/vegetation/index.ts#L84 createGrassInstances}
 */
```

### 3. Copy Example Code

Code blocks in JSDoc comments are production-ready:

```typescript
/**
 * @example
 * ```tsx
 * const grassMesh = createGrassInstances(1000, 50, biomes);
 * scene.add(grassMesh);
 * ```
 */
```

### 4. Understand Parameters

Examples explain every parameter:

```typescript
return {
    parameters: {
        count: 5000,
        areaSize: 100,
        seed: 42,
        enableWind: true,
        windStrength: 0.8,
    },
};
```

## 🎓 Example Progression

Examples are organized from simple to complex:

### Basic Examples

- Single feature demonstration
- Minimal configuration
- Essential parameters only
- Perfect for getting started

### Advanced Examples

- Multiple features combined
- Custom configurations
- Performance optimization
- Production techniques

### Complete Examples

- Full scene setups
- Best practices
- Integration patterns
- Real-world usage

## 🔗 API Coverage Map

This showcase covers **100+ API methods** across:

- ✅ **Vegetation System** (8+ examples)
  - GPU instancing
  - Biome-based placement
  - Custom vegetation types
  - Height-based positioning

- ✅ **Water System** (8+ examples)
  - Basic and advanced water
  - Caustics and reflections
  - Foam and underwater effects
  - Preset configurations

- ✅ **Sky & Atmosphere** (10+ examples)
  - Day/night cycles
  - Weather systems
  - Volumetric fog
  - Underwater effects

- 🚧 **Terrain System** (Coming soon)
- 🚧 **Character System** (Coming soon)
- 🚧 **Particle System** (Coming soon)
- 🚧 **Physics System** (Coming soon)
- 🚧 **Shader Presets** (Coming soon)

## 💡 Best Practices Demonstrated

Every example showcases production-quality patterns:

1. **Input Validation**: Proper parameter checking
2. **Error Handling**: Graceful failure modes
3. **Performance**: Optimization techniques
4. **TypeScript**: Full type safety
5. **Documentation**: Comprehensive comments
6. **Modularity**: Reusable components
7. **Testing**: Testable patterns

## 🚀 Running Examples

### Generate Documentation

```bash
# From this directory
pnpm install
pnpm docs
```

This generates TypeDoc documentation with all JSDoc annotations rendered.

### Interactive Showcase

```bash
# Run the interactive example viewer
pnpm dev
```

Visit `http://localhost:5173` to see all examples running live.

## 📊 Example Metadata

Each example returns structured metadata:

```typescript
{
    component: 'Water',           // Component/function used
    description: 'What it does',  // Clear explanation
    apiCalls: ['Water'],          // API methods demonstrated
    features: [],                 // Features showcased
    parameters: {},               // Parameter explanations
    bestPractices: [],            // Recommendations
    performance: {},              // Performance notes
}
```

This metadata can be used to:

- Generate interactive documentation
- Build example browsers
- Create API reference tables
- Power search functionality

## 🎯 Finding Examples

### By API Method

Search for `@apiExample [MethodName]` to find all examples using that method.

### By Category

Examples are categorized:

- `@category Basic` - Simple, introductory examples
- `@category Advanced` - Complex configurations
- `@category Preset` - Pre-configured setups
- `@category Complete` - Full scene examples
- `@category Core` - Low-level API usage

### By Feature

Use the `features` array in example metadata to find examples by capability.

## 📝 Contributing Examples

When adding new examples:

1. Follow the consistent structure
2. Include JSDoc with `@see` links to source
3. Provide complete `@example` code blocks
4. Add `@apiExample` tags
5. Return structured metadata
6. Cover basic to advanced usage
7. Include best practices

## 🔍 Generated Documentation

Run `pnpm docs` to generate:

- **API Index** - All methods with example links
- **Example Browser** - Searchable example catalog
- **Source Links** - Direct GitHub URLs
- **Type Definitions** - Full TypeScript types
- **Cross-References** - Related examples and APIs

## 📚 Related Resources

- [Main README](../../README.md) - Project overview
- [API Documentation](../../API.md) - Complete API reference
- [Public API Contract](../../PUBLIC_API.md) - Stable API guarantees
- [Examples Directory](../) - Other example projects

## 🎉 Benefits

This JSDoc-linked approach provides:

1. **Discoverability** - Easy to find examples for any API
2. **Traceability** - Direct links to implementation
3. **Maintainability** - Examples stay in sync with API
4. **Learnability** - Progressive complexity
5. **Reusability** - Production-ready code
6. **Documentation** - Auto-generated from JSDoc
7. **Searchability** - Find examples by any criteria

---

**Every line of code is documented. Every API has examples. Every example links to source.**
