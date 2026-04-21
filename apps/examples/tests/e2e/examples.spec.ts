import { expect, type Page, test } from '@playwright/test';

const examples = [
  {
    slug: 'api-showcase',
    heading: 'Strata API Showcase',
    exerciseRuntime: async (page: Page) => {
      await page.getByRole('button', { name: 'Composition' }).click();
      await expect(page.locator('canvas')).toHaveCount(1);
    },
  },
  { slug: 'basic-terrain', heading: 'Basic Terrain' },
  { slug: 'sky-volumetrics', heading: 'Sky & Volumetrics' },
  { slug: 'vegetation-showcase', heading: 'Vegetation Showcase' },
  { slug: 'water-scene', heading: 'Water Scene' },
  { slug: 'world-topology', heading: 'Strata World Topology' },
];

const allowedRuntimeErrors = [
  /^THREE\.WebGLRenderer: A WebGL context could not be created\./,
  /^THREE\.WebGLRenderer: Error creating WebGL context\.$/,
  /^Error creating WebGL context\.$/,
];

function isAllowedRuntimeError(message: string) {
  return allowedRuntimeErrors.some((pattern) => pattern.test(message));
}

async function supportsWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    return context !== null;
  });
}

async function getRuntimeCanvasState(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('canvas')).map((canvas) => {
      const context =
        canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl');

      return {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        hasWebGLContext: context !== null,
      };
    })
  );
}

for (const example of examples) {
  test(`${example.slug} loads from built output`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    const failedLocalResponses: string[] = [];
    const shouldAssertWebGL = await supportsWebGL(page);

    page.on('pageerror', (error) => {
      runtimeErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(message.text());
      }
    });
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.hostname === '127.0.0.1' && response.status() >= 400) {
        failedLocalResponses.push(`${response.status()} ${url.pathname}`);
      }
    });

    const response = await page.goto(`/${example.slug}/`, { waitUntil: 'domcontentloaded' });

    expect(response?.ok()).toBe(true);
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.getByRole('heading', { name: example.heading })).toBeVisible({
      timeout: 15_000,
    });

    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    await example.exerciseRuntime?.(page);
    await page.waitForTimeout(250);

    if (shouldAssertWebGL) {
      await expect
        .poll(() => getRuntimeCanvasState(page), { timeout: 10_000 })
        .toContainEqual(
          expect.objectContaining({
            hasWebGLContext: true,
          })
        );

      const canvases = await getRuntimeCanvasState(page);
      expect(
        canvases.some(
          (canvas) =>
            canvas.hasWebGLContext &&
            canvas.width > 0 &&
            canvas.height > 0 &&
            canvas.clientWidth > 0 &&
            canvas.clientHeight > 0
        )
      ).toBe(true);
    }

    expect(failedLocalResponses).toEqual([]);
    expect(runtimeErrors.filter((message) => !isAllowedRuntimeError(message))).toEqual([]);
  });
}
