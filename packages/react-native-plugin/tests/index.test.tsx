import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  NativeModules: {
    StrataModule: {
      getDeviceProfile: vi.fn().mockResolvedValue({
        deviceType: 'mobile',
        platform: 'ios',
        safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
        performanceMode: 'high',
      }),
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

import { useDevice } from '../src/index';

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
});
