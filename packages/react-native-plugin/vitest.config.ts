import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Vite plugin that intercepts react-native module resolution.
 * React Native's index.js contains Flow syntax (import typeof *)
 * that Vite/Rollup cannot parse. This plugin returns a minimal
 * stub that is then overridden by vi.mock() in each test file.
 */
function reactNativeStub(): Plugin {
  return {
    name: 'react-native-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'react-native') {
        return '\0react-native-stub';
      }
      return null;
    },
    load(id) {
      if (id === '\0react-native-stub') {
        return `
          export const NativeModules = {};
          export const Platform = { OS: 'ios', select: () => undefined };
          export const Dimensions = { get: () => ({ width: 0, height: 0 }), addEventListener: () => ({ remove: () => {} }) };
          export const PixelRatio = { get: () => 1 };
          export const NativeEventEmitter = function() { return { addListener() {}, removeAllListeners() {} }; };
          export const View = 'View';
          export default {};
        `;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [reactNativeStub()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
    // Suppress unhandled errors in teardown phase (Vitest jsdom bug workaround)
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
