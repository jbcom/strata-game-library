#!/usr/bin/env node
/**
 * api-report.mjs — extract, snapshot, and gate Strata's public API surface.
 *
 * WHY THIS READS `dist/` AND NOT `src/`
 * -------------------------------------
 * The public API of a package is what a consumer can reach after
 * `npm i @strata-game-library/core`. That is decided by two things the source
 * tree cannot answer on its own:
 *
 *   1. the `exports` map in package.json, which decides which subpaths resolve;
 *   2. the emitted `.d.ts`, which is where tsup has already flattened every
 *      `export *` chain into an explicit symbol list.
 *
 * Strata has 281 `export *` statements across 62 source files, so the source
 * tree cannot tell you what is public without resolving that graph by hand.
 * The built `.d.ts` files already contain zero `export *` — tsup resolved them.
 * Reading dist therefore gets the true answer for free, from artifacts CI
 * already produces.
 *
 * A source-level check (a test asserting `Object.keys(await import(...))`)
 * would miss type-only exports entirely, since they are erased at runtime, and
 * would never notice a subpath declared in package.json but absent from dist.
 *
 * OUTPUT
 * ------
 * One `api/<pkg>.api.json` per publishable package:
 *
 *   {
 *     "package": "@strata-game-library/core",
 *     "version": "1.7.0",
 *     "subpaths": {
 *       ".": { "AudioBus": "type", "createAudioBus": "value", ... }
 *     }
 *   }
 *
 * Keys are sorted so a diff is a symbol-level diff and nothing else. Hashed
 * tsup chunk names (`index-DkXyymvh.d.ts`) are followed through but never
 * recorded, so a rebuild that reshuffles chunks does not churn the snapshot.
 *
 * USAGE
 * -----
 *   node scripts/api-report.mjs                     # write snapshots
 *   node scripts/api-report.mjs --check             # gate: diff vs committed
 *   node scripts/api-report.mjs --check-exports-map # gate: exports map <-> dist
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_DIR = join(ROOT, 'api');

/** Workspace globs that may contain publishable packages. */
const PACKAGE_ROOTS = ['packages', 'adapters', 'plugins'];

// ---------------------------------------------------------------------------
// Package discovery
// ---------------------------------------------------------------------------

/**
 * Find every publishable workspace package: has a package.json, is not
 * `private: true`, and declares an `exports` map. Apps and the docs site are
 * private and therefore skipped — they ship no API.
 */
