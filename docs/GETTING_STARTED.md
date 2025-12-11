# Strata

**The complete 3D game development library for React Three Fiber**

Strata provides everything you need to build high-quality 3D games and experiences, from terrain generation to character animation, all optimized for performance across mobile, web, and desktop.

---

## Quick Start

```bash
npm install @jbcom/strata @react-three/fiber @react-three/drei three
```

```tsx
import { Canvas } from '@react-three/fiber';
import { Terrain, Water, ProceduralSky } from '@jbcom/strata';

function Game() {
  return (
    <Canvas>
      <ProceduralSky />
      <Terrain size={256} />
      <Water size={100} />
    </Canvas>
  );
}
```

---

## API Domains

Strata organizes its API into **six domains** based on how you'll use them:

### 🌍 World Building
Terrain, water, vegetation, sky, and atmosphere - the foundation of your 3D environment.

**Key exports:** `Terrain`, `Water`, `GrassInstances`, `ProceduralSky`, `CloudSky`

### 🎭 Entities & Simulation
Characters, physics, animation, and AI - dynamic objects that move and interact.

**Key exports:** `CharacterController`, `Ragdoll`, `YukaVehicle`, `IKChain`, `ProceduralWalk`

### ✨ Effects & Atmosphere
Particles, weather, decals, lighting effects - visual polish that brings scenes to life.

**Key exports:** `ParticleEmitter`, `Rain`, `Snow`, `GodRays`, `Decal`

### 🎮 Player Experience
Cameras, input, audio, and UI - how players see, control, hear, and understand your game.

**Key exports:** `FollowCamera`, `FPSCamera`, `AudioProvider`, `HealthBar`, `Minimap`

### ⚙️ Game Systems
State management, save/load, checkpoints - the infrastructure powering your game.

**Key exports:** `GameStateProvider`, `useGameState`, `useSaveLoad`, `useCheckpoint`

### 🎨 Rendering Pipeline
Shaders, post-processing, materials - low-level graphics for advanced customization.

**Key exports:** `CinematicEffects`, `ToonMesh`, `DissolveMesh`, `HologramMesh`

---

## By Developer Role

### Game Developer
Start with **World Building** to create your environment, then add **Entities** for characters and physics, and polish with **Effects**.

### Graphics Programmer
Jump to **Rendering Pipeline** for shaders and post-processing, or explore the GLSL exports for raw shader code.

### Systems Engineer
Focus on **Game Systems** for state management with Zustand integration, undo/redo, and save/load functionality.

### Platform Engineer
Check out the mobile packages:
- `@strata/capacitor-plugin` - Capacitor integration
- `@strata/react-native` - React Native integration

Both provide device detection, input handling, and haptic feedback with the same API.

---

## Architecture

Strata follows a **thin wrapper architecture** over best-in-class libraries:

| System | Library | Purpose |
|--------|---------|---------|
| State | Zustand + zundo | Game state with undo/redo |
| Physics | Rapier | Character controllers, ragdolls |
| AI | YukaJS | Steering behaviors, pathfinding |
| Audio | Howler.js | Spatial audio, sound management |
| Animation | XState | State machines for animation |
| Math | maath | Interpolation, easing |
| Noise | simplex-noise | Procedural generation |

---

## Examples

```bash
# Run the showcase demo
cd packages/examples/showcase
npm install && npm run dev
```

See the [Examples](https://github.com/jbcom/strata/tree/main/packages/examples) directory for more.
