---
title: API Contract
updated: 2026-08-23
status: current
domain: technical
---

# API Contract

What counts as Strata's public API, what promise each tier carries, and how
that promise is enforced mechanically rather than by convention.

## Why this document exists

Strata emits roughly 2,400 exported symbols. Fewer than 400 of them are
imported anywhere, including by Strata's own applications and tests. The cause
is structural, not sloppiness: there are **287 `export *` statements** across
the source tree, and `packages/core/src/index.ts` is five star lines with zero
explicit named exports, chained two levels deep over 132 files.

The consequence is that **every new file in `packages/core/src/core/**` becomes
public API the moment it is saved** — no author decision, no review surface, no
diff that says "this is now a SemVer promise". Across the core and r3f barrels
combined there is exactly one explicit named re-export line. Nothing is
curated.

That is why no document could state what Strata's API *is*: the answer was only
computable by walking 287 star statements. This contract, and the snapshots in
`api/`, make it a fact you can read and a gate you can fail.

## The three tiers

Tiers are carried by **physical location**, not by TSDoc tags. The repo has only
nine `@internal` and twelve `@public` tags across roughly 1,500 symbols, so a
tag-based rule would fail open on almost everything — it would report a clean
surface while governing nothing.

### Tier 1 — Public

A symbol is public when **both** are true:

1. it is named **explicitly** in a barrel — never reached via `export *`; and
2. that barrel is a build entry with a matching key in the package's `exports` map.

Both conditions, or it is not public. Tier 1 is SemVer-protected: removing or
narrowing a symbol requires a major version. The supported set is listed in
[`llms-full.txt`](../llms-full.txt).

### Tier 2 — Adapter-facing (`./internal`, SemVer-exempt)

Adapters legitimately need core internals that consumers should not touch. The
honest destination for that pressure is a **declared, documented, exempt**
subpath — `strata-game-library/core/internal` — rather than letting it
re-inflate Tier 1.

It is published, because an adapter shipped as a separate package cannot
consume an unpublished path. It carries **no SemVer guarantee** and may change
in a minor. Pin exact if you depend on it.

Adapters and the umbrella package may import it. Applications, docs, and
examples may not — enforced by `noRestrictedImports` in `biome.json`. That
guard is live **before** the subpath exists, so `apps/` cannot drift into it
the moment it lands.

### Tier 3 — Internal (the default)

Everything else. Reachable inside its package by relative path, invisible
outside it. This is where the ~1,061 symbols consumed only via intra-package
relative imports belong, along with the ~495 referenced by no import anywhere.

Crucially, **demoting these breaks no call site**: relative imports never went
through the barrel, so replacing `export *` with explicit named exports removes
them from the public surface with zero code churn.

Test-only symbols are Tier 3. Tests import by relative path like any other
internal consumer. If a test can only reach a symbol through the package
barrel, that is the bug.

## Barrel rules

1. **`export *` is banned** in publishable packages, roots included. It is the
   root cause: it makes the surface grow silently. Explicit lists make adding
   public API a deliberate, diff-visible act. Currently at warning level
   (`performance/noReExportAll`) because 287 pre-existing violations remain;
   it becomes an error as each package is curated.
2. **A barrel re-exports only from its own public package surface.** Private
   workspace modules and third parties are bundled behind
   `strata-game-library` subpaths; users never install them separately.
3. **Every `exports` subpath maps to exactly one barrel, and every barrel is a
   declared subpath.** Bidirectional, enforced by `--check-exports-map`.
4. **A barrel contains only re-exports** plus its module docblock — no
   declarations, no logic, no side effects. Keeps `import { x }` from running
   arbitrary module-init code and keeps tree-shaking effective.
5. **Type-only exports use `export type { … }`.** `isolatedModules` is already
   on, so the compiler knows the difference. It lets bundlers erase types and
   lets the API report distinguish a type change from a value change.
6. **Exactly one canonical path per symbol.** Two paths to one symbol means two
   SemVer promises and consumers split across both, so neither can be removed.
7. **Only adapters may import `core/internal`.**

## Enforcement

Three layers, in dependency order.

### Layer 1 — the API surface gate

`api/<pkg>.api.json` holds every exported symbol per subpath, extracted from
the **built `.d.ts`** and diffed in CI. Its `version` field is provenance for
the snapshot, not a gated API input: Release Please may advance package
metadata without changing exports or declaration shapes.

```bash
pnpm api:report   # regenerate snapshots
pnpm api:check    # gate: fail on any undeclared surface change
pnpm api:update   # accept a deliberate change
```

