import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type React from 'react';
import type { NeonEffectsProps } from './types';

/**
 * Cyberpunk/Neon Visual Preset.
 *
 * Emphasizes vibrant emissive colors with high-intensity bloom, sharp contrast,
 * and saturated hues for a stylized futuristic aesthetic.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <NeonEffects
 *   bloomIntensity={4.0}
 *   saturation={0.5}
 * />
 * ```
 */
export const NeonEffects: React.FC<NeonEffectsProps> = ({
  bloomIntensity = 3,
  saturation = 0.3,
  luminanceThreshold = 0.6,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={0.05}
        mipmapBlur
      />
      <HueSaturation hue={0} saturation={saturation} />
      <BrightnessContrast brightness={0} contrast={0.15} />
      <ToneMapping mode={ToneMappingMode.REINHARD2} />
    </EffectComposer>
  );
};
