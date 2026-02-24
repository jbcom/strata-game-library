import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Vignette,
} from '@react-three/postprocessing';
import type React from 'react';
import type { DreamyEffectsProps } from './types';

/**
 * Dreamy and Ethereal Visual Preset.
 *
 * Creates a soft, glowing atmosphere with high bloom intensity, slightly
 * desaturated colors, and a bright, hazy appearance. Perfect for flashbacks
 * or magical environments.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <DreamyEffects
 *   bloomIntensity={2.5}
 *   saturation={-0.3}
 * />
 * ```
 */
export const DreamyEffects: React.FC<DreamyEffectsProps> = ({
  bloomIntensity = 2,
  saturation = -0.2,
  brightness = 0.1,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.1}
        mipmapBlur
      />
      <HueSaturation hue={0} saturation={saturation} />
      <BrightnessContrast brightness={brightness} contrast={-0.1} />
      <Vignette darkness={0.3} offset={0.6} />
    </EffectComposer>
  );
};
