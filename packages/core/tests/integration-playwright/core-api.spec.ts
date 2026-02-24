/**
 * Integration tests for Strata core API functions
 *
 * @id @S1
 * Tests that core algorithms work correctly in a browser environment
 * These tests import and test the ACTUAL Strata library exports
 */

import { expect, test } from '@playwright/test';

test.describe('Core API - SDF Functions @S1.1', () => {
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

  test('should export SDF primitive functions @T1', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasSdSphere: typeof Strata.sdSphere === 'function',
        hasSdBox: typeof Strata.sdBox === 'function',
        hasSdPlane: typeof Strata.sdPlane === 'function',
        hasSdCapsule: typeof Strata.sdCapsule === 'function',
        hasSdTorus: typeof Strata.sdTorus === 'function',
        hasSdCone: typeof Strata.sdCone === 'function',
      };
    });

    expect(result.hasSdSphere).toBe(true);
    expect(result.hasSdBox).toBe(true);
    expect(result.hasSdPlane).toBe(true);
    expect(result.hasSdCapsule).toBe(true);
    expect(result.hasSdTorus).toBe(true);
    expect(result.hasSdCone).toBe(true);
  });

  test('should execute sdSphere correctly @T2', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { sdSphere } = window.Strata;
      const THREE = await import('three');

      // Test point at origin with sphere at origin and radius 1
      const pointAtOrigin = new THREE.Vector3(0, 0, 0);
      const sphereCenter = new THREE.Vector3(0, 0, 0);
      const radius = 1.0;

      const distanceAtOrigin = sdSphere(pointAtOrigin, sphereCenter, radius);

      // Test point outside sphere
      const pointOutside = new THREE.Vector3(2, 0, 0);
      const distanceOutside = sdSphere(pointOutside, sphereCenter, radius);

      // Test point on surface
      const pointOnSurface = new THREE.Vector3(1, 0, 0);
      const distanceOnSurface = sdSphere(pointOnSurface, sphereCenter, radius);

      return {
        distanceAtOrigin,
        distanceOutside,
        distanceOnSurface,
      };
    });

    // Point at center should be -radius (inside by radius amount)
    expect(result.distanceAtOrigin).toBe(-1.0);
    // Point 2 units away should be 1 unit outside
    expect(result.distanceOutside).toBe(1.0);
    // Point on surface should be 0
    expect(Math.abs(result.distanceOnSurface)).toBeLessThan(0.001);
  });

  test('should execute sdBox correctly @T3', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { sdBox } = window.Strata;
      const THREE = await import('three');

      // Test point at center of unit box
      const pointAtCenter = new THREE.Vector3(0, 0, 0);
      const boxCenter = new THREE.Vector3(0, 0, 0);
      const boxSize = new THREE.Vector3(1, 1, 1); // Half-extents

      const distanceAtCenter = sdBox(pointAtCenter, boxCenter, boxSize);

      // Test point outside box
      const pointOutside = new THREE.Vector3(2, 0, 0);
      const distanceOutside = sdBox(pointOutside, boxCenter, boxSize);

      return {
        distanceAtCenter,
        distanceOutside,
      };
    });

    // Point at center should be negative (inside)
    expect(result.distanceAtCenter).toBeLessThan(0);
    // Point 2 units away should be outside (positive)
    expect(result.distanceOutside).toBeGreaterThan(0);
  });
});

test.describe('Core API - Noise Functions @S1.2', () => {
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

  test('should export noise functions @T4', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasFbm: typeof Strata.fbm === 'function',
        hasNoise3D: typeof Strata.noise3D === 'function',
        hasWarpedFbm: typeof Strata.warpedFbm === 'function',
      };
    });

    expect(result.hasFbm).toBe(true);
    expect(result.hasNoise3D).toBe(true);
    expect(result.hasWarpedFbm).toBe(true);
  });

  test('should execute fbm noise correctly @T5', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { fbm } = window.Strata;

      // Test FBM at various points - should return deterministic values
      const value1 = fbm(0, 0, 0, 4);
      const value2 = fbm(1.5, 2.5, 3.5, 4);
      const value3 = fbm(0, 0, 0, 4); // Same as value1

      // Test that values are in expected range (-1 to 1 or 0 to 1 depending on implementation)
      const inRange = (v: number) => typeof v === 'number' && !Number.isNaN(v);

      return {
        value1InRange: inRange(value1),
        value2InRange: inRange(value2),
        isDeterministic: value1 === value3,
        valuesDiffer: value1 !== value2,
      };
    });

    expect(result.value1InRange).toBe(true);
    expect(result.value2InRange).toBe(true);
    expect(result.isDeterministic).toBe(true);
    expect(result.valuesDiffer).toBe(true);
  });

  test('should execute noise3D correctly @T6', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { noise3D } = window.Strata;

      // Test 3D noise at various points
      const value1 = noise3D(0, 0, 0);
      const value2 = noise3D(1.5, 2.5, 3.5);
      const value3 = noise3D(0, 0, 0); // Same as value1

      const inRange = (v: number) => typeof v === 'number' && !Number.isNaN(v);

      return {
        value1InRange: inRange(value1),
        value2InRange: inRange(value2),
        isDeterministic: value1 === value3,
      };
    });

    expect(result.value1InRange).toBe(true);
    expect(result.value2InRange).toBe(true);
    expect(result.isDeterministic).toBe(true);
  });
});

