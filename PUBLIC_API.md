# Strata Public API Contract

**Status note (2026-04-15):** The repo is transitioning from the historical `@jbcom/strata` documentation model to the new `strata-game-library` umbrella package plus the existing `@strata-game-library/*` workspace packages.

This document describes the intended stable public API surface for the umbrella package and its subpath exports.

All APIs listed here are guaranteed to follow semantic versioning:

- **Major versions** (1.0.0 → 2.0.0): Breaking changes allowed
- **Minor versions** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch versions** (1.0.0 → 1.0.1): Bug fixes only, backward compatible

## Package Exports

### Main Export (`strata-game-library`)

The main export is the stable engine-facing surface: declarative game APIs, presets, and shaders.
Framework adapters and plugins remain available from explicit subpaths.

```ts
import {
  createGame,
  createRPGGame,
  createRPGState,
  createCreature,
  createProp,
  generateInstanceData,
  createQuadrupedSkeleton,
  waterFragmentShader,
  // Presets
  ALL_THEMES
} from 'strata-game-library';
```

### Subpath Exports

For tree-shaking and runtime-specific imports:

- `strata-game-library/core` - Pure TypeScript algorithms (no React)
- `strata-game-library/r3f` - React Three Fiber adapter surface
  Includes `StrataGame`, `RuntimeProp`, `RuntimeCreature`, `RuntimeAssetMesh`, `createRuntimeGeometry`, `useGame`, `useScene`, `useMode`, `useInput`, `useActionPressed`, `useControlHints`, `useGameStatus`, `usePauseToggle`, and `useTransition`
- `strata-game-library/components` - React Three Fiber components
- `strata-game-library/hooks` - React hooks for the R3F adapter
- `strata-game-library/presets` - Organized game primitives by layer
- `strata-game-library/shaders` - GLSL shader code and uniform factories
- `strata-game-library/utils` - Utility functions (texture loading, etc.)
- `strata-game-library/audio-synth` - Tone.js-backed game audio helpers
- `strata-game-library/model-synth` - Meshy-backed text-to-3D, rigging, animation, and retexture clients
- `strata-game-library/capacitor` - Capacitor/mobile bridge
- `strata-game-library/react-native` - React Native bridge
- `strata-game-library/reactylon` - Babylon.js/Reactylon adapter
  Includes `StrataRuntimeProp`, `StrataRuntimeCreature`, `resolveReactylonRuntimeProp`, `resolveReactylonRuntimeCreature`, `createBabylonRuntimeMaterial`, `instantiateBabylonRuntimeProp`, `instantiateBabylonRuntimePropAsync`, `instantiateBabylonRuntimeCreature`, and `instantiateBabylonRuntimeCreatureAsset`
- `strata-game-library/astro` - Astro integration

`StrataGame` is the adapter-owned mount surface and creates its own R3F `Canvas`.

### Platform Helpers

```ts
type Platform = 'web' | 'capacitor' | 'native'

interface AdapterMap<T> {
  web: T
  capacitor?: T
  reactNative?: T
  native?: T
}

detectPlatform(): Platform
isReactNative(): boolean
selectAdapter<T>(adapters: AdapterMap<T>, platform?: Platform): T
```

`reactNative` is the preferred explicit adapter slot for React Native runtimes. `native` remains supported as the backward-compatible generic native slot.

### Composition API

```ts
createCreature(input: CreateCreatureInput | string): CreatureDefinition
resolveCreatureComposition(input: CreateCreatureInput | string): CreatureComposition
createCreatureAnimationGraph(runtime, options?): CreatureRuntimeAnimationGraph
createCreatureIKRigPlan(runtime): CreatureRuntimeIKRigPlan
createProp(input: CreatePropInput | string): PropDefinition
resolvePropComposition(input: CreatePropInput | string): PropComposition
findPropInteractionAction(runtime, action): PropRuntimeInteractionAction | undefined
executePropInteractionAction(runtime, action, state?): PropRuntimeInteractionResult
createPropInteractionController(runtime, initialState?): PropRuntimeInteractionController
createMaterialTrait(type, options?): MaterialTrait
inferMaterialTraits(material, options?): MaterialTrait[]
createMaterialProceduralBakeExportPlan(raster, options?): MaterialProceduralBakeExportPlan
encodeMaterialProceduralBakeExportPlan(plan, options?): MaterialProceduralBakeExportResult[]
createMaterialProceduralBakeBrowserImageEncoder(options?): MaterialProceduralBakeExportEncoderFn
createMaterialProceduralBakeBasisUniversalKtx2Encoder(options): MaterialProceduralBakeExportEncoderFn
createMaterialVariant(material, options?): MaterialDefinition
createMaterialVariants(material, options): MaterialDefinition[]
```

`CreatureComposition` and `PropComposition` include an adapter-neutral `runtime` assembly plan with serializable transforms, bounds, material slots, swappable material metadata, interaction metadata, and physics profiles derived from explicit definitions plus resolved material physics.

