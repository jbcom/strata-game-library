import { expect, test } from '@playwright/test';

test.describe('Preset E2E Tests', () => {
  test('should load and render a creature preset', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to be ready
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');

    // Check initial preset (otter)
    const paramsStr = await page.getAttribute('body', 'data-preset-params');
    const params = JSON.parse(paramsStr!);

    expect(params.bodyLength).toBeDefined();
    expect(params.age).toBe('adult');
  });

  test('should update when changing type and form', async ({ page }) => {
    await page.goto('/');

    // Change to building: hut
    await page.selectOption('#type-select', 'building');
    await page.fill('#form-input', 'hut');

    // Wait for update
    await page.waitForFunction(() => {
      const params = JSON.parse(document.body.getAttribute('data-preset-params') || '{}');
      return params.floors !== undefined;
    });

    const paramsStr = await page.getAttribute('body', 'data-preset-params');
    const params = JSON.parse(paramsStr!);

    expect(params.floors).toBeDefined();
  });

  test('should load equipment presets', async ({ page }) => {
    await page.goto('/');

    await page.selectOption('#type-select', 'equipment');
    await page.fill('#form-input', 'rifle-assault');

    await page.waitForFunction(() => {
      const params = JSON.parse(document.body.getAttribute('data-preset-params') || '{}');
      return params.receiver === 'rifle';
    });

    const paramsStr = await page.getAttribute('body', 'data-preset-params');
    const params = JSON.parse(paramsStr!);

    expect(params.receiver).toBe('rifle');
    expect(params.barrel).toBe('long');
  });

  test('visual regression check (placeholder)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForSelector('body[data-ready="true"]');

    // Take a screenshot of the otter
    await page.screenshot({ path: 'tests/e2e/screenshots/otter-preset.png' });
  });
});
