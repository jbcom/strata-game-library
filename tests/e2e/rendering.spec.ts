import { expect, test } from '@playwright/test';

/**
 * E2E tests for Strata rendering examples
 *
 * These tests verify that all rendering features work correctly
 * across different browsers and devices.
 */

test.describe('Strata Rendering Examples', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should render terrain', async ({ page }) => {
        // Wait for terrain to be visible
        const terrain = page.locator('[data-testid="terrain"]');
        await expect(terrain).toBeVisible({ timeout: 10000 });

        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot('terrain.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should render water', async ({ page }) => {
        const water = page.locator('[data-testid="water"]');
        await expect(water).toBeVisible({ timeout: 10000 });

        // Wait for animation frame
        await page.waitForTimeout(1000);

        await expect(page).toHaveScreenshot('water.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should render vegetation (instanced grass)', async ({ page }) => {
        const vegetation = page.locator('[data-testid="vegetation"]');
        await expect(vegetation).toBeVisible({ timeout: 10000 });

        await expect(page).toHaveScreenshot('vegetation.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should render character with fur', async ({ page }) => {
        const character = page.locator('[data-testid="character"]');
        await expect(character).toBeVisible({ timeout: 10000 });

        // Wait for animation
        await page.waitForTimeout(2000);

        await expect(page).toHaveScreenshot('character-fur.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should render molecular structures', async ({ page }) => {
        const molecule = page.locator('[data-testid="molecule"]');
        await expect(molecule).toBeVisible({ timeout: 10000 });

        await expect(page).toHaveScreenshot('molecule.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should render sky and volumetrics', async ({ page }) => {
        const sky = page.locator('[data-testid="sky"]');
        await expect(sky).toBeVisible({ timeout: 10000 });

        await expect(page).toHaveScreenshot('sky-volumetrics.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should handle camera movement', async ({ page }) => {
        // Simulate camera movement
        await page.mouse.move(400, 300);
        await page.mouse.down();
        await page.mouse.move(500, 400);
        await page.mouse.up();

        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('camera-movement.png', {
            fullPage: false,
            clip: { x: 0, y: 0, width: 800, height: 600 },
        });
    });

    test('should maintain performance with many instances', async ({ page }) => {
        // Check FPS or frame time
        const fps = await page.evaluate(() => {
            return (window as any).fps || 0;
        });

        // Should maintain at least 30 FPS
        expect(fps).toBeGreaterThan(30);
    });
});