**Why built `.d.ts` and not source.** The public API is what a consumer can
reach after `npm i`, which is decided by the `exports` map plus the emitted
declarations. tsup already flattens every star chain: the built
`adapters/r3f/dist/index.d.ts` contains **zero** `export *`, just explicit
symbol lists. Reading `dist/` gets the true answer from artifacts CI already
produces, with no new build step.

The alternatives were each considered and rejected on this repo's specifics:

| Approach | Why not |
| --- | --- |
| API Extractor | Redoes a rollup tsup already produces, and models one entry per package — core has 23 subpaths, so 23 configs and 23 report files. Still would not verify a subpath is *declared*. |
| A test asserting `Object.keys(await import(…))` | Imports source, so it never sees what the `exports` map publishes; cannot see type-only exports at all; cannot detect a subpath declared but not emitted. Would have caught none of the three real defects below. |
| biome / dependency-cruiser alone | See only this repo's source, never what an installed consumer can reach. Necessary for Rules 1/2/7, useless as the surface gate. |
| `attw` / `publint` | Check that exports *resolve*, not *which symbols escape*. Complementary, not a substitute. |

Snapshots record symbol names only — tsup's hashed chunk names
(`index-DkXyymvh.d.ts`) are followed through but never written down, so a
rebuild that reshuffles chunks does not churn the diff.

### Layer 2 — lint

`performance/noReExportAll` (Rule 1) and `style/noRestrictedImports` (Rule 7)
run in ~1s via husky + lint-staged. The lint-staged glob covers
`{packages,adapters,plugins}/*/src/**` — previously `packages/*` only, which
left r3f, the worst offender at 135 star exports, unlinted before commit.

Layer 2 is a fast fail, not the gate: biome cannot resolve a star chain across
132 files.

### Layer 3 — structural

`node scripts/api-report.mjs --check-exports-map` asserts Rule 3 in both
directions: every declared subpath resolves to a real emitted file, and every
emitted entry is reachable through a declared subpath.

## Defects this gate found on its first run

Three, all real, all consumer-facing:

1. **`strata-game-library/presets/characters`** is declared in the published
   `exports` map, but `src/characters` does not exist and nothing is emitted.
   Importing it throws for any consumer.
2. **`strata-game-library/model-synth/clients/*`** is declared and exists in
   source, but the build's entry glob never emits it.
3. **`strata-game-library/r3f` re-exports ~40 symbols it does not own** —
   core types (`GameStore`, `LODConfig`, `BloomSettings`, `InputAxis`,
   `MinimapConfig`, `VignetteSettings`, …) plus the entire third-party `YUKA`
   namespace. A consumer importing `LODConfig` from r3f is welded to a symbol
   r3f cannot version, and a core patch can break r3f's consumers through a
   type r3f merely passed through.

Separately, the published docs reference `strata-game-library/core` and
`strata-game-library/core/molecular`, neither of which is in core's `exports`
map — documentation teaching imports that do not resolve.

These are recorded, not fixed here. Establishing the contract and narrowing the
surface are separate acts, and mixing them makes the narrowing unreviewable.

## Order of operations

The baseline snapshot is committed **against today's surface, before any
cleanup**. That first commit is an honest record of the mess; every subsequent
removal shows up as a reviewed, intentional diff against it. Cleaning first and
snapshotting after would discard the audit trail and make the large removal PRs
impossible to review.

Sequencing, lowest risk first:

- **Phase 0 (this change)** — snapshot, gate, contract. No behavior change.
- **Phase 1** — r3f and reactylon. Both are 0.x, so narrowing is minor-legal.
  r3f is the worst offender and the cheapest to fix: kill the star exports,
  stop the foreign re-exports.
- **Phase 2** — `export *` to explicit named exports in core, presets, shaders.
  Ships in 1.x, since it removes only symbols nothing imports.
- **Phase 3** — the major: delete dead symbols, prune unused subpaths, collapse
  duplicate paths, ship a codemod.

## Changing the public API

1. Make the change.
2. `pnpm build` — the gate reads `dist/`.
3. `pnpm api:check`. If it fails and the change was intended, run
   `pnpm api:update`.
4. **Commit the updated snapshots with the change.** The snapshot diff is the
   review surface — it is how a reviewer sees that a SemVer promise moved.
5. Removing or narrowing a Tier 1 symbol needs a major version. Record it in
   [`BREAKING_CHANGES.md`](../docs/archive/BREAKING_CHANGES.md); the snapshot diff between
   two tags generates the removed-symbol table mechanically, so no
   hand-maintained list can drift.
