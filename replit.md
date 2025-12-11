# Strata - Comprehensive 3D Gaming Library for React Three Fiber

## Overview
Strata is a world-class procedural 3D graphics and game development library for React Three Fiber. It provides production-ready components for terrain, water, vegetation, sky, volumetrics, characters, particles, weather, cameras, AI, audio, physics, post-processing, animation, state management, UI, shaders, and interactive controls.

## Project Structure (Monorepo)

```
├── packages/
│   ├── capacitor-plugin/     # @strata/capacitor-plugin - Capacitor mobile plugin
│   ├── react-native/         # @strata/react-native - React Native mobile plugin
│   ├── docs/                 # Auto-generated TypeDoc API documentation
│   └── examples/             # Showcase example games
│       └── showcase/         # Feature showcase demo
├── src/                      # @jbcom/strata - Core library
│   ├── components/           # React Three Fiber components
│   ├── core/                 # Algorithms (marching cubes, SDF, particles, etc.)
│   ├── presets/              # Pre-configured setups
│   ├── shaders/              # GLSL shader code
│   ├── hooks/                # React hooks (useYuka, useGameState, etc.)
│   └── utils/                # Utility functions
├── tests/                    # Unit, integration, and e2e tests
├── typedoc.json              # TypeDoc configuration
└── dist/                     # Compiled library output
```

## Packages

### @jbcom/strata (Root)
The core 3D graphics library with all React Three Fiber components.

### @strata/capacitor-plugin
Cross-platform input, device detection, and haptics for Capacitor apps:
- **Native iOS** - Swift implementation with UIImpactFeedbackGenerator, GCController
- **Native Android** - Java implementation with Vibrator, InputDevice
- **Web** - Full web fallback implementation
- **React Hooks** - useDevice, useInput, useHaptics, useControlHints

### @strata/react-native
Cross-platform input, device detection, and haptics for React Native apps:
- **Device Detection** - Platform, dimensions, orientation, device type
- **Input Handling** - Touch, gamepad support with unified API
- **Haptics** - Vibration patterns, impact feedback
- **React Hooks** - Same API as Capacitor plugin for consistency

### packages/docs (Auto-generated)
TypeDoc-generated API documentation with domain-based organization:
- **World Building** - Terrain, water, vegetation, sky
- **Entities & Simulation** - Characters, physics, animation, AI
- **Effects & Atmosphere** - Particles, weather, decals, lighting
- **Player Experience** - Cameras, input, audio, UI
- **Game Systems** - State management, save/load
- **Rendering Pipeline** - Shaders, post-processing

