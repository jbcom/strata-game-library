import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(fixtureDir, '../package.json'), 'utf8')) as {
  exports: Record<string, unknown>;
};

describe('strata-game-library umbrella package', () => {
  it('exposes the runtime-light root surface', async () => {
    const strata = await import('../src/index.ts');
    const presetGame = strata.createRPGGame();

    expect(strata.createGame).toBeTypeOf('function');
    expect(strata.createRPGGame).toBeTypeOf('function');
    expect(strata.createRPGState).toBeTypeOf('function');
    expect(strata.createTitleSceneShell).toBeTypeOf('function');
    expect(strata.createTitleScene).toBeTypeOf('function');
    expect(strata.createSaveSceneShell).toBeTypeOf('function');
    expect(strata.createSaveScene).toBeTypeOf('function');
    expect(strata.createSceneShellFlow).toBeTypeOf('function');
    expect(strata.createLoadSceneShellAction).toBeTypeOf('function');
    expect(strata.createLoadActiveProfileSceneShellAction).toBeTypeOf('function');
    expect(strata.createOpenActiveProfileArchiveSceneShellAction).toBeTypeOf('function');
    expect(strata.createSaveGameSceneShellAction).toBeTypeOf('function');
    expect(strata.createLoadGameSceneShellAction).toBeTypeOf('function');
    expect(strata.createDeleteSaveSceneShellAction).toBeTypeOf('function');
    expect(strata.createQuadruped).toBeTypeOf('function');
    expect(strata.waterFragmentShader).toBeTypeOf('string');
    expect(strata.Presets).toBeDefined();
    expect(strata.Shaders).toBeDefined();
    expect(presetGame.definition.ui?.shell?.hud).toMatchObject({
      title: 'Adventure HUD',
    });
    expect(presetGame.definition.ui?.shell?.loadingOverlay).toMatchObject({
      title: 'Preparing Adventure',
    });
    expect(presetGame.definition.scenes.gameplay.shell).toMatchObject({
      title: 'Adventure Begins',
    });
  });

  it('keeps lightweight subpath wrappers available', async () => {
    const [api, core, presets, shaders, reactylon] = await Promise.all([
      import('../src/api.ts'),
      import('../src/core.ts'),
      import('../src/presets.ts'),
      import('../src/shaders.ts'),
      import('../src/reactylon.ts'),
    ]);

    expect(api.createGame).toBeTypeOf('function');
    expect(api.createRPGGame).toBeTypeOf('function');
    expect(api.createRPGState).toBeTypeOf('function');
    expect(api.createMenuSceneShell).toBeTypeOf('function');
    expect(api.createMenuScene).toBeTypeOf('function');
    expect(api.createSaveSceneShell).toBeTypeOf('function');
    expect(api.createSaveScene).toBeTypeOf('function');
    expect(api.createSceneShellFlow).toBeTypeOf('function');
    expect(api.createLoadActiveProfileSceneShellAction).toBeTypeOf('function');
    expect(api.createOpenActiveProfileArchiveSceneShellAction).toBeTypeOf('function');
    expect(api.createSaveGameSceneShellAction).toBeTypeOf('function');
    expect(api.createDeleteSaveSceneShellAction).toBeTypeOf('function');
    expect(core.createWorld).toBeTypeOf('function');
    expect(presets.createQuadruped).toBeTypeOf('function');
    expect(shaders.waterVertexShader).toBeTypeOf('string');
    expect(reactylon.createBabylonRuntimeCreatureAnimationGraphController).toBeTypeOf('function');
    expect(reactylon.applyBabylonRuntimeCreatureIKPose).toBeTypeOf('function');
    expect(reactylon.instantiateBabylonRuntimeCreatureAsset).toBeTypeOf('function');
  });

  it('declares explicit subpaths for optional adapters and plugins', () => {
    expect(packageJson.exports).toMatchObject({
      '.': expect.any(Object),
      './api': expect.any(Object),
      './components': expect.any(Object),
      './hooks': expect.any(Object),
      './core': expect.any(Object),
      './game': expect.any(Object),
      './compose': expect.any(Object),
      './world': expect.any(Object),
      './utils': expect.any(Object),
      './shaders': expect.any(Object),
      './presets': expect.any(Object),
      './r3f': expect.any(Object),
      './reactylon': expect.any(Object),
      './audio-synth': expect.any(Object),
      './model-synth': expect.any(Object),
      './capacitor': expect.any(Object),
      './react-native': expect.any(Object),
      './astro': expect.any(Object),
    });
  });
});
