/**
 * Phase-gated Babylon subtree mount.
 *
 * @module mount/SceneRoot
 * @category Player Experience
 *
 * `<SceneRoot>` mounts a discriminant-scoped `TransformNode` — and the
 * children hung off it — only while `activeKey === matchKey`, disposing the
 * whole subtree on exit.
 *
 * This is the Babylon analogue of the R3F adapter's `<StrataCanvas active>`
 * gate, and it exists because Babylon's Engine and Scene are expensive and
 * are meant to stay mounted across phases. What you want to swap per phase
 * is the *mesh subtree*, not the scene. Hanging every phase's meshes off one
 * `TransformNode` and calling `dispose(false, true)` on exit is what makes
 * that swap leak-free: Babylon has no garbage collection for scene graph
 * nodes, so a mesh that is merely unreferenced by React still renders, still
 * consumes GPU memory, and still participates in picking forever.
 *
 * The children render-prop receives the root node, so sub-scenes parent
 * their meshes to it and inherit the dispose chain for free.
 *
 * Generalized over any discriminant key — menu/gameplay/game-over screens
 * sharing one Engine, encounter phases, level indices — not tied to any
 * particular game's phase union.
 *
 * @example
 * ```tsx
 * <SceneRoot activeKey={phase} matchKey="combat">
 *   {(root) => <CombatArena parent={root} />}
 * </SceneRoot>
 * ```
 */

import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { type ReactNode, useEffect, useState } from 'react';
import { useScene } from 'reactylon';

/** Props for {@link SceneRoot}. */
export interface SceneRootProps<T extends string | number> {
  /** The currently active discriminant value. */
  activeKey: T;
  /** The value this subtree mounts for. */
  matchKey: T;
  /** Rendered with the mounted root node while active. */
  children: (root: TransformNode) => ReactNode;
}

/**
 * Mount a disposable Babylon `TransformNode` subtree while
 * `activeKey === matchKey`.
 *
 * The Babylon `Scene` and `Engine` are expected to stay mounted above this
 * component; `SceneRoot` owns only the per-key subtree.
 */
export function SceneRoot<T extends string | number>({
  activeKey,
  matchKey,
  children,
}: SceneRootProps<T>): ReactNode {
  const scene = useScene();
  const [root, setRoot] = useState<TransformNode | null>(null);

  const isActive = activeKey === matchKey;

  useEffect(() => {
    // Inactive, or no scene yet: nothing to mount. Any previously active
    // root was torn down by that earlier effect run's own cleanup.
    if (!scene || !isActive) return;

    const node = new BabylonTransformNode(`strata-scene-root-${String(matchKey)}`, scene);
    setRoot(node);

    return () => {
      node.dispose(false, true);
      // Clear only if this effect's own node is still the published one.
      // Under StrictMode (and any fast remount) the next effect runs before
      // this cleanup, so an unconditional setRoot(null) would blank out the
      // *newer* node and leave the subtree permanently unmounted.
      setRoot((current) => (current === node ? null : current));
    };
  }, [isActive, matchKey, scene]);

  if (!isActive || !root) return null;
  return <>{children(root)}</>;
}