### packages/examples
Simple showcase games demonstrating Strata capabilities:
- **showcase/** - Interactive scene with all features
- **fps/** - First-person exploration (planned)
- **flythrough/** - Cinematic camera path (planned)

## Development Commands

### Root Level
```bash
pnpm run build          # Build core library
pnpm run dev            # Watch mode
pnpm run test           # Run all tests
pnpm run lint           # ESLint
pnpm run format         # Prettier
pnpm run docs:build     # Generate TypeDoc API docs
pnpm run docs:dev       # Serve docs locally
```

### Examples
```bash
pnpm --filter @strata/showcase dev    # Run showcase example
pnpm --filter @strata/showcase build  # Build for web
```

## CI/CD Pipeline

The GitHub Actions workflow handles:
1. **Lint & Test** - ESLint, TypeScript, Vitest
2. **Build Docs** - TypeDoc API documentation
3. **Build Examples (Web)** - Vite production build
4. **Build Examples (Android)** - Capacitor APK (releases only)
5. **Build Examples (Desktop)** - Electron (releases only)
6. **Deploy** - GitHub Pages (docs + web examples)
7. **Release** - NPM publish via semantic-release

## Feature Systems

### Core Graphics
- **Terrain** - SDF-based terrain with marching cubes
- **Water** - Reflective water with waves, AdvancedWater for oceans
- **Vegetation** - GPU-instanced grass, trees, rocks
- **Sky** - ProceduralSky with day/night cycle
- **Volumetrics** - Fog, underwater effects, enhanced fog
- **Characters** - Animated characters with multi-layer fur

### Extended Features
- **GPU Particles** - Fire, smoke, sparks, magic, explosion presets
- **Weather** - Rain, snow, lightning with state machine
- **Clouds** - Procedural FBM noise-based clouds
- **Camera Systems** - Follow, orbit, FPS, cinematic cameras
- **Decals & Billboards** - Sprite sheets, pooling, fade
- **LOD System** - Automatic level-of-detail with cross-fade
- **God Rays** - Volumetric lighting effects
- **3D Input Controls** - Joystick, switches, pressure plates
- **AI (YukaJS)** - Steering behaviors, FSM, navmesh pathfinding
- **Spatial Audio** - 3D positioned sounds with falloff
- **Physics (Rapier)** - Character controller, vehicles, ragdolls
- **Post-Processing** - Cinematic, dreamy, horror, neon effects
- **Procedural Animation** - IK chains, spring bones, look-at
- **State Management** - Save/load, undo/redo, checkpoints
- **Game UI** - Health bars, inventory, dialog, minimap
- **Shader Library** - Toon, hologram, dissolve, forcefield

## Theme Colors
- **Burnt Orange** - #D4845C (primary accent)
- **Dusty Teal** - #5B9EA6 (secondary accent)
- **Warm Sand** - #C49A6C (tertiary)
- **Dark Background** - #101418

## API Design Principles
- Components accept `THREE.ColorRepresentation`
- Common props exposed at top level
- Components support `forwardRef`
- Framework-agnostic core logic
- Comprehensive JSDoc documentation

## User Preferences
- Simple showcase examples (not complex games)
- Auto-generated TypeDoc for API docs
- Cross-platform builds (web/Android/desktop)
- Burnt Orange & Dusty Teal theme

## Core Module Integrations

All core modules use **thin wrapper architecture** over best-in-class libraries:

| Module | Libraries | Location |
|--------|-----------|----------|
| **State** | Zustand + zundo | `src/core/state/` |
| **ECS** | Miniplex | `src/core/ecs/` |
| **Math/Noise** | maath + simplex-noise | `src/core/math/` |
| **Pathfinding** | ngraph.graph + ngraph.path | `src/core/pathfinding/` |
| **Audio** | Howler.js | `src/core/audio/` |
| **Animation** | XState | `src/core/animation/` |
| **Debug** | leva + tunnel-rat | `src/core/debug/` |

See `docs/STANDARDS.md` for architectural guidelines (files <400 LOC, thin wrappers, contract/adapter pattern).

## Recent Changes (Dec 2024)
- **Documentation Restructured** - Domain-based API organization (World, Entities, Effects, Experience, Systems, Rendering)
- **Capacitor Plugin Complete** - Native iOS (Swift) and Android (Java) implementations
- **React Native Package Created** - @strata/react-native with same API as Capacitor
- **Module Integration Complete** - All 7 core modules now use curated third-party libraries
- **State.tsx Refactored** - Thin React façade around Zustand GameStoreApi
- **Audio.tsx Refactored** - Split from 1134 LOC monolith to 11 modular files
- **Ragdoll Fixed** - Added proper physics joints (spherical + revolute) connecting body parts
- **YukaPath Fixed** - Corrected path visualization with waypoints and direction indicators
- **914 Tests Passing** - Comprehensive test coverage across all modules
- **TypeDoc Generated** - Auto-generated API documentation with themed styling
- Pivoted from custom docs site to TypeDoc auto-generation
- Created packages/examples/showcase for feature demonstration
- Set up cross-platform CI/CD (web, Android, desktop)
- Completed library gap audits (Rapier, Drei, Postprocessing)
- Configured Burnt Orange & Dusty Teal theme
