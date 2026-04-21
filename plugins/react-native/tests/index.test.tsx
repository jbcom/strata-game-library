import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const nativeMocks = vi.hoisted(() => ({
  getDeviceProfile: vi.fn().mockResolvedValue({
    deviceType: 'mobile',
    platform: 'ios',
    inputMode: 'gamepad',
    orientation: 'portrait',
    hasGamepad: true,
    safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
    performanceMode: 'high',
  }),
  getInputSnapshot: vi.fn().mockResolvedValue({
    timestamp: 1000,
    leftStick: { x: 0.25, y: -0.5 },
    rightStick: { x: 0.1, y: 0.2 },
    buttons: { a: true, b: false },
    triggers: { left: 0.3, right: 0.7 },
    connectedGamepads: [{ index: 0, id: 'MFi Controller' }],
  }),
}));

vi.mock('react-native', () => ({
  NativeModules: {
    StrataModule: {
      getDeviceProfile: nativeMocks.getDeviceProfile,
      getInputSnapshot: nativeMocks.getInputSnapshot,
    },
    StrataReactNativePlugin: {
      getDeviceInfo: vi.fn(),
      getSafeAreaInsets: vi.fn(),
      getPerformanceMode: vi.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    select: vi.fn((obj: Record<string, unknown>) => obj.ios),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 390, height: 844 })),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  PixelRatio: {
    get: vi.fn(() => 3),
  },
  NativeEventEmitter: vi.fn().mockImplementation(() => ({
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
  View: 'View',
}));

import { useDevice, useInput } from '../src/index';

describe('useDevice', () => {
  it('should return initial device profile', () => {
    const { result } = renderHook(() => useDevice());

    // Initial state
    expect(result.current.platform).toBe('ios');
    expect(result.current.hasTouch).toBe(true);
    expect(result.current.screenWidth).toBe(390);
    expect(result.current.screenHeight).toBe(844);
    expect(result.current.pixelRatio).toBe(3);
  });

  it('should merge native gamepad capabilities into the device profile', async () => {
    const { result } = renderHook(() => useDevice());

    await waitFor(() => {
      expect(result.current.inputMode).toBe('gamepad');
    });

    expect(result.current.hasGamepad).toBe(true);
    expect(result.current.safeAreaInsets.top).toBe(47);
    expect(nativeMocks.getDeviceProfile).toHaveBeenCalled();
  });
});

describe('useInput', () => {
  it('should poll native gamepad snapshots when available', async () => {
    const { result, unmount } = renderHook(() => useInput());

    await waitFor(() => {
      expect(result.current.buttons.a).toBe(true);
    });

    expect(result.current.leftStick).toEqual({ x: 0.25, y: -0.5 });
    expect(result.current.triggers.right).toBe(0.7);
    expect(result.current.connectedGamepads).toEqual([{ index: 0, id: 'MFi Controller' }]);
    expect(nativeMocks.getInputSnapshot).toHaveBeenCalled();

    unmount();
  });
});
