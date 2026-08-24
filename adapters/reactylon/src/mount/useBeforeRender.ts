/**
 * Per-frame subscription to the active Babylon scene.
 *
 * @module mount/useBeforeRender
 * @category Player Experience
 *
 * Replaces direct `scene.onBeforeRenderObservable.add(...)` calls scattered
 * through imperative scene setup. Three things make the direct call a
 * recurring source of bugs that this hook removes:
 *
 * 1. **Leaks.** The observer must be removed on unmount or it keeps running
 *    (and keeps its closure alive) for the lifetime of the scene.
 * 2. **Unbounded delta.** `getDeltaTime()` returns the real wall-clock gap,
 *    which after a tab is backgrounded can be many seconds. Feeding that
 *    into integration code tunnels objects through walls and NaNs springs.
 *    This hook clamps to 50 ms (a 20 fps floor).
 * 3. **Stale closures.** Naively re-registering on every render churns the
 *    observable; capturing the first callback forever means the frame loop
 *    reads stale props. The callback is held in a ref refreshed in
 *    `useLayoutEffect`, so the observer is registered once per scene (or
 *    explicit dep) while always calling the latest callback.
 *
 * Reactylon ships no `useBeforeRender` of its own.
 *
 * @example
 * ```tsx
 * useBeforeRender((delta, scene) => {
 *   mesh.rotation.y += delta * spinRate;
 * }, [spinRate]);
 * ```
 */

import type { Scene } from '@babylonjs/core/scene';
import { type DependencyList, useEffect, useLayoutEffect, useRef } from 'react';
import { useScene } from 'reactylon';

/**
 * Upper bound on the per-frame delta handed to the callback, in seconds.
 *
 * A backgrounded tab produces arbitrarily large real deltas; clamping keeps
 * simulation integration stable when the tab is restored.
 */
export const MAX_FRAME_DELTA_SECONDS = 0.05;

/**
 * Subscribe to the active Babylon scene's `onBeforeRenderObservable`,
 * removing the observer automatically on unmount or scene change.
 *
 * @param callback - Invoked each frame with the clamped delta in seconds
 *   and the active scene. Always the latest callback, without re-registering
 *   the observer.
 * @param deps - Extra dependencies that should force re-registration.
 */
export function useBeforeRender(
  callback: (delta: number, scene: Scene) => void,
  deps: DependencyList = []
): void {
  const scene = useScene();
  const callbackRef = useRef(callback);

  // useLayoutEffect (rather than the render body) keeps the latest callback
  // addressable by the per-frame closure without mutating during render.
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!scene) return;
    const observer = scene.onBeforeRenderObservable.add(() => {
      const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, MAX_FRAME_DELTA_SECONDS);
      callbackRef.current(delta, scene);
    });
    return () => {
      if (observer) scene.onBeforeRenderObservable.remove(observer);
    };
    // The caller's deps intentionally extend the dependency array.
  }, [scene, ...deps]);
}
