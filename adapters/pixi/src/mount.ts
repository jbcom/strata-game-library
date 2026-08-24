/**
 * @arcade-cabinet/pixi-mount — Pixi 8 Application mount/unmount lifecycle.
 *
 * Extracted from on-the-ropes' src/rendering/ring/RingRenderer.ts +
 * src/rendering/show-mode-controller.ts (the pixi-mount tournament winner),
 * with two lessons from the runners-up folded in:
 *
 *  - illinois-jim's StrictMode fresh-canvas fix: a WebGL context is bound to
 *    its canvas ELEMENT for the element's lifetime. When Pixi's
 *    `app.destroy()` tears down the GL context it loses it
 *    (`WEBGL_lose_context.loseContext()`), and `getContext('webgl2')` on
 *    that same element thereafter returns the *lost* context forever —
 *    `gl.createShader()` returns null and Pixi's
 *    `checkMaxIfStatementsInShader` throws. React StrictMode's
 *    mount→cleanup→mount cycle destroys app #1 and re-initialises app #2 on
 *    the SAME element, so #2 always boots onto a dead context. The fix is
 *    structural: omit `canvas` and let mountPixi mint a FRESH `<canvas>` per
 *    Application inside your (reusable) container — virgin context every
 *    time. (illinois-jim paintingRenderer.ts.)
 *
 *  - ONE resize pipeline (opus-review adjustment): the source game ran TWO
 *    ResizeObservers on the same canvas — the renderer's (surface resize)
 *    and the controller's (scene reflow) — which only produced
 *    resize-then-reflow ordering via implicit registration-order firing.
 *    Here a single observer drives `renderer.resize()` and THEN the
 *    caller's `onResize` hook, making the ordering an explicit contract.
 *
 * Zero framework coupling: element in, handle out. Works with React,
 * Preact, or nothing. The optional React hook lives in
 * `@arcade-cabinet/pixi-mount/react`.
 *
 * No Math.random anywhere — this module is rendering bootstrap only.
 */

import { Application } from 'pixi.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface MountOptions {
  /**
   * Provide your own canvas, or omit to let mountPixi create+own a fresh one
   * (recommended default — avoids the StrictMode WEBGL_lose_context poison
   * documented in illinois-jim's paintingRenderer.ts; see module header).
   * A provided canvas is never removed from the DOM on destroy; an owned
   * canvas always is.
   */
  canvas?: HTMLCanvasElement;
  /** If no canvas is given, the created canvas is appended here. */
  container?: HTMLElement;
  /** Pixi background color (default 0x080810 — on-the-ropes' near-black). */
  background?: number | string;
  /** Caps devicePixelRatio (default 2 — going higher wastes GPU on pixel art). */
  maxResolution?: number;
  /**
   * roundPixels + antialias:false + resolution:1 — for retro/pixel-art
   * titles (on-the-ropes' "1993 mode": snap to integer coords for chunky
   * sprites).
   */
  pixelSnap?: boolean;
  /** Auto-detects prefers-reduced-motion when omitted (on-the-ropes' detectReduceMotion). */
  reduceMotion?: boolean;
  /**
   * 'observer' (default): ONE ResizeObserver on the sizing element drives
   *   renderer.resize() then onResize — the collapsed single pipeline.
   * 'resizeTo': Pixi's built-in push-based resizeTo:element (illinois-jim /
   *   bioluminescent-sea's pattern); onResize still fires via the
   *   renderer's own 'resize' event.
   * 'manual': no automatic wiring — call handle.resize() yourself.
   */
  resizeMode?: 'observer' | 'resizeTo' | 'manual';
  /**
   * Element whose box drives sizing. Defaults to the container for an owned
   * canvas, else the canvas itself.
   */
  resizeTarget?: HTMLElement;
  /**
   * Called on every resize AFTER renderer.resize() — for scene reflow
   * (on-the-ropes' ringScene.layout() pattern; without this hook most
   * pixi mounts only resize the surface and never reflow content).
   */
  onResize?: (width: number, height: number) => void;
}

