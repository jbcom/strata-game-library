# Library Audit - Gaps & Integration Issues

## 🔴 CRITICAL ISSUES

### 1. Core Module Has React Dependency
**Location**: `src/core/instancing.ts`
**Issue**: Imports `@react-three/drei` in core module
**Impact**: Breaks "pure TypeScript" contract - core should have ZERO React dependencies
**Fix**: Remove drei dependency, make it framework-agnostic

### 2. createInstancingSetup is Broken
**Location**: `src/core/instancing.ts:134`
**Issue**: 
- Returns config object that drei doesn't use
- References drei types in core module
- Never actually used anywhere
**Impact**: Dead code, misleading API
**Fix**: Remove or refactor to be framework-agnostic

### 3. GPUInstancedMesh Not Actually GPU-Driven
**Location**: `src/components/Instancing.tsx:95`
**Issue**: Uses drei's Instances but doesn't implement wind/LOD on GPU
**Impact**: Still CPU-based, misleading name
**Fix**: Either implement true GPU wind/LOD or rename/remove

## 🟡 INTEGRATION GAPS

### 4. Inline Shaders in Components
**Locations**: 
- `src/components/Sky.tsx` - inline shader strings
- `src/components/VolumetricEffects.tsx` - inline shader strings
**Issue**: Should use exported shaders from `@jbcom/strata/shaders`
**Impact**: Code duplication, can't reuse shaders
**Fix**: Extract to shader files, use exports

### 5. Missing Core TypeScript Versions
**Missing**:
- Core Sky material factory
- Core VolumetricEffects material factories
**Issue**: Can't use Sky/VolumetricEffects without React
**Impact**: Breaks framework-agnostic promise
**Fix**: Create core/ versions

### 6. Type Name Conflicts
**Issue**: 
- `InstanceData` exported from both core and components
- `BiomeData` exported with different names (SDFBiomeData, InstancingBiomeData, InstanceBiomeData)
**Impact**: Confusing API, type conflicts
**Fix**: Unify naming, clear separation

### 7. Missing Exports
**Missing**:
- Sky shaders not exported
- Volumetric shader materials not exported as core functions
- Raymarching component props not exported as types

### 8. Inconsistent Patterns
**Issues**:
- Some components use core functions (Water), others don't (Sky, VolumetricEffects)
- Some shaders have uniform factories (water), others don't (sky, volumetrics)
- Inconsistent error handling

## 🟢 MINOR ISSUES

### 9. Missing Tests
- No tests for Sky component
- No tests for VolumetricEffects
- No tests for Raymarching
- No integration tests

### 10. Documentation Gaps
- Sky component not in API.md
- VolumetricEffects not fully documented
- createInstancingSetup not documented
- Missing examples for core-only usage

### 11. Type Safety Issues
- Some props use `any` implicitly
- Missing JSDoc on many functions
- Inconsistent optional vs required props

## 📋 FIXES NEEDED

1. ✅ Remove drei from core/instancing.ts
2. ✅ Remove or fix createInstancingSetup → Fixed: Replaced with createInstancedMesh
3. ✅ Extract Sky shaders to shader files
4. ✅ Extract VolumetricEffects shaders to shader files
5. ✅ Create core/ versions of Sky and VolumetricEffects
6. ⚠️ Fix type naming conflicts - Partially fixed, need to unify
7. ⚠️ Add missing exports - Partially done
8. ⚠️ Add tests for all components - Tests created but need more coverage
9. ⚠️ Update API.md with all exports - Needs update
10. ⚠️ Add JSDoc to all public functions - Partially done

## 🟡 REMAINING GAPS

### GPU Wind/LOD Not Implemented
**Location**: `src/components/Instancing.tsx:GPUInstancedMesh`
**Issue**: Props `enableWind`, `windStrength`, `lodDistance` are accepted but not used
**Impact**: Misleading API - suggests GPU wind/LOD but doesn't implement it
**Options**:
1. Remove props (breaking change)
2. Implement via drei's shader material system
3. Document as "reserved for future implementation"

### Type Exports Still Confusing
- `InstanceData` exported from both core and components (same type, different locations)
- `BiomeData` has 3 different names: SDFBiomeData, InstancingBiomeData, InstanceBiomeData
- Need unified naming strategy

### Missing Integration Tests
- No tests for component integration
- No tests for shader/material creation
- No tests for end-to-end workflows
