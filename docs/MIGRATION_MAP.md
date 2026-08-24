---
title: "Documentation Migration Map"
description: "Mapping from the retired Astro/Starlight source to the Sourcey site"
status: complete
last_updated: 2026-08-24
---

# Documentation Migration Map

The former Astro/Starlight app has been retired as a renderer. Its authored
Markdown is converted by `scripts/prepare-sourcey-content.mjs` before each
Sourcey build, so the public static output has one renderer, one navigation,
and one deployment artifact: `docs/dist`.

| Previous source | Sourcey route family | Treatment |
| --- | --- | --- |
| `getting-started/` | `/getting-started/` | Preserved and supplemented by the concise root introduction and quick start. |
| `core/`, `shaders/`, `presets/` | Same route families | Preserved as feature reference. |
| `mobile/`, `audio-synth/`, `capacitor-plugin/`, `model-synth/` | Same route families | Preserved as adapter/plugin reference. |
| `guides/`, `examples/`, `showcase/` | Same route families | Converted from MDX to semantic Markdown; live islands are replaced by links to runnable example source. |
| `packages/` TypeDoc Markdown | `/packages/` | Preserved as the generated API reference, including function, type, interface, and variable pages. |
| Legacy static TypeDoc HTML in `api/` | `/packages/` | Replaced by the Sourcey-rendered TypeDoc Markdown corpus. |
| Astro components, CSS, config, tests, generated output | None | Removed because Sourcey owns presentation, navigation, search, and deployment. |

Historical links to `/api/` and `/api/types/` are rewritten to the current
package reference landing page during preparation. All other known legacy
relative routes retain their slash-style paths below
`/strata-game-library/`.
