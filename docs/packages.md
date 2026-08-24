---
title: Packages
description: Install one Strata package and choose a public subpath for your renderer.
---

# Package

| Import from `strata-game-library` | Use it for |
| --- | --- |
| root | Renderer-independent game definitions, state, and procedural algorithms. |
| `/core`, `/shaders`, `/presets` | Focused library surfaces. |
| `/r3f`, `/reactylon`, `/pixi` | React Three Fiber, Babylon/Reactylon, and Pixi adapters. |
| `/yuka` | Opt-in [Yuka](https://mugen87.github.io/yuka/) steering, navigation, and R3F bridge. |
| `/audio-synth`, `/model-synth` | Optional audio and model-generation integrations. |
| `/capacitor`, `/react-native`, `/astro` | Mobile and Astro integrations. |

Install `strata-game-library` once. Its explicit export map keeps each subpath
separate at build time while npm has exactly one public package identity.

Read the [adapter guide](https://strata.game/adapters/) before choosing peers and the
[Yuka adapter guide](https://strata.game/adapters/yuka/) when a game needs steering or navmesh behavior.
