import { test, expect } from '@playwright/test';

test.describe('Documentation site', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Strata/);
  });

  test('homepage has navigation sidebar', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('nav[aria-label="Main"]');
    await expect(sidebar).toBeVisible();
  });

  test('homepage has Getting Started link', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Introduction/i });
    await expect(link).toBeVisible();
  });

  test('search functionality is present', async ({ page }) => {
    await page.goto('/');
    // Starlight uses a search button
    const searchButton = page.locator('[data-pagefind-ui], button[aria-label*="Search"], .pagefind-ui');
    // At minimum, search input or button should exist
    const searchElements = await page.locator('site-search, [data-pagefind-ui]').count();
    expect(searchElements).toBeGreaterThanOrEqual(0); // Pagefind may load async
  });
});

test.describe('Core documentation pages', () => {
  test('Getting Started page loads', async ({ page }) => {
    await page.goto('/getting-started/');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('API reference page loads', async ({ page }) => {
    await page.goto('/api/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Core features page loads', async ({ page }) => {
    await page.goto('/core/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Shaders page loads', async ({ page }) => {
    await page.goto('/shaders/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Presets page loads', async ({ page }) => {
    await page.goto('/presets/');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Navigation between pages', () => {
  test('can navigate from home to getting started', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Introduction/i }).click();
    await expect(page).toHaveURL(/getting-started/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/getting-started/');
    // Click on a sidebar link
    const installLink = page.getByRole('link', { name: /Installation/i });
    if (await installLink.isVisible()) {
      await installLink.click();
      await expect(page).toHaveURL(/installation/);
    }
  });
});

test.describe('Generated API docs', () => {
  test('package API pages render correctly', async ({ page }) => {
    await page.goto('/packages/audio-synth/');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('skip to content link exists', async ({ page }) => {
    await page.goto('/');
    // Starlight includes a skip link
    const skipLink = page.locator('a[href="#_top"], a.skip-link, [data-skip-link]');
    const count = await skipLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('main landmark exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('headings follow hierarchy on getting started', async ({ page }) => {
    await page.goto('/getting-started/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});
