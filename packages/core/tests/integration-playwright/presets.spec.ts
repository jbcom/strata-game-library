/**
 * Integration tests for Strata preset APIs and utilities
 *
 * @id @S3
 * Tests that preset systems (particles, decals, materials, etc.) work correctly
 * These tests import and test the ACTUAL Strata exports
 */

import { expect, test } from '@playwright/test';

test.describe('Presets - Particle System @S3.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export particle system functions @T20', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasCreateParticleEmitter: typeof Strata.createParticleEmitter === 'function',
        hasCoreParticleEmitter: typeof Strata.CoreParticleEmitter !== 'undefined',
        hasParticleEmitter: typeof Strata.ParticleEmitter !== 'undefined',
        hasParticleBurst: typeof Strata.ParticleBurst !== 'undefined',
      };
    });

    expect(result.hasCreateParticleEmitter).toBe(true);
    expect(result.hasParticleBurst).toBe(true);
  });

  test('should create particle emitter with config @T21', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createParticleEmitter } = window.Strata;

      if (!createParticleEmitter) {
        return { error: 'createParticleEmitter not found' };
      }

      try {
        const emitter = createParticleEmitter({
          maxParticles: 100,
          emissionRate: 10,
          lifetime: 2.0,
          startSize: 0.1,
          endSize: 0.01,
          startColor: { r: 1, g: 0.5, b: 0, a: 1 },
          endColor: { r: 1, g: 0, b: 0, a: 0 },
          velocity: { x: 0, y: 1, z: 0 },
          velocitySpread: { x: 0.5, y: 0.5, z: 0.5 },
        });

        return {
          created: emitter !== null && emitter !== undefined,
          hasUpdate: typeof emitter?.update === 'function',
          hasReset: typeof emitter?.reset === 'function',
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if ('error' in result) {
      console.log('Particle error:', result.error);
    }

    expect(result.created).toBe(true);
  });
});

test.describe('Presets - Decal System @S3.2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export decal functions @T22', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasDecalProjector: typeof Strata.DecalProjector !== 'undefined',
        hasCreateDecalTexture: typeof Strata.createDecalTexture === 'function',
        hasCreateBulletHoleTexture: typeof Strata.createBulletHoleTexture === 'function',
        hasCreateBloodSplatterTexture: typeof Strata.createBloodSplatterTexture === 'function',
        hasCreateScorchMarkTexture: typeof Strata.createScorchMarkTexture === 'function',
        hasCreateFootprintTexture: typeof Strata.createFootprintTexture === 'function',
        // Components
        hasDecal: typeof Strata.Decal !== 'undefined',
        hasDecalPool: typeof Strata.DecalPool !== 'undefined',
      };
    });

    expect(result.hasDecalProjector).toBe(true);
    expect(result.hasCreateDecalTexture).toBe(true);
    expect(result.hasCreateBulletHoleTexture).toBe(true);
    expect(result.hasDecal).toBe(true);
    expect(result.hasDecalPool).toBe(true);
  });

  test('should create decal textures @T23', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createBulletHoleTexture, createScorchMarkTexture, createFootprintTexture } =
        window.Strata;

      const textures = [];

      try {
        if (createBulletHoleTexture) {
          const bulletHole = createBulletHoleTexture(64);
          textures.push({ name: 'bulletHole', created: bulletHole !== null });
        }

        if (createScorchMarkTexture) {
          const scorch = createScorchMarkTexture(64);
          textures.push({ name: 'scorch', created: scorch !== null });
        }

        if (createFootprintTexture) {
          const footprint = createFootprintTexture(64);
          textures.push({ name: 'footprint', created: footprint !== null });
        }

        return {
          texturesCreated: textures.filter((t) => t.created).length,
          totalAttempted: textures.length,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(result.texturesCreated).toBeGreaterThan(0);
  });
});

