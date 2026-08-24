# Legacy documentation source

This directory is not a documentation application and must not be deployed.
`src/content/docs/` is retained only as the authored migration corpus while
`scripts/prepare-sourcey-content.mjs` converts it to Sourcey-compatible
Markdown under `docs/` before every Sourcey build.

Do not add Astro, Starlight, React islands, generated site output, or a second
deployment workflow here. Add new public documentation directly to `docs/` and
its `sourcey.config.ts` navigation.
