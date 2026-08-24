import path from 'node:path';
import { mergeConfig, normalizePath, type PluginOption, type UserConfig } from 'vite';

/**
 * Known-gotcha heavy dependencies that need co-chunking / optimizeDeps care.
 * Toggling one of these on wires in the fix the fleet has already rediscovered
 * per-repo (see blobolines' vite.config.ts for the three.js/Rapier war story
 * and little-legends' vitest.browser.config.ts for the declarative-hex-worlds
 * mid-run re-bundle fix this preset generalizes).
 */
export interface HeavyDepsOptions {
  /** three.js: dedupe + its own Rolldown code-splitting group + optimizeDeps.include. */
  three?: boolean;
  /**
   * Rapier (WASM physics): optimizeDeps.exclude (async WASM init can't be
   * pre-bundled) + co-chunked with three so both land in the same async
   * boundary instead of racing two separate dynamic imports.
   */
  rapier?: boolean;
  /** Phaser: its own Rolldown code-splitting group (it's large and rarely changes). */
  phaser?: boolean;
}

export interface DefineGamePresetOptions {
  /**
   * Drives the default GitHub Pages base ("/<appName>/") and the Capacitor
   * hostname convention. Required — every derived default keys off this.
   */
  appName: string;
  /**
   * Explicit base override. When omitted, derived from env in this order:
   * VITE_BASE env var > CAPACITOR=true (base "/") > GITHUB_PAGES=true
   * (base "/<appName>/") > "/".
   */
  base?: string;
  /** Framework plugins the caller supplies (react(), tailwindcss(), ...). */
  plugins?: PluginOption[];
  /** Known-gotcha heavy deps needing co-chunking / optimizeDeps care. */
  heavyDeps?: HeavyDepsOptions;
  /**
   * Extra HMR-storm avoidance globs, merged with the preset's own default
   * ignore list (dist, android, ios, test-results).
   */
  watchIgnore?: string[];
  /** Extra module ids to dedupe beyond the preset's own react/react-dom set. */
  dedupe?: string[];
  /**
   * Absolute filesystem target for the optional "@/*" alias. When omitted,
   * the preset creates no alias. Relative replacements are rejected because
   * Vite resolves them from its process context rather than the consumer's
   * config file. POSIX and Windows absolute paths are accepted and normalized
   * to Vite's forward-slash convention.
   */
  srcDir?: string;
  /** Merged last, after every preset-derived field — the escape hatch. */
  overrides?: UserConfig;
}

function deriveBase(appName: string, explicit?: string): string {
  if (explicit !== undefined) return explicit;
  if (process.env.VITE_BASE) return process.env.VITE_BASE;
  if (process.env.CAPACITOR === 'true') return '/';
  if (process.env.GITHUB_PAGES === 'true') return `/${appName}/`;
  return '/';
}

interface CodeSplittingGroup {
  name: string;
  test: RegExp;
}

function buildCodeSplittingGroups(heavyDeps: HeavyDepsOptions): CodeSplittingGroup[] {
  const { three, rapier, phaser } = heavyDeps;
  const groups: CodeSplittingGroup[] = [];

  if (three || rapier) {
    const packages = [three ? 'three' : undefined, rapier ? '@dimforge/rapier3d-compat' : undefined]
      .filter((name): name is string => name !== undefined)
      .map((name) => name.replace('/', '[\\\\/]'));
    groups.push({
      name: 'three-vendor',
      test: new RegExp(`[\\\\/]node_modules[\\\\/](?:${packages.join('|')})(?:[\\\\/]|$)`),
    });
  }

  if (phaser) {
    groups.push({
      name: 'phaser-vendor',
      test: /[\\/]node_modules[\\/]phaser(?:[\\/]|$)/,
    });
  }

  return groups;
}

function sourceAlias(srcDir: string | undefined): Record<string, string> | undefined {
  if (srcDir === undefined) return undefined;
  if (!path.isAbsolute(srcDir) && !path.win32.isAbsolute(srcDir)) {
    throw new TypeError(
      `defineGamePreset srcDir must be an absolute filesystem path; received ${JSON.stringify(srcDir)}`
    );
  }
  const normalized = path.win32.isAbsolute(srcDir)
    ? srcDir.replaceAll('\\', '/')
    : normalizePath(srcDir);
  return { '@': normalized };
}

interface CodeSplittingShape {
  groups?: unknown;
}

interface OutputShape {
  codeSplitting?: CodeSplittingShape;
}

/**
 * Vite's mergeConfig concatenates nested arrays. That is useful for plugins,
 * but duplicate named Rolldown groups are ambiguous. Preserve first-seen
 * ordering while making the caller's later group with the same name replace
 * the preset definition, matching the documented "overrides win" contract.
 */
function reconcileNamedCodeSplittingGroups(config: UserConfig): UserConfig {
  const output = config.build?.rolldownOptions?.output;
  if (!output || Array.isArray(output) || typeof output !== 'object') return config;

  const codeSplitting = (output as OutputShape).codeSplitting;
  if (!codeSplitting || !Array.isArray(codeSplitting.groups)) return config;

  const groups: unknown[] = [];
  const namedPositions = new Map<string, number>();
  for (const group of codeSplitting.groups) {
    const name =
      typeof group === 'object' && group !== null && 'name' in group
        ? (group as { name?: unknown }).name
        : undefined;
    if (typeof name !== 'string') {
      groups.push(group);
      continue;
    }

    const previous = namedPositions.get(name);
    if (previous === undefined) {
      namedPositions.set(name, groups.length);
      groups.push(group);
    } else {
      groups[previous] = group;
    }
  }
  codeSplitting.groups = groups;
  return config;
}

/**
 * Base Vite config factory encoding the fleet's shared build conventions:
 * env-switched `base`, heavy-dep co-chunking fixes, and HMR watch-ignore
 * globs — merging caller overrides last so any repo can fully escape-hatch.
 */
export function defineGamePreset(options: DefineGamePresetOptions): UserConfig {
  const {
    appName,
    base,
    plugins = [],
    heavyDeps = {},
    watchIgnore = [],
    dedupe = [],
    srcDir,
    overrides = {},
  } = options;

  const codeSplittingGroups = buildCodeSplittingGroups(heavyDeps);
  const optimizeDepsInclude: string[] = [];
  const optimizeDepsExclude: string[] = [];

  if (heavyDeps.three) optimizeDepsInclude.push('three');
  if (heavyDeps.rapier) optimizeDepsExclude.push('@dimforge/rapier3d-compat');
  const alias = sourceAlias(srcDir);

  const preset: UserConfig = {
    base: deriveBase(appName, base),
    plugins,
    resolve: {
      ...(alias ? { alias } : {}),
      dedupe: ['react', 'react-dom', ...dedupe],
    },
    ...(optimizeDepsInclude.length || optimizeDepsExclude.length
      ? {
          optimizeDeps: {
            ...(optimizeDepsInclude.length ? { include: optimizeDepsInclude } : {}),
            ...(optimizeDepsExclude.length ? { exclude: optimizeDepsExclude } : {}),
          },
        }
      : {}),
    ...(codeSplittingGroups.length
      ? {
          build: {
            rolldownOptions: {
              output: {
                codeSplitting: {
                  groups: codeSplittingGroups,
                },
              },
            },
          },
        }
      : {}),
    server: {
      watch: {
        ignored: [
          '**/diagnostics/**',
          '**/test-results/**',
          '**/dist/**',
          '**/android/**',
          '**/ios/**',
          ...watchIgnore,
        ],
      },
    },
  };

  return reconcileNamedCodeSplittingGroups(mergeConfig(preset, overrides));
}
