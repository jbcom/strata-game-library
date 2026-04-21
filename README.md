# Strata Game Library

[![CI](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Layer by Layer, World by World.** The complete game framework for building procedural 3D worlds in React Three Fiber.

Terrain, water, vegetation, sky, physics, AI, animation, audio -- everything you need to ship immersive games and experiences.

**[Documentation](https://strata.game)** | **[Live Demos](https://strata.game/showcase/)** | **[Getting Started](https://strata.game/getting-started/)**

## Quick Start

```bash
# New single-package entrypoint (workspace now, first npm publish pending)
pnpm add strata-game-library @react-three/fiber @react-three/drei three

# Current published install path
pnpm add @strata-game-library/core @strata-game-library/r3f @react-three/fiber @react-three/drei three
```

```tsx
import {
  createAnnouncementSceneShell,
  createDismissSceneShellAction,
  createRPGGame,
  createTogglePauseSceneShellAction,
} from 'strata-game-library';
import {
  ProceduralSky,
  SceneCard,
  StrataGame,
  VolumetricFogMesh,
  Water,
  createGameHUD,
  createPauseMenu,
} from 'strata-game-library/r3f';

const ExplorerHUD = createGameHUD({ title: 'Explorer HUD', hintLimit: 5 });
const ExplorerPauseMenu = createPauseMenu({
  title: 'Expedition Paused',
  description: 'The current mode stays mounted, and the pause action remains available.',
});

const game = createRPGGame({
  name: 'River Demo',
  version: '0.1.0',
  world: {
    regions: {
      meadow: {
        name: 'Meadow',
        center: [0, 0, 0],
        radius: 80,
      },
    },
    connections: [],
  },
  scenes: {
    main: {
      id: 'main',
      shell: createAnnouncementSceneShell({
        actions: [
          createTogglePauseSceneShellAction({
            label: 'Toggle Pause',
            variant: 'primary',
          }),
          createDismissSceneShellAction({
            closeOnSuccess: true,
            label: 'Dismiss Card',
            variant: 'ghost',
          }),
        ],
        title: 'River Crossing',
        subtitle: 'SCENE MENU',
        description: 'The current route is loaded, and the shell can now run live runtime actions.',
      }),
      render: () => (
        <>
          <ProceduralSky sunPosition={[100, 50, 100]} />
          <Water size={200} depth={20} />
          <VolumetricFogMesh density={0.02} />
        </>
      ),
    },
  },
  initialScene: 'main',
  modes: {
    exploration: {
      systems: [],
    },
  },
  initialState: {
    currentRegion: 'meadow',
    player: {
      name: 'Scout',
    },
  },
  ui: {
    hud: ExplorerHUD,
    menus: {
      pause: ExplorerPauseMenu,
    },
  },
});

function Game() {
  return <StrataGame game={game} />;
}
```

`strata-game-library` is the new umbrella package for the monorepo. Its root export is the stable core/presets/shaders surface, and framework adapters or plugins stay available as explicit subpaths from the same install target while the legacy `@strata-game-library/*` packages remain available during consolidation.

`StrataGame` owns the R3F canvas, attaches the core `InputManager` automatically, exposes `useInput()` / `useActionPressed()` / `useControlHints()` / `useGameStatus()` alongside `useGame()` / `useScene()` / `useMode()` / `useTransition()`, and keeps active mode `inputMap` definitions flowing into the live action map.

Pause behavior is now part of the default declarative mount path: `StrataGame` listens for the active mode's `pause` action by default, narrows the live action map to that pause binding while paused, and renders `game.definition.ui?.menus?.pause` automatically. The R3F component layer also now includes `GameHUD`, `PauseMenu`, `SceneCard`, `createGameHUD()`, and `createPauseMenu()` for built-in HUD/menu scaffolding.

Composition outputs now have adapter paths too: `RuntimeProp` and `RuntimeCreature` render resolved core composition runtime plans in R3F, while `StrataRuntimeProp` and `StrataRuntimeCreature` expose serializable Reactylon/Babylon descriptors for the same plans.

`createGame()` is now transition-aware at the definition level too: `GameDefinition.transitions` can declare default scene/mode transitions, individual scenes or modes can override those defaults, and the built-in genre helpers ship opinionated transition presets out of the box.

The built-in genre helpers also now ship usable mode-level control schemes, and matching scene/mode overrides inherit those defaults instead of forcing you to redefine every input binding from scratch.

Scenes can now also declare `scene.shell` metadata for built-in announcement, title, menu, session, or archive cards. Those cards can stay pinned and run declarative actions such as `load-scene`, `push-mode`, `toggle-pause`, `resume`, `save-game`, `load-game`, `load-latest-profile`, `load-active-profile`, `open-active-profile-archive`, `delete-save`, `clear-profile`, or `dismiss-shell`, and the core package now exposes reusable builders like `createAnnouncementSceneShell()`, `createTitleSceneShell()`, `createMenuSceneShell()`, `createSessionSceneShell()`, `createSaveSceneShell()`, `createAnnouncementScene()`, `createTitleScene()`, `createMenuScene()`, `createSessionScene()`, `createSaveScene()`, `createLoadSceneShellAction()`, `createLoadLatestProfileSceneShellAction()`, `createLoadActiveProfileSceneShellAction()`, `createOpenActiveProfileArchiveSceneShellAction()`, `createSaveGameSceneShellAction()`, `createLoadGameSceneShellAction()`, `createDeleteSaveSceneShellAction()`, `createClearProfileSceneShellAction()`, and `createTogglePauseSceneShellAction()` so you do not have to hand-assemble those objects. Archive shells can also declare `saveSlots` metadata, and the built-in R3F scene card will reflect live slot state, saved timestamp/version metadata, and disable invalid load/delete actions automatically.

`createGame()` now also exposes first-class persistence helpers on the returned runtime via `game.save()`, `game.load()`, `game.deleteSave()`, `game.listSaves()`, and `game.getSaveInfo()`, plus reactive profile-session status via `game.activeProfileId`, `game.setActiveProfile()`, `game.getSnapshot()`, and `game.subscribe()`, so shell actions and imperative consumers can use the same save system without reaching through `store.getState()`.

Preset helpers now also include plain `ui.shell` metadata for the built-in HUD, pause menu, and loading overlay, plus built-in announcement-shell metadata for their default starting scenes. They can also synthesize opt-in shell flows via `titleScene: true | { ... }`, `menuScene: true | { ... }`, `saveScene: true | { ... }`, `settingsScene: true | { ... }`, and `sessionShell: true | { ... }`, which front the normal preset gameplay scene with generated title/menu/save/settings cards and can also convert the live gameplay scene into a session card with menu/title/save/settings/pause actions. Those generated shells now use genre-aware copy and default action labels instead of generic placeholders, and `saveScene` can generate either a flat runtime-backed archive or a generated profile selector plus per-profile archive scenes without hand-authoring shell buttons. Profile selectors are now first-class `profiles` scene shells rather than generic menus, so the built-in R3F scene card can show live per-profile occupancy summaries and latest-save metadata before you enter an archive. Generated profile selector metadata now also carries state-aware entry labels, so empty profiles read as start points while occupied profiles read as continue points in the built-in R3F shell. Generated profile selectors now back those labels with direct runtime behavior too: occupied profiles restore the latest available save, empty profiles jump straight into gameplay, and explicit manage buttons still open the per-profile archive scene. Generated title and menu flows now also synthesize active-profile-aware continue actions through `load-active-profile`, so a current profile resumes from its latest save while fallback scenes preserve the old boot path when no profile is selected yet. Generated save actions across title/menu/settings/session shells now also reuse the runtime's active profile, so `Saves` reopens the current profile archive directly and falls back to the selector only when no active profile has been chosen yet. Generated profile selectors can also emit selector-level clear actions, so occupied profiles can be reset directly from the selector without opening the archive scene first. Generated profile archives also namespace persisted slot ids by default, so per-profile slot definitions can stay local to the UI while persistence uses `storageSlot` keys like `campaign:slot-1`; that can be overridden per profile with `slotNamespace` or per slot with an explicit `storageSlot`. Archive slot metadata can now also constrain individual slot actions with `allowSave`, `allowLoad`, and `allowDelete`, plus custom `savedLabel` / `emptyLabel` state copy for the built-in archive UI. The same flow builder is also available directly as `createSceneShellFlow()` for non-preset scene records. If you do not provide custom `ui.hud` or `ui.menus.pause` React components, or a custom `loading` prop for boot, `StrataGame` will synthesize the built-in shell automatically from that metadata.

Package policy is now documented in [Package Strategy](docs/architecture/PACKAGE_STRATEGY.md), with historical split-repo parity recorded in [Consolidation Parity Matrix](docs/architecture/CONSOLIDATION_PARITY_MATRIX.md). Consumer migration guidance lives in the public [Umbrella Package Migration](apps/docs/src/content/docs/guides/umbrella-package-migration.md) guide.

## Packages

| Package | Status | Description |
|---------|--------|-------------|
| [`strata-game-library`](packages/strata-game-library) | Workspace, pending first npm publish | New single-install entrypoint with a runtime-light root plus tree-shakeable subpaths |
| [`@strata-game-library/core`](packages/core) | Published | Pure TS algorithms, ECS, physics, AI, state, game orchestration |
| [`@strata-game-library/r3f`](adapters/r3f) | Workspace, pending npm publish | React Three Fiber components, hooks, StrataGame |
| [`@strata-game-library/shaders`](packages/shaders) | Published | Standalone GLSL shaders for Three.js |
| [`@strata-game-library/presets`](packages/presets) | Published | Production-ready configurations (30+ categories) |
| [`@strata-game-library/audio-synth`](plugins/audio-synth) | Published | Procedural audio synthesis with Tone.js |
| [`@strata-game-library/model-synth`](plugins/model-synth) | Workspace, pending npm publish | AI-powered 3D model generation |
| [`@strata-game-library/capacitor`](plugins/capacitor) | Rename in progress, npm currently `@strata-game-library/capacitor-plugin` | Native mobile integration via Capacitor |
| [`@strata-game-library/react-native`](plugins/react-native) | Rename in progress, npm currently `@strata-game-library/react-native-plugin` | React Native bridge |
| [`@strata-game-library/reactylon`](adapters/reactylon) | Workspace, pending npm publish | Babylon.js adapter via Reactylon |
| [`@strata-game-library/astro`](plugins/astro) | Workspace, pending npm publish | Astro integration for docs and demos |

## Architecture

Strata is built in layers -- each one building on the last:

```text
Layer 4  Presets & Game Framework     createGame(), scenes, modes, AI behaviors
Layer 3  React Three Fiber Components Terrain, Water, Sky, Vegetation, Characters
Layer 2  Core Algorithms              SDF, Noise, Marching Cubes, Pathfinding, ECS
Layer 1  GLSL Shaders                 Terrain, water, sky, volumetrics, materials
Layer 0  TypeScript Types & Utilities Type-safe foundation for everything above
```

Every layer is independently usable. Import just the shaders, or use the full framework.

## Features

- **Procedural Terrain** -- SDF-based generation with marching cubes, biome blending, erosion, triplanar texturing
- **Advanced Water** -- Gerstner waves, Fresnel reflections, caustics, foam, depth transparency
- **GPU Vegetation** -- 10,000+ instanced grass, trees, rocks at 60fps with wind animation
- **Procedural Sky** -- Atmospheric scattering, day/night cycles, stars, volumetric clouds
- **Volumetric Effects** -- God rays, fog, underwater overlays, particles
- **Entity Component System** -- Miniplex-based ECS for game logic
- **Physics** -- Rapier integration with rigid bodies, constraints, raycasting
- **AI & Pathfinding** -- Graph-based navigation, Yuka behaviors
- **Animation** -- Skeletal, procedural, IK solving, blend trees
- **Audio** -- Spatial audio, sound management, procedural synthesis
- **State Management** -- XState + Zustand with undo/redo

## Development

```bash
pnpm install          # Install dependencies
pnpm run build        # Build all packages
pnpm run test         # Run all tests
pnpm run lint         # Lint with Biome
pnpm run typecheck    # TypeScript type checking
```

## Monorepo Structure

```text
strata/
  packages/
    core/              # Pure TypeScript algorithms, ECS, state, game orchestration
    shaders/           # Standalone GLSL shaders
    presets/           # Configuration presets
  adapters/
    r3f/               # React Three Fiber components & hooks (@strata-game-library/r3f)
  plugins/
    audio-synth/       # Audio synthesis (Tone.js)
    model-synth/       # AI model generation (Meshy API)
    capacitor/         # Native mobile via Capacitor
    react-native/      # React Native bridge
  apps/
    docs/              # Documentation site (Astro Starlight)
    examples/          # Example projects
```

## Contributing

See the [Contributing Guide](https://strata.game/guides/contributing/) for development setup, PR process, and coding standards.

## License

MIT -- see [LICENSE](LICENSE) for details.

## Part of jbcom

Strata is the Games & Procedural division of the [jbcom enterprise](https://jbcom.github.io), building alongside [Agentic](https://agentic.dev) (AI) and [Extended Data](https://extendeddata.dev) (Infrastructure).