`CreatureDefinition.assets` and `CreatureComposition.runtime.asset` provide optional model, rig, animation-clip, and bone-map bindings for asset-backed creature rendering. `createCreatureRigBindingPlan()` converts logical creature bones plus optional loaded source rig bone names into deterministic matched/missing/unverified binding metadata. `createCreatureAnimationGraph()` converts runtime animation bindings into declarative states, guarded transitions, and normalized locomotion blend groups, while `createCreatureIKRigPlan()` turns skeleton IK chains into adapter-neutral solver plans with target coverage. The R3F adapter exposes `RuntimeCreatureAsset`, and `RuntimeCreature` can use asset bindings through `assetMode` and `animation`.

`PropComposition.runtime.interactionActions` provides adapter-ready action descriptors for interactive props, including stable ids, labels, enabled state, affected node ids, audio cues, and payload metadata.

`executePropInteractionAction()` turns those descriptors plus optional prop interaction state into deterministic next-state/effect records for containers, seats, doors, switches, and collectibles. `createPropInteractionController()` wraps that executor with a small stateful controller for adapter-owned UI and gameplay systems. Adapters can execute UI, audio, inventory, command, physics, and state effects without hard-coding prop type behavior.

`MaterialDefinition.traits`, `createMaterialTrait()`, `inferMaterialTraits()`, `createMaterialProceduralPlan()`, `createMaterialProceduralBakePlan()`, `rasterizeMaterialProceduralBakePlan()`, `encodeMaterialProceduralBakeImagePng()`, `encodeMaterialProceduralBakeRasterPng()`, `createMaterialProceduralBakeExportPlan()`, `encodeMaterialProceduralBakeExportPlan()`, `createMaterialProceduralBakeBrowserImageEncoder()`, `createMaterialProceduralBakeBasisUniversalKtx2Encoder()`, and `createMaterialProceduralBakeArtifacts()` provide serializable procedural material metadata, deterministic shader/texture layer plans, bake manifests, pure RGBA bake rasters, PNG byte export, WebP/KTX2 encoder requests, executable export plans with injected encoder hooks, dependency-light browser WebP/canvas and Basis Universal KTX2 adapter factories, and one-shot bake artifact bundles for grain, fibers, scratches, wear, patina, veins, mottle, and absorption channels. Variants can replace or append traits, adapter material descriptors infer or preserve trait, procedural plan, and procedural bake-plan metadata, the R3F adapter applies those plans to `MeshStandardMaterial` shader compilation, and the Reactylon adapter attaches a Babylon PBR material plugin for procedural albedo, scalar, opacity, and emissive effects.

The R3F adapter consumes those plans through `RuntimeProp`, `RuntimeCreature`, `RuntimeCreatureAsset`, `RuntimeAssetMesh`, and `createRuntimeGeometry()`, with override hooks for custom node/bone renderers and custom Three.js materials. `RuntimeCreatureAsset` exposes `createRuntimeCreatureAssetRigBinding()`, `createRuntimeCreatureAnimationTrackNameMap()`, `retargetRuntimeCreatureAnimationClip()`, `resolveRuntimeCreatureAnimationClipName()`, `playRuntimeCreatureAnimationAction()`, `crossFadeRuntimeCreatureAnimationAction()`, `applyRuntimeCreatureAnimationBlend()`, `stopRuntimeCreatureAnimationAction()`, `createRuntimeCreatureAnimationController()`, `createRuntimeCreatureAnimationStateController()`, `createRuntimeCreatureAnimationGraphController()`, `createRuntimeCreaturePoseTargetMap()`, `applyRuntimeCreaturePose()`, `createRuntimeCreatureIKPose()`, `applyRuntimeCreatureIKPose()`, and `onRigBinding` / `onAnimationGraphController` callbacks so loaded Three.js bone hierarchies can be checked against core creature `boneMap` metadata, animation tracks can be retargeted between runtime logical bones and source rig bone names, logical animation clips can be played/stopped/cross-faded/weighted through source Three actions, named guarded state transitions, or core graph events, and runtime/IK poses can be applied by runtime bone id, logical bone id, or source rig bone name. `RuntimeProp` can also execute prop interaction actions on node clicks via `onInteraction`, `interactionState`, and `selectInteractionAction`, `useRuntimePropInteractionController()` exposes the same stateful controller semantics to R3F gameplay UI, `RuntimePropInteractionPanel` provides a prefabbed action/status/reset overlay, and `applyRuntimePropInteractionPhysicsEffects()` maps renderer-neutral physics effects to runtime object metadata plus optional physics-adapter callbacks. `attachRuntimePropPhysicsHandle()` and `createRuntimePropObjectPhysicsAdapter()` provide a standard Three `userData` handle convention for wiring those effects into physics backends; `createRuntimePropRapierPhysicsHandle()` / `attachRuntimePropRapierPhysicsHandle()` and `createRuntimePropCannonPhysicsHandle()` / `attachRuntimePropCannonPhysicsHandle()` provide dependency-light Rapier and Cannon body/collider wrappers for mode, collider, collision-mask, and wake effects.

