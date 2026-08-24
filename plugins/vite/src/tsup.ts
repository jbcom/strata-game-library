import type { Options } from 'tsup';

/** Shape of a library build: what it is called, what it must not bundle. */
export interface LibraryBuildOptions {
  /** Package name. Used for the build banner, so it cannot drift from reality. */
  name: string;
  /** Entry points. Defaults to a single `src/index.ts`. */
  entry?: Options['entry'];
  /**
   * Packages the consumer supplies. Anything imported but absent here gets
   * bundled into dist — which duplicates the dependency and breaks
   * `instanceof` against the host copy. Prefer listing peerDependencies.
   */
  external?: (string | RegExp)[];
  /**
   * JSX transform mode. `"preserve"` when a downstream compiler owns JSX
   * (React Native, Astro); `"automatic"` for the modern React runtime.
   *
   * Routed through `esbuildOptions` deliberately: tsup's own `Options` has no
   * `jsx` field, so setting it at the top level type-errors under a preset and
   * is silently discarded in a hand-written config. Four Strata packages were
   * doing exactly that.
   */
  jsx?: 'transform' | 'preserve' | 'automatic';
  /** Escape hatch for genuinely package-specific needs. */
  overrides?: Options;
}

/**
 * Build config for a publishable library in this workspace.
 *
 * Exists because twelve hand-written tsup configs drifted: mismatched `target`
 * casing, and one adapter shipping another package's banner and externals.
 * Deriving the banner from `name` makes that specific mistake unrepresentable.
 */
export function libraryBuild(options: LibraryBuildOptions): Options {
  const { name, entry = ['src/index.ts'], external = [], jsx, overrides } = options;

  return {
    entry,
    format: ['esm'],
    target: 'es2022',
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: false,
    // Preserved so consumer stack traces and `fn.name` checks stay meaningful.
    keepNames: true,
    external,
    ...(jsx
      ? {
          esbuildOptions(esbuild: { jsx?: string }) {
            esbuild.jsx = jsx;
          },
        }
      : {}),
    banner: { js: `/* ${name} - ESM Build */` },
    ...overrides,
  };
}
