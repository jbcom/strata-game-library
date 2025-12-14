/**
 * Capacitor Plugin Web Implementation Tests
 *
 * Tests for the StrataWeb class that provides cross-platform
 * device profiling, input handling, and haptics for web browsers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrataWeb } from '../../../packages/capacitor-plugin/src/web';

describe('StrataWeb', () => {
    let strata: StrataWeb;

    beforeEach(() => {
        // Mock window APIs - use vi.fn() that actually calls the callback
        vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => {
            // Return an ID but don't actually run the callback to avoid infinite loops
            return 1;
        }));
        vi.stubGlobal('cancelAnimationFrame', vi.fn());

        // Mock window dimensions
        vi.stubGlobal('innerWidth', 1920);
        vi.stubGlobal('innerHeight', 1080);
        vi.stubGlobal('devicePixelRatio', 1);

        // Mock getComputedStyle for safe area insets
        vi.stubGlobal('getComputedStyle', vi.fn().mockReturnValue({
            getPropertyValue: vi.fn().mockReturnValue('0'),
        }));

        // Mock matchMedia
        vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
            matches: query.includes('portrait') ? false : query.includes('fine'),
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })));

        // Mock navigator with proper getGamepads array
        const mockGamepads: (Gamepad | null)[] = [null, null, null, null];
        vi.stubGlobal('navigator', {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            maxTouchPoints: 0,
            getGamepads: vi.fn().mockReturnValue(mockGamepads),
            vibrate: vi.fn().mockReturnValue(true),
        });

        // Mock document for event listeners
        vi.stubGlobal('document', {
            documentElement: {},
        });

        strata = new StrataWeb();
    });

    afterEach(() => {
        strata.destroy();
        vi.restoreAllMocks();
    });

    describe('getDeviceProfile', () => {
        it('returns a valid device profile', async () => {
            const profile = await strata.getDeviceProfile();

            expect(profile).toHaveProperty('deviceType');
            expect(profile).toHaveProperty('platform');
            expect(profile).toHaveProperty('inputMode');
            expect(profile).toHaveProperty('orientation');
            expect(profile).toHaveProperty('hasTouch');
            expect(profile).toHaveProperty('hasPointer');
            expect(profile).toHaveProperty('hasGamepad');
            expect(profile).toHaveProperty('screenWidth');
            expect(profile).toHaveProperty('screenHeight');
            expect(profile).toHaveProperty('pixelRatio');
            expect(profile).toHaveProperty('safeAreaInsets');
        });

        it('detects desktop on large screens without touch', async () => {
            vi.stubGlobal('innerWidth', 1920);
            vi.stubGlobal('innerHeight', 1080);

            const profile = await strata.getDeviceProfile();
            expect(profile.deviceType).toBe('desktop');
            expect(profile.isDesktop).toBe(true);
        });

        it('detects mobile on small screens', async () => {
            vi.stubGlobal('innerWidth', 375);
            vi.stubGlobal('innerHeight', 812);
            vi.stubGlobal('navigator', {
                ...navigator,
                maxTouchPoints: 5,
            });

            const profile = await strata.getDeviceProfile();
            expect(profile.deviceType).toBe('mobile');
            expect(profile.isMobile).toBe(true);
        });

        it('detects windows platform from user agent', async () => {
            const profile = await strata.getDeviceProfile();
            expect(profile.platform).toBe('windows');
        });

        it('returns keyboard input mode without gamepad or touch', async () => {
            const profile = await strata.getDeviceProfile();
            expect(profile.inputMode).toBe('keyboard');
        });

        it('returns safe area insets object', async () => {
            const profile = await strata.getDeviceProfile();
            expect(profile.safeAreaInsets).toHaveProperty('top');
            expect(profile.safeAreaInsets).toHaveProperty('right');
            expect(profile.safeAreaInsets).toHaveProperty('bottom');
            expect(profile.safeAreaInsets).toHaveProperty('left');
        });
    });

    describe('getControlHints', () => {
        it('returns keyboard hints by default', async () => {
            const hints = await strata.getControlHints();

            expect(hints.movement).toContain('WASD');
            expect(hints.action).toContain('Click');
            expect(hints.camera).toContain('Mouse');
        });
    });

    describe('getInputSnapshot', () => {
        it('returns a valid input snapshot', async () => {
            const snapshot = await strata.getInputSnapshot();

            expect(snapshot).toHaveProperty('timestamp');
            expect(snapshot).toHaveProperty('leftStick');
            expect(snapshot).toHaveProperty('rightStick');
            expect(snapshot).toHaveProperty('buttons');
            expect(snapshot).toHaveProperty('triggers');
            expect(snapshot).toHaveProperty('touches');
        });

        it('has default zero values for sticks', async () => {
            const snapshot = await strata.getInputSnapshot();

            expect(snapshot.leftStick.x).toBe(0);
            expect(snapshot.leftStick.y).toBe(0);
            expect(snapshot.rightStick.x).toBe(0);
            expect(snapshot.rightStick.y).toBe(0);
        });

        it('has default false for standard buttons', async () => {
            const snapshot = await strata.getInputSnapshot();

            expect(snapshot.buttons['jump']).toBe(false);
            expect(snapshot.buttons['action']).toBe(false);
            expect(snapshot.buttons['cancel']).toBe(false);
        });

        it('returns empty touches array by default', async () => {
            const snapshot = await strata.getInputSnapshot();
            expect(snapshot.touches).toEqual([]);
        });

        it('uses nullish coalescing for gamepad button states', async () => {
            // Mock gamepad with undefined button
            const mockGamepad = {
                axes: [0, 0, 0, 0],
                buttons: [
                    undefined, // button 0 undefined
                    { pressed: true, value: 1 },
                    { pressed: false, value: 0 },
                ],
            };

            vi.stubGlobal('navigator', {
                ...navigator,
                getGamepads: vi.fn().mockReturnValue([mockGamepad]),
            });

            const freshStrata = new StrataWeb();
            const snapshot = await freshStrata.getInputSnapshot();

            // Should be false, not undefined
            expect(snapshot.buttons['jump']).toBe(false);
            freshStrata.destroy();
        });
    });

    describe('setInputMapping', () => {
        it('allows custom input mapping', async () => {
            await strata.setInputMapping({
                jump: ['KeySpace', 'KeyJ'],
            });

            // No error thrown means success
            expect(true).toBe(true);
        });
    });

    describe('triggerHaptics', () => {
        it('calls navigator.vibrate with duration', async () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate');

            await strata.triggerHaptics({ intensity: 'medium', duration: 100 });

            expect(vibrateSpy).toHaveBeenCalledWith(100);
        });

        it('maps intensity to default durations', async () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate');

            await strata.triggerHaptics({ intensity: 'light' });
            expect(vibrateSpy).toHaveBeenCalledWith(10);

            await strata.triggerHaptics({ intensity: 'heavy' });
            expect(vibrateSpy).toHaveBeenCalledWith(50);
        });

        it('supports pattern-based haptics', async () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate');

            await strata.triggerHaptics({ pattern: [100, 50, 100] });

            expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100]);
        });

        it('supports customIntensity parameter', async () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate');

            // customIntensity < 0.33 should map to light (10ms)
            await strata.triggerHaptics({ customIntensity: 0.1 });
            expect(vibrateSpy).toHaveBeenLastCalledWith(10);

            // customIntensity >= 0.66 should map to heavy (50ms)
            await strata.triggerHaptics({ customIntensity: 0.9 });
            expect(vibrateSpy).toHaveBeenLastCalledWith(50);
        });

        it('clamps customIntensity to 0-1 range', async () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate');

            // Values outside range should be clamped
            await strata.triggerHaptics({ customIntensity: -0.5 });
            expect(vibrateSpy).toHaveBeenLastCalledWith(10); // light

            await strata.triggerHaptics({ customIntensity: 1.5 });
            expect(vibrateSpy).toHaveBeenLastCalledWith(50); // heavy
        });
    });

    describe('addListener', () => {
        it('returns a remove function for deviceChange', async () => {
            const callback = vi.fn();
            const handle = await strata.addListener('deviceChange', callback);

            expect(handle).toHaveProperty('remove');
            expect(typeof handle.remove).toBe('function');
        });

        it('returns a remove function for inputChange', async () => {
            const callback = vi.fn();
            const handle = await strata.addListener('inputChange', callback);

            expect(handle).toHaveProperty('remove');
            expect(typeof handle.remove).toBe('function');
        });

        it('returns a remove function for gamepadConnected', async () => {
            const callback = vi.fn();
            const handle = await strata.addListener('gamepadConnected', callback);

            expect(handle).toHaveProperty('remove');
            expect(typeof handle.remove).toBe('function');
        });

        it('returns a remove function for gamepadDisconnected', async () => {
            const callback = vi.fn();
            const handle = await strata.addListener('gamepadDisconnected', callback);

            expect(handle).toHaveProperty('remove');
            expect(typeof handle.remove).toBe('function');
        });

        it('remove function cleans up listener', async () => {
            const callback = vi.fn();
            const handle = await strata.addListener('deviceChange', callback);

            await handle.remove();

            // No error means successful cleanup
            expect(true).toBe(true);
        });
    });

    describe('destroy', () => {
        it('cleans up resources without error', () => {
            expect(() => strata.destroy()).not.toThrow();
        });

        it('can be called multiple times safely', () => {
            strata.destroy();
            expect(() => strata.destroy()).not.toThrow();
        });
    });

    describe('multi-controller support', () => {
        it('selectController returns success', async () => {
            const result = await strata.selectController({ index: 0 });

            expect(result.success).toBe(true);
            expect(result.selectedIndex).toBe(0);
        });

        it('getConnectedControllers returns array', async () => {
            const result = await strata.getConnectedControllers();

            expect(result).toHaveProperty('controllers');
            expect(result).toHaveProperty('selectedIndex');
            expect(Array.isArray(result.controllers)).toBe(true);
        });
    });
});