The Reactylon adapter consumes the same plans through `StrataRuntimeProp`, `StrataRuntimeCreature`, serializable Babylon/Reactylon runtime descriptors, and direct Babylon mesh/material instantiation helpers. `createBabylonRuntimeMaterial()` attaches the Babylon procedural material plugin when a runtime material descriptor carries a procedural plan, and `getBabylonRuntimeProceduralMaterialPlugin()` exposes that plugin for direct Babylon integration. Native Babylon prop instances carry runtime interaction metadata and expose a stateful `executeInteraction()` plus `interactionState` / `resetInteractionState()` for adapter-owned UI or gameplay systems; `executeInteraction()` also applies prop physics effects to Babylon mesh collision/pickability state, runtime metadata, and available Babylon v2/v1 physics bodies. `instantiateBabylonRuntimePropAsync()` and `instantiateBabylonRuntimeCreatureAsset()` add async asset-loading paths for mesh-shaped prop nodes and asset-bound creatures through Babylon `SceneLoader` or an injected asset loader; asset-backed creature instances expose loaded skeletons, rig binding coverage, animation groups, and `playAnimation()` for logical-to-source clip selection.

### Game State Presets

```ts
createRPGGame(options?): Game<RPGState>
createActionGame(options?): Game<ActionState>
createPuzzleGame(options?): Game<PuzzleState>
createSandboxGame(options?): Game<SandboxState>
createRacingGame(options?): Game<RacingState>
createPlatformerGame(options?): Game<ActionState>

createRPGState(overrides?): RPGState
createActionState(overrides?): ActionState
createPuzzleState(overrides?): PuzzleState
createSandboxState(overrides?): SandboxState
createRacingState(overrides?): RacingState
createStateFromPreset(name, overrides?): RPGState | ActionState | PuzzleState | SandboxState | RacingState
```

### Declarative Transitions

```ts
interface GameDefinition {
  transitions?: {
    scenes?: {
      load?: GameTransitionOptions
      push?: GameTransitionOptions
      pop?: GameTransitionOptions
    }
    modes?: {
      push?: GameTransitionOptions
      replace?: GameTransitionOptions
      pop?: GameTransitionOptions
    }
  }
}

interface SceneDefinition {
  transition?: GameTransitionOptions
}

interface ModeDefinition {
  transition?: GameTransitionOptions
}
```

Runtime call options still win, then scene/mode defaults, then game-level defaults.

### Game Runtime Status

```ts
interface GameSnapshot {
  isPaused: boolean
  activeProfileId?: string
}

interface Game<TState extends object = object> {
  readonly isPaused: boolean
  readonly activeProfileId?: string
  getSnapshot(): GameSnapshot
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void
  setActiveProfile(profileId?: string): void
  pause(): void
  resume(): void
  save(slot?: string): Promise<boolean>
  load(slot?: string): Promise<boolean>
  deleteSave(slot: string): Promise<boolean>
  listSaves(): Promise<string[]>
  getSaveInfo(slot: string): Promise<{ timestamp: number; version: number } | null>
}
```

When the game is paused, the active mode's `pause` binding remains live and other mapped actions are temporarily cleared. `activeProfileId` lets adapters and shell actions keep profile-aware flows anchored to the currently selected save profile.

### Preset Helper Behavior

