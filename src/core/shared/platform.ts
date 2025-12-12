/**
 * Platform Detection & Adapter Management
 *
 * Provides utilities for detecting the current platform and managing
 * platform-specific adapters for cross-platform compatibility.
 *
 * @module core/shared/platform
 */

// Type definitions for better type safety
interface CapacitorWindow {
    Capacitor?: {
        isNativePlatform?: () => boolean;
        Plugins?: Record<string, unknown>;
    };
}

interface BrowserWindow {
    AudioContext?: unknown;
    webkitAudioContext?: unknown;
    DeviceMotionEvent?: unknown;
}

declare const HermesInternal: unknown;

export type Platform = 'web' | 'capacitor' | 'native';

export interface PlatformCapabilities {
    hasWebGL: boolean;
    hasWebAudio: boolean;
    hasLocalStorage: boolean;
    hasHaptics: boolean;
    hasTouchInput: boolean;
    hasDeviceMotion: boolean;
}

let cachedPlatform: Platform | null = null;
let cachedCapabilities: PlatformCapabilities | null = null;

export function detectPlatform(): Platform {
    if (cachedPlatform) return cachedPlatform;

    // Server-side rendering or non-browser environment
    if (typeof window === 'undefined') {
        // Check for React Native environment via globalThis navigator
        const globalNav = (globalThis as unknown as { navigator?: { product?: string } }).navigator;
        // Use multiple React Native detection methods since navigator.product is deprecated
        if (globalNav?.product === 'ReactNative' || 
            typeof (globalThis as any).HermesInternal !== 'undefined' ||
            typeof (globalThis as any).__REACT_NATIVE__ !== 'undefined' ||
            typeof (globalThis as any).nativeModuleProxy !== 'undefined') {
            cachedPlatform = 'native';
            return cachedPlatform;
        }
        // SSR environments should default to 'web' since they render for browsers
        cachedPlatform = 'web';
        return cachedPlatform;
    }

    // Check for React Native in browser-like environment
    if (typeof navigator !== 'undefined' && 
        (navigator.product === 'ReactNative' ||
         typeof (globalThis as any).HermesInternal !== 'undefined' ||
         typeof (globalThis as any).__REACT_NATIVE__ !== 'undefined' ||
         typeof (globalThis as any).nativeModuleProxy !== 'undefined')) {
        cachedPlatform = 'native';
        return cachedPlatform;
    }

    // Check for Capacitor
    const win = window as unknown as CapacitorWindow;
    if (win.Capacitor?.isNativePlatform?.()) {
        cachedPlatform = 'capacitor';
        return cachedPlatform;
    }

    cachedPlatform = 'web';
    return cachedPlatform;
}

/**
 * Helper to safely check localStorage availability
 * (can throw SecurityError in sandboxed iframes or strict privacy settings)
 */
function checkLocalStorage(): boolean {
    try {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
            return false;
        }
        // Test actual read/write to catch Safari private mode and sandboxed iframes
        const testKey = '__strata_ls_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

export function detectCapabilities(): PlatformCapabilities {
    if (cachedCapabilities) return cachedCapabilities;

    // Return false for all capabilities in SSR/non-browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        cachedCapabilities = {
            hasWebGL: false,
            hasWebAudio: false,
            hasLocalStorage: false,
            hasHaptics: false,
            hasTouchInput: false,
            hasDeviceMotion: false,
        };
        return cachedCapabilities;
    }

    // Browser environment - safely detect capabilities
    const win = window as unknown as BrowserWindow;

    // Check for WebGL with fallback to WebGL 1.0
    let hasWebGL = false;
    try {
        const canvas = document.createElement('canvas');
        // Help garbage collection
        canvas.width = 0;
        canvas.height = 0;
        hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        hasWebGL = false;
    }

    cachedCapabilities = {
        hasWebGL,
        hasWebAudio: !!(win.AudioContext || win.webkitAudioContext),
        hasLocalStorage: checkLocalStorage(),
        hasHaptics: typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function',
        hasTouchInput:
            'ontouchstart' in window ||
            (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0),
        hasDeviceMotion: typeof win.DeviceMotionEvent !== 'undefined',
    };

    return cachedCapabilities;
}

export function isWeb(): boolean {
    return detectPlatform() === 'web';
}

export function isCapacitor(): boolean {
    return detectPlatform() === 'capacitor';
}

export function isNative(): boolean {
    return detectPlatform() === 'native';
}

export function resetPlatformCache(): void {
    cachedPlatform = null;
    cachedCapabilities = null;
}

export interface AdapterMap<T> {
    web: T;
    capacitor?: T;
    native?: T;
}

export function selectAdapter<T>(adapters: AdapterMap<T>, platform?: Platform): T {
    const currentPlatform = platform ?? detectPlatform();

    switch (currentPlatform) {
        case 'capacitor':
            return adapters.capacitor ?? adapters.web;
        case 'native':
            if (!adapters.native) {
                throw new Error(
                    'No native adapter available for this feature. ' +
                        'React Native support is not yet implemented. ' +
                        'Please use the web or capacitor platform, or provide a native adapter via AdapterMap.'
                );
            }
            return adapters.native;
        case 'web':
        default:
            return adapters.web;
    }
}
