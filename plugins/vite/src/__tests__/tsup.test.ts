import { describe, expect, it } from 'vitest';
import { libraryBuild } from '../tsup.js';

describe('libraryBuild', () => {
  it('derives the banner from the package name', () => {
    // The bug this preset exists to prevent: @strata-game-library/pixi shipped
    // a dist announcing itself as @strata-game-library/reactylon, because the
    // banner was copy-pasted. Deriving it makes that unrepresentable.
    const cfg = libraryBuild({ name: '@scope/renderer' });
    expect(cfg.banner).toEqual({ js: '/* @scope/renderer - ESM Build */' });
  });

  it('defaults to a single src/index.ts entry', () => {
    expect(libraryBuild({ name: '@scope/pkg' }).entry).toEqual(['src/index.ts']);
  });

  it('preserves an explicit entry map for subpath exports', () => {
    const entry = { index: 'src/index.ts', 'clients/base': 'src/clients/base.ts' };
    expect(libraryBuild({ name: '@scope/pkg', entry }).entry).toEqual(entry);
  });

  it('passes externals through verbatim, including regexes', () => {
    // Anything imported but missing here gets bundled, which duplicates the
    // dependency and breaks instanceof against the host copy.
    const external = [/^@scope\//, 'three', 'react'];
    expect(libraryBuild({ name: '@scope/pkg', external }).external).toEqual(external);
  });

  it('externalises nothing by default', () => {
    expect(libraryBuild({ name: '@scope/pkg' }).external).toEqual([]);
  });

  it('emits library-appropriate defaults', () => {
    const cfg = libraryBuild({ name: '@scope/pkg' });
    expect(cfg.format).toEqual(['esm']);
    expect(cfg.target).toBe('es2022');
    expect(cfg.dts).toBe(true);
    expect(cfg.sourcemap).toBe(true);
    // Applications minify; libraries must not, or consumer builds cannot.
    expect(cfg.minify).toBe(false);
    // Keeps consumer stack traces and fn.name checks meaningful.
    expect(cfg.keepNames).toBe(true);
  });

  it('omits jsx config entirely when no mode is requested', () => {
    expect(libraryBuild({ name: '@scope/pkg' }).esbuildOptions).toBeUndefined();
  });

  it('routes jsx through esbuildOptions, not the top level', () => {
    // tsup's Options has no `jsx` field: setting it there is silently
    // discarded, which is what four Strata packages were doing.
    const cfg = libraryBuild({ name: '@scope/ui', jsx: 'automatic' });
    expect(cfg).not.toHaveProperty('jsx');
    const esbuild: { jsx?: string } = {};
    (cfg.esbuildOptions as (o: { jsx?: string }) => void)(esbuild);
    expect(esbuild.jsx).toBe('automatic');
  });

  it('routes preserve mode the same way', () => {
    const cfg = libraryBuild({ name: '@scope/native', jsx: 'preserve' });
    const esbuild: { jsx?: string } = {};
    (cfg.esbuildOptions as (o: { jsx?: string }) => void)(esbuild);
    expect(esbuild.jsx).toBe('preserve');
  });

  it('lets overrides win over the defaults', () => {
    // Capacitor ships into WebViews with an older floor than a browser's.
    const cfg = libraryBuild({
      name: '@scope/mobile',
      overrides: { target: 'es2020', splitting: true },
    });
    expect(cfg.target).toBe('es2020');
    expect(cfg.splitting).toBe(true);
  });

  it('does not let overrides silently drop the derived banner', () => {
    const cfg = libraryBuild({ name: '@scope/pkg', overrides: { minify: true } });
    expect(cfg.banner).toEqual({ js: '/* @scope/pkg - ESM Build */' });
    expect(cfg.minify).toBe(true);
  });
});
