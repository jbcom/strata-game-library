# CI Fixes Applied

## Issues Fixed

### 1. Outdated Lockfile
**Problem**: `pnpm-lock.yaml` was out of sync after renaming package from `procedural-gen` to `strata` and adding new dependencies.

**Fix**: 
- Ran `pnpm install` to regenerate lockfile
- Lockfile now includes all dependencies for `@jbcom/strata`

### 2. Missing Peer Dependencies
**Problem**: Missing `react-dom` peer dependency causing warnings.

**Fix**:
- Added `react-dom` to `peerDependencies`
- Added `react-dom` and `@types/react-dom` to `devDependencies`

### 3. Drei Version Compatibility
**Problem**: `@react-three/drei@10.7.7` requires `@react-three/fiber@^9.0.0` but we have `^8.15.0`.

**Fix**:
- Updated `devDependencies` to use `@react-three/drei@^9.114.0` which is compatible with `@react-three/fiber@^8.15.0`
- Kept `peerDependencies` as `>=9.0.0` to allow users to use newer versions

### 4. Shader Function References
**Problem**: Shaders referenced non-existent Three.js functions `perspectiveDepthToViewZ` and `viewZToOrthographicDepth`.

**Fix**:
- Replaced with manual depth conversion formulas
- Added comments explaining the conversion

## Files Changed

- `packages/strata/package.json` - Updated dependencies and peer dependencies
- `pnpm-lock.yaml` - Regenerated with correct package name and dependencies
- `src/presets/postprocessing/index.ts` - Fixed depth reading shader
- `src/presets/shadows/index.ts` - Fixed depth reading shader

## Verification

- ✅ Lockfile regenerated successfully
- ✅ No conflicting peer dependencies
- ✅ All dependencies resolved
- ✅ No linter errors
- ✅ Shader functions fixed

CI should now pass with these fixes.