- `createRPGGame`, `createActionGame`, `createPuzzleGame`, `createSandboxGame`, `createRacingGame`, and `createPlatformerGame` now ship built-in mode `inputMap` defaults.
- Those helpers also now ship `ui.shell` metadata for a built-in HUD, pause menu, and loading overlay.
- Those helpers also now ship announcement-style scene shell metadata for their default starting scenes.
- Those helpers can now also synthesize opt-in title/menu/save/settings/session shell flows via `titleScene: true | { ... }`, `menuScene: true | { ... }`, `saveScene: true | { ... }`, `settingsScene: true | { ... }`, and `sessionShell: true | { ... }`.
- `saveScene` can synthesize either a flat archive scene or a generated save-profile selector plus per-profile archive scenes via `profiles` and `profileSelector`, and `createSceneShellFlow()` exposes matching `saveProfileSceneIds` metadata when that path is used.
- Generated profile selectors now use a dedicated `profiles` shell variant with `saveProfiles` metadata, so built-in R3F scene cards can render live per-profile occupancy summaries and latest-save metadata before entering an archive.
- `saveProfiles` metadata can now also declare `emptyActionLabel` and `occupiedActionLabel`, which the built-in R3F selector uses to present empty profiles as start points and occupied profiles as continue points.
- Generated profile selectors now also wire those states into runtime behavior via `load-latest-profile`, so occupied profiles restore the latest available save, empty profiles can jump directly into gameplay, and separate manage actions can still open the profile archive scene.
- Generated title/menu flows now also synthesize active-profile-aware continue actions via `load-active-profile`, so the current profile resumes from its latest save while fallback scenes preserve the normal boot path when no active profile is selected yet.
- Generated save actions across title/menu/settings/session shells now also use `open-active-profile-archive`, so shells reopen the currently active profile archive directly and only fall back to the selector when no profile has been chosen yet.
- Generated profile selectors can now also include profile-level `clear-profile` actions, so occupied profiles can be reset directly from the selector without first loading the archive scene.
- Generated per-profile archive flows namespace persisted slot ids by default, so visible slot ids can stay local to each profile while persistence uses profile-scoped `storageSlot` ids like `campaign:slot-1`; override with `slotNamespace` or an explicit `storageSlot`.
- Archive slot metadata now also supports `allowSave`, `allowLoad`, `allowDelete`, `savedLabel`, and `emptyLabel` for slot-level control in built-in archive shells.
- `createSceneShellFlow()` exposes the same title/menu/save/settings/session shell synthesis at the core layer for arbitrary `SceneDefinition` records, and the genre helpers now build on top of that shared flow builder.
- `createGame()` also now exposes first-class persistence helpers on the runtime via `game.save()`, `game.load()`, `game.deleteSave()`, `game.listSaves()`, and `game.getSaveInfo()`.
- Scene-shell action builders now also cover persistence flows with `createSaveGameSceneShellAction()`, `createLoadGameSceneShellAction()`, `createLoadLatestProfileSceneShellAction()`, `createOpenActiveProfileArchiveSceneShellAction()`, `createDeleteSaveSceneShellAction()`, and `createClearProfileSceneShellAction()`.
- Matching scene/mode overrides are merged with preset defaults instead of replacing the entire preset record.
- Non-matching custom scene/mode records still act as replacement sets, so fully custom templates remain possible.

### Declarative Game Shell

```ts
interface GameHUDDefinition {
  title?: string
  hintLimit?: number
  showMode?: boolean
  showPressedActions?: boolean
  showControls?: boolean
}

interface PauseMenuDefinition {
  title?: string
  description?: string
  resumeLabel?: string
  hintLimit?: number
  showMode?: boolean
  showControls?: boolean
}

interface GameLoadingOverlayDefinition {
  title?: string
  description?: string
  bootLabel?: string
  sceneLabel?: string
  bootDescription?: string
  sceneDescription?: string
  showScene?: boolean
  showProgress?: boolean
}

type SceneShellVariant = 'announcement' | 'title' | 'menu' | 'session' | 'archive' | 'profiles'

interface SceneShellSaveSlotDefinition {
  slot: string
  storageSlot?: string
  label?: string
  description?: string
  allowSave?: boolean
  allowLoad?: boolean
  allowDelete?: boolean
  savedLabel?: string
  emptyLabel?: string
}

interface SceneShellSaveProfileDefinition {
  id: string
  label?: string
  description?: string
  sceneId: string
  emptyActionLabel?: string
  occupiedActionLabel?: string
  slots?: SceneShellSaveSlotDefinition[]
}

interface SceneShellProfileLoadTargetDefinition {
  emptySceneId?: string
  slots: string[]
}

type SceneShellActionDefinition =
  | {
      type: 'dismiss-shell'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
    }
  | {
      type: 'load-scene' | 'push-scene'
      label: string
      sceneId: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      transition?: GameTransitionOptions
    }
  | {
      type: 'pop-scene'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      transition?: GameTransitionOptions
    }
  | {
      type: 'push-mode' | 'replace-mode'
      label: string
      modeId: string
      props?: Record<string, unknown>
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      transition?: GameTransitionOptions
    }
  | {
      type: 'pop-mode' | 'pause' | 'resume' | 'toggle-pause'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
    }
  | {
      type: 'save-game' | 'load-game'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      slot?: string
    }
  | {
      type: 'delete-save'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      slot: string
    }
  | {
      type: 'load-latest-profile'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      profileId: string
      slots: string[]
      emptySceneId?: string
      transition?: GameTransitionOptions
    }
  | {
      type: 'load-active-profile'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      profiles: Record<string, SceneShellProfileLoadTargetDefinition>
      fallbackSceneId?: string
      transition?: GameTransitionOptions
    }
  | {
      type: 'open-active-profile-archive'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      profileSceneIds: Record<string, string>
      fallbackSceneId?: string
      transition?: GameTransitionOptions
    }
  | {
      type: 'clear-profile'
      label: string
      description?: string
      variant?: 'primary' | 'secondary' | 'ghost'
      closeOnSuccess?: boolean
      profileId: string
      slots: string[]
    }

interface SceneShellDefinition {
  variant?: SceneShellVariant
  title?: string
  subtitle?: string
  description?: string
  actions?: SceneShellActionDefinition[]
  saveProfiles?: SceneShellSaveProfileDefinition[]
  saveSlots?: SceneShellSaveSlotDefinition[]
  showSceneId?: boolean
  durationMs?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  showOnEnter?: boolean
}

interface GameUIShellDefinition {
  hud?: GameHUDDefinition | false
  loadingOverlay?: GameLoadingOverlayDefinition | false
  pauseMenu?: PauseMenuDefinition | false
}

interface GameDefinition {
  ui?: {
    shell?: GameUIShellDefinition
  }
}

interface SceneDefinition {
  shell?: SceneShellDefinition
}
```

