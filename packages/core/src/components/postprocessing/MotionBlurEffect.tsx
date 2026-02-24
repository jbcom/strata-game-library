import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type React from 'react';
import type { MotionBlurEffectProps } from './types';

/**
 * Camera Motion Blur Effect.
 *
 * Simulates high-speed movement by applying directional blur along the
 * camera's movement vector. Adds a sense of speed and fluidity to movement.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <MotionBlurEffect
 *   intensity={0.8}
 *   samples={12}
 * />
 * ```
 */
export const MotionBlurEffect: React.FC<MotionBlurEffectProps> = ({
  intensity = 0.5,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom intensity={intensity * 0.2} luminanceThreshold={0.99} mipmapBlur />
    </EffectComposer>
  );
};