function discoverPackages() {
  const found = [];
  for (const group of PACKAGE_ROOTS) {
    const groupDir = join(ROOT, group);
    if (!existsSync(groupDir)) continue;
    for (const entry of readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(groupDir, entry.name);
      const manifestPath = join(dir, 'package.json');
      if (!existsSync(manifestPath)) continue;
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (manifest.private) continue;
      if (!manifest.exports) continue;
      found.push({ dir, manifest, slug: slugFor(manifest.name) });
    }
  }
  return found.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

/** `@strata-game-library/core` -> `core`; `strata-game-library` -> `umbrella`. */
function slugFor(name) {
  if (name === 'strata-game-library') return 'umbrella';
  return name.replace('@strata-game-library/', '');
}

/**
 * Resolve a subpath's declared `types` entry to a `.d.ts` path on disk.
 * Conditional exports may be a bare string or an object with a `types` key.
 */
function typesEntryFor(target) {
  if (typeof target === 'string') return target.endsWith('.d.ts') ? target : null;
  if (target && typeof target === 'object') return target.types ?? null;
  return null;
}

// ---------------------------------------------------------------------------
// Declaration parsing
// ---------------------------------------------------------------------------

/**
 * Collect the symbols a single `.d.ts` file exports.
 *
 * Handles the four shapes tsup emits:
 *   - `export { A, B as C }`                    — the flattened barrel
 *   - `export { X } from './chunk-HASH.js'`     — local chunk re-export
 *   - `export * from './chunk-HASH.js'`         — local chunk star (followed)
 *   - `export declare const x` / `interface Y`  — direct declaration
 *
 * Local relative re-exports are followed so the chunk boundary never appears in
 * the report. A re-export from a bare specifier is recorded as a symbol but
 * NOT followed — it is foreign surface,
 * which is precisely what we want visible in the snapshot.
 *
 * `seen` guards against cyclic chunk graphs.
 */
function collectExports(dtsPath, seen = new Set()) {
  const out = new Map();
  const real = resolveDts(dtsPath);
  if (!real || seen.has(real)) return out;
  seen.add(real);

  const source = ts.createSourceFile(
    real,
    readFileSync(real, 'utf8'),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS
  );

  for (const statement of source.statements) {
    // export { ... } [from '...']
    if (ts.isExportDeclaration(statement)) {
      const spec = statement.moduleSpecifier?.text;
      const isLocal = spec?.startsWith('.');

      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          const name = element.name.text;
          // `export type { X }` on the statement, or `export { type X }` inline
          const isType = statement.isTypeOnly || element.isTypeOnly;
          // Always consult the local declaration: `export type { X }` tells us
          // X is a type but not its SHAPE, and the shape is what a consumer
          // actually breaks against.
          let resolved = kindFromDeclaration(source, element, name);
          // `export { X } from './chunk'` puts the declaration in the OTHER
          // file, so the local scan finds nothing and falls through to 'value'.
          // dist/index.d.ts is exactly this: one re-export line for the whole
          // package. Follow the specifier to recover the shape.
          if (resolved === 'value' && isLocal && spec) {
            const target = resolveDts(join(dirname(real), spec));
            if (target) {
              const fromModule = collectExports(target, new Set(seen)).get(name);
              if (fromModule !== undefined) resolved = fromModule;
            }
          }
          out.set(name, isType && resolved === 'value' ? 'type' : resolved);
        }
        continue;
      }

      // export * from '...'
      if (!statement.exportClause) {
        if (isLocal) {
          // A local tsup chunk: follow it, so the chunk boundary never shows up
          // in the report.
          const nested = collectExports(join(dirname(real), spec), seen);
          for (const [name, kind] of nested) if (!out.has(name)) out.set(name, kind);
        } else {
          // A star re-export of an entire OTHER package. Its symbol list is that
          // package's business and is versioned there, so enumerating it here
          // would make this snapshot churn whenever an unrelated package moves.
          // Record the fact of the re-export instead: it is a barrel Rule 2
          // violation (a package must not re-export surface it does not own),
          // and it must be visible in the snapshot rather than silently dropped.
          out.set(`export * from '${spec}'`, 'star-reexport');
        }
      }
      continue;
    }

    // export declare const/function/class/interface/type/enum
    const mods = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    const exported = mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;

    const isTypeDecl =
      ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement);

    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) out.set(decl.name.text, 'value');
      }
    } else if (statement.name && ts.isIdentifier(statement.name)) {
      out.set(statement.name.text, isTypeDecl ? (shapeOf(statement) ?? 'type') : 'value');
    }
  }

  return out;
}

/**
 * Classify a re-exported name as type or value by looking for a local
 * declaration of it in the same file. tsup inlines most declarations into the
 * chunk it re-exports from, so an unresolved name defaults to `value` — the
 * conservative choice, since treating a value as a type would understate a
 * breaking change.
 */
/**
 * Record the SHAPE of an interface or object-type alias, not merely that it
 * exists — `{ deadZone?: number; accent?: string }` rather than `"type"`.
 *
 * Without this the gate is blind to the changes most likely to break a
 * consumer. Seven props were added to VirtualJoystickProps in one change and
 * the snapshot did not move by a single character; a REMOVED prop, or one
 * whose type narrowed, would have been equally invisible. Symbol names alone
 * only catch a whole export appearing or vanishing.
 *
 * Member types are recorded as source text. That is deliberately literal: it
 * flags a rename from `string` to `Color` even when the two are structurally
 * identical, which for a published API is a change worth seeing.
 */
function shapeOf(statement) {
  const members = ts.isInterfaceDeclaration(statement)
    ? statement.members
    : ts.isTypeAliasDeclaration(statement) && ts.isTypeLiteralNode(statement.type)
      ? statement.type.members
      : null;
  if (!members) return null;

  const shape = {};
  for (const member of members) {
    if (!member.name || !ts.isPropertySignature(member)) continue;
    const key = member.name.getText?.() ?? String(member.name.text ?? '');
    if (!key) continue;
    const optional = member.questionToken ? '?' : '';
    const type = member.type?.getText?.().replace(/\s+/g, ' ') ?? 'unknown';
    shape[`${key}${optional}`] = type;
  }
  return Object.keys(shape).length ? shape : null;
}

