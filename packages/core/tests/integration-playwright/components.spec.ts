/**
 * Browser integration tests for Strata core rendering primitives.
 *
 * @id @S2
 * These tests intentionally cover framework-agnostic Three.js materials,
 * geometry factories, and instancing helpers. React/R3F components belong in
 * adapters/r3f, not packages/core.
 */

import { expect, type Page, test } from '@playwright/test';

async function loadStrata(page: Page) {
  await page.goto('/tests/integration-playwright/fixtures/test-server.html');
  await page.waitForLoadState('domcontentloaded');

  await page.evaluate(async () => {
    const Strata = await import('/dist/index.js');
    window.Strata = Strata;
    window.testStatus.libraryLoaded = true;
  });
}

test.describe('Core Rendering - Export Boundary @S2.1', () => {
  test.beforeEach(async ({ page }) => {
    await loadStrata(page);
  });

  test('should export framework-agnostic rendering factories @T10', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasCreateWaterMaterial: typeof Strata.createWaterMaterial === 'function',
        hasCreateAdvancedWaterMaterial: typeof Strata.createAdvancedWaterMaterial === 'function',
        hasCreateWaterGeometry: typeof Strata.createWaterGeometry === 'function',
        hasCreateSkyMaterial: typeof Strata.createSkyMaterial === 'function',
        hasCreateSkyGeometry: typeof Strata.createSkyGeometry === 'function',
        hasCreateInstancedMesh: typeof Strata.createInstancedMesh === 'function',
      };
    });

    expect(result.hasCreateWaterMaterial).toBe(true);
    expect(result.hasCreateAdvancedWaterMaterial).toBe(true);
    expect(result.hasCreateWaterGeometry).toBe(true);
    expect(result.hasCreateSkyMaterial).toBe(true);
    expect(result.hasCreateSkyGeometry).toBe(true);
    expect(result.hasCreateInstancedMesh).toBe(true);
  });

  test('should not export React components from core @T11', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasWaterComponent: typeof Strata.Water !== 'undefined',
        hasProceduralSkyComponent: typeof Strata.ProceduralSky !== 'undefined',
        hasGrassInstancesComponent: typeof Strata.GrassInstances !== 'undefined',
        hasVolumetricFogMeshComponent: typeof Strata.VolumetricFogMesh !== 'undefined',
      };
    });

    expect(result.hasWaterComponent).toBe(false);
    expect(result.hasProceduralSkyComponent).toBe(false);
    expect(result.hasGrassInstancesComponent).toBe(false);
    expect(result.hasVolumetricFogMeshComponent).toBe(false);
  });
});

test.describe('Core Rendering - Material and Geometry Creation @S2.2', () => {
  test.beforeEach(async ({ page }) => {
    await loadStrata(page);
  });

  test('should create water and sky materials in a browser @T12', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      const waterMaterial = Strata.createWaterMaterial({ time: 1 });
      const advancedWaterMaterial = Strata.createAdvancedWaterMaterial({
        causticIntensity: 0.5,
        time: 2,
      });
      const skyMaterial = Strata.createSkyMaterial({
        timeOfDay: {
          sunAngle: 60,
          sunIntensity: 1,
        },
        time: 3,
      });

      return {
        waterType: waterMaterial.type,
        advancedWaterType: advancedWaterMaterial.type,
        skyType: skyMaterial.type,
        waterHasTimeUniform: waterMaterial.uniforms.time.value === 1,
        skyHasSunUniform: skyMaterial.uniforms.uSunAngle.value === 60,
      };
    });

    expect(result.waterType).toBe('ShaderMaterial');
    expect(result.advancedWaterType).toBe('ShaderMaterial');
    expect(result.skyType).toBe('ShaderMaterial');
    expect(result.waterHasTimeUniform).toBe(true);
    expect(result.skyHasSunUniform).toBe(true);
  });

  test('should create water and sky geometries in a browser @T13', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      const waterGeometry = Strata.createWaterGeometry(10, 4);
      const skyGeometry = Strata.createSkyGeometry([100, 50]);

      return {
        waterType: waterGeometry.type,
        skyType: skyGeometry.type,
        waterPositionCount: waterGeometry.attributes.position.count,
        skyPositionCount: skyGeometry.attributes.position.count,
      };
    });

    expect(result.waterType).toBe('PlaneGeometry');
    expect(result.skyType).toBe('PlaneGeometry');
    expect(result.waterPositionCount).toBeGreaterThan(0);
    expect(result.skyPositionCount).toBeGreaterThan(0);
  });
});

test.describe('Core Rendering - Effects and Instancing @S2.3', () => {
  test.beforeEach(async ({ page }) => {
    await loadStrata(page);
  });

  test('should create effect shader materials in a browser @T14', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const Strata = window.Strata;
      const THREE = await import('three');
      const cloudLayer = Strata.createCloudLayerMaterial({
        layer: {
          coverage: 0.5,
          density: 0.35,
        },
        time: 4,
      });
      const fog = Strata.createVolumetricFogMeshMaterial({
        cameraPosition: new THREE.Vector3(0, 2, 5),
        time: 5,
      });
      const godRays = Strata.createGodRaysMaterial({
        lightPosition: new THREE.Vector3(0.5, 0.5, 0),
        lightColor: new THREE.Color(1, 0.95, 0.8),
        intensity: 1,
        decay: 0.95,
        density: 0.8,
        samples: 32,
        exposure: 0.6,
        scattering: 0.5,
        noiseFactor: 0.1,
      });

      return {
        cloudLayerType: cloudLayer.type,
        fogType: fog.type,
        godRaysType: godRays.type,
        cloudCoverage: cloudLayer.uniforms.uCoverage.value,
        fogTime: fog.uniforms.uTime.value,
      };
    });

    expect(result.cloudLayerType).toBe('ShaderMaterial');
    expect(result.fogType).toBe('ShaderMaterial');
    expect(result.godRaysType).toBe('ShaderMaterial');
    expect(result.cloudCoverage).toBe(0.5);
    expect(result.fogTime).toBe(5);
  });

  test('should create an instanced mesh from generated instance data @T15', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const Strata = window.Strata;
      const THREE = await import('three');
      const instances = Strata.generateInstanceData(12, 10, () => 1, undefined, undefined, 123);
      const mesh = Strata.createInstancedMesh({
        geometry: new THREE.BoxGeometry(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0x44aa44 }),
        count: 12,
        instances,
        castShadow: false,
        receiveShadow: false,
      });

      return {
        created: mesh.isInstancedMesh === true,
        count: mesh.count,
        instanceCount: instances.length,
        castShadow: mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
      };
    });

    expect(result.created).toBe(true);
    expect(result.count).toBe(result.instanceCount);
    expect(result.castShadow).toBe(false);
    expect(result.receiveShadow).toBe(false);
  });
});
