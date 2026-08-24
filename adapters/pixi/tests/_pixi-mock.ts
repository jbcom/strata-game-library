/**
 * tests/_pixi-mock.ts — package-local pixi.js mock.
 *
 * Pixi.js can't run under jsdom (no WebGL). The mock mirrors the exact
 * surface mountPixi touches — Application init/destroy, renderer
 * resize + 'resize' event emission (Pixi 8's AbstractRenderer emits
 * 'resize' with logical screen dimensions after every resize), and
 * Filter.defaultOptions for the filter-resolution fix.
 *
 * Derived from on-the-ropes' tests/rendering/_pixi-mock.ts.
 */

export interface MockAppRecord {
  canvas: HTMLCanvasElement | null;
  destroyed: boolean;
  initOptions: Record<string, unknown> | null;
  resizeCalls: Array<[number, number]>;
  resizeListenerCount: number;
  resizeTo: HTMLElement | Window | null;
  width: number;
  height: number;
}

export const __mockState = {
  apps: [] as MockAppRecord[],
  reset(): void {
    this.apps.length = 0;
  },
};

export function pixiMock(): Record<string, unknown> {
  class Container {
    public children: unknown[] = [];
    public label: string | undefined;
    addChild(child: unknown): void {
      this.children.push(child);
    }
  }

  class Application {
    public canvas: HTMLCanvasElement | null = null;
    public resizeTo: HTMLElement | Window | null = null;
    public screen = { width: 0, height: 0 };
    public stage = new Container();
    public renderer: {
      resize(w: number, h: number): void;
      on(event: string, fn: (w: number, h: number) => void): void;
      off(event: string, fn: (w: number, h: number) => void): void;
    };
    private _record: MockAppRecord = {
      canvas: null,
      destroyed: false,
      initOptions: null,
      resizeCalls: [],
      resizeListenerCount: 0,
      resizeTo: null,
      width: 0,
      height: 0,
    };
    private _resizeListeners: Array<(w: number, h: number) => void> = [];

    constructor() {
      const record = this._record;
      const listeners = this._resizeListeners;
      this.renderer = {
        resize: (w: number, h: number): void => {
          record.resizeCalls.push([w, h]);
          record.width = w;
          record.height = h;
          this.screen.width = w;
          this.screen.height = h;
          // Pixi 8: AbstractRenderer emits 'resize' after resizing.
          for (const fn of [...listeners]) fn(w, h);
        },
        on: (event: string, fn: (w: number, h: number) => void): void => {
          if (event !== 'resize') return;
          listeners.push(fn);
          record.resizeListenerCount = listeners.length;
        },
        off: (event: string, fn: (w: number, h: number) => void): void => {
          if (event !== 'resize') return;
          const idx = listeners.indexOf(fn);
          if (idx >= 0) listeners.splice(idx, 1);
          record.resizeListenerCount = listeners.length;
        },
      };
      __mockState.apps.push(this._record);
    }

    async init(opts: Record<string, unknown>): Promise<void> {
      this._record.initOptions = opts;
      this.canvas = (opts.canvas as HTMLCanvasElement | undefined) ?? null;
      this._record.canvas = this.canvas;
      this._record.width = (opts.width as number | undefined) ?? 800;
      this._record.height = (opts.height as number | undefined) ?? 450;
      this.screen.width = this._record.width;
      this.screen.height = this._record.height;
    }

    resize(): void {
      const target = this.resizeTo;
      if (target === null) return;
      const width = target instanceof Window ? target.innerWidth : target.clientWidth;
      const height = target instanceof Window ? target.innerHeight : target.clientHeight;
      this.renderer.resize(width, height);
    }

    setResizeTarget(target: HTMLElement | Window): void {
      this.resizeTo = target;
      this._record.resizeTo = target;
    }

    destroy(_a?: unknown, _b?: unknown): void {
      if (this._record.destroyed) {
        // Real Pixi throws on double destroy — mountPixi must never reach
        // this line twice thanks to its idempotence guard + try/catch.
        throw new Error('Application already destroyed');
      }
      this._record.destroyed = true;
    }

    get __record(): MockAppRecord {
      return this._record;
    }
  }

  const Filter = {
    defaultOptions: { resolution: 1 as number | string },
  };

  return { Application, Container, Filter, __mockState };
}

// ---------------------------------------------------------------------------
// ResizeObserver fake — jsdom ships none; tests install this to drive the
// collapsed single-observer pipeline deterministically.
// ---------------------------------------------------------------------------

export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  static reset(): void {
    FakeResizeObserver.instances.length = 0;
  }

  public observed: Element[] = [];
  public disconnected = false;
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(target: Element): void {
    const idx = this.observed.indexOf(target);
    if (idx >= 0) this.observed.splice(idx, 1);
  }

  disconnect(): void {
    this.disconnected = true;
    this.observed.length = 0;
  }

  /** Fire the callback as if the observed element resized to w×h. */
  fire(width: number, height: number): void {
    const entry = {
      target: this.observed[0],
      contentRect: { width, height },
    } as unknown as ResizeObserverEntry;
    this.callback([entry], this as unknown as ResizeObserver);
  }
}
