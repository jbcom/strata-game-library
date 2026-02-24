import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import type React from 'react';
import * as THREE from 'three';
import type { CinematicEffectsProps } from './types';

/**
 * Cinema-Quality Visual Preset.
 *
 * Replicates a cinematic film look using ACES color mapping, subtle chromatic
 * aberration, vignette, and optional soft film grain.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <CinematicEffects
 *   bloomIntensity={1.2}
 *   filmGrain={true}
 * />
 * ```
 */
export const CinematicEffects: React.FC<CinematicEffectsProps> = ({
  bloomIntensity = 1,
  vignetteDarkness = 0.4,
  chromaticAberration = 0.003,
  filmGrain = true,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  const effects: React.ReactElement[] = [
    <Bloom
      key="bloom"
      intensity={bloomIntensity}
      luminanceThreshold={0.85}
      luminanceSmoothing={0.05}
      mipmapBlur
    />,
    <Vignette key="vignette" darkness={vignetteDarkness} offset={0.4} />,
    <ChromaticAberration
      key="chromatic"
      offset={new THREE.Vector2(chromaticAberration, chromaticAberration)}
      radialModulation
      modulationOffset={0.2}
    />,
  ];

  if (filmGrain) {
    effects.push(<Noise key="noise" premultiply blendFunction={BlendFunction.SOFT_LIGHT} />);
  }

  effects.push(<ToneMapping key="toneMap" mode={ToneMappingMode.ACES_FILMIC} />);

  return <EffectComposer multisampling={multisampling}>{effects}</EffectComposer>;
};