`StrataGame` uses `ui.shell` as a fallback only. Custom `ui.hud` and `ui.menus.pause` React components still take precedence when they are provided, and the explicit `loading` prop still takes precedence during boot.
Scene-level `shell` metadata is separate from `ui.shell` and describes the active scene's built-in announcement/title/menu/session/archive/profile card.
In the R3F adapter, `scene.shell.actions` routes through the live `game.loadScene()`, `pushScene()`, `popScene()`, `pushMode()`, `replaceMode()`, `popMode()`, `pause()`, `resume()`, `save()`, `load()`, `deleteSave()`, `load-latest-profile`, `load-active-profile`, `open-active-profile-archive`, and profile-level `clear-profile` helpers.
When `scene.shell.saveSlots` is present, the built-in archive card also reflects live slot availability, save timestamp/version metadata, and disables invalid `load-game` / `delete-save` actions automatically.

### Model Synth Character Workflow

```ts
const synth = new ModelSynth({ apiKey: process.env.MESHY_API_KEY! })

const character = await synth.character({
  prompt: 'stylized otter adventurer',
  rigged: true,
  animations: ['idle', 'walk', { name: 'jump60', actionId: 466 }],
})
```

`ModelSynth.character()` generates the model, optionally creates/polls a Meshy rigging task, and optionally creates/polls Meshy animation tasks. The returned task is augmented with `riggingTask`, `riggedModelUrls`, `animationTasks`, and `animationUrls` when those stages run.

When rigging is requested, the character workflow refines the Text-to-3D preview by default before submitting the task to Meshy rigging. Pass `refine: false` only for advanced workflows where the input is known to be riggable.

Named character animations resolve through Strata's bundled Meshy action-id map. Numeric Meshy action ids and named object requests are also accepted. Unknown named animation requests are rejected before text-to-3D model generation starts.

### Scene Shell Preset Helpers

```ts
createAnnouncementSceneShell(options?: Omit<Partial<SceneShellDefinition>, 'variant'>): SceneShellDefinition
createTitleSceneShell(options?: Omit<Partial<SceneShellDefinition>, 'variant'>): SceneShellDefinition
createMenuSceneShell(options?: Omit<Partial<SceneShellDefinition>, 'variant'>): SceneShellDefinition
createSessionSceneShell(options?: Omit<Partial<SceneShellDefinition>, 'variant'>): SceneShellDefinition
createSaveSceneShell(options?: Omit<Partial<SceneShellDefinition>, 'variant'>): SceneShellDefinition
createAnnouncementScene(id: string, options?): SceneDefinition
createTitleScene(id: string, options?): SceneDefinition
createMenuScene(id: string, options?): SceneDefinition
createSessionScene(id: string, options?): SceneDefinition
createSaveScene(id: string, options?): SceneDefinition

createDismissSceneShellAction(options?): SceneShellActionDefinition
createLoadSceneShellAction(sceneId: string, options?): SceneShellActionDefinition
createPushSceneShellAction(sceneId: string, options?): SceneShellActionDefinition
createPopSceneShellAction(options?): SceneShellActionDefinition
createPushModeSceneShellAction(modeId: string, options?): SceneShellActionDefinition
createReplaceModeSceneShellAction(modeId: string, options?): SceneShellActionDefinition
createPopModeSceneShellAction(options?): SceneShellActionDefinition
createPauseSceneShellAction(options?): SceneShellActionDefinition
createResumeSceneShellAction(options?): SceneShellActionDefinition
createTogglePauseSceneShellAction(options?): SceneShellActionDefinition
createSaveGameSceneShellAction(slot?: string, options?): SceneShellActionDefinition
createLoadGameSceneShellAction(slot?: string, options?): SceneShellActionDefinition
createLoadLatestProfileSceneShellAction(profileId: string, slots: string[], options?): SceneShellActionDefinition
createLoadActiveProfileSceneShellAction(profiles: Record<string, SceneShellProfileLoadTargetDefinition>, options?): SceneShellActionDefinition
createOpenActiveProfileArchiveSceneShellAction(profileSceneIds: Record<string, string>, options?): SceneShellActionDefinition
createDeleteSaveSceneShellAction(slot: string, options?): SceneShellActionDefinition
createClearProfileSceneShellAction(profileId: string, slots: string[], options?): SceneShellActionDefinition
```

Built-in genre helpers use the same shell primitives for their default starting-scene announcements, and can optionally synthesize title/menu scenes in front of the resolved preset gameplay scene while also converting that gameplay scene into a generated session shell with genre-aware action labels.

### Scene Loading Snapshot

