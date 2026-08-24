import { playwright } from '@vitest/browser-playwright';

export interface DefineUnitTestOptions {
  /** Glob(s) for pure-logic unit test files. */
  include?: string[];
  /** Glob(s) to exclude (browser/e2e suites always excluded by default). */
  exclude?: string[];
  /** jsdom (default) or node — jsdom needed for DOM-touching unit tests. */
  environment?: 'jsdom' | 'node';
}

/** Minimal config fragment this preset returns — spread directly into
 * vitest's real `test` field (`defineConfig({ test: { ...defineUnitTest() } })`). */
export interface UnitTestFragment {
  include: string[];
  exclude: string[];
  environment: 'jsdom' | 'node';
  environmentOptions?: { jsdom?: { url: string } };
}

/**
 * Node/jsdom unit-test config fragment — little-legends' vitest.config.ts
 * pattern: pure sim code (grid math, RNG determinism, worldgen, turn
 * systems) run fast without a real browser. Real-browser component tests
 * use `defineBrowserTest` instead.
 */
export function defineUnitTest(options: DefineUnitTestOptions = {}): UnitTestFragment {
  const {
    include = ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude = ['tests/browser/**', 'tests/e2e/**', 'node_modules', 'dist', 'android'],
    environment = 'jsdom',
  } = options;

  return {
    include,
    exclude,
    environment,
    // jsdom only exposes localStorage/sessionStorage when the document has
    // a real origin. With its default "about:blank" they are UNDEFINED, so
    // any storage-touching unit test dies on "Cannot read properties of
    // undefined (reading 'clear'/'getItem')" — hit for real by
    // little-legends' runtime-mute contract test. Every consumer of this
    // preset inherits the fix.
    ...(environment === 'jsdom'
      ? { environmentOptions: { jsdom: { url: 'http://localhost:3000' } } }
      : {}),
  };
}

export interface DefineBrowserTestOptions {
  /** Glob(s) for real-browser component test files. */
  include?: string[];
  /**
   * Extra module ids to pre-list in optimizeDeps.include so Vite's
   * dep-optimizer doesn't discover them mid-test-run. A mid-run re-bundle
   * reloads the module graph and produces a SECOND React instance, which
   * throws "Invalid hook call" from inside R3F's own <Canvas> — a real,
   * previously-hit bug (little-legends' vitest.browser.config.ts, hex-board
   * spike) this preset now encodes once instead of every repo rediscovering
   * it. React Three Fiber consumers get `three` by default for backward
   * compatibility; non-Three renderers should set `includeThree: false`.
   */
  optimizeDepsInclude?: string[];
  /** Pre-bundle `three` for React Three Fiber consumers. Defaults to true for
   * backward compatibility; Pixi/Canvas/DOM-only games should disable it. */
  includeThree?: boolean;
  /** Disable file parallelism (default true — real-Chromium tests share one browser instance). */
  fileParallelism?: boolean;
  /** Extra Playwright chromium launch args, appended after the GPU/ANGLE defaults. */
  extraLaunchArgs?: string[];
}

/** Playwright's three supported browser engines (mirrors Vitest's
 * `BrowserInstanceOption['browser']` union). */
export type PlaywrightBrowserName = 'chromium' | 'firefox' | 'webkit';

/** Complete Vitest 4 browser fragment. The Playwright provider is constructed
 * here so the process-level mute and headed contract cannot be dropped by a
 * consumer forgetting to copy a detached launch-argument array. */
export interface BrowserTestFragment {
  enabled: true;
  instances: Array<{ browser: PlaywrightBrowserName }>;
  headless: false;
  screenshotFailures: true;
  fileParallelism: boolean;
  provider: ReturnType<typeof playwright>;
}

function rejectHeadlessOptions(options: DefineBrowserTestOptions): void {
  if (Object.hasOwn(options, 'headless')) {
    throw new TypeError(
      'defineBrowserTest does not accept a headless override; use a separate nonvisual diagnostic config'
    );
  }
  const hiddenHeadless = options.extraLaunchArgs?.find((argument) =>
    /^--headless(?:=|$)/.test(argument)
  );
  if (hiddenHeadless) {
    throw new TypeError(
      `defineBrowserTest rejects hidden Chromium headless flags; received ${hiddenHeadless}`
    );
  }
}

/**
 * Real-browser (Chromium via Playwright) test config fragment — drives the
 * app through the DOM/store and asserts rendered output, not raw pixels.
 * Ships the GPU/ANGLE launch args and dep-optimizer pre-bundle list that
 * little-legends' vitest.browser.config.ts hand-rolled and documented.
 */
export function defineBrowserTest(options: DefineBrowserTestOptions = {}): {
  include: string[];
  optimizeDeps: { include: string[] };
  browser: BrowserTestFragment;
} {
  rejectHeadlessOptions(options);
  const {
    include = ['tests/browser/**/*.{test,spec}.{ts,tsx}'],
    optimizeDepsInclude = [],
    includeThree = true,
    fileParallelism = false,
    extraLaunchArgs = [],
  } = options;

  return {
    include,
    optimizeDeps: {
      include: [...(includeThree ? ['three'] : []), ...optimizeDepsInclude],
    },
    browser: {
      enabled: true,
      instances: [{ browser: 'chromium' }],
      headless: false,
      screenshotFailures: true,
      fileParallelism,
      provider: playwright({
        launchOptions: {
          args: defaultBrowserLaunchArgs(extraLaunchArgs),
        },
      }),
    },
  };
}

/** GPU/ANGLE Chromium launch args the fleet's browser configs converge on. */
export function defaultBrowserLaunchArgs(extra: string[] = []): string[] {
  const hiddenHeadless = extra.find((argument) => /^--headless(?:=|$)/.test(argument));
  if (hiddenHeadless) {
    throw new TypeError(
      `defaultBrowserLaunchArgs rejects hidden Chromium headless flags; received ${hiddenHeadless}`
    );
  }
  return [
    '--mute-audio',
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--use-angle=swiftshader-webgl',
    ...extra,
  ];
}