function kindFromDeclaration(source, _element, name) {
  for (const statement of source.statements) {
    if (
      (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) &&
      statement.name?.text === name
    ) {
      // tsup inlines the declaration WITHOUT an export keyword and re-exports
      // it by name, so this by-name scan is the only place the shape is
      // reachable — the exported-declaration branch skips it entirely.
      return shapeOf(statement) ?? 'type';
    }
  }
  return 'value';
}

/** Map a module specifier to a real `.d.ts` on disk (tsup emits `.js` specifiers). */
function resolveDts(candidate) {
  const attempts = [
    candidate,
    candidate.replace(/\.js$/, '.d.ts'),
    `${candidate}.d.ts`,
    join(candidate, 'index.d.ts'),
  ];
  for (const attempt of attempts) {
    if (existsSync(attempt) && attempt.endsWith('.d.ts')) return attempt;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Report construction
// ---------------------------------------------------------------------------

function buildReport(pkg) {
  const subpaths = {};
  const missing = [];

  for (const [subpath, target] of Object.entries(pkg.manifest.exports)) {
    const entry = typesEntryFor(target);
    if (!entry) continue;

    // A wildcard subpath (`./clients/*`) exposes one module per matching file,
    // so expand it: each match becomes its own concrete subpath in the report.
    // Leaving it unexpanded would let files appear or vanish under a declared
    // public path without the gate noticing.
    if (subpath.includes('*')) {
      for (const [concrete, file] of expandWildcard(pkg.dir, subpath, entry)) {
        const symbols = collectExports(file);
        subpaths[concrete] = Object.fromEntries(
          [...symbols.entries()].sort(([a], [b]) => a.localeCompare(b))
        );
      }
      continue;
    }

    const dtsPath = join(pkg.dir, entry);
    if (!existsSync(dtsPath)) {
      missing.push({ subpath, expected: relative(ROOT, dtsPath) });
      continue;
    }

    const symbols = collectExports(dtsPath);
    subpaths[subpath] = Object.fromEntries(
      [...symbols.entries()].sort(([a], [b]) => a.localeCompare(b))
    );
  }

  const ordered = Object.fromEntries(
    Object.entries(subpaths).sort(([a], [b]) => a.localeCompare(b))
  );

  return {
    report: {
      package: pkg.manifest.name,
      version: pkg.manifest.version,
      subpaths: ordered,
    },
    missing,
  };
}

/**
 * Expand a wildcard subpath into the concrete subpaths it currently exposes.
 * `./clients/*` + `./dist/clients/*.d.ts` yields `./clients/base`, etc.
 * Returns [concreteSubpath, absoluteDtsPath] pairs, sorted for stable output.
 */
function expandWildcard(pkgDir, subpath, entry) {
  const dir = join(pkgDir, dirname(entry));
  if (!existsSync(dir)) return [];
  const out = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.d.ts')) continue;
    const stem = file.slice(0, -'.d.ts'.length);
    out.push([subpath.replaceAll('*', stem), join(dir, file)]);
  }
  return out.sort(([a], [b]) => a.localeCompare(b));
}

function countSymbols(report) {
  return Object.values(report.subpaths).reduce((n, s) => n + Object.keys(s).length, 0);
}

function snapshotPath(pkg) {
  return join(API_DIR, `${pkg.slug}.api.json`);
}

function serialize(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Diffing
// ---------------------------------------------------------------------------

/** Symbol-level diff between the committed snapshot and a freshly built one. */
function diffReports(committed, fresh) {
  const problems = [];
  const allSubpaths = new Set([
    ...Object.keys(committed.subpaths ?? {}),
    ...Object.keys(fresh.subpaths ?? {}),
  ]);

  if (committed.version !== fresh.version) {
    problems.push(`  version: ${committed.version} -> ${fresh.version}`);
  }

  for (const subpath of [...allSubpaths].sort()) {
    const before = committed.subpaths?.[subpath];
    const after = fresh.subpaths?.[subpath];

    if (!before) {
      problems.push(`  + subpath ${subpath} (${Object.keys(after).length} symbols)`);
      continue;
    }
    if (!after) {
      problems.push(`  - subpath ${subpath} (was ${Object.keys(before).length} symbols)`);
      continue;
    }

    for (const name of Object.keys(after)) {
      if (!(name in before)) problems.push(`  + ${subpath} :: ${name} (${after[name]})`);
    }
    for (const name of Object.keys(before)) {
      if (!(name in after)) problems.push(`  - ${subpath} :: ${name} (${before[name]})`);
    }
    for (const name of Object.keys(after)) {
      if (!(name in before)) continue;
      const a = before[name];
      const b = after[name];
      // Shapes are objects, so `!==` compares references and fires on every
      // symbol every run. Compare by value, and report which MEMBERS moved —
      // "[object Object] -> [object Object]" tells a reviewer nothing.
      if (typeof a === 'object' && typeof b === 'object' && a && b) {
        const removed = Object.keys(a).filter((k) => !(k in b));
        const added = Object.keys(b).filter((k) => !(k in a));
        const retyped = Object.keys(b).filter((k) => k in a && a[k] !== b[k]);
        if (!removed.length && !added.length && !retyped.length) continue;
        const parts = [
          ...removed.map((k) => `-${k}`),
          ...added.map((k) => `+${k}`),
          ...retyped.map((k) => `~${k}: ${a[k]} -> ${b[k]}`),
        ];
        problems.push(`  ~ ${subpath} :: ${name} { ${parts.join(', ')} }`);
      } else if (a !== b) {
        problems.push(`  ~ ${subpath} :: ${name} (${a} -> ${b})`);
      }
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

/** Newest mtime under `dir`, or 0 when it does not exist. */
function newestMtime(dir, depth = 0) {
  if (depth > 12 || !existsSync(dir)) return 0;
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    const t = entry.isDirectory() ? newestMtime(full, depth + 1) : statSync(full).mtimeMs;
    if (t > newest) newest = t;
  }
  return newest;
}

/**
 * Refuse to report against absent OR STALE build output.
 *
 * A missing dist/ was already caught. A stale one was not, and it is worse:
 * the report succeeds and writes plausible-looking snapshots derived from
 * artifacts that no longer match src. Running this on a dirty tree regenerated
 * all twelve snapshots with inflated counts (core 979 -> 2836, r3f 574 -> 1084)
 * alongside "unresolved subpath" warnings, and the churn had to be reverted by
 * hand. Snapshots are the API contract; deriving them from stale dist records a
 * contract nobody shipped.
 */
function requireBuilt(packages) {
  const unbuilt = packages.filter((p) => !existsSync(join(p.dir, 'dist')));
  if (unbuilt.length > 0) {
    console.error('API report needs built packages. Missing dist/ for:');
    for (const p of unbuilt) console.error(`  ${p.manifest.name}`);
    console.error('\nRun `pnpm build` first.');
    process.exit(2);
  }

  const stale = packages.filter((p) => {
    const src = newestMtime(join(p.dir, 'src'));
    return src > 0 && src > newestMtime(join(p.dir, 'dist'));
  });
  if (stale.length > 0) {
    console.error('API report needs CURRENT build output. src/ is newer than dist/ for:');
    for (const p of stale) console.error(`  ${p.manifest.name}`);
    console.error('\nRun `pnpm build` first — reporting against stale dist/ writes');
    console.error('snapshots for an API that was never built.');
    process.exit(2);
  }
}

function modeWrite(packages) {
  mkdirSync(API_DIR, { recursive: true });
  let total = 0;

  for (const pkg of packages) {
    const { report, missing } = buildReport(pkg);
    writeFileSync(snapshotPath(pkg), serialize(report));
    const n = countSymbols(report);
    total += n;
    const note = missing.length ? `  (${missing.length} unresolved subpath(s))` : '';
    console.log(
      `  ${pkg.manifest.name.padEnd(38)} ${String(n).padStart(5)} symbols across ` +
        `${Object.keys(report.subpaths).length} subpath(s)${note}`
    );
  }

  console.log(`\nWrote ${packages.length} snapshots to api/ — ${total} exported symbols total.`);
}

function modeCheck(packages) {
  const failures = [];

  for (const pkg of packages) {
    const path = snapshotPath(pkg);
    const { report } = buildReport(pkg);

    if (!existsSync(path)) {
      failures.push(
        `${pkg.manifest.name}: no committed snapshot at ${relative(ROOT, path)}\n` +
          '  This package publishes an API that nothing is tracking.'
      );
      continue;
    }

    const committed = JSON.parse(readFileSync(path, 'utf8'));
    const problems = diffReports(committed, report);
    if (problems.length > 0) {
      failures.push(`${pkg.manifest.name}: public API changed\n${problems.join('\n')}`);
    }
  }

  if (failures.length > 0) {
    console.error('\nPUBLIC API CHANGED\n');
    for (const f of failures) console.error(`${f}\n`);
    console.error(
      'The public API is a SemVer promise, so a change here must be deliberate.\n' +
        'If this change is intended, run `pnpm api:update` and commit the updated\n' +
        'snapshots so the surface change is visible in the diff and gets reviewed.\n'
    );
    process.exit(1);
  }

  console.log(`Public API matches committed snapshots (${packages.length} packages).`);
}

/**
 * Structural gate for barrel Rule 3: the `exports` map and the emitted files
 * must agree in both directions.
 *
 *   - Every declared subpath must resolve to a file that exists. A subpath that
 *     does not resolve is a published import that throws for the consumer.
 *   - Every emitted top-level entry `.d.ts` must be reachable through some
 *     declared subpath, or it is dead weight shipped in the tarball.
 */
function modeCheckExportsMap(packages) {
  const failures = [];

  for (const pkg of packages) {
    const declared = [];
    const problems = [];

    for (const [subpath, target] of Object.entries(pkg.manifest.exports)) {
      const entry = typesEntryFor(target);
      if (!entry) continue;

      // A wildcard subpath (`./clients/*`) resolves per-import against whatever
      // matches at consume time; there is no single file to stat. Assert the
      // containing directory exists and leave the rest to resolution.
      if (subpath.includes('*') || entry.includes('*')) {
        const base = join(pkg.dir, dirname(entry.replace(/\*.*$/, 'x')));
        if (!existsSync(base)) {
          problems.push(`  ${subpath} -> ${entry} (wildcard base ${relative(pkg.dir, base)} absent)`);
        }
        continue;
      }

      declared.push(resolve(pkg.dir, entry));
      if (!existsSync(join(pkg.dir, entry))) {
        problems.push(`  ${subpath} -> ${entry} (declared in exports, absent from dist)`);
      }
      const runtime = typeof target === 'object' ? target.import : null;
      if (runtime && !existsSync(join(pkg.dir, runtime))) {
        problems.push(`  ${subpath} -> ${runtime} (declared in exports, absent from dist)`);
      }
    }

    const declaredSet = new Set(declared);
    const distDir = join(pkg.dir, 'dist');
    if (existsSync(distDir)) {
      for (const file of readdirSync(distDir)) {
        if (!file.endsWith('.d.ts')) continue;
        // Hashed tsup chunks are internal plumbing, never entries.
        if (/-[A-Za-z0-9_-]{8}\.d\.ts$/.test(file)) continue;
        const full = join(distDir, file);
        if (!declaredSet.has(full)) {
          problems.push(`  dist/${file} is emitted but no exports key points at it`);
        }
      }
    }

    if (problems.length > 0) {
      failures.push(`${pkg.manifest.name}:\n${problems.join('\n')}`);
    }
  }

  if (failures.length > 0) {
    console.error('\nEXPORTS MAP DOES NOT MATCH DIST\n');
    for (const f of failures) console.error(`${f}\n`);
    console.error(
      'Every declared subpath must resolve to a real emitted file, and every\n' +
        'emitted entry must be reachable through a declared subpath. A subpath\n' +
        'that does not resolve is an import that throws for the consumer.\n'
    );
    process.exit(1);
  }

  console.log(`Exports maps agree with dist (${packages.length} packages).`);
}

// ---------------------------------------------------------------------------

function main() {
  const args = new Set(process.argv.slice(2));
  const packages = discoverPackages();

  if (packages.length === 0) {
    console.error('No publishable packages found.');
    process.exit(2);
  }

  requireBuilt(packages);

  if (args.has('--check-exports-map')) return modeCheckExportsMap(packages);
  if (args.has('--check')) return modeCheck(packages);
  return modeWrite(packages);
}

main();
