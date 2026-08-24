---
title: Packages
description: Choose the Strata package that fits your game and renderer.
---

# Packages

| Package | Use it for |
| --- | --- |
| `strata-game-library` | One renderer-independent install with deliberate adapter subpaths. |
| `@strata-game-library/core` | Game definitions, state, input, persistence, ECS, AI, and procedural algorithms. |
| `@strata-game-library/shaders` | Standalone GLSL shader modules. |
| `@strata-game-library/presets` | Reusable environment, character, and game presets. |
| `@strata-game-library/r3f` | React Three Fiber components and hooks. |
| `@strata-game-library/reactylon` | Babylon.js through Reactylon. |
| `@strata-game-library/pixi` | Pixi lifecycle and rendering utilities. |
| `@strata-game-library/audio-synth` | Procedural audio synthesis. |
| `@strata-game-library/model-synth` | Optional model-generation client. |
| `@strata-game-library/capacitor` | Capacitor mobile integration. |
| `@strata-game-library/react-native` | React Native bridge. |
| `@strata-game-library/astro` | Astro integration and styles. |
| `@strata-game-library/vite` | Shared Vite, Vitest, tsup, TypeScript, and Biome configuration. |

Every published package includes a focused README and an explicit export map. The umbrella package is the best starting point; select focused packages when a smaller dependency surface is more useful.
