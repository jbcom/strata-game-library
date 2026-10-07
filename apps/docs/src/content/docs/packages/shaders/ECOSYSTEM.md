---
title: Development ecosystem
description: Package structure and maintainer validation
status: current
domain: technical
---

# Development ecosystem

The library keeps renderer-independent algorithms in core and binds them to
renderers through adapters. Shaders and presets supply reusable rendering and
composition primitives; plugins integrate optional platform and tooling APIs.

## Package boundaries

- Core contains pure TypeScript algorithms and no React imports.
- Adapters own renderer components and hooks.
- Shaders contain reusable GLSL programs.
- Presets compose reusable materials, creatures, and scene settings.
- Plugins keep optional integrations separate from the core.

## Maintainer workflow

Run lint, type checking, tests, builds, API contract checks, packed-consumer
validation, and documentation checks before submitting changes. Use the root
`pnpm verify` command to run the non-browser checks together.

Keep examples specific to the public API being documented. Use neutral sample
names and keep consuming applications' content in their own repositories.
