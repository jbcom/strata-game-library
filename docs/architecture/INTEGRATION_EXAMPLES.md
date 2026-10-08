---
title: "Integration validation examples"
description: "Purpose-built scenarios for validating game framework integrations"
status: active
last_updated: 2026-10-07
area: architecture
---

# Integration validation examples

Use small, purpose-built demo projects to validate an integration before adding
it to a larger application. Keep game content in the consuming application and
exercise shared algorithms through the package's public entry points.

| Demo | Systems to exercise | Evidence |
| --- | --- | --- |
| Exploration demo | Terrain, world graph, spawning | Move between regions and check deterministic spawn results |
| Racing demo | Input, physics, game modes | Check pause/resume, failure/retry, and completion |
| Adventure demo | Animation, AI, scene transitions | Check animation transitions and pathfinding |
| Simulation demo | ECS and persistence | Save, reload, and compare restored state |

## Validation checklist

- Install the published package into a fresh consumer.
- Import the public entry points used by the demo.
- Keep renderer-specific code in the matching adapter.
- Verify deterministic algorithms with fixed seeds.
- Exercise desktop and touch input where supported.
- Keep automated audio testing silent without changing saved preferences.
- Run lint, type checking, tests, and the production build.
- Report the package version and the exact checks performed.

## Reporting integration issues

Include a minimal reproduction, the imported entry point, runtime and renderer
versions, expected behavior, and observed behavior. Use neutral fixture names,
such as `Player One`, `inventory`, and `level-1`, in shared examples.
