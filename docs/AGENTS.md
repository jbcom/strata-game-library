---
title: "Documentation Guide"
description: "Sourcey documentation source, navigation, and maintenance rules"
status: active
area: docs
last_updated: 2026-08-24
---

# Documentation Guide

`docs/` is the source for the public Sourcey site. The production output is
`docs/dist`, built with `pnpm run docs:build` and published by the Pages job.
The canonical public base URL is `https://jonbogaty.com/strata-game-library/`.

## Public documentation

Keep public pages in plain Markdown with accurate YAML frontmatter. Add a page
to `docs/sourcey.config.ts` as well as creating the file so it appears in the
navigation. Use canonical absolute links for public routes when a link crosses
navigation groups; this preserves the configured project base path.

The public entry points are:

| Area | Pages |
| --- | --- |
| Getting started | `introduction.md`, `quickstart.md`, `architecture.md` |
| Reference | `packages.md`, `contributing.md`, `security.md` |
| Framework design | `architecture/PACKAGE_STRATEGY.md`, `architecture/rfc/` |
| Migration | `architecture/guides/` |

Build and validate changes before submitting them:

```bash
pnpm run docs:build
pnpm run docs:links
```

Do not add generated output to git. `docs/dist` is intentionally ignored.

## Historical material

`docs/archive/`, `docs/plans/`, and similar historical records remain useful
for maintainers but are not automatically public. Only place current,
user-facing content in the Sourcey navigation. Clearly mark a historical
document if it is intentionally exposed.

The former `apps/docs/` site is migration input only. Do not restore it as a
production build or deployment path; migrate useful plain Markdown into this
directory and replace interactive examples with runnable examples in `apps/examples/`.

## Architecture documentation

RFCs define intended behavior; package source and tests define implemented
behavior. When an RFC changes, update the implementation and the corresponding
public guide in the same change. Treat implementation percentages in historical
documents as snapshots, not current release evidence.

## Related references

- [Project instructions](../AGENTS.md)
- [Public API](../PUBLIC_API.md)
- [Compatibility contract](../CONTRACT.md)
