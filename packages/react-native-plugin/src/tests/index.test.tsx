import { renderHook } from '@testing-library/react-hooks/native';
import { useDevice } from '../index';

jest.mock('react-native', () => ({
  NativeModules: {
    StrataModule: {
      getDeviceProfile: jest.fn().mockResolvedValue({
        deviceType: 'mobile',
        platform: 'ios',
        safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
        performanceMode: 'high',
      }),
    },
    StrataReactNativePlugin: {
      getDeviceInfo: jest.fn(),
      getSafeAreaInsets: jest.fn(),
      getPerformanceMode: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: Record<string, unknown>) => obj.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  PixelRatio: {
    get: jest.fn(() => 3),
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
}));

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
