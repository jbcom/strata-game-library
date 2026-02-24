import { Bloom, EffectComposer, SSAO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import type React from 'react';
import type { RealisticEffectsProps } from './types';

/**
 * Physically-Based Realistic Visual Preset.
 *
 * Enhances scene realism with high-quality ambient occlusion (SSAO), subtle
 * bloom for natural light highlights, and filmic tone mapping.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <RealisticEffects
 *   ssaoIntensity={1.5}
 *   toneMappingMode={ToneMappingMode.ACES_FILMIC}
 * />
 * ```
 */
export const RealisticEffects: React.FC<RealisticEffectsProps> = ({
  ssao = true,
  ssaoIntensity = 1,
  bloomIntensity = 0.5,
  toneMappingMode = ToneMappingMode.ACES_FILMIC,
  enabled = true,
  multisampling = 8,
}) => {
  if (!enabled) return null;

  const effects: React.ReactElement[] = [];

  if (ssao) {
    effects.push(
      <SSAO
        key="ssao"
        samples={16}
        radius={0.05}
        intensity={ssaoIntensity}
        luminanceInfluence={0.5}
        worldDistanceThreshold={1}
        worldDistanceFalloff={0.1}
        worldProximityThreshold={0.5}
        worldProximityFalloff={0.1}
      />
    );
  }

  effects.push(
    <Bloom
      key="bloom"
      intensity={bloomIntensity}
      luminanceThreshold={0.95}
      luminanceSmoothing={0.01}
      mipmapBlur
    />,
    <ToneMapping key="toneMap" mode={toneMappingMode} />
  );

  return <EffectComposer multisampling={multisampling}>{effects}</EffectComposer>;
};
