/**
 * @arcade-cabinet/pixi-mount/pixi-react — fleet mount policy for @pixi/react.
 *
 * @pixi/react v8 creates and owns its Application; it cannot adopt the
 * Application returned by mountPixi(). This component therefore wraps
 * @pixi/react's supported <Application> API directly. It never calls
 * mountPixi() and never creates a second Application.
 *
 * React owns the canvas element and @pixi/react owns Application teardown.
 * This adapter retains the framework-neutral mount's DPR, reduced-motion and
 * single resize-pipeline contracts around that one upstream-owned instance.
 */

import {
  Application as PixiReactApplication,
  type ApplicationRef,
} from '@pixi/react';
import type { Application } from 'pixi.js';
import {
  type ComponentProps,
  type ReactElement,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { detectReduceMotion, getDpr } from './mount.js';

type PixiReactChildren = ComponentProps<typeof PixiReactApplication>['children'];

export type PixiReactResizeMode = 'observer' | 'resizeTo' | 'manual';
export type PixiReactResizeTarget = HTMLElement | Window | RefObject<HTMLElement | null>;

export interface PixiReactMountHandle {
  /** The only Pixi Application. It is created and destroyed by @pixi/react. */
  readonly app: Application;
  /** The React-owned canvas used by the Application. */
  readonly canvas: HTMLCanvasElement;
  /** Whether reduced-motion is honoured for this mount. */
  readonly reduceMotion: boolean;
  /** Current logical renderer width in CSS pixels. */
  readonly width: number;
  /** Current logical renderer height in CSS pixels. */
  readonly height: number;
  /** Manual resize: renderer first, then onResize, deduped. */
  resize(width: number, height: number): void;
}

export interface PixiReactMountProps {
  children?: PixiReactChildren;
  /** CSS class applied to @pixi/react's canvas. */
  className?: string;
  /** Pixi background color. Defaults to the fleet near-black. */
  background?: number | string;
  /** Caps devicePixelRatio. Defaults to 2. */
  maxResolution?: number;
  /** Enables integer coordinates, resolution 1 and disables antialiasing. */
  pixelSnap?: boolean;
  /** Auto-detects prefers-reduced-motion when omitted. */
  reduceMotion?: boolean;
  /** Resize wiring. Defaults to one ResizeObserver pipeline. */
  resizeMode?: PixiReactResizeMode;
  /** Defaults to the canvas parent, then the canvas itself. */
  resizeTarget?: PixiReactResizeTarget;
  /** Called after the renderer has resized. */
  onResize?: (width: number, height: number) => void;
  /** Called once for each successfully initialised live Application. */
  onReady?: (handle: PixiReactMountHandle) => void;
}

interface ResizeEmitter {
  on(event: 'resize', listener: (width: number, height: number) => void): unknown;
  off(event: 'resize', listener: (width: number, height: number) => void): unknown;
}

interface MountedRuntime {
  readonly app: Application;
  readonly canvas: HTMLCanvasElement;
  readonly handle: PixiReactMountHandle;
  bound: boolean;
  currentWidth: number;
  currentHeight: number;
  observer: ResizeObserver | null;
  removeWindowListener: (() => void) | null;
  resizeListener: ((width: number, height: number) => void) | null;
}

interface CapturedMountOptions {
  readonly background: number | string;
  readonly maxResolution: number;
  readonly pixelSnap: boolean;
  readonly reduceMotion: boolean;
  readonly resizeMode: PixiReactResizeMode;
  readonly resizeTarget?: PixiReactResizeTarget;
}

function isRefTarget(target: PixiReactResizeTarget): target is RefObject<HTMLElement | null> {
  return typeof target === 'object' && target !== null && 'current' in target;
}

function resolveTarget(target: PixiReactResizeTarget | undefined): HTMLElement | Window | null {
  if (target === undefined) return null;
  return isRefTarget(target) ? target.current : target;
}

function isWindowTarget(target: HTMLElement | Window): target is Window {
  return typeof Window !== 'undefined' && target instanceof Window;
}

function measure(
  target: HTMLElement | Window,
  fallbackWidth: number,
  fallbackHeight: number,
): readonly [number, number] {
  if (isWindowTarget(target)) {
    return [target.innerWidth || fallbackWidth, target.innerHeight || fallbackHeight];
  }
  const width = target.clientWidth || (target instanceof HTMLCanvasElement ? target.width : 0);
  const height = target.clientHeight || (target instanceof HTMLCanvasElement ? target.height : 0);
  return [width || fallbackWidth, height || fallbackHeight];
}

function logicalSize(app: Application): readonly [number, number] {
  const width = app.screen?.width;
  const height = app.screen?.height;
  return [
    typeof width === 'number' && width > 0 ? width : 800,
    typeof height === 'number' && height > 0 ? height : 450,
  ];
}

/**
 * Render one @pixi/react Application with the shared arcade mount policy.
 *
 * Application options are captured for this component lifetime. Change its
 * React key to deliberately rebuild with different mount policy. `onResize`
 * and `onReady` callbacks are read from their latest props.
 */
export function PixiReactMount({
  children,
  className,
  background = 0x080810,
  maxResolution = 2,
  pixelSnap = false,
  reduceMotion,
  resizeMode = 'observer',
  resizeTarget,
  onResize,
  onReady,
}: PixiReactMountProps): ReactElement {
  const applicationRef = useRef<ApplicationRef | null>(null);
  const runtimeRef = useRef<MountedRuntime | null>(null);
  const mountedRef = useRef(true);
  const onResizeRef = useRef(onResize);
  const onReadyRef = useRef(onReady);
  onResizeRef.current = onResize;
  onReadyRef.current = onReady;

  const capturedOptions = useRef<CapturedMountOptions | null>(null);
  capturedOptions.current ??= {
    background,
    maxResolution,
    pixelSnap,
    reduceMotion: reduceMotion ?? detectReduceMotion(),
    resizeMode,
    ...(resizeTarget === undefined ? {} : { resizeTarget }),
  };

  const unbindRuntime = useCallback((runtime: MountedRuntime): void => {
    if (!runtime.bound) return;
    runtime.bound = false;
    runtime.observer?.disconnect();
    runtime.observer = null;
    runtime.removeWindowListener?.();
    runtime.removeWindowListener = null;
    if (runtime.resizeListener !== null) {
      (runtime.app.renderer as unknown as ResizeEmitter).off('resize', runtime.resizeListener);
      runtime.resizeListener = null;
    }
  }, []);

  const bindRuntime = useCallback((runtime: MountedRuntime): void => {
    if (runtime.bound) return;
    runtime.bound = true;
    const options = capturedOptions.current;
    if (options === null) throw new Error('PixiReactMount options were not captured');

    const resizeListener = (width: number, height: number): void => {
      runtime.currentWidth = width;
      runtime.currentHeight = height;
      onResizeRef.current?.(width, height);
    };
    runtime.resizeListener = resizeListener;
    (runtime.app.renderer as unknown as ResizeEmitter).on('resize', resizeListener);

    const target =
      resolveTarget(options.resizeTarget) ?? runtime.canvas.parentElement ?? runtime.canvas;
    const resizeToTarget = (): void => {
      const [width, height] = measure(target, runtime.currentWidth, runtime.currentHeight);
      runtime.handle.resize(width, height);
    };

    if (options.resizeMode === 'observer') {
      if (isWindowTarget(target)) {
        target.addEventListener('resize', resizeToTarget);
        runtime.removeWindowListener = () => target.removeEventListener('resize', resizeToTarget);
      } else {
        const Observer = globalThis.ResizeObserver;
        if (typeof Observer === 'function') {
          runtime.observer = new Observer((entries) => {
            for (const entry of entries) {
              runtime.handle.resize(entry.contentRect.width, entry.contentRect.height);
            }
          });
          runtime.observer.observe(target);
        }
      }
      resizeToTarget();
    } else if (options.resizeMode === 'resizeTo') {
      runtime.app.resizeTo = target;
      resizeToTarget();
    }
  }, []);

  const handleInit = useCallback(
    (app: Application): void => {
      if (!mountedRef.current) return;
      const canvas = applicationRef.current?.getCanvas();
      if (canvas === null || canvas === undefined) {
        throw new Error('@pixi/react initialised without exposing its canvas');
      }

      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      const existing = runtimeRef.current;
      if (existing !== null && existing.app === app) {
        bindRuntime(existing);
        return;
      }
      if (existing !== null) unbindRuntime(existing);

      const [currentWidth, currentHeight] = logicalSize(app);
      const options = capturedOptions.current;
      if (options === null) throw new Error('PixiReactMount options were not captured');
      let runtime: MountedRuntime;
      const handle: PixiReactMountHandle = {
        app,
        canvas,
        reduceMotion: options.reduceMotion,
        get width() {
          return runtime.currentWidth;
        },
        get height() {
          return runtime.currentHeight;
        },
        resize(width: number, height: number): void {
          const nextWidth = Math.max(1, Math.floor(width));
          const nextHeight = Math.max(1, Math.floor(height));
          if (nextWidth === runtime.currentWidth && nextHeight === runtime.currentHeight) return;
          app.renderer.resize(nextWidth, nextHeight);
        },
      };
      runtime = {
        app,
        canvas,
        handle,
        bound: false,
        currentWidth,
        currentHeight,
        observer: null,
        removeWindowListener: null,
        resizeListener: null,
      };
      runtimeRef.current = runtime;
      bindRuntime(runtime);
      onReadyRef.current?.(handle);
    },
    [bindRuntime, unbindRuntime],
  );

  useEffect(() => {
    mountedRef.current = true;
    const runtime = runtimeRef.current;
    if (runtime !== null) bindRuntime(runtime);
    return () => {
      mountedRef.current = false;
      const current = runtimeRef.current;
      if (current !== null) unbindRuntime(current);
    };
  }, [bindRuntime, unbindRuntime]);

  const options = capturedOptions.current;
  if (options === null) throw new Error('PixiReactMount options were not captured');

  return (
    <PixiReactApplication
      ref={applicationRef}
      className={className}
      width={800}
      height={450}
      background={options.background}
      antialias={!options.pixelSnap}
      resolution={options.pixelSnap ? 1 : getDpr(options.maxResolution)}
      autoDensity={true}
      roundPixels={options.pixelSnap}
      resizeTo={undefined}
      onInit={handleInit}
    >
      {children}
    </PixiReactApplication>
  );
}
