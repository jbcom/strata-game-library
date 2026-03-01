---
title: "Getting Started Documentation Index"
description: "Agent guide for getting-started documentation in the Strata game framework"
area: getting-started
last_updated: 2026-03-01
---

# Getting Started Documentation

## Overview

This directory contains legacy getting-started docs from a pre-monorepo Python project template. These files are placeholder/template content and do NOT reflect the actual Strata TypeScript game framework. The real getting-started content lives in the Astro Starlight documentation site at `apps/docs/`.

## Documents

| File | Status | Description |
|------|--------|-------------|
| [installation.md](installation.md) | Stale/Template | Python installation guide (references PyPI, uv, pip) -- NOT applicable to Strata |
| [quickstart.md](quickstart.md) | Stale/Template | Python quickstart with `PACKAGE_NAME` placeholder -- NOT applicable to Strata |

## Key Context

- These files are **template artifacts** from a Python project generator and contain placeholder text (`PACKAGE_NAME`)
- They reference Python tools (uv, pip, PyPI) which are irrelevant to this TypeScript/pnpm project
- The actual getting-started documentation is in the Starlight docs site:
  - `apps/docs/src/content/docs/getting-started/` - Starlight pages
  - Root `CLAUDE.md` has the real quick-start commands
- These files should likely be either updated to reflect the actual TypeScript project or removed

## Actual Getting Started (for reference)

The real installation and quickstart for Strata:

```bash
# Install
pnpm add @strata-game-library/core @strata-game-library/r3f

# Optional packages
pnpm add @strata-game-library/shaders @strata-game-library/presets

# Development (monorepo)
pnpm install
pnpm run build
pnpm run test
```

## Starlight Equivalent

The Astro docs site at `apps/docs/` contains a comprehensive 312-page documentation site with proper getting-started content, API reference, tutorials, and showcase pages. That is the canonical source for user-facing documentation.

## Related

- [apps/docs/](../../apps/docs/) - Starlight documentation site (canonical docs)
- [CLAUDE.md](../../CLAUDE.md) - Quick start commands for development
- [docs/GETTING_STARTED.md](../GETTING_STARTED.md) - Root-level getting started (may also be stale)