```ts
interface SceneManagerSnapshot {
  current: SceneDefinition | null
  stack: SceneDefinition[]
  isLoading: boolean
  loadProgress: number
  pendingSceneId?: string
}
```

`pendingSceneId` reflects the scene currently being loaded or pushed, which makes definition-driven loading UI deterministic instead of guess-based.

## Core API (Pure TypeScript)

### SDF Functions

```ts
// Primitives
sdSphere(p: Vector3, center: Vector3, radius: number): number
sdBox(p: Vector3, center: Vector3, halfExtents: Vector3): number
sdPlane(p: Vector3, normal: Vector3, distance: number): number
sdCapsule(p: Vector3, a: Vector3, b: Vector3, radius: number): number
sdTorus(p: Vector3, center: Vector3, majorRadius: number, minorRadius: number): number
sdCone(p: Vector3, center: Vector3, angle: number, height: number): number
sdRock(p: Vector3, center: Vector3, baseRadius: number): number

// Operations
opUnion(d1: number, d2: number): number
opSubtraction(d1: number, d2: number): number
opIntersection(d1: number, d2: number): number
opSmoothUnion(d1: number, d2: number, k: number): number
opSmoothSubtraction(d1: number, d2: number, k: number): number
opSmoothIntersection(d1: number, d2: number, k: number): number

// Noise
noise3D(x: number, y: number, z: number): number
fbm(x: number, y: number, z: number, octaves?: number): number
warpedFbm(x: number, y: number, z: number, octaves?: number): number

// Utilities
calcNormal(p: Vector3, sdfFunc: (p: Vector3) => number, epsilon?: number): Vector3
getBiomeAt(x: number, z: number, biomes: BiomeData[]): BiomeData
getTerrainHeight(x: number, z: number, biomes: BiomeData[]): number
sdTerrain(p: Vector3, biomes: BiomeData[]): number
sdCaves(p: Vector3): number
```

### Marching Cubes

```ts
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

### Instancing

```ts
generateInstanceData(
  count: number,
  areaSize: number,
  biomes: BiomeData[],
  heightFunction?: (x: number, z: number) => number,
  seed?: number
): InstanceData[]

createInstancedMesh(
  geometry: BufferGeometry,
  material: Material,
  instances: InstanceData[]
): InstancedMesh
```

### Water Components

```ts
createWaterMaterial(options?: WaterMaterialOptions): ShaderMaterial
createAdvancedWaterMaterial(options?: AdvancedWaterMaterialOptions): ShaderMaterial
createWaterGeometry(size: number, segments?: number): PlaneGeometry
```

### Ray Marching

```ts
createRaymarchingMaterial(options: RaymarchingMaterialOptions): ShaderMaterial
createRaymarchingGeometry(): PlaneGeometry
```

### Sky

```ts
createSkyMaterial(options: SkyMaterialOptions): ShaderMaterial
createSkyGeometry(size?: [number, number]): PlaneGeometry
```

### Volumetrics

```ts
createVolumetricFogMeshMaterial(options?: VolumetricFogMeshMaterialOptions): ShaderMaterial
createUnderwaterOverlayMaterial(options?: UnderwaterOverlayMaterialOptions): ShaderMaterial
```

### Input

```ts
createInputManager(config?: InputManagerConfig): InputManager

interface InputManager {
  attach(element: HTMLElement): void
  detach(): void
  setActionMap(actionMap: InputActionMap): void
  clearActionMap(): void
  getActionMap(): InputActionMap
  getSnapshot(): InputManagerSnapshot
  subscribe(listener: (snapshot: InputManagerSnapshot) => void): () => void
  isActionPressed(action: string): boolean
  getPressedActions(): string[]
  on(event: 'press' | 'release' | 'axisChange' | 'actionStart' | 'actionEnd' | '*', callback: (event: InputEvent) => void): void
  off(event: 'press' | 'release' | 'axisChange' | 'actionStart' | 'actionEnd' | '*', callback: (event: InputEvent) => void): void
}

type InputActionMap = Record<string, {
  keyboard?: string[]
  gamepad?: string | number
  tilt?: boolean
}>
```

```ts
useInput(): InputManagerSnapshot
useActionPressed(action: string): boolean
useCurrentInputMap(): InputActionMap
useGameStatus(): GameSnapshot
usePauseToggle(options?: {
  action?: string
  enabled?: boolean
}): GameSnapshot & {
  pause(): void
  resume(): void
  toggle(): void
}
useControlHints(): Array<{
  action: string
  keyboard?: string[]
  gamepad?: string | number
  tilt?: boolean
}>
```

`usePauseToggle()` only binds to `actionStart` events when `enabled` is set to `true`; `StrataGame` already handles the default pause binding path.

### Built-In HUD / Menu Scaffolding

```ts
interface StrataGameProps {
  autoPause?: boolean
  pauseAction?: string
}

createGameHUD(options?: GameHUDProps): React.ComponentType
createPauseMenu(options?: PauseMenuProps): React.ComponentType
createSceneCard(options?: SceneCardProps): React.ComponentType

