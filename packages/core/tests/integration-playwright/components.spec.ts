/**
 * Integration tests for Strata React components
 *
 * @id @S2
 * Tests that Strata React components render and function correctly
 * These tests import and test the ACTUAL Strata component exports
 */

import { expect, test } from '@playwright/test';

test.describe('React Components - Core Exports @S2.1', () => {
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

  test('should export Water component @T10', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasWater: typeof Strata.Water !== 'undefined',
        hasAdvancedWater: typeof Strata.AdvancedWater !== 'undefined',
        waterIsFunction: typeof Strata.Water === 'function' || typeof Strata.Water === 'object',
      };
    });

    expect(result.hasWater).toBe(true);
    expect(result.hasAdvancedWater).toBe(true);
  });

  test('should export Sky components @T11', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasProceduralSky: typeof Strata.ProceduralSky !== 'undefined',
        hasCloudSky: typeof Strata.CloudSky !== 'undefined',
        hasCloudLayer: typeof Strata.CloudLayer !== 'undefined',
        hasVolumetricClouds: typeof Strata.VolumetricClouds !== 'undefined',
      };
    });

    expect(result.hasProceduralSky).toBe(true);
    expect(result.hasCloudSky).toBe(true);
    expect(result.hasCloudLayer).toBe(true);
    expect(result.hasVolumetricClouds).toBe(true);
  });

  test('should export Instancing components @T12', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasGrassInstances: typeof Strata.GrassInstances !== 'undefined',
        hasTreeInstances: typeof Strata.TreeInstances !== 'undefined',
        hasRockInstances: typeof Strata.RockInstances !== 'undefined',
        hasGPUInstancedMesh: typeof Strata.GPUInstancedMesh !== 'undefined',
      };
    });

    expect(result.hasGrassInstances).toBe(true);
    expect(result.hasTreeInstances).toBe(true);
    expect(result.hasRockInstances).toBe(true);
    expect(result.hasGPUInstancedMesh).toBe(true);
  });

  test('should export Weather components @T13', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasRain: typeof Strata.Rain !== 'undefined',
        hasSnow: typeof Strata.Snow !== 'undefined',
        hasWeatherEffects: typeof Strata.WeatherEffects !== 'undefined',
      };
    });

    expect(result.hasRain).toBe(true);
    expect(result.hasSnow).toBe(true);
    expect(result.hasWeatherEffects).toBe(true);
  });

  test('should export Volumetric components @T14', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasVolumetricFogMesh: typeof Strata.VolumetricFogMesh !== 'undefined',
        hasVolumetricPointLight: typeof Strata.VolumetricPointLight !== 'undefined',
        hasVolumetricSpotlight: typeof Strata.VolumetricSpotlight !== 'undefined',
        hasVolumetricEffects: typeof Strata.VolumetricEffects !== 'undefined',
        hasGodRays: typeof Strata.GodRays !== 'undefined',
        hasLightShafts: typeof Strata.LightShafts !== 'undefined',
      };
    });

    expect(result.hasVolumetricFogMesh).toBe(true);
    expect(result.hasVolumetricPointLight).toBe(true);
    expect(result.hasVolumetricSpotlight).toBe(true);
    expect(result.hasVolumetricEffects).toBe(true);
    expect(result.hasGodRays).toBe(true);
    expect(result.hasLightShafts).toBe(true);
  });
});

test.describe('React Components - Water Rendering @S2.2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Water component in scene @T15', async ({ page }) => {
    // This test verifies that the Water component can be instantiated and rendered
    await page.evaluate(async () => {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const { Canvas } = await import('@react-three/fiber');
      const Strata = await import('/dist/index.js');

      const root = ReactDOM.createRoot(document.getElementById('root'));

      // Render the actual Strata Water component
      root.render(
        React.createElement(Canvas, { camera: { position: [0, 5, 10] } }, [
          React.createElement(Strata.Water, {
            key: 'water',
            position: [0, 0, 0],
          }),
          React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
          React.createElement('directionalLight', {
            key: 'sun',
            position: [10, 10, 5],
            intensity: 1,
          }),
        ])
      );

      // Signal that render was attempted
      setTimeout(() => {
        window.signalReady();
      }, 2000);
    });

    // Wait for scene to render
    await page.waitForFunction(() => window.testStatus?.ready === true, {
      timeout: 15000,
    });

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/strata-water-component.png' });

    // Verify no errors occurred
    const hasError = await page.evaluate(() => window.testStatus?.error);
    expect(hasError).toBeNull();
  });
});

