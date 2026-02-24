/**
 * Platform Detection SSR Unit Tests
 *
 * These tests run in node environment (no window/document) to properly test
 * SSR and React Native detection without breaking Vitest's internal state.
 *
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  detectCapabilities,
  detectPlatform,
  resetPlatformCache,
} from '../../../src/core/shared/platform';

describe('Platform Detection - SSR Environment', () => {
  beforeEach(() => {
    resetPlatformCache();
    // Clean up any React Native globals from previous tests
    delete (globalThis as any).HermesInternal;
    delete (globalThis as any).__REACT_NATIVE__;
    delete (globalThis as any).nativeModuleProxy;
  });

  afterEach(() => {
    resetPlatformCache();
    // Clean up React Native globals
    delete (globalThis as any).HermesInternal;
    delete (globalThis as any).__REACT_NATIVE__;
    delete (globalThis as any).nativeModuleProxy;
  });

  describe('SSR platform detection', () => {
    it('defaults to web for SSR without React Native globals', () => {
      // In node environment, window is undefined
      expect(typeof window).toBe('undefined');
      expect(detectPlatform()).toBe('web');
    });

    it('detects React Native via HermesInternal', () => {
      // Mock Hermes engine (used by React Native)
      (globalThis as any).HermesInternal = {};

      resetPlatformCache();
      expect(detectPlatform()).toBe('native');
    });

    it('detects React Native via __REACT_NATIVE__ global', () => {
      (globalThis as any).__REACT_NATIVE__ = true;

      resetPlatformCache();
      expect(detectPlatform()).toBe('native');
    });

    it('detects React Native via nativeModuleProxy', () => {
      (globalThis as any).nativeModuleProxy = {};

      resetPlatformCache();
      expect(detectPlatform()).toBe('native');
    });
  });

  describe('SSR capability detection', () => {
    it('returns all false capabilities in SSR environment', () => {
      // In node environment, window and document are undefined
      expect(typeof window).toBe('undefined');
      expect(typeof document).toBe('undefined');

      const caps = detectCapabilities();

      expect(caps.hasWebGL).toBe(false);
      expect(caps.hasWebAudio).toBe(false);
      expect(caps.hasLocalStorage).toBe(false);
      expect(caps.hasHaptics).toBe(false);
      expect(caps.hasTouchInput).toBe(false);
      expect(caps.hasDeviceMotion).toBe(false);
    });
  });
});
