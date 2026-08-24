# Contributing to Strata

Strata welcomes fixes, documentation, new procedural systems, adapters, and focused design proposals. Contributions are accepted through pull requests; no change is pushed directly to `main`.

## Set up a local checkout

Maintainers use [Mise](https://mise.jdx.dev/) to select the latest stable Node.js and pnpm releases:

```bash
git clone https://github.com/jbcom/strata-game-library.git
cd strata-game-library
mise trust
mise install
mise run install
mise run check
```

Mise is a local convenience, not a consumer or CI requirement. If you already manage runtimes another way, use Node.js 22 or newer and the latest stable pnpm:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

CI independently tests the declared Node.js floor and the latest stable Node.js using the official Node and pnpm setup actions.

## Respect package boundaries

- `packages/core` is strict, renderer-independent TypeScript. It must not import React, React Three Fiber, Babylon, Reactylon, or Pixi.
- `adapters/r3f`, `adapters/reactylon`, and `adapters/pixi` own renderer-specific behavior.
- `packages/shaders` owns standalone GLSL modules.
- `packages/presets` composes stable lower-level APIs into reusable configuration.
- `plugins` own optional integrations and must not make their peers mandatory for unrelated entrypoints.
- New public APIs require JSDoc, tests, export-map coverage, and documentation.

## Branch and commit workflow

Create a branch in your fork or, for an authorized development agent, in the upstream repository:

```bash
git switch -c feat/short-description
```

Every commit and pull-request title uses [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(terrain): add erosion seed control
fix(r3f): dispose replaced gradient textures
docs: explain package-manager boundaries
```

History is preserved. If `main` advances, merge it into your branch:

```bash
git fetch upstream
git merge upstream/main
```

Do not rebase or force-push an established shared branch. Pull requests merge with merge commits; squash and rebase merging are disabled.

## Validate the change

Run the checks proportionate to the change, and run the complete gate before requesting merge:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run api:check
pnpm run package:validate
pnpm run docs:build:pages
pnpm run docs:links
```

`package:validate` packs every publishable workspace package, inspects its exports and metadata, installs the tarballs into a clean consumer, and executes a real import.

## Pull-request policy

The normal trusted-agent path has no human approval requirement. Mergeability is decided by stable automated gates: CI, repository policy, dependency review, and configured independent analysis services. Agents should respond to actionable findings with additional commits and enable auto-merge only when the branch is ready.

External fork code remains untrusted. Fork CI uses read-only tokens, no repository secrets, and GitHub-hosted ephemeral runners. GitHub may require a maintainer to approve an external contributor's workflow execution; this is an execution-boundary safeguard, not a code-review approval.

External fork PRs cannot modify the repository control plane, including workflows, local actions, dependency automation, release configuration, CodeRabbit configuration, or Sonar analysis control. A maintainer can reproduce a justified control-plane change on a trusted upstream branch.

## Releases

Do not edit versions or `CHANGELOG.md` for ordinary changes. release-please derives versions from Conventional Commits, opens the release PR, updates package metadata and changelogs, and creates the GitHub release. Trusted CD then publishes npm packages with provenance and deploys the documentation site.

## Security reports

Do not open a public issue for a suspected vulnerability. Follow the private process in [SECURITY.md](SECURITY.md).
