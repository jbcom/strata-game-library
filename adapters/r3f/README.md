# @strata-game-library/r3f

[![npm version](https://img.shields.io/npm/v/@strata-game-library/r3f)](https://www.npmjs.com/package/@strata-game-library/r3f)
[![license](https://img.shields.io/npm/l/@strata-game-library/r3f)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

React Three Fiber components for the [Strata Game Library](https://strata.game) -- terrain, water, vegetation, sky, volumetrics, physics, animation, audio, camera, input, and UI.

This package is the primary rendering adapter for `@strata-game-library/core`. It provides ready-to-use R3F components and hooks that wrap Strata's pure TypeScript engine, letting you build 3D games declaratively with React.

## Installation

```bash
pnpm add @strata-game-library/r3f
```

### Peer Dependencies (required)

```bash
pnpm add react react-dom three @react-three/fiber @react-three/drei
```

### Optional Peer Dependencies

Install these based on the features you use:

| Package | Required for |
|---------|-------------|
| `@react-three/rapier` | Physics components (CharacterController, Buoyancy, Ragdoll, VehicleBody, Destructible) |
| `postprocessing` | Post-processing effects (CinematicEffects, DynamicDOF, MotionBlur, etc.) |
| `yuka` | AI steering behaviors and navigation (YukaVehicle, YukaNavMesh, YukaPath) |
| `zustand` | Game state management (GameStateProvider, useGameState, undo/redo) |

```bash
# Example: install everything
pnpm add @react-three/rapier postprocessing yuka zustand
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber';
import { ProceduralSky, Water, FollowCamera } from '@strata-game-library/r3f';

function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />

      <ProceduralSky
        timeOfDay={{ sunAngle: 60, sunIntensity: 0.9 }}
        weather={{ intensity: 0 }}
      />

      <Water
        position={[0, -2, 0]}
        size={200}
        color={0x006994}
        waveSpeed={1.2}
        waveHeight={0.4}
      />

      <FollowCamera target={playerRef} distance={10} />
    </Canvas>
  );
}
```

### Using the Game Orchestrator

For full game lifecycle management with scenes, modes, and state:

```tsx
import { createGame } from '@strata-game-library/core';
import { StrataGame } from '@strata-game-library/r3f';

const game = createGame({
  scenes: { /* ... */ },
  modes: { /* ... */ },
});

function App() {
  return (
    <StrataGame
      game={game}
      loading={<div>Loading...</div>}
    >
      {/* Additional R3F children rendered inside the Canvas */}
    </StrataGame>
  );
}
```

## Features

- **Sky** -- Procedural atmospheric scattering with dynamic day/night cycles and weather
- **Water** -- Animated wave surfaces with caustics, reflections, and foam
- **Clouds** -- Volumetric cloud layers and cloud sky domes
- **Vegetation** -- GPU-instanced trees, grass, and rocks with LOD
- **Volumetrics** -- Enhanced fog, god rays, underwater overlay, volumetric fog meshes
- **Weather** -- Rain, snow, lightning, and a unified WeatherSystem controller
- **Camera** -- Follow, orbit, FPS, cinematic, fixed-perspective, and gyroscope cameras
- **Physics** -- Character controllers, buoyancy, ragdolls, vehicles, destructibles (Rapier)
- **Animation** -- IK chains/limbs, procedural walk, breathing, blinking, spring bones, tail physics, head tracking, look-at, animation state machines with blend trees
- **AI** -- Yuka-powered entity management, navigation meshes, pathfinding, state machines, vehicle steering
- **Audio** -- Spatial/positional audio, ambient audio, audio zones, footstep audio, weather audio (Howler)
- **Particles** -- GPU-accelerated particle emitters and burst effects
- **Shaders** -- Crystal, dissolve, forcefield, glitch, gradient, hologram, outline, raymarching, toon
- **Post-processing** -- Cinematic, dreamy, horror, neon, realistic, vintage effects, dynamic DOF, motion blur
- **Parallax** -- Multi-layer parallax backgrounds with infinite tiling and procedural generation
- **Decals** -- Surface-projected decals, billboards, and animated billboards
- **Input** -- 3D joysticks, pressure plates, wall buttons, ground switches, trigger composers
- **UI** -- Health bars, nameplates, minimaps, crosshairs, damage numbers, dialog boxes, inventories, tooltips, notifications, virtual joysticks, screen flash
- **State** -- Zustand-based game state with undo/redo, auto-save, checkpoints, and persistence
- **LOD** -- Distance-based level-of-detail groups, meshes, vegetation, and impostors
- **Instancing** -- GPU-instanced meshes for grass, trees, and rocks at scale

## Components

### Sky & Atmosphere

| Component | Description |
|-----------|-------------|
| `ProceduralSky` | Dynamic sky with Rayleigh/Mie scattering, day/night, and weather |
| `CloudLayer` | Individual cloud layer with configurable density and speed |
| `CloudSky` | Complete cloud sky dome |
| `VolumetricClouds` | Raymarched volumetric cloud rendering |

### Water

| Component | Description |
|-----------|-------------|
| `Water` | Animated water surface with configurable waves |
| `AdvancedWater` | Water with caustics, deep color, and foam effects |

### Volumetrics & Weather

| Component | Description |
|-----------|-------------|
| `EnhancedFog` | Configurable distance and height fog |
| `GodRays` | Volumetric light shafts |
| `UnderwaterOverlay` | Full-screen underwater visual effect |
| `VolumetricEffects` | Combined volumetric rendering |
| `VolumetricFogMesh` | Localized fog volume |
| `Rain` | Particle-based rain |
| `Snow` | Particle-based snow |
| `Lightning` | Procedural lightning bolts |
| `WeatherSystem` | Unified weather controller for rain, snow, fog, and lightning |

### Camera

| Component | Description |
|-----------|-------------|
| `FollowCamera` | Third-person camera that tracks a target |
| `OrbitCamera` | Orbiting camera for strategy and editor views |
| `FPSCamera` | First-person shooter camera |
| `CinematicCamera` | Spline-based cinematic camera for cutscenes |
| `FixedPerspectiveCamera` | Fixed-angle camera for side-scrollers and isometric games |
| `GyroscopeCamera` | Device orientation camera for mobile AR |
| `CameraShake` | Procedural camera shake effect |

### Animation

| Component | Description |
|-----------|-------------|
| `IKChain` | Multi-joint inverse kinematics chain |
| `IKLimb` | Single-limb IK solver (arms, legs) |
| `ProceduralWalk` | Procedural walk cycle animation |
| `BreathingAnimation` | Subtle breathing motion |
| `BlinkController` | Automated eye blink timing |
| `HeadTracker` | Head orientation tracking toward a target |
| `LookAt` | Smooth look-at constraint |
| `SpringBone` | Physics-driven bone jiggle (hair, cloth) |
| `TailPhysics` | Chain-based tail/tentacle simulation |

### Physics

| Component | Description |
|-----------|-------------|
| `CharacterController` | Rapier-based character movement controller |
| `Buoyancy` | Water buoyancy simulation |
| `Ragdoll` | Ragdoll physics on skeletal meshes |
| `VehicleBody` | Vehicle physics with suspension and wheels |
| `Destructible` | Breakable/destructible objects |

### AI

| Component | Description |
|-----------|-------------|
| `YukaEntityManager` | Manages Yuka AI entities within R3F |
| `YukaVehicle` | Autonomous vehicle with steering behaviors |
| `YukaNavMesh` | Navigation mesh for pathfinding |
| `YukaPath` | Predefined path for entity movement |
| `YukaStateMachine` | Finite state machine for AI behavior |

### Audio

| Component | Description |
|-----------|-------------|
| `AudioListener` | Scene audio listener (typically attached to camera) |
| `PositionalAudio` | 3D positional audio source |
| `AudioEmitter` | General-purpose audio emitter |
| `AmbientAudio` | Non-directional ambient sound |
| `AudioZone` | Region-based audio activation |
| `AudioEnvironment` | Environment-wide audio settings (reverb, etc.) |
| `FootstepAudio` | Surface-aware footstep sounds |
| `WeatherAudio` | Weather-driven ambient audio |
| `AudioProvider` | Context provider for the audio system |

### Particles

| Component | Description |
|-----------|-------------|
| `ParticleEmitter` | Continuous GPU particle emitter |
| `ParticleBurst` | One-shot particle burst effect |

### Shader Effects

| Component | Description |
|-----------|-------------|
| `CrystalMesh` | Crystalline refraction material |
| `DissolveMesh` | Dissolve/disintegration transition |
| `Forcefield` | Animated forcefield bubble |
| `GlitchMesh` | Digital glitch distortion |
| `GradientMesh` | Configurable gradient material |
| `HologramMesh` | Holographic scanline effect |
| `Outline` | Object outline/silhouette |
| `Raymarching` | Custom raymarching shader |
| `ToonMesh` | Cel-shaded toon material |

### Post-Processing

| Component | Description |
|-----------|-------------|
| `EffectStack` | Composable post-processing pipeline |
| `DynamicDOF` | Depth-of-field with auto-focus |
| `MotionBlurEffect` | Per-object motion blur |
| `CinematicEffects` | Film-grade color grading and vignette |
| `DreamyEffects` | Soft bloom and ethereal glow |
| `HorrorEffects` | Desaturation, grain, and chromatic aberration |
| `NeonEffects` | High-contrast neon bloom |
| `RealisticEffects` | Physically-based tonemapping and SSAO |
| `VintageEffects` | Retro film look with grain and sepia |

### Parallax

| Component | Description |
|-----------|-------------|
| `ParallaxBackground` | Multi-layer parallax container with depth fog |
| `ParallaxLayer` | Individual parallax layer with scroll speed |
| `SideScrollerBackground` | Shorthand for side-scroller parallax setups |
| `ProceduralBackgroundComponent` | Procedurally generated parallax from biome presets |
| `InfiniteRepeater` | Seamless infinite tiling wrapper |

### Decals

| Component | Description |
|-----------|-------------|
| `Decal` | Surface-projected texture decal |
| `DecalPool` | Managed pool of reusable decals |
| `Billboard` | Always-facing-camera quad |
| `AnimatedBillboard` | Sprite-sheet animated billboard |

### Input

| Component | Description |
|-----------|-------------|
| `Joystick3D` | 3D in-scene joystick control |
| `PressurePlate` | Weight-activated pressure plate |
| `WallButton` | Clickable wall-mounted button |
| `GroundSwitch` | Floor-activated switch |
| `TriggerComposer` | Combine multiple trigger conditions |

### UI

| Component | Description |
|-----------|-------------|
| `HealthBar` | Animated health/resource bar |
| `Nameplate` | Floating nameplate above entities |
| `Minimap` | Real-time minimap overlay |
| `Crosshair` | Configurable crosshair/reticle |
| `DamageNumber` | Floating damage number popup |
| `DialogBox` | NPC dialog/conversation UI |
| `Inventory` | Grid-based inventory display |
| `Tooltip` | Hover tooltip |
| `Notification` | Timed notification popup |
| `KillStreakNotification` | Streak/combo notification |
| `ProgressBar3D` | 3D in-world progress bar |
| `ScreenFlash` | Full-screen flash effect (damage, pickups) |
| `VirtualJoystick` | On-screen touch joystick for mobile |

### State Management

| Component | Description |
|-----------|-------------|
| `GameStateProvider` | Zustand store provider for game state |
| `PersistGate` | Delays rendering until persisted state is rehydrated |
| `StateDebugger` | Development overlay showing current state |

### Level of Detail

| Component | Description |
|-----------|-------------|
| `LODGroup` | Distance-based LOD switching container |
| `LODMesh` | Single mesh with LOD levels |
| `LODVegetation` | Vegetation-optimized LOD |
| `Impostor` | Billboard impostor for distant objects |

### GPU Instancing

| Component | Description |
|-----------|-------------|
| `GPUInstancedMesh` | General-purpose GPU instancing |
| `GrassInstances` | Optimized grass blade instancing |
| `TreeInstances` | Optimized tree instancing |
| `RockInstances` | Optimized rock instancing |

### Game Orchestration

| Component | Description |
|-----------|-------------|
| `StrataGame` | Top-level game component with Canvas, scene management, and UI overlay |

## Hooks

### Input Hooks

| Hook | Description |
|------|-------------|
| `useKeyboardControls` | Maps keyboard keys to named game actions with configurable bindings |

### AI / Steering Behaviors (Yuka)

| Hook | Description |
|------|-------------|
| `useSeek` | Steer toward a target position |
| `useFlee` | Steer away from a target position |
| `usePursue` | Predict and intercept a moving target |
| `useEvade` | Predict and flee from a moving target |
| `useArrive` | Seek with deceleration near the target |
| `useWander` | Random wandering behavior |
| `useFollowPath` | Follow a sequence of waypoints |
| `useAlignment` | Align heading with nearby agents |
| `useCohesion` | Steer toward the center of nearby agents |
| `useSeparation` | Maintain distance from nearby agents |
| `useInterpose` | Position between two targets |
| `useOffsetPursuit` | Maintain a formation offset from a leader |
| `useObstacleAvoidance` | Steer around obstacles |

### Camera Hooks

| Hook | Description |
|------|-------------|
| `useCameraTransition` | Smooth animated transitions between camera positions |

### Animation Hooks

| Hook | Description |
|------|-------------|
| `useAnimationMachine` | XState-driven animation state machine with R3F frame integration |
| `useAnimationBlend` | Blend tree for mixing multiple animations by parameter |

### Parallax Hooks

| Hook | Description |
|------|-------------|
| `useParallax` | Manages parallax scroll state, layer offsets, and depth fog |

### State Hooks

| Hook | Description |
|------|-------------|
| `useGameState` | Select slices of game state from the Zustand store |
| `useUndo` | Undo/redo for game state changes |
| `useAutoSave` | Automatic periodic state persistence |
| `useSaveLoad` | Manual save/load with named slots |
| `useCheckpoint` | Checkpoint-based save/restore |

### Audio Hooks

| Hook | Description |
|------|-------------|
| `useAudioContext` | Access the audio system context |
| `useAudioListener` | Access the scene audio listener |
| `useAudioManager` | Control audio playback globally |
| `useSpatialAudio` | Create and manage 3D positional audio |

### Game Hooks

| Hook | Description |
|------|-------------|
| `useGame` | Access the current `Game` instance from within `<StrataGame>` |

## Sub-path Exports

| Import path | Contents |
|-------------|----------|
| `@strata-game-library/r3f` | Everything (components + hooks + StrataGame) |
| `@strata-game-library/r3f/components` | All R3F components only |
| `@strata-game-library/r3f/hooks` | All hooks only |

```tsx
// Import from the main entry point
import { Water, ProceduralSky, useKeyboardControls } from '@strata-game-library/r3f';

// Or import from specific sub-paths for smaller bundles
import { Water, ProceduralSky } from '@strata-game-library/r3f/components';
import { useKeyboardControls, useSeek } from '@strata-game-library/r3f/hooks';
```

## Examples

### Outdoor Scene with Weather

```tsx
import { Canvas } from '@react-three/fiber';
import {
  ProceduralSky,
  createTimeOfDay,
  AdvancedWater,
  WeatherSystem,
  GrassInstances,
  TreeInstances,
  FollowCamera,
  EnhancedFog,
} from '@strata-game-library/r3f';

function OutdoorScene() {
  const timeOfDay = createTimeOfDay(14); // 2:00 PM

  return (
    <Canvas shadows>
      <ProceduralSky timeOfDay={timeOfDay} />
      <EnhancedFog />
      <AdvancedWater
        size={500}
        color={0x2a5a8a}
        deepColor={0x1a3a5a}
        causticIntensity={0.6}
        waveHeight={0.3}
      />
      <WeatherSystem />
      <GrassInstances count={10000} area={100} />
      <TreeInstances count={200} area={100} />
      <FollowCamera target={playerRef} distance={8} />
    </Canvas>
  );
}
```

### Side-Scroller with Parallax

```tsx
import { Canvas } from '@react-three/fiber';
import {
  ProceduralBackgroundComponent,
  FixedPerspectiveCamera,
  useKeyboardControls,
} from '@strata-game-library/r3f';

function SideScroller() {
  const controls = useKeyboardControls();

  return (
    <Canvas>
      <FixedPerspectiveCamera preset="side" />
      <ProceduralBackgroundComponent
        biome="forest"
        layerCount={6}
        seed={42}
        scrollX={playerX}
        timeOfDay={12}
        animated
      />
      {/* Game objects */}
    </Canvas>
  );
}
```

### AI Enemies with Steering

```tsx
import {
  YukaEntityManager,
  YukaVehicle,
  YukaNavMesh,
  useSeek,
  useSeparation,
  useObstacleAvoidance,
} from '@strata-game-library/r3f';

function EnemyAI({ target }) {
  const seekBehavior = useSeek({ target: target.position, weight: 1.0 });
  const separationBehavior = useSeparation({ weight: 0.5 });
  const avoidanceBehavior = useObstacleAvoidance({ weight: 2.0 });

  return (
    <YukaEntityManager>
      <YukaVehicle
        behaviors={[seekBehavior, separationBehavior, avoidanceBehavior]}
        maxSpeed={5}
      >
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </YukaVehicle>
    </YukaEntityManager>
  );
}
```

## Related Packages

| Package | Description |
|---------|-------------|
| [`@strata-game-library/core`](https://www.npmjs.com/package/@strata-game-library/core) | Pure TypeScript engine -- algorithms, ECS, state, game orchestration |
| [`@strata-game-library/shaders`](https://www.npmjs.com/package/@strata-game-library/shaders) | Standalone GLSL shaders |
| [`@strata-game-library/presets`](https://www.npmjs.com/package/@strata-game-library/presets) | Pre-configured game presets |

## Documentation

Full documentation, guides, and API reference: [https://strata.game](https://strata.game)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
