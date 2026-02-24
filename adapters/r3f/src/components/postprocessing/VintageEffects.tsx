import {
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  Noise,
  Sepia,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type React from 'react';
import type { VintageEffectsProps } from './types';

/**
 * Nostalgic Vintage Visual Preset.
 *
 * Recreates the look of old film or aged photographs using sepia tones,
 * increased contrast, heavy vignette, and visible grain noise.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <VintageEffects
 *   sepiaIntensity={0.6}
 *   filmGrain={true}
 * />
 * ```
 */
export const VintageEffects: React.FC<VintageEffectsProps> = ({
  sepiaIntensity = 0.4,
  vignetteDarkness = 0.5,
  filmGrain = true,
  saturation = -0.3,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  const effects: React.ReactElement[] = [
    <HueSaturation key="hueSat" hue={0.05} saturation={saturation} />,
    <Sepia key="sepia" intensity={sepiaIntensity} />,
    <BrightnessContrast key="bc" brightness={-0.05} contrast={0.1} />,
    <Vignette key="vignette" darkness={vignetteDarkness} offset={0.4} />,
  ];

  if (filmGrain) {
    effects.push(<Noise key="noise" premultiply blendFunction={BlendFunction.SOFT_LIGHT} />);
  }

  return <EffectComposer multisampling={multisampling}>{effects}</EffectComposer>;
};
