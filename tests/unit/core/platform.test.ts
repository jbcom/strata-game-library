/**
 * Platform Detection Unit Tests
 *
 * Tests for platform detection, capability detection, and adapter selection.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    detectPlatform,
    detectCapabilities,
    isWeb,
    isCapacitor,
    isNative,
    resetPlatformCache,
    selectAdapter,
    type AdapterMap,
    type Platform,
    type PlatformCapabilities,
} from '../../../src/core/shared/platform';

describe('Platform Detection', () => {
    beforeEach(() => {
        resetPlatformCache();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('detectPlatform', () => {
        it('detects web platform in browser environment', () => {
            expect(detectPlatform()).toBe('web');
        });

        it('caches platform detection result', () => {
            const first = detectPlatform();
            const second = detectPlatform();
            expect(first).toBe(second);
            expect(first).toBe('web');
        });

        it('resetPlatformCache clears cached values', () => {
            const first = detectPlatform();
            resetPlatformCache();
            const second = detectPlatform();
            // Both should still be 'web' in browser environment
            expect(first).toBe('web');
            expect(second).toBe('web');
        });
    });

        it('detects capacitor when Capacitor.isNativePlatform returns true', () => {
            resetPlatformCache();
            
            // Mock Capacitor environment
            const mockCapacitor = { isNativePlatform: () => true };
            const originalWindow = global.window;
            
            // @ts-ignore - Mocking window for test
            global.window = { ...window, Capacitor: mockCapacitor };
            
            expect(detectPlatform()).toBe('capacitor');
            
            // Restore original window
            global.window = originalWindow;
        });

        it('detects React Native via HermesInternal in SSR environment', () => {
            resetPlatformCache();
            
            // Mock SSR with React Native globals
            const originalWindow = global.window;
            const originalGlobalThis = global.globalThis;
            
            // @ts-ignore - Mocking for test
            delete global.window;
            // @ts-ignore - Mocking for test
            global.globalThis = { 
                ...globalThis,
                HermesInternal: {} 
            };
            
            expect(detectPlatform()).toBe('native');
            
            // Restore globals
            global.window = originalWindow;
            global.globalThis = originalGlobalThis;
        });

        it('detects React Native via __REACT_NATIVE__ global', () => {
            resetPlatformCache();
            
            const originalWindow = global.window;
            const originalGlobalThis = global.globalThis;
            
            // @ts-ignore - Mocking for test
            delete global.window;
            // @ts-ignore - Mocking for test
            global.globalThis = { 
                ...globalThis,
                __REACT_NATIVE__: true 
            };
            
            expect(detectPlatform()).toBe('native');
            
            // Restore globals
            global.window = originalWindow;
            global.globalThis = originalGlobalThis;
        });

        it('detects React Native via nativeModuleProxy', () => {
            resetPlatformCache();
            
            const originalWindow = global.window;
            const originalGlobalThis = global.globalThis;
            
            // @ts-ignore - Mocking for test
            delete global.window;
            // @ts-ignore - Mocking for test
            global.globalThis = { 
                ...globalThis,
                nativeModuleProxy: {} 
            };
            
            expect(detectPlatform()).toBe('native');
            
            // Restore globals
            global.window = originalWindow;
            global.globalThis = originalGlobalThis;
        });

        it('defaults to web for SSR without React Native globals', () => {
            resetPlatformCache();
            
            const originalWindow = global.window;
            
            // @ts-ignore - Mocking SSR environment
            delete global.window;
            
            expect(detectPlatform()).toBe('web');
            
            // Restore window
            global.window = originalWindow;
        });

        it('falls back to web when Capacitor.isNativePlatform returns false', () => {
            resetPlatformCache();
            
            const mockCapacitor = { isNativePlatform: () => false };
            const originalWindow = global.window;
            
            // @ts-ignore - Mocking window for test
            global.window = { ...window, Capacitor: mockCapacitor };
            
            expect(detectPlatform()).toBe('web');
            
            // Restore original window
            global.window = originalWindow;
        });

    describe('helper functions', () => {
        it('isWeb returns true in browser environment', () => {
            expect(isWeb()).toBe(true);
        });

        it('isCapacitor returns false without Capacitor', () => {
            expect(isCapacitor()).toBe(false);
        });

        it('isNative returns false in browser environment', () => {
            expect(isNative()).toBe(false);
        });
    });

    describe('detectCapabilities', () => {
        it('returns capability object with expected properties', () => {
            const caps = detectCapabilities();

            expect(caps).toHaveProperty('hasWebGL');
            expect(caps).toHaveProperty('hasWebAudio');
            expect(caps).toHaveProperty('hasLocalStorage');
            expect(caps).toHaveProperty('hasHaptics');
            expect(caps).toHaveProperty('hasTouchInput');
            expect(caps).toHaveProperty('hasDeviceMotion');
        });

        it('caches capabilities detection result', () => {
            const first = detectCapabilities();
            const second = detectCapabilities();
            expect(first).toBe(second);
        });

        it('returns boolean values for all capabilities', () => {
            const caps = detectCapabilities();

            expect(typeof caps.hasWebGL).toBe('boolean');
            expect(typeof caps.hasWebAudio).toBe('boolean');
            expect(typeof caps.hasLocalStorage).toBe('boolean');
            expect(typeof caps.hasHaptics).toBe('boolean');
            expect(typeof caps.hasTouchInput).toBe('boolean');
            expect(typeof caps.hasDeviceMotion).toBe('boolean');
        });
    });

        it('returns all false capabilities in SSR environment', () => {
            resetPlatformCache();
            
            const originalWindow = global.window;
            const originalDocument = global.document;
            
            // @ts-ignore - Mocking SSR environment
            delete global.window;
            // @ts-ignore - Mocking SSR environment  
            delete global.document;
            
            const caps = detectCapabilities();
            
            expect(caps.hasWebGL).toBe(false);
            expect(caps.hasWebAudio).toBe(false);
            expect(caps.hasLocalStorage).toBe(false);
            expect(caps.hasHaptics).toBe(false);
            expect(caps.hasTouchInput).toBe(false);
            expect(caps.hasDeviceMotion).toBe(false);
            
            // Restore globals
            global.window = originalWindow;
            global.document = originalDocument;
        });

        it('handles localStorage SecurityError gracefully', () => {
            resetPlatformCache();
            
            // Mock localStorage that throws on access
            const originalLocalStorage = window.localStorage;
            Object.defineProperty(window, 'localStorage', {
                get: () => { throw new Error('SecurityError'); }
            });
            
            const caps = detectCapabilities();
            expect(caps.hasLocalStorage).toBe(false);
            
            // Restore localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true
            });
        });

    describe('selectAdapter', () => {
        it('returns web adapter for web platform', () => {
            const adapters: AdapterMap<string> = { web: 'webAdapter' };
            const result = selectAdapter(adapters, 'web');
            expect(result).toBe('webAdapter');
        });

        it('returns capacitor adapter when available', () => {
            const adapters: AdapterMap<string> = {
                web: 'webAdapter',
                capacitor: 'capacitorAdapter',
            };
            const result = selectAdapter(adapters, 'capacitor');
            expect(result).toBe('capacitorAdapter');
        });

        it('falls back to web adapter for capacitor when capacitor adapter missing', () => {
            const adapters: AdapterMap<string> = { web: 'webAdapter' };
            const result = selectAdapter(adapters, 'capacitor');
            expect(result).toBe('webAdapter');
        });

        it('returns native adapter when available', () => {
            const adapters: AdapterMap<string> = {
                web: 'webAdapter',
                native: 'nativeAdapter',
            };
            const result = selectAdapter(adapters, 'native');
            expect(result).toBe('nativeAdapter');
        });

        it('throws error when native adapter is missing', () => {
            const adapters: AdapterMap<string> = { web: 'webAdapter' };
            expect(() => selectAdapter(adapters, 'native')).toThrow(
                'No native adapter available for this feature'
            );
        });

        it('uses detected platform when not specified', () => {
            const adapters: AdapterMap<string> = { web: 'webAdapter' };
            // In browser environment, should use web adapter
            const result = selectAdapter(adapters);
            expect(result).toBe('webAdapter');
        });

        it('works with complex adapter types', () => {
            interface Adapter {
                name: string;
                execute: () => void;
            }

            const webAdapter: Adapter = {
                name: 'web',
                execute: () => {},
            };
            const capacitorAdapter: Adapter = {
                name: 'capacitor',
                execute: () => {},
            };

            const adapters: AdapterMap<Adapter> = {
                web: webAdapter,
                capacitor: capacitorAdapter,
            };

            const result = selectAdapter(adapters, 'capacitor');
            expect(result.name).toBe('capacitor');
        });
    });

    describe('cache reset', () => {
        it('resetPlatformCache allows fresh detection', () => {
            // Get initial values
            const platform1 = detectPlatform();
            const caps1 = detectCapabilities();

            // Reset cache
            resetPlatformCache();

            // Get new values - they should be freshly computed
            const platform2 = detectPlatform();
            const caps2 = detectCapabilities();

            // Values should be equal but not the same object for capabilities
            expect(platform1).toBe(platform2);
            expect(caps1).not.toBe(caps2); // Different object references
            expect(caps1).toEqual(caps2); // But same values
        });
    });
});
