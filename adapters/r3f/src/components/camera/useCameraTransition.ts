import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import type * as THREE from 'three';
import { lerpVector3 } from '@strata-game-library/core';
import { easeInOutCubic } from '@strata-game-library/core';
import type { CameraTransitionConfig } from './types';

/**
 * Hook for smooth camera viewpoint transitions.
 *
 * Provides a managed way to animate the camera from one position/orientation
 * to another over a specified duration with easing.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * const { startTransition } = useCameraTransition();
 *
 * const handleClick = () => {
 *   startTransition({
 *     from: camera.position.clone(),
 *     to: new THREE.Vector3(10, 5, 10),
 *     duration: 2.0
 *   });
 * };
 * ```
 */
export function useCameraTransition() {
  const { camera } = useThree();
  const transitionRef = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    fromLookAt?: THREE.Vector3;
    toLookAt?: THREE.Vector3;
    duration: number;
    elapsed: number;
    easing: (t: number) => number;
    onComplete?: () => void;
    active: boolean;
  } | null>(null);

  const startTransition = useCallback((props: CameraTransitionConfig) => {
    transitionRef.current = {
      from: props.from.clone(),
      to: props.to.clone(),
      fromLookAt: props.fromLookAt?.clone(),
      toLookAt: props.toLookAt?.clone(),
      duration: props.duration ?? 1,
      elapsed: 0,
      easing: props.easing ?? easeInOutCubic,
      onComplete: props.onComplete,
      active: true,
    };
  }, []);

  useFrame((_, delta) => {
    if (!transitionRef.current?.active) return;

    const t = transitionRef.current;
    t.elapsed += delta;

    const progress = Math.min(1, t.elapsed / t.duration);
    const easedProgress = t.easing(progress);

    const position = lerpVector3(t.from, t.to, easedProgress);
    camera.position.copy(position);

    if (t.fromLookAt && t.toLookAt) {
      const lookAt = lerpVector3(t.fromLookAt, t.toLookAt, easedProgress);
      camera.lookAt(lookAt);
    }

    if (progress >= 1) {
      t.active = false;
      t.onComplete?.();
    }
  });

  return { startTransition };
}