GameHUD(props?: GameHUDProps): ReactElement
PauseMenu(props?: PauseMenuProps): ReactElement | null
SceneCard(props?: SceneCardProps): ReactElement | null
```

`StrataGame` renders `game.definition.ui?.hud` during the normal UI overlay pass and `game.definition.ui?.menus?.pause` automatically while `isPaused === true`.
If those custom React components are absent, it falls back to `game.definition.ui?.shell` and renders the built-in HUD/pause-menu scaffold from that metadata.
The same fallback path now also covers boot and scene-loading overlays via `game.definition.ui?.shell?.loadingOverlay`.
When the active scene includes `scene.shell`, `StrataGame` also renders a built-in scene card automatically and wires any declarative shell actions into the live game runtime.

## Presets API

### Fur

```ts
createFurMaterial(
  layerIndex: number,
  totalLayers: number,
  options?: FurOptions
): ShaderMaterial

createFurSystem(
  geometry: BufferGeometry,
  baseMaterial: Material,
  options?: FurOptions
): Group

updateFurUniforms(furSystem: Group, time: number): void
```

### Characters

```ts
createCharacter(options?: CharacterOptions): {
  root: Group
  joints: CharacterJoints
  state: CharacterState
}

animateCharacter(
  character: { root: Group; joints: CharacterJoints; state: CharacterState },
  time: number,
  deltaTime?: number
): void
```

### Molecular

```ts
createMolecule(
    atoms: AtomData[],
    bonds: BondData[],
    options?: MolecularOptions
): Group

createWaterMolecule(
    position?: Vector3,
    scale?: number
): Group
```

### Particles

```ts
createParticleSystem(
    options?: ParticleEmitterOptions
): ParticleSystem

// ParticleSystem interface
interface ParticleSystem {
    group: Group
    update: (deltaTime: number) => void
    dispose: () => void
}
```

### Decals

```ts
createDecal(
    geometry: BufferGeometry,
    options: DecalOptions
): Mesh

createBulletHoleDecal(
    position: Vector3,
    normal: Vector3,
    size?: number
): Mesh
```

### Billboards

```ts
createBillboard(
    options: BillboardOptions
): Mesh

createBillboardInstances(
    count: number,
    positions: Vector3[],
    options: BillboardOptions
): InstancedMesh

createAnimatedBillboard(
    texture: Texture,
    frameCount: { x: number; y: number },
    frameRate?: number,
    options?: Omit<BillboardOptions, 'texture'>
): Mesh & { update: (deltaTime: number) => void }
```

### Shadows

```ts
createShadowSystem(
    options: ShadowSystemOptions
): ShadowSystem

createContactShadows(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera
): ShaderMaterial
```

### Post-Processing

```ts
createPostProcessingPipeline(
    options: PostProcessingOptions
): PostProcessingPipeline

// PostProcessingPipeline interface
interface PostProcessingPipeline {
    render: (deltaTime: number) => void
    dispose: () => void
}
```

### Reflections

```ts
createReflectionProbe(
    options: ReflectionProbeOptions
): ReflectionProbe

createEnvironmentMap(
    renderer: WebGLRenderer,
    scene: Scene,
    position: Vector3,
    resolution?: number
): CubeTexture

applyReflectionProbe(
    material: Material,
    probe: CubeTexture,
    intensity?: number
): void

// ReflectionProbeManager class
class ReflectionProbeManager {
    addProbe(name: string, options: ReflectionProbeOptions): ReflectionProbe
    getProbe(name: string): ReflectionProbe | undefined
    removeProbe(name: string): void
    update(): void
    dispose(): void
}
```

## React Components API

### Water

```tsx
<Water size={number} time?: number />
<AdvancedWater
  size={number}
  waterColor?: ColorRepresentation
  deepWaterColor?: ColorRepresentation
  foamColor?: ColorRepresentation
  causticIntensity?: number
/>
```

### Instancing Components

```tsx
<GPUInstancedMesh
  geometry={BufferGeometry}
  material={Material}
  count={number}
  instances={InstanceData[]}
  enableWind?: boolean
  windStrength?: number
  lodDistance?: number
/>

<GrassInstances count={number} areaSize={number} biomes={BiomeData[]} />
<TreeInstances count={number} areaSize={number} biomes={BiomeData[]} />
<RockInstances count={number} areaSize={number} biomes={BiomeData[]} />
```

### Sky Components

```tsx
<ProceduralSky
  timeOfDay={Partial<TimeOfDayState>}
  weather?: Partial<WeatherState>
  gyroTilt?: Vector2
/>
```

### Volumetric Components

```tsx
<VolumetricEffects
  fogEnabled?: boolean
  underwaterEnabled?: boolean
/>

<VolumetricFogMesh
  color?: Color
  density?: number
  height?: number
/>

<UnderwaterOverlay
  waterColor?: Color
  density?: number
  causticStrength?: number
