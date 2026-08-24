# Integration Issues & Fixes

## ✅ FIXED Issues

### 1. Core Module React Dependency

**Was**: `core/instancing.ts` imported `@react-three/drei`
**Fixed**: Removed dependency, core is now pure TypeScript
**Impact**: Core API is truly framework-agnostic

### 2. Broken createInstancingSetup

**Was**: Returned config object that drei doesn't use
**Fixed**: Replaced with `createInstancedMesh` that returns `THREE.InstancedMesh`
**Impact**: Actually usable, returns real Three.js object

### 3. Inline Shaders

**Was**: Sky and VolumetricEffects had inline shader strings
**Fixed**: Extracted to `shaders/sky.ts` and `shaders/volumetrics-components.ts`
**Impact**: Shaders are reusable, can be used without components

### 4. Missing Core Material Factories

**Was**: No way to create Sky/VolumetricEffects materials without React
**Fixed**: Created `core/sky.ts` and `core/volumetrics.ts`
**Impact**: Full framework-agnostic support

### 5. Missing Material Disposal

**Was**: Water, Sky, VolumetricEffects didn't dispose materials
**Fixed**: Added `useEffect` cleanup in all components
**Impact**: No memory leaks

### 6. GPU Wind/LOD Not Implemented

**Was**: Props `enableWind`, `windStrength`, `lodDistance` accepted but ignored with no documentation
**Fixed**: Added JSDoc documentation marking these props as "reserved for future GPU shader integration"
**Impact**: Clear API expectations via IDE tooltips

### 7. No Seeded Random

**Was**: `generateInstanceData` uses `Math.random()` - not deterministic
**Fixed**: Added optional `seed` parameter for deterministic generation
**Impact**: Reproducible instance layouts

### 8. Missing Input Validation

**Was**: No validation of parameters
**Fixed**: Added validation for:

- count > 0
- areaSize > 0
- Required geometry/material/instances
- Clear error messages
**Impact**: Better developer experience and debugging

## ⚠️ REMAINING Issues

### 9. Type Export Confusion

**Issue**: Multiple BiomeData types with different names

- `SDFBiomeData` - from sdf.ts (union type)
- `InstancingBiomeData` - from instancing.ts (string type)
- `ComponentBiomeData` - re-export from components

**Status**: Types are compatible but could be clearer
**Recommendation**: Add JSDoc explaining the difference

### 10. Missing Integration Tests

**Issue**: No tests for:

- Component + core integration
- Shader material creation
- End-to-end workflows
**Fix Needed**: Add integration test suite

## 📊 Test Coverage Gaps

- ✅ Core SDF functions - tested
- ✅ Marching cubes - tested
- ✅ Instance generation - tested (including seeded random and validation)
- ❌ Sky component - not tested
- ❌ VolumetricEffects - not tested
- ❌ Raymarching - not tested
- ❌ Water components - not tested
- ❌ Integration tests - missing

## 🔗 Integration Patterns

### Pattern 1: Core → Component

✅ **Working**: Components use core functions

- Water uses `createWaterMaterial`
- Sky uses `createSkyMaterial`
- VolumetricEffects uses core material factories

### Pattern 2: Shader → Core → Component

✅ **Working**: Shaders exported, used by core, used by components

- Sky shaders → core/sky.ts → components/Sky.tsx
- Volumetric shaders → core/volumetrics.ts → components/VolumetricEffects.tsx

### Pattern 3: Core Standalone

✅ **Working**: All core functions work without React

- Can use `createWaterMaterial`, `createSkyMaterial`, etc. in vanilla Three.js
- Can use `generateInstanceData`, `marchingCubes`, etc. in any framework

## 🚨 Breaking Changes Needed

1. ~~**GPUInstancedMesh props**: Either implement or remove `enableWind`, `windStrength`, `lodDistance`~~ ✅ DOCUMENTED
2. **Type exports**: Consider unifying BiomeData types or making distinction clearer

## 📝 Documentation Needed

1. Complete API.md with all components
2. Add examples for core-only usage
3. Add examples for shader-only usage
4. Document type differences (SDFBiomeData vs InstancingBiomeData)
5. ~~Document GPU wind/LOD status~~ ✅ DONE via JSDoc