test.describe('Presets - Billboard System @S3.3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export billboard functions @T24', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasCreateBillboardMatrix: typeof Strata.createBillboardMatrix === 'function',
        hasUpdateBillboardRotation: typeof Strata.updateBillboardRotation === 'function',
        hasSortBillboardsByDepth: typeof Strata.sortBillboardsByDepth === 'function',
        hasBillboard: typeof Strata.Billboard !== 'undefined',
        hasAnimatedBillboard: typeof Strata.AnimatedBillboard !== 'undefined',
      };
    });

    expect(result.hasCreateBillboardMatrix).toBe(true);
    expect(result.hasUpdateBillboardRotation).toBe(true);
    expect(result.hasSortBillboardsByDepth).toBe(true);
    expect(result.hasBillboard).toBe(true);
    expect(result.hasAnimatedBillboard).toBe(true);
  });

  test('should create billboard matrix @T25', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createBillboardMatrix } = window.Strata;
      const THREE = await import('three');

      if (!createBillboardMatrix) {
        return { error: 'createBillboardMatrix not found' };
      }

      try {
        const cameraPosition = new THREE.Vector3(0, 0, 10);
        const billboardPosition = new THREE.Vector3(0, 0, 0);

        const matrix = createBillboardMatrix(billboardPosition, cameraPosition);

        return {
          created: matrix !== null && matrix !== undefined,
          isMatrix4: matrix instanceof THREE.Matrix4,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if ('error' in result) {
      console.log('Billboard error:', result.error);
    }

    expect(result.created).toBe(true);
  });
});

test.describe('Presets - Material Creation @S3.4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export material creation functions @T26', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasCreateWaterMaterial: typeof Strata.createWaterMaterial === 'function',
        hasCreateAdvancedWaterMaterial: typeof Strata.createAdvancedWaterMaterial === 'function',
        hasCreateSkyMaterial: typeof Strata.createSkyMaterial === 'function',
        hasCreateRaymarchingMaterial: typeof Strata.createRaymarchingMaterial === 'function',
        hasCreateVolumetricFogMeshMaterial:
          typeof Strata.createVolumetricFogMeshMaterial === 'function',
        hasCreateGodRaysMaterial: typeof Strata.createGodRaysMaterial === 'function',
        hasCreateCloudLayerMaterial: typeof Strata.createCloudLayerMaterial === 'function',
      };
    });

    expect(result.hasCreateWaterMaterial).toBe(true);
    expect(result.hasCreateSkyMaterial).toBe(true);
    expect(result.hasCreateRaymarchingMaterial).toBe(true);
    expect(result.hasCreateGodRaysMaterial).toBe(true);
  });

  test('should create water material @T27', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createWaterMaterial } = window.Strata;

      if (!createWaterMaterial) {
        return { error: 'createWaterMaterial not found' };
      }

      try {
        const material = createWaterMaterial({
          color: 0x0077ff,
          opacity: 0.8,
        });

        return {
          created: material !== null && material !== undefined,
          hasUniforms: material?.uniforms !== undefined,
          isShaderMaterial:
            material?.type === 'ShaderMaterial' || material?.isShaderMaterial === true,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if ('error' in result) {
      console.log('Material error:', result.error);
    }

    expect(result.created).toBe(true);
  });
});

test.describe('Presets - Weather System @S3.5', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export weather system functions @T28', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasCreateWeatherSystem: typeof Strata.createWeatherSystem === 'function',
        hasCoreWeatherSystem: typeof Strata.CoreWeatherSystem !== 'undefined',
        hasCreateWindSimulation: typeof Strata.createWindSimulation === 'function',
        hasWindSimulation: typeof Strata.WindSimulation !== 'undefined',
        hasCalculateTemperature: typeof Strata.calculateTemperature === 'function',
        hasGetPrecipitationType: typeof Strata.getPrecipitationType === 'function',
      };
    });

    expect(result.hasCreateWeatherSystem).toBe(true);
    expect(result.hasCreateWindSimulation).toBe(true);
    expect(result.hasCalculateTemperature).toBe(true);
  });

  test('should create weather system @T29', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createWeatherSystem } = window.Strata;

      if (!createWeatherSystem) {
        return { error: 'createWeatherSystem not found' };
      }

      try {
        const weather = createWeatherSystem({
          initialWeather: 'clear',
          transitionDuration: 5.0,
        });

        return {
          created: weather !== null && weather !== undefined,
          hasUpdate: typeof weather?.update === 'function',
          hasSetWeather: typeof weather?.setWeather === 'function',
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if ('error' in result) {
      console.log('Weather error:', result.error);
    }

    expect(result.created).toBe(true);
  });
});