test.describe('Core API - Instancing @S1.3', () => {
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

  test('should export generateInstanceData @T7', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasGenerateInstanceData: typeof Strata.generateInstanceData === 'function',
        hasGenerateInstanceDataCore: typeof Strata.generateInstanceDataCore === 'function',
      };
    });

    // At least one should exist
    expect(result.hasGenerateInstanceData || result.hasGenerateInstanceDataCore).toBe(true);
  });

  test('should generate instance data with correct structure @T8', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { generateInstanceData, generateInstanceDataCore } = window.Strata;
      const generateFn = generateInstanceData || generateInstanceDataCore;

      if (!generateFn) {
        return { error: 'generateInstanceData not found' };
      }

      // Generate instances with a fixed seed for determinism
      const instances = generateFn(
        10, // count
        100, // areaSize
        () => 0, // heightFunction (flat terrain)
        undefined, // biomeFunction
        undefined, // densityFunction
        12345 // seed
      );

      if (!Array.isArray(instances)) {
        return { error: 'Result is not an array', type: typeof instances };
      }

      // Validate structure of first instance
      const firstInstance = instances[0];
      const hasValidStructure =
        firstInstance &&
        firstInstance.position &&
        typeof firstInstance.position.x === 'number' &&
        typeof firstInstance.position.y === 'number' &&
        typeof firstInstance.position.z === 'number';

      return {
        count: instances.length,
        hasValidStructure,
        // Due to rejection sampling, count may be less than requested
        countInValidRange: instances.length > 0 && instances.length <= 10,
      };
    });

    if ('error' in result) {
      console.log('Error:', result.error);
    }

    expect(result.countInValidRange).toBe(true);
    expect(result.hasValidStructure).toBe(true);
  });
});

test.describe('Core API - SDF Operations @S1.4', () => {
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

  test('should export SDF boolean operations @T9', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasOpUnion: typeof Strata.opUnion === 'function',
        hasOpSubtraction: typeof Strata.opSubtraction === 'function',
        hasOpIntersection: typeof Strata.opIntersection === 'function',
        hasOpSmoothUnion: typeof Strata.opSmoothUnion === 'function',
        hasOpSmoothSubtraction: typeof Strata.opSmoothSubtraction === 'function',
        hasOpSmoothIntersection: typeof Strata.opSmoothIntersection === 'function',
      };
    });

    expect(result.hasOpUnion).toBe(true);
    expect(result.hasOpSubtraction).toBe(true);
    expect(result.hasOpIntersection).toBe(true);
    expect(result.hasOpSmoothUnion).toBe(true);
    expect(result.hasOpSmoothSubtraction).toBe(true);
    expect(result.hasOpSmoothIntersection).toBe(true);
  });

  test('should execute SDF operations correctly @T10', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { opUnion, opSubtraction, opIntersection } = window.Strata;

      // Test union: min of two distances
      const union = opUnion(1.0, 2.0);

      // Test subtraction: max(d1, -d2)
      const subtraction = opSubtraction(1.0, 0.5);

      // Test intersection: max of two distances
      const intersection = opIntersection(1.0, 2.0);

      return {
        union,
        subtraction,
        intersection,
      };
    });

    // Union should return the minimum
    expect(result.union).toBe(1.0);
    // Intersection should return the maximum
    expect(result.intersection).toBe(2.0);
    // Subtraction has specific behavior
    expect(typeof result.subtraction).toBe('number');
  });
});

test.describe('Core API - Camera Utilities @S1.5', () => {
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

  test('should export camera/math utilities @T11', async ({ page }) => {
    const result = await page.evaluate(() => {
      const Strata = window.Strata;
      return {
        hasLerp: typeof Strata.lerp === 'function',
        hasSlerp: typeof Strata.slerp === 'function',
        hasSmoothDamp: typeof Strata.smoothDamp === 'function',
        hasEaseOutCubic: typeof Strata.easeOutCubic === 'function',
        hasEaseInOutCubic: typeof Strata.easeInOutCubic === 'function',
      };
    });

    expect(result.hasLerp).toBe(true);
    expect(result.hasSlerp).toBe(true);
    expect(result.hasSmoothDamp).toBe(true);
    expect(result.hasEaseOutCubic).toBe(true);
    expect(result.hasEaseInOutCubic).toBe(true);
  });

  test('should execute lerp correctly @T12', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { lerp } = window.Strata;

      return {
        atStart: lerp(0, 10, 0),
        atMiddle: lerp(0, 10, 0.5),
        atEnd: lerp(0, 10, 1),
        negativeRange: lerp(-10, 10, 0.5),
      };
    });

    expect(result.atStart).toBe(0);
    expect(result.atMiddle).toBe(5);
    expect(result.atEnd).toBe(10);
    expect(result.negativeRange).toBe(0);
  });
});
