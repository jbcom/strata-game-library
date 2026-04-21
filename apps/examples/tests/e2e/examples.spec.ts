import { expect, test } from '@playwright/test';

const examples = [
  { slug: 'api-showcase', heading: 'Strata API Showcase' },
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

for (const example of examples) {
  test(`${example.slug} loads from built output`, async ({ page }) => {
    const runtimeErrors: string[] = [];
    const failedLocalResponses: string[] = [];

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

    expect(failedLocalResponses).toEqual([]);
    expect(runtimeErrors.filter((message) => !isAllowedRuntimeError(message))).toEqual([]);
  });
}