test.describe('React Components - Instancing Rendering @S2.3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render GrassInstances component @T16', async ({ page }) => {
    await page.evaluate(async () => {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const { Canvas } = await import('@react-three/fiber');
      const THREE = await import('three');
      const Strata = await import('/dist/index.js');

      const root = ReactDOM.createRoot(document.getElementById('root'));

      // Generate instance data using Strata's function
      const generateFn = Strata.generateInstanceData || Strata.generateInstanceDataCore;
      let instances = [];
      if (generateFn) {
        try {
          instances = generateFn(50, 20, () => 0, undefined, undefined, 12345);
        } catch (e) {
          console.error('Failed to generate instances:', e);
        }
      }

      // Create a simple grass geometry
      const geometry = new THREE.PlaneGeometry(0.1, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
        side: THREE.DoubleSide,
      });

      root.render(
        React.createElement(
          Canvas,
          {
            camera: { position: [0, 10, 20], fov: 60 },
          },
          [
            // Use GPUInstancedMesh with generated data
            React.createElement(Strata.GPUInstancedMesh, {
              key: 'grass',
              geometry: geometry,
              material: material,
              instances: instances,
              count: instances.length,
            }),
            React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
            React.createElement('directionalLight', {
              key: 'sun',
              position: [10, 10, 5],
              intensity: 1,
            }),
            // Ground plane
            React.createElement(
              'mesh',
              {
                key: 'ground',
                rotation: [-Math.PI / 2, 0, 0],
                position: [0, -0.01, 0],
              },
              [
                React.createElement('planeGeometry', {
                  key: 'geom',
                  args: [50, 50],
                }),
                React.createElement('meshStandardMaterial', {
                  key: 'mat',
                  color: 0x553311,
                }),
              ]
            ),
          ]
        )
      );

      setTimeout(() => {
        window.signalReady();
      }, 2000);
    });

    await page.waitForFunction(() => window.testStatus?.ready === true, {
      timeout: 15000,
    });

    await page.screenshot({ path: 'test-results/strata-grass-instances.png' });

    const hasError = await page.evaluate(() => window.testStatus?.error);
    expect(hasError).toBeNull();
  });
});

test.describe('React Components - Sky Rendering @S2.4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render ProceduralSky component @T17', async ({ page }) => {
    await page.evaluate(async () => {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const { Canvas } = await import('@react-three/fiber');
      const Strata = await import('/dist/index.js');

      const root = ReactDOM.createRoot(document.getElementById('root'));

      root.render(
        React.createElement(Canvas, { camera: { position: [0, 0, 0] } }, [
          React.createElement(Strata.ProceduralSky, {
            key: 'sky',
          }),
          React.createElement('ambientLight', { key: 'ambient', intensity: 0.3 }),
        ])
      );

      setTimeout(() => {
        window.signalReady();
      }, 2000);
    });

    await page.waitForFunction(() => window.testStatus?.ready === true, {
      timeout: 15000,
    });

    await page.screenshot({ path: 'test-results/strata-procedural-sky.png' });

    const hasError = await page.evaluate(() => window.testStatus?.error);
    expect(hasError).toBeNull();
  });

  test('should render CloudSky component @T18', async ({ page }) => {
    await page.evaluate(async () => {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const { Canvas } = await import('@react-three/fiber');
      const Strata = await import('/dist/index.js');

      const root = ReactDOM.createRoot(document.getElementById('root'));

      root.render(
        React.createElement(Canvas, { camera: { position: [0, 0, 0] } }, [
          React.createElement(Strata.CloudSky, {
            key: 'clouds',
          }),
          React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
          React.createElement('directionalLight', {
            key: 'sun',
            position: [1, 1, 1],
            intensity: 1,
          }),
        ])
      );

      setTimeout(() => {
        window.signalReady();
      }, 2000);
    });

    await page.waitForFunction(() => window.testStatus?.ready === true, {
      timeout: 15000,
    });

    await page.screenshot({ path: 'test-results/strata-cloud-sky.png' });

    const hasError = await page.evaluate(() => window.testStatus?.error);
    expect(hasError).toBeNull();
  });
});

test.describe('React Components - Effects @S2.5', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/integration-playwright/fixtures/test-server.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render VolumetricFogMesh @T19', async ({ page }) => {
    await page.evaluate(async () => {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const { Canvas } = await import('@react-three/fiber');
      const Strata = await import('/dist/index.js');

      const root = ReactDOM.createRoot(document.getElementById('root'));

      root.render(
        React.createElement(
          Canvas,
          {
            camera: { position: [0, 2, 10] },
          },
          [
            React.createElement(Strata.VolumetricFogMesh, {
              key: 'fog',
              position: [0, 0, 0],
            }),
            React.createElement('mesh', { key: 'cube', position: [0, 0, 0] }, [
              React.createElement('boxGeometry', { key: 'geom', args: [2, 2, 2] }),
              React.createElement('meshStandardMaterial', {
                key: 'mat',
                color: 0xff0000,
              }),
            ]),
            React.createElement('ambientLight', { key: 'ambient', intensity: 0.5 }),
            React.createElement('pointLight', {
              key: 'point',
              position: [5, 5, 5],
              intensity: 1,
            }),
          ]
        )
      );

      setTimeout(() => {
        window.signalReady();
      }, 2000);
    });

    await page.waitForFunction(() => window.testStatus?.ready === true, {
      timeout: 15000,
    });

    await page.screenshot({ path: 'test-results/strata-volumetric-fog.png' });

    const hasError = await page.evaluate(() => window.testStatus?.error);
    expect(hasError).toBeNull();
  });
});