/>
```

### Ray Marching Components

```tsx
<Raymarching
  sdfFunction={string} // GLSL function string
  maxSteps?: number
  maxDistance?: number
  minDistance?: number
  backgroundColor?: Color
  fogStrength?: number
  fogColor?: Color
/>
```

## Type Definitions

All types are exported and part of the public API:

```ts
// SDF
interface BiomeData {
  type: 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland'
  center: Vector2
  radius: number
}

// Instancing
interface InstanceData {
  position: Vector3
  rotation: Euler
  scale: Vector3
  biome: string
  height: number
  underwater: boolean
}

// Marching Cubes
interface MarchingCubesOptions {
  resolution: number
  bounds: { min: Vector3; max: Vector3 }
  isoLevel?: number
}

interface MarchingCubesResult {
  vertices: Float32Array
  normals: Float32Array
  indices: Uint32Array
}

// Presets
interface FurOptions {
  baseColor?: ColorRepresentation
  tipColor?: ColorRepresentation
  layerCount?: number
  spacing?: number
  windStrength?: number
  gravityDroop?: number
}

interface CharacterOptions {
  skinColor?: ColorRepresentation
  furOptions?: FurOptions
  scale?: number
}

interface CharacterState {
    speed: number
    maxSpeed: number
    rotation: number
    position: Vector3
    velocity: Vector3
}

// Particles
interface ParticleEmitterOptions {
    maxParticles?: number
    lifetime?: number
    rate?: number
    shape?: 'point' | 'box' | 'sphere' | 'cone'
    shapeParams?: {
        width?: number
        height?: number
        depth?: number
        radius?: number
        angle?: number
    }
    velocity?: { min: Vector3; max: Vector3 }
    acceleration?: Vector3
    color?: { start: Color; end: Color }
    size?: { start: number; end: number }
    opacity?: { start: number; end: number }
    rotation?: { min: number; max: number }
    texture?: Texture
    blending?: Blending
}

// Decals
interface DecalOptions {
    position: Vector3
    rotation: Euler
    scale: Vector3
    texture: Texture
    normalMap?: Texture
    material?: Material
    depthTest?: boolean
    depthWrite?: boolean
}

// Billboards
interface BillboardOptions {
    texture: Texture
    size?: number | { width: number; height: number }
    color?: Color
    transparent?: boolean
    opacity?: number
    alphaTest?: number
    side?: Side
}

// Shadows
interface ShadowSystemOptions {
    light: DirectionalLight
    camera: Camera
    cascades?: number
    shadowMapSize?: number
    shadowBias?: number
    shadowNormalBias?: number
    shadowRadius?: number
    maxDistance?: number
    fadeDistance?: number
    enableSoftShadows?: boolean
    enableContactShadows?: boolean
}

// Post-Processing
interface PostProcessingOptions {
    renderer: WebGLRenderer
    scene: Scene
    camera: Camera
    effects?: PostProcessingEffect[]
    resolution?: { width: number; height: number }
}

type PostProcessingEffect =
    | { type: 'bloom'; threshold?: number; intensity?: number; radius?: number }
    | { type: 'ssao'; radius?: number; intensity?: number; bias?: number }
    | { type: 'colorGrading'; lut?: Texture; intensity?: number }
    | { type: 'motionBlur'; samples?: number; intensity?: number }
    | { type: 'depthOfField'; focus?: number; aperture?: number; maxBlur?: number }
    | { type: 'chromaticAberration'; offset?: number }
    | { type: 'vignette'; offset?: number; darkness?: number }
    | { type: 'filmGrain'; intensity?: number }

// Reflections
interface ReflectionProbeOptions {
    position: Vector3
    size?: number
    resolution?: number
    updateRate?: number
    boxProjection?: boolean
    boxSize?: Vector3
    renderObjects?: (scene: Scene) => Object3D[]
}

// ... and more (see full type exports)
```

## Input Validation

All public functions include input validation and throw descriptive errors:

```ts
// Example error messages
"sdSphere: radius must be positive"
"generateInstanceData: count must be positive"
"createWaterMaterial: time must be a finite number"
```

## Performance Guarantees

- **GPU-accelerated**: All rendering uses GPU where possible
- **Mobile-optimized**: Texture compression, LOD, and performance tuning
- **Deterministic**: Seeded random for reproducible results
- **Memory-safe**: Proper disposal of resources (materials, geometries)

## Breaking Changes Policy

Breaking changes will only occur in major versions and will be:

1. Documented in CHANGELOG.md
2. Deprecated for at least one minor version before removal
3. Clearly marked in TypeScript types

## Internal APIs

APIs not listed in this document are **internal** and may change without notice:

- Internal helper functions
- Private class methods
- Implementation details
- Test utilities

## Examples vs Tests

- **Examples** (`examples/`) - Documentation and demos for developers
- **Tests** (`tests/`) - Automated verification of API contract
  - `tests/unit/` - Unit tests for core functions
  - `tests/integration/` - Integration tests for components
  - `tests/e2e/` - End-to-end Playwright tests

Examples are for learning; tests are for verification.
