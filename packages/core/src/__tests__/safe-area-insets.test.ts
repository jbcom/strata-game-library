import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSafeAreaInsets, resetSafeAreaCache } from '../core/safe-area-insets';

afterEach(() => {
  resetSafeAreaCache();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getSafeAreaInsets', () => {
  it('returns zeros where there is no DOM, rather than throwing', () => {
    // Server-side rendering has no document; the caller should still get a
    // usable value instead of an exception.
    vi.stubGlobal('document', undefined);
    expect(getSafeAreaInsets()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('reads the resolved env() paddings from the probe', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '44px',
      paddingRight: '0px',
      paddingBottom: '34px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    // An iPhone-shaped result: notch on top, home indicator at the bottom.
    expect(getSafeAreaInsets()).toEqual({ top: 44, right: 0, bottom: 34, left: 0 });
  });

  it('resolves to zero on platforms with no insets', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    expect(getSafeAreaInsets()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('falls back to zero when a padding is unparseable', () => {
    // env() unsupported can yield an empty string; parseFloat gives NaN, and a
    // NaN inset would silently corrupt every layout that adds it.
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '',
      paddingRight: 'auto',
      paddingBottom: '20px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    const insets = getSafeAreaInsets();
    expect(insets.top).toBe(0);
    expect(insets.right).toBe(0);
    expect(insets.bottom).toBe(20);
    expect(Object.values(insets).every(Number.isFinite)).toBe(true);
  });

  it('caches after the first read', () => {
    const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '10px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    getSafeAreaInsets();
    getSafeAreaInsets();
    getSafeAreaInsets();
    // Insets only change on rotation, so re-probing per call would be waste.
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('re-reads after the cache is reset, so rotation is supported', () => {
    const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '10px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    getSafeAreaInsets();
    resetSafeAreaCache();
    getSafeAreaInsets();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('leaves no probe element behind in the document', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingTop: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
    } as unknown as CSSStyleDeclaration);

    const before = document.body.childElementCount;
    getSafeAreaInsets();
    // A probe that is appended but never removed leaks a node per call.
    expect(document.body.childElementCount).toBe(before);
  });
});
