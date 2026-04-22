# strata-game-library

Single-package entrypoint for Strata.

This package consolidates the current Strata monorepo surface into one install target while preserving tree-shakeable subpath imports.

Package policy is documented in the repository's [Package Strategy](https://github.com/jbcom/strata-game-library/blob/main/docs/architecture/PACKAGE_STRATEGY.md). Consumer migration guidance is in the public [Umbrella Package Migration](https://strata.game/guides/umbrella-package-migration/) guide.

## Install

```bash
pnpm add strata-game-library @react-three/fiber @react-three/drei three
```

## Quick Start

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
  Water,
  createGameHUD,
  createPauseMenu,
} from 'strata-game-library/r3f';

const ExplorerHUD = createGameHUD({ title: 'Explorer HUD', hintLimit: 5 });
const ExplorerPauseMenu = createPauseMenu({
  title: 'River Demo Paused',
  description: 'The pause binding stays live while the overlay is open.',
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
        description: 'The active scene is live, and the shell can now trigger runtime actions.',
      }),
      render: () => (
        <>
          <ProceduralSky sunPosition={[100, 50, 100]} />
          <Water size={200} depth={20} />
        </>
      ),
    },
  },
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

export function App() {
  return <StrataGame game={game} />;
}
```

## Subpaths

- `strata-game-library/api`
- `strata-game-library/components`
- `strata-game-library/hooks`
- `strata-game-library/core`
- `strata-game-library/game`
- `strata-game-library/compose`
- `strata-game-library/world`
- `strata-game-library/utils`
- `strata-game-library/shaders`
- `strata-game-library/presets`
- `strata-game-library/r3f`
- `strata-game-library/reactylon`
- `strata-game-library/audio-synth`
- `strata-game-library/model-synth`
- `strata-game-library/capacitor`
- `strata-game-library/react-native`
- `strata-game-library/astro`

## Notes

- The root export is intentionally runtime-light: core API, presets, and shaders.
- Framework adapters and plugins live on explicit subpaths such as `strata-game-library/r3f`.
- The scoped `@strata-game-library/*` packages remain the canonical internal workspace modules and legacy external entrypoints during the consolidation period.
- The scoped packages remain supported direct entrypoints in this consolidation cycle; the old `@strata-game-library/capacitor-plugin` and `@strata-game-library/react-native-plugin` names are legacy aliases to deprecate after the renamed packages are published and verified.
- `StrataGame` owns the canvas, binds the core `InputManager` automatically, and the R3F adapter now also exposes `useInput()`, `useActionPressed()`, `useControlHints()`, `useGameStatus()`, and `useTransition()` alongside `useGame()`, `useScene()`, and `useMode()`.
- Pause is part of the default runtime path: `StrataGame` listens for the active mode's `pause` action by default, keeps only that binding live while paused, and renders `ui.menus.pause` automatically.
- Built-in `GameHUD`, `PauseMenu`, and `SceneCard` helpers now provide a first-pass declarative game-shell scaffold, `SceneCard` supports announcement/title/menu/session/archive variants plus runtime-backed action buttons, and the core package now exposes reusable scene-shell builders, scene-definition builders, and scene-shell action builders.
- `RuntimeProp` and `RuntimeCreature` render resolved core composition runtime plans in R3F, including asset-backed creature rig binding coverage, opt-in Three.js clip-track retargeting, logical animation action control/cross-fading/weighted blends/guarded state control, and runtime creature pose application, while `StrataRuntimeProp` and `StrataRuntimeCreature` expose serializable Reactylon/Babylon descriptors for the same plans.
- Procedural material traits now produce live shader-layer plans, deterministic texture bake manifests, pure RGBA raster payloads, dependency-free PNG bytes, WebP/KTX2 encoder requests, and one-shot bake artifact bundles for adapter or offline asset pipelines.
- Prop interaction execution returns deterministic UI/audio/inventory/command/physics/state effect records for adapter-owned gameplay flows, with an R3F controller hook, prefabbed interaction panel, object physics-handle adapter, Rapier and Cannon handle factories, and R3F/Babylon helpers for applying prop physics effects to runtime object metadata and Babylon collision/pickability state.
- Scene-shell actions now also cover persistence flows via `save-game`, `load-game`, `load-latest-profile`, `load-active-profile`, `open-active-profile-archive`, and `delete-save`, and `createGame()` exposes matching `game.save()`, `game.load()`, `game.deleteSave()`, `game.listSaves()`, `game.getSaveInfo()`, `game.activeProfileId`, and `game.setActiveProfile()` helpers on the live runtime.
- Archive scene shells can now declare `saveSlots` metadata, and the built-in R3F scene card reflects live slot state, save timestamp/version metadata, and disables unavailable load/delete actions automatically.
- `createGame()` supports declarative transition defaults via `GameDefinition.transitions`, plus scene/mode-level transition overrides. Built-in preset helpers include genre-specific defaults.
- Preset helpers now include genre-level mode input maps, and partial overrides inherit matching defaults instead of replacing whole template records.
- Preset helpers also now ship plain `ui.shell` metadata for the built-in HUD, pause menu, and loading overlay, plus announcement-shell metadata for their default starting scenes, and they can now synthesize opt-in title/menu/save/settings/session shell flows with `titleScene: true | { ... }`, `menuScene: true | { ... }`, `saveScene: true | { ... }`, `settingsScene: true | { ... }`, and `sessionShell: true | { ... }`.
- `saveScene` can now generate either a flat archive scene or a save-profile selector with generated per-profile archive scenes via `profiles` and `profileSelector`.
- Generated save-profile selectors now use a dedicated `profiles` shell variant, so the built-in `SceneCard` can render live per-profile occupancy summaries and latest-save metadata instead of only a flat action list.
- Generated save-profile selectors also carry state-aware entry labels, and the built-in `SceneCard` now backs them with direct runtime behavior: occupied profiles continue from the latest available save, empty profiles start gameplay immediately, and explicit manage actions still open the archive scene.
- Generated title/menu flows now also synthesize active-profile-aware continue actions, so a current profile resumes from its latest save while fallback scenes preserve the old boot path when no profile is selected yet.
- Generated save actions across title/menu/settings/session shells now reopen the active profile archive directly when a profile is already selected, and fall back to the selector scene when no active profile exists yet.
- Generated save-profile selectors can also emit selector-level clear actions, so occupied profiles can be reset directly from the selector without entering the archive scene first.
- Generated per-profile archive flows now namespace persisted slot ids by default, so profile-local slot definitions can stay readable in the UI while persistence uses `storageSlot` keys like `campaign:slot-1`; override that with `slotNamespace` on the generated profile or an explicit `storageSlot` on a slot.
- Archive slot metadata now also supports `allowSave`, `allowLoad`, `allowDelete`, `savedLabel`, and `emptyLabel` for built-in save-shell UIs.
- Core also exposes `createSceneShellFlow()` directly when you want that same generated title/menu/save/settings/session shell behavior around arbitrary scene records instead of a genre preset.
- `createAnnouncementScene()`, `createTitleScene()`, `createMenuScene()`, `createSessionScene()`, and `createSaveScene()` wrap the same built-in shell variants as ready-to-register `SceneDefinition` helpers.
- Workspace `build` and `test` commands for this package prepare the internal workspace dependencies first so local verification does not depend on stale prebuilt outputs.
