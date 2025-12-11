# Strata - 3D Gaming Library for React Three Fiber

## Overview
Strata is a procedural 3D graphics library for React Three Fiber that provides components for terrain, water, vegetation, sky, volumetrics, and character rendering.

## Project Structure
- `src/` - TypeScript source code for the library
  - `components/` - React Three Fiber components
  - `core/` - Core algorithms (marching cubes, SDF, raymarching)
  - `presets/` - Pre-configured setups for various effects
  - `shaders/` - GLSL shader code
  - `utils/` - Utility functions
- `docs-site/` - Vite + React documentation site with interactive demos
  - `src/pages/demos/` - Live demo pages for each feature
  - Uses Material UI for UI chrome
  - Dogfoods @jbcom/strata components
- `tests/` - Unit, integration, and e2e tests
- `dist/` - Compiled library output

## Development Commands
- `pnpm run build` - Compile TypeScript to dist/
- `pnpm run dev` - Watch mode for development
- `pnpm run test` - Run all tests
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## Documentation Site
Run `cd docs-site && pnpm dev` to start the documentation server on port 5000.

### Demo Pages
- `/` - Homepage with hero scene
- `/demos/terrain` - SDF terrain with marching cubes
- `/demos/water` - Water and AdvancedWater components
- `/demos/sky` - ProceduralSky with day/night cycle
- `/demos/vegetation` - GPU-instanced grass, trees, rocks
- `/demos/volumetrics` - Fog, underwater effects
- `/demos/characters` - Animated characters with fur
- `/demos/full-scene` - All features combined

## API Design Principles
- Components accept `THREE.ColorRepresentation` (strings, hex numbers, Color objects)
- Common props like `size`, `color`, `opacity` are exposed at the top level
- Components support `forwardRef` for animation hooks
- Consistent naming across all vegetation components

## Recent API Improvements (Dec 2024)
- **Water**: Added `color`, `opacity`, `waveSpeed`, `waveHeight` props, forwardRef support
- **AdvancedWater**: `size` accepts number or tuple, forwardRef support
- **GrassInstances**: Added `height` and `color` props
- **VolumetricFogMesh**: Now accepts `ColorRepresentation` instead of `THREE.Color`
- **EnhancedFog**: Added `near`/`far` props for linear fog, accepts `ColorRepresentation`
- **UnderwaterOverlay**: Renamed `waterColor` to `color`, accepts `ColorRepresentation`

## Technology Stack
- TypeScript
- React Three Fiber
- Three.js
- Material UI (docs site)
- Vite (docs site bundler)
- Vitest for testing
- Playwright for e2e tests
- pnpm workspace