test.describe('Presets - Post-Processing @S3.6', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export post-processing utilities @T30', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasDefaultEffectSettings: typeof Strata.defaultEffectSettings !== 'undefined',
        hasDofScenarios: typeof Strata.dofScenarios !== 'undefined',
        hasLutConfigs: typeof Strata.lutConfigs !== 'undefined',
        hasBlendPostProcessingPresets: typeof Strata.blendPostProcessingPresets === 'function',
        hasCalculateFocusDistance: typeof Strata.calculateFocusDistance === 'function',
        hasGetTimeOfDayEffects: typeof Strata.getTimeOfDayEffects === 'function',
      };
    });

    expect(result.hasDefaultEffectSettings).toBe(true);
    expect(result.hasDofScenarios).toBe(true);
    expect(result.hasBlendPostProcessingPresets).toBe(true);
    expect(result.hasCalculateFocusDistance).toBe(true);
  });

  test('should have effect preset configurations @T31', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { defaultEffectSettings, dofScenarios } = window.Strata;

      return {
        hasDefaultSettings: defaultEffectSettings !== null && defaultEffectSettings !== undefined,
        settingsHasBloom: defaultEffectSettings?.bloom !== undefined,
        settingsHasVignette: defaultEffectSettings?.vignette !== undefined,
        hasDofScenarios: Array.isArray(dofScenarios) || typeof dofScenarios === 'object',
      };
    });

    expect(result.hasDefaultSettings).toBe(true);
  });
});

test.describe('Presets - LOD System @S3.7', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');

    // Load Strata library using dynamic import
    await page.evaluate(async () => {
      const Strata = await import('/dist/index.js');
      window.Strata = Strata;
      window.testStatus.libraryLoaded = true;
    });
  });

  test('should export LOD functions @T32', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasLODManager: typeof Strata.LODManager !== 'undefined',
        hasCalculateLODLevel: typeof Strata.calculateLODLevel === 'function',
        hasCreateLODLevels: typeof Strata.createLODLevels === 'function',
        hasShouldUseLOD: typeof Strata.shouldUseLOD === 'function',
        hasSimplifyGeometry: typeof Strata.simplifyGeometry === 'function',
        hasCalculateScreenSpaceSize: typeof Strata.calculateScreenSpaceSize === 'function',
      };
    });

    expect(result.hasLODManager).toBe(true);
    expect(result.hasCalculateLODLevel).toBe(true);
    expect(result.hasCreateLODLevels).toBe(true);
    expect(result.hasShouldUseLOD).toBe(true);
  });

  test('should calculate LOD level based on distance @T33', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { calculateLODLevel } = window.Strata;

      if (!calculateLODLevel) {
        return { error: 'calculateLODLevel not found' };
      }

      try {
        // Test LOD level at various distances
        const levels = [
          { distance: 10, thresholds: [50, 100, 200] },
          { distance: 75, thresholds: [50, 100, 200] },
          { distance: 150, thresholds: [50, 100, 200] },
          { distance: 300, thresholds: [50, 100, 200] },
        ];

        const results = levels.map(({ distance, thresholds }) => ({
          distance,
          level: calculateLODLevel(distance, thresholds),
        }));

        return {
          results,
          closerIsBetterLOD: results[0].level <= results[3].level,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if ('error' in result) {
      console.log('LOD error:', result.error);
    }

    expect(result.closerIsBetterLOD).toBe(true);
  });
});
