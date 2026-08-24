/**
 * Parent-sized, phase-gated R3F canvas mount with WebGL context recovery.
 *
 * @module mount/StrataCanvas
 * @category Player Experience
 *
 * `<StrataCanvas>` is the low-level mount primitive underneath (and usable
 * independently of) {@link StrataGame}. It owns four things that a bare
 * `<Canvas>` does not:
 *
 * 1. **Parent-sized host.** The canvas is wrapped in a div carrying the
 *    {@link strataCanvasHostStyle} contract — `flex: 1` + `min-height: 0` +
 *    100%/100% — so r3f's own ResizeObserver sizes against a box that
 *    actually resolves inside a flex app shell. No `vh`/`vw`/`innerWidth`.
 * 2. **Phase gating.** While `active` is false the component renders
 *    nothing, which fully tears down the WebGL context. Menu, pause, and
 *    loading phases should not pay renderer cost, and hiding the canvas
 *    with CSS does not stop it rendering.
 * 3. **Context-loss recovery.** Desktop and mobile GPUs drop the WebGL
 *    context under memory pressure or backgrounding. Without
 *    `preventDefault()` on `webglcontextlost` the browser discards it
 *    permanently and never fires `webglcontextrestored`. But
 *    `preventDefault` alone is not recovery: three.js/r3f have no mechanism
 *    to repopulate GPU-side textures, geometries, and compiled programs
 *    into a restored-but-empty context. The officially recommended pattern
 *    is remounting the `<Canvas>`, so on restore this component bumps an
 *    internal key and does exactly that — React's existing scene-graph
 *    state repopulates the fresh context immediately. Without it, a lost
 *    context leaves a permanently blank canvas with no user-visible signal.
 * 4. **A quality tier.** `{ maxDpr, antialias }` maps to the `dpr` band and
 *    the antialias flag. High-DPI phones pay quadratic fill cost, so low
 *    tiers clamp dpr and drop MSAA.
 *
 * @example
 * ```tsx
 * <StrataCanvas active={phase === 'playing'} quality={{ maxDpr: 1.5, antialias: false }}>
 *   <MyScene />
 * </StrataCanvas>
 * ```
 */

import type { CanvasProps, RootState } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import type { HTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { STRATA_CANVAS_HOST_CLASS, strataCanvasHostStyle } from './hostStyle.js';

/**
 * Device/quality tier resolved by the caller.
 *
 * Drives the `dpr` band `[1, maxDpr]` and the antialias default.
 */
export interface StrataCanvasQuality {
  /** Upper bound of the device-pixel-ratio band. */
  maxDpr: number;
  /** Whether to request MSAA on the WebGL context. */
  antialias: boolean;
}

/**
 * Host-div attributes. `data-*` keys are explicitly permitted — an object
 * literal typed as plain `HTMLAttributes` rejects hyphenated keys.
 */
export type StrataCanvasHostProps = HTMLAttributes<HTMLDivElement> & {
  [dataAttr: `data-${string}`]: string | number | boolean | undefined;
};

/** Props for {@link StrataCanvas}. */
export interface StrataCanvasProps extends Omit<CanvasProps, 'dpr' | 'gl'> {
  /**
   * Mount gate. The canvas renders only while true; false unmounts it and
   * releases the WebGL context entirely.
   */
  active: boolean;
  /** Quality tier. Defaults to `{ maxDpr: 2, antialias: true }`. */
  quality?: StrataCanvasQuality;
  /**
   * Called on WebGL context loss, after the baked-in `preventDefault()`.
   * Override to show a "reconnecting" overlay; the default logs a warning.
   */
  onContextLost?: (canvas: HTMLCanvasElement) => void;
  /**
   * Called when the context is restored, before the forced remount.
   * The default logs a warning.
   */
  onContextRestored?: (canvas: HTMLCanvasElement) => void;
  /**
   * Needed only when something reads the canvas back (screenshot pipelines,
   * `toDataURL()` harnesses). Carries a real mobile perf cost.
   */
  preserveDrawingBuffer?: boolean;
  /** Tone-mapping exposure; `1.0` is the canonical ACES baseline. */
  toneMappingExposure?: number;
  /** Extra props (e.g. `data-*` attributes) for the host div. */
  hostProps?: StrataCanvasHostProps;
  children: ReactNode;
}

/**
 * Parent-sized, phase-gated R3F canvas with WebGL context recovery.
 *
 * See the module doc for the four capabilities this adds over a bare
 * `<Canvas>`, and {@link strataCanvasHostStyle} for the CSS contract the
 * caller owns the other half of.
 */
export function StrataCanvas({
  active,
  quality = { maxDpr: 2, antialias: true },
  onContextLost,
  onContextRestored,
  preserveDrawingBuffer = false,
  toneMappingExposure = 1.0,
  hostProps,
  onCreated,
  children,
  ...canvasProps
}: StrataCanvasProps): ReactNode {
  // Keep the latest callbacks in refs so the listeners registered once in
  // onCreated never go stale across re-renders.
  const lostRef = useRef(onContextLost);
  const restoredRef = useRef(onContextRestored);
  useEffect(() => {
    lostRef.current = onContextLost;
    restoredRef.current = onContextRestored;
  });

  // Bumping this key remounts <Canvas>, tearing down and recreating the
  // WebGL context — see the module doc for why preventDefault alone is not
  // sufficient recovery.
  const [remountKey, setRemountKey] = useState(0);

  if (!active) return null;

  const handleCreated = (state: RootState): void => {
    const canvas = state.gl.domElement;
    canvas.addEventListener(
      'webglcontextlost',
      (event: Event) => {
        // Signals to the browser that we intend to recover; without it the
        // context is discarded permanently and never restored.
        event.preventDefault();
        if (lostRef.current) {
          lostRef.current(canvas);
        } else {
          console.warn('[strata/r3f] WebGL context lost — awaiting restore.');
        }
      },
      false
    );
    canvas.addEventListener(
      'webglcontextrestored',
      () => {
        if (restoredRef.current) {
          restoredRef.current(canvas);
        } else {
          console.warn('[strata/r3f] WebGL context restored.');
        }
        setRemountKey((key) => key + 1);
      },
      false
    );
    onCreated?.(state);
  };

  const { className: hostClassName, style: hostStyle, ...hostRest } = hostProps ?? {};
  return (
    <div
      className={
        hostClassName ? `${STRATA_CANVAS_HOST_CLASS} ${hostClassName}` : STRATA_CANVAS_HOST_CLASS
      }
      style={hostStyle ? { ...strataCanvasHostStyle, ...hostStyle } : strataCanvasHostStyle}
      {...hostRest}
    >
      <Canvas
        key={remountKey}
        dpr={[1, quality.maxDpr]}
        gl={{
          antialias: quality.antialias,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure,
          outputColorSpace: SRGBColorSpace,
          preserveDrawingBuffer,
        }}
        onCreated={handleCreated}
        {...canvasProps}
      >
        {children}
      </Canvas>
    </div>
  );
}