export interface PixiMountHandle {
  /** Pixi Application instance — layers/scene content are the caller's. */
  readonly app: Application;
  /** The canvas the Application renders to (owned or caller-provided). */
  readonly canvas: HTMLCanvasElement;
  /** Whether reduced-motion is honoured for this mount. */
  readonly reduceMotion: boolean;
  /** Logical canvas width (CSS pixels). */
  readonly width: number;
  /** Logical canvas height (CSS pixels). */
  readonly height: number;
  /** Manual resize — renderer.resize() then onResize, deduped. */
  resize(width: number, height: number): void;
  /**
   * Idempotent — safe to call twice; wraps app.destroy in try/catch,
   * disconnects the ResizeObserver, and removes an owned canvas from the
   * DOM (a destroyed mount's canvas must be gone — its GL context is lost
   * forever; see module header).
   */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Environment detection helpers (exported — useful to consumers directly)
// ---------------------------------------------------------------------------

/** True when the environment reports prefers-reduced-motion: reduce. */
export function detectReduceMotion(): boolean {
  if (typeof globalThis === 'undefined') return false;
  const win = (globalThis as { matchMedia?: (q: string) => { matches: boolean } }).matchMedia;
  if (typeof win !== 'function') return false;
  try {
    return win('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** devicePixelRatio clamped to [1, maxResolution] (default cap 2). */
export function getDpr(maxResolution = 2): number {
  if (typeof globalThis === 'undefined') return 1;
  const dpr = (globalThis as { devicePixelRatio?: number }).devicePixelRatio;
  if (typeof dpr !== 'number' || !Number.isFinite(dpr) || dpr <= 0) return 1;
  return Math.min(dpr, maxResolution);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

/**
 * Pixi 8's Renderer is an EventEmitter that emits 'resize' after every
 * renderer.resize() (including resizeTo-driven ones). Typed locally so the
 * subscription survives minor upstream event-map typing churn.
 */
interface ResizeEmitter {
  on(event: 'resize', fn: (width: number, height: number) => void): unknown;
  off(event: 'resize', fn: (width: number, height: number) => void): unknown;
}

function measure(el: HTMLElement, fallbackW: number, fallbackH: number): [number, number] {
  const w = el.clientWidth || (el instanceof HTMLCanvasElement ? el.width : 0) || fallbackW;
  const h = el.clientHeight || (el instanceof HTMLCanvasElement ? el.height : 0) || fallbackH;
  return [w, h];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise a Pixi 8 Application with the arcade-cabinet mount contract.
 *
 * Pixi 8 requires `await app.init(...)`. The returned handle is fully usable
 * once this Promise resolves.
 */
export async function mountPixi(options: MountOptions = {}): Promise<PixiMountHandle> {
  const {
    canvas: providedCanvas,
    container,
    background = 0x080810,
    maxResolution = 2,
    pixelSnap = false,
    resizeMode = 'observer',
    resizeTarget,
    onResize,
  } = options;
  const reduceMotion = options.reduceMotion ?? detectReduceMotion();

  // Fresh-canvas default (illinois-jim's StrictMode fix — see module header).
  const ownsCanvas = providedCanvas === undefined;
  const canvas = providedCanvas ?? document.createElement('canvas');
  if (ownsCanvas) {
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container?.appendChild(canvas);
  }

  // The element whose CSS box is authoritative for logical size. For an
  // owned canvas that's the container (autoDensity rewrites the canvas'
  // own style size in px after each resize, so the canvas can't be its own
  // sizing reference); for a provided canvas it's the canvas itself
  // (on-the-ropes' original contract).
  const sizingEl = resizeTarget ?? (ownsCanvas ? (container ?? canvas) : canvas);
  const [initialW, initialH] = measure(sizingEl, 800, 450);

  const app = new Application();
  await app.init({
    canvas,
    width: initialW,
    height: initialH,
    background,
    antialias: !pixelSnap,
    resolution: pixelSnap ? 1 : getDpr(maxResolution),
    autoDensity: true,
    // Snap to integer coords for crisp pixel-art rendering.
    roundPixels: pixelSnap,
    ...(resizeMode === 'resizeTo' ? { resizeTo: sizingEl } : {}),
  });

  let currentW = initialW;
  let currentH = initialH;
  let destroyed = false;

  // ---- The single resize pipeline ----
  // Every path (observer, resizeTo, manual) funnels through
  // renderer.resize(); the renderer's own 'resize' event then updates the
  // tracked size and fires onResize — resize-then-reflow ordering is a
  // structural guarantee, not a registration-order accident.
  const onRendererResize = (width: number, height: number): void => {
    currentW = width;
    currentH = height;
    onResize?.(width, height);
  };
  (app.renderer as unknown as ResizeEmitter).on('resize', onRendererResize);

  function resize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    if (w === currentW && h === currentH) return;
    app.renderer.resize(w, h);
  }

  // ---- ResizeObserver wiring (browser only; jsdom has none) ----
  let resizeObserver: ResizeObserver | null = null;
  if (resizeMode === 'observer') {
    const RO = (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    if (typeof RO === 'function') {
      resizeObserver = new RO((entries) => {
        for (const entry of entries) {
          resize(entry.contentRect.width, entry.contentRect.height);
        }
      });
      resizeObserver.observe(sizingEl);
    }
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    if (resizeObserver !== null) {
      try {
        resizeObserver.disconnect();
      } catch {
        /* ignore */
      }
      resizeObserver = null;
    }
    (app.renderer as unknown as ResizeEmitter).off('resize', onRendererResize);
    // Pixi 8 destroy — drop renderer + stage + children we own; textures
    // stay (they may be shared with other mounts / caches).
    try {
      app.destroy({ removeView: false }, { children: true, texture: false, textureSource: false });
    } catch {
      /* ignore — app may already be destroyed */
    }
    // An owned canvas leaves the DOM with its (now lost) GL context; the
    // container stays reusable for the next mount.
    if (ownsCanvas) canvas.remove();
  }

  return {
    app,
    canvas,
    reduceMotion,
    get width() {
      return currentW;
    },
    get height() {
      return currentH;
    },
    resize,
    destroy,
  };
}
