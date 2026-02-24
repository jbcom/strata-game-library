import {
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  HueSaturation,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type React from 'react';
import * as THREE from 'three';
import type { HorrorEffectsProps } from './types';

/**
 * Gritty Horror Visual Preset.
 *
 * Establishes a dark, tense atmosphere with heavy desaturation, high contrast,
 * visual noise, and strong corner vignetting.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <HorrorEffects
 *   noiseIntensity={0.4}
 *   desaturation={-0.8}
 * />
 * ```
 */
export const HorrorEffects: React.FC<HorrorEffectsProps> = ({
  desaturation = -0.5,
  vignetteDarkness = 0.7,
  chromaticAberration = true,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  const effects: React.ReactElement[] = [
    <HueSaturation key="hueSat" hue={0} saturation={desaturation} />,
    <BrightnessContrast key="bc" brightness={-0.15} contrast={0.2} />,
    <Vignette key="vignette" darkness={vignetteDarkness} offset={0.3} />,
    <Noise key="noise" premultiply blendFunction={BlendFunction.ADD} />,
  ];

  if (chromaticAberration) {
    effects.push(
      <ChromaticAberration
        key="chromatic"
        offset={new THREE.Vector2(0.005, 0.005)}
        radialModulation
        modulationOffset={0.3}
      />
    );
  }

  return <EffectComposer multisampling={multisampling}>{effects}</EffectComposer>;
};
