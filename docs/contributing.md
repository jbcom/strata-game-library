---
title: Contributing
description: Set up Strata locally and contribute changes that can be released safely.
---

# Contributing

Maintainers use Mise to select the latest stable Node.js and pnpm releases. Published packages support Node.js 22 and later.

```bash
mise trust
mise install
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Use Conventional Commits such as `feat(core): add deterministic world snapshots`. Open an upstream topic branch and pull request; do not push directly to `main`. Pull requests merge with merge commits only, preserving their meaningful constituent commits.

The repository runs automated native checks, package inspection, public API compatibility checks, browser integration, Sourcey documentation validation, dependency review, CodeQL, and automated review. External forks are intentionally untrusted: they do not receive privileged tokens or deployment credentials and cannot change repository control-plane files.

For the complete contributor and security process, read [`CONTRIBUTING.md`](https://github.com/jbcom/strata-game-library/blob/main/CONTRIBUTING.md) and [`SECURITY.md`](https://github.com/jbcom/strata-game-library/blob/main/SECURITY.md).
