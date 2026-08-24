---
title: Architecture
description: The renderer boundary and package dependency model behind Strata.
---

# Architecture

Strata is a TypeScript monorepo for declarative, procedural games. Its core algorithms are renderer-agnostic; optional adapters bind those algorithms to the rendering environments where they belong.

```text
@strata-game-library/shaders → @strata-game-library/core → @strata-game-library/r3f → @strata-game-library/presets
                                                          → @strata-game-library/reactylon
                                                          → @strata-game-library/pixi
```

`@strata-game-library/core` never imports React, React Three Fiber, Babylon, or Pixi. It owns game definitions, state, input, persistence, ECS, pathfinding, procedural algorithms, and composition. Adapters own framework components and hooks.

This separation keeps game logic portable, makes algorithmic code easy to test, and prevents an application renderer from becoming an accidental dependency of every consumer.

For public stability guarantees, see the repository's [API contract](https://github.com/jbcom/strata-game-library/blob/main/docs/API_CONTRACT.md).
