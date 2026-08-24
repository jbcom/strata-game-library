/**
 * @arcade-cabinet/pixi-mount/react — optional React hook wrapper.
 *
 * Thin, NOT the primary API: the framework-agnostic core stays
 * element-in/handle-out (on-the-ropes' model). This hook is a convenience
 * layer mirroring bioluminescent-sea's disposed-guard useEffect pattern
 * for StrictMode safety.
 *
 * `react` is an optional peer dependency — only this subpath needs it.
 */

import { type RefObject, useEffect, useRef, useState } from 'react';
import { mountPixi, type MountOptions, type PixiMountHandle } from './mount.js';

/**
 * Mount a Pixi Application onto the ref'd element.
 *
 * RECOMMENDED: pass a ref to a plain container element (a `<div>`). The
 * mount then mints a fresh canvas per Application, which is what makes
 * StrictMode's mount→cleanup→mount cycle safe — a destroyed Pixi app's
 * WebGL context is lost forever on its canvas ELEMENT, so a reused
 * `<canvas>` ref boots the second app onto a dead context (illinois-jim's
 * documented WEBGL_lose_context poison). A canvas ref still works for
 * single-mount trees, but carries that hazard under StrictMode.
 *
 * `options` are captured when the mount effect runs; changing them later
 * does not remount. Returns null until the async Pixi init resolves.
 */
export function usePixiMount(
  ref: RefObject<HTMLCanvasElement | HTMLElement | null>,
  options: MountOptions = {},
): PixiMountHandle | null {
  const [handle, setHandle] = useState<PixiMountHandle | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    let disposed = false;
    let mounted: PixiMountHandle | null = null;
    const base = optionsRef.current;
    const opts: MountOptions =
      el instanceof HTMLCanvasElement ? { ...base, canvas: el } : { ...base, container: el };
    void mountPixi(opts).then((h) => {
      // Disposed-guard: StrictMode may have cleaned up before init resolved.
      if (disposed) {
        h.destroy();
        return;
      }
      mounted = h;
      setHandle(h);
    });
    return () => {
      disposed = true;
      mounted?.destroy();
      setHandle(null);
    };
  }, [ref]);

  return handle;
}
