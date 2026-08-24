/**
 * tests/mount.test.ts — mountPixi core lifecycle.
 *
 * Canvas ownership, init option mapping (pixelSnap, DPR cap, background),
 * reduced-motion detection, the collapsed single-observer resize pipeline
 * (renderer.resize THEN onResize as a structural guarantee), resizeTo /
 * manual modes, and idempotent destroy.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __mockState, FakeResizeObserver, pixiMock } from './_pixi-mock';

vi.mock('pixi.js', () => pixiMock());

import { detectReduceMotion, getDpr, mountPixi } from '../src/index';

function makeCanvas(w = 800, h = 450): HTMLCanvasElement {
  const c = document.createElement('canvas');
  Object.defineProperty(c, 'clientWidth', { value: w, configurable: true });
  Object.defineProperty(c, 'clientHeight', { value: h, configurable: true });
  return c;
}

function makeContainer(w = 640, h = 360): HTMLDivElement {
  const d = document.createElement('div');
  Object.defineProperty(d, 'clientWidth', { value: w, configurable: true });
  Object.defineProperty(d, 'clientHeight', { value: h, configurable: true });
  document.body.appendChild(d);
  return d;
}

beforeEach(() => {
  __mockState.reset();
  FakeResizeObserver.reset();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('canvas ownership', () => {
  it('creates + appends a fresh canvas when none is provided', async () => {
    const container = makeContainer(640, 360);
    const handle = await mountPixi({ container });
    expect(handle.canvas.parentElement).toBe(container);
    expect(handle.width).toBe(640);
    expect(handle.height).toBe(360);
    handle.destroy();
  });

  it('destroy removes an owned canvas from the DOM (lost-context hygiene)', async () => {
    const container = makeContainer();
    const handle = await mountPixi({ container });
    const canvas = handle.canvas;
    handle.destroy();
    expect(canvas.parentElement).toBeNull();
    expect(container.isConnected).toBe(true);
  });

  it('uses a provided canvas and never removes it on destroy', async () => {
    const container = makeContainer();
    const canvas = makeCanvas(320, 180);
    container.appendChild(canvas);
    const handle = await mountPixi({ canvas });
    expect(handle.canvas).toBe(canvas);
    expect(handle.width).toBe(320);
    expect(handle.height).toBe(180);
    handle.destroy();
    expect(canvas.parentElement).toBe(container);
  });
});

describe('init option mapping', () => {
  it('defaults: antialias on, DPR-capped resolution, no roundPixels', async () => {
    vi.stubGlobal('devicePixelRatio', 3);
    const handle = await mountPixi({ canvas: makeCanvas() });
    const opts = __mockState.apps[0]?.initOptions;
    expect(opts?.antialias).toBe(true);
    expect(opts?.resolution).toBe(2); // capped at default maxResolution 2
    expect(opts?.roundPixels).toBe(false);
    expect(opts?.autoDensity).toBe(true);
    expect(opts?.background).toBe(0x080810);
    handle.destroy();
  });

  it('pixelSnap: antialias off, resolution pinned to 1, roundPixels on', async () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const handle = await mountPixi({ canvas: makeCanvas(), pixelSnap: true });
    const opts = __mockState.apps[0]?.initOptions;
    expect(opts?.antialias).toBe(false);
    expect(opts?.resolution).toBe(1);
    expect(opts?.roundPixels).toBe(true);
    handle.destroy();
  });

  it('maxResolution raises the DPR cap', async () => {
    vi.stubGlobal('devicePixelRatio', 3);
    const handle = await mountPixi({ canvas: makeCanvas(), maxResolution: 3 });
    expect(__mockState.apps[0]?.initOptions?.resolution).toBe(3);
    handle.destroy();
  });

  it('background is forwarded', async () => {
    const handle = await mountPixi({ canvas: makeCanvas(), background: 0x123456 });
    expect(__mockState.apps[0]?.initOptions?.background).toBe(0x123456);
    handle.destroy();
  });
});

describe('reduced motion', () => {
  it('auto-detects prefers-reduced-motion via matchMedia', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q }));
    expect(detectReduceMotion()).toBe(true);
    const handle = await mountPixi({ canvas: makeCanvas() });
    expect(handle.reduceMotion).toBe(true);
    handle.destroy();
  });

  it('explicit reduceMotion: false overrides matchMedia', async () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: true, media: q }));
    const handle = await mountPixi({ canvas: makeCanvas(), reduceMotion: false });
    expect(handle.reduceMotion).toBe(false);
    handle.destroy();
  });
});

describe('getDpr', () => {
  it('clamps devicePixelRatio to maxResolution and floors bad values to 1', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    expect(getDpr()).toBe(2);
    expect(getDpr(3)).toBe(3);
    vi.stubGlobal('devicePixelRatio', Number.NaN);
    expect(getDpr()).toBe(1);
    vi.stubGlobal('devicePixelRatio', -1);
    expect(getDpr()).toBe(1);
  });
});

describe('the collapsed resize pipeline (observer mode)', () => {
  it('mounts exactly ONE ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const handle = await mountPixi({ canvas: makeCanvas() });
    expect(FakeResizeObserver.instances.length).toBe(1);
    handle.destroy();
  });

  it('observer firing drives renderer.resize THEN onResize with the same dims', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const order: string[] = [];
    const onResize = vi.fn((w: number, h: number) => {
      order.push(`onResize:${w}x${h}`);
      // renderer.resize must have already happened (structural ordering)
      expect(__mockState.apps[0]?.resizeCalls.at(-1)).toEqual([w, h]);
    });
    const handle = await mountPixi({ canvas: makeCanvas(800, 450), onResize });
    FakeResizeObserver.instances[0]?.fire(1024, 600);
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(1024, 600);
    expect(order).toEqual(['onResize:1024x600']);
    expect(handle.width).toBe(1024);
    expect(handle.height).toBe(600);
    handle.destroy();
  });

  it('observes the provided canvas; owned canvases observe the container', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const canvas = makeCanvas();
    const h1 = await mountPixi({ canvas });
    expect(FakeResizeObserver.instances[0]?.observed).toEqual([canvas]);
    h1.destroy();
    const container = makeContainer();
    const h2 = await mountPixi({ container });
    expect(FakeResizeObserver.instances[1]?.observed).toEqual([container]);
    h2.destroy();
  });

  it('dedupes same-dimension resizes (no renderer churn, no reflow)', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const onResize = vi.fn();
    const handle = await mountPixi({ canvas: makeCanvas(800, 450), onResize });
    FakeResizeObserver.instances[0]?.fire(800, 450);
    expect(__mockState.apps[0]?.resizeCalls.length).toBe(0);
    expect(onResize).not.toHaveBeenCalled();
    handle.destroy();
  });

  it('manual resize() goes through the same pipeline', async () => {
    const onResize = vi.fn();
    const handle = await mountPixi({ canvas: makeCanvas(800, 450), onResize });
    handle.resize(1024, 600);
    expect(__mockState.apps[0]?.resizeCalls).toEqual([[1024, 600]]);
    expect(onResize).toHaveBeenCalledExactlyOnceWith(1024, 600);
    expect(handle.width).toBe(1024);
    handle.resize(1024, 600); // dedupe
    expect(onResize).toHaveBeenCalledTimes(1);
    handle.destroy();
  });

  it('floors fractional sizes and clamps to >= 1', async () => {
    const handle = await mountPixi({ canvas: makeCanvas(800, 450) });
    handle.resize(1023.7, 0);
    expect(__mockState.apps[0]?.resizeCalls.at(-1)).toEqual([1023, 1]);
    handle.destroy();
  });

  it('gracefully skips observer wiring when ResizeObserver is absent (jsdom)', async () => {
    const handle = await mountPixi({ canvas: makeCanvas() });
    expect(FakeResizeObserver.instances.length).toBe(0);
    handle.resize(100, 100); // manual path still works
    expect(handle.width).toBe(100);
    handle.destroy();
  });
});

describe('resizeTo + manual modes', () => {
  it("resizeTo mode forwards the sizing element to Pixi's resizeTo and mounts no observer", async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const container = makeContainer();
    const handle = await mountPixi({ container, resizeMode: 'resizeTo' });
    expect(__mockState.apps[0]?.initOptions?.resizeTo).toBe(container);
    expect(FakeResizeObserver.instances.length).toBe(0);
    handle.destroy();
  });

  it("resizeTo mode still fires onResize via the renderer's own resize event", async () => {
    const onResize = vi.fn();
    const canvas = makeCanvas(800, 450);
    const handle = await mountPixi({ canvas, resizeMode: 'resizeTo', onResize });
    // Simulate Pixi's internal resizeTo-driven resize.
    handle.app.renderer.resize(500, 300);
    expect(onResize).toHaveBeenCalledExactlyOnceWith(500, 300);
    expect(handle.width).toBe(500);
    expect(handle.height).toBe(300);
    handle.destroy();
  });

  it('manual mode mounts no observer', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const handle = await mountPixi({ canvas: makeCanvas(), resizeMode: 'manual' });
    expect(FakeResizeObserver.instances.length).toBe(0);
    handle.destroy();
  });

  it('resizeTarget overrides the observed element', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const target = makeContainer(1000, 500);
    const handle = await mountPixi({ canvas: makeCanvas(), resizeTarget: target });
    expect(FakeResizeObserver.instances[0]?.observed).toEqual([target]);
    expect(handle.width).toBe(1000);
    expect(handle.height).toBe(500);
    handle.destroy();
  });
});

describe('destroy', () => {
  it('disconnects the observer, detaches the resize listener, destroys the app', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const handle = await mountPixi({ canvas: makeCanvas() });
    const app = __mockState.apps[0];
    expect(app?.resizeListenerCount).toBe(1);
    handle.destroy();
    expect(FakeResizeObserver.instances[0]?.disconnected).toBe(true);
    expect(app?.resizeListenerCount).toBe(0);
    expect(app?.destroyed).toBe(true);
  });

  it('is idempotent — a second destroy() is a safe no-op', async () => {
    const handle = await mountPixi({ canvas: makeCanvas() });
    handle.destroy();
    expect(() => handle.destroy()).not.toThrow();
    expect(__mockState.apps[0]?.destroyed).toBe(true);
  });

  it('mount → destroy cycles leak no live Pixi apps (memory hygiene)', async () => {
    for (let i = 0; i < 3; i++) {
      const h = await mountPixi({ canvas: makeCanvas() });
      h.destroy();
    }
    expect(__mockState.apps.length).toBe(3);
    expect(__mockState.apps.every((a) => a.destroyed)).toBe(true);
  });
});
