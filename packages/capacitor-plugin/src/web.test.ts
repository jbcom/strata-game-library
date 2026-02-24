import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrataWeb } from './web.js';

describe('StrataWeb', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return device info', async () => {
    const plugin = new StrataWeb();
    const info = await plugin.getDeviceInfo();
    expect(info).toHaveProperty('isMobile');
    expect(info.platform).toBe('web');
  });

  it('should handle haptics', async () => {
    const plugin = new StrataWeb();
    const vibrateSpy = vi.fn();
    global.navigator.vibrate = vibrateSpy;

    await plugin.haptics({ type: 'impact', style: 'heavy' });
    expect(vibrateSpy).toHaveBeenCalledWith(50);

    await plugin.haptics({ type: 'selection' });
    expect(vibrateSpy).toHaveBeenCalledWith(10);
  });

  it('should return default safe area insets', async () => {
    const plugin = new StrataWeb();
    const insets = await plugin.getSafeAreaInsets();
    expect(insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});
