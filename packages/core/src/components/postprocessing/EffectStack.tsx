import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  Noise,
  Sepia,
  SSAO,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, type ToneMappingMode } from 'postprocessing';
import type React from 'react';
import * as THREE from 'three';
import type { EffectStackProps } from './types';

/**
 * Universal Post-Processing Effect Stack.
 *
 * Coordinates a collection of visual effects based on a single preset configuration.
 * Automatically handles ordering and lifecycle of bloom, DoF, SSAO, and more.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <EffectStack
 *   preset={myPreset}
 *   multisampling={4}
 * >
 *   <CustomDistortionEffect />
 * </EffectStack>
 * ```
 */
export const EffectStack: React.FC<EffectStackProps> = ({
  preset,
  enabled = true,
  multisampling = 8,
  children,
}) => {
  if (!enabled) return null;

  const effects: React.ReactElement[] = [];

  if (preset.bloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={preset.bloom.intensity ?? 1}
        luminanceThreshold={preset.bloom.luminanceThreshold ?? 0.9}
        luminanceSmoothing={preset.bloom.luminanceSmoothing ?? 0.025}
        mipmapBlur={preset.bloom.mipmapBlur ?? true}
      />
    );
  }

  if (preset.dof) {
    effects.push(
      <DepthOfField
        key="dof"
        focusDistance={preset.dof.focusDistance ?? 5}
        focalLength={preset.dof.focalLength ?? 50}
        bokehScale={preset.dof.bokehScale ?? 2}
      />
    );
  }

  if (preset.vignette) {
    effects.push(
      <Vignette
        key="vignette"
        darkness={preset.vignette.darkness ?? 0.5}
        offset={preset.vignette.offset ?? 0.5}
      />
    );
  }

  if (preset.chromaticAberration) {
    effects.push(
      <ChromaticAberration
        key="chromatic"
        offset={
          new THREE.Vector2(
            preset.chromaticAberration.offset?.x ?? 0.002,
            preset.chromaticAberration.offset?.y ?? 0.002
          )
        }
        radialModulation={preset.chromaticAberration.radialModulation ?? true}
        modulationOffset={preset.chromaticAberration.modulationOffset ?? 0.15}
      />
    );
  }

  if (preset.colorGrading) {
    effects.push(
      <HueSaturation
        key="hueSat"
        hue={preset.colorGrading.hue ?? 0}
        saturation={preset.colorGrading.saturation ?? 0}
      />
    );
  }

  if (preset.brightnessContrast) {
    effects.push(
      <BrightnessContrast
        key="bc"
        brightness={preset.brightnessContrast.brightness ?? 0}
        contrast={preset.brightnessContrast.contrast ?? 0}
      />
    );
  }

  if (preset.sepia) {
    effects.push(<Sepia key="sepia" intensity={preset.sepia.intensity ?? 1} />);
  }

  if (preset.filmGrain) {
    effects.push(
      <Noise
        key="noise"
        premultiply={preset.noise?.premultiply ?? false}
        blendFunction={BlendFunction.ADD}
      />
    );
  }

  if (preset.toneMapping) {
    effects.push(<ToneMapping key="toneMap" mode={preset.toneMapping.mode as ToneMappingMode} />);
  }

  if (preset.ssao) {
    effects.push(
      <SSAO
        key="ssao"
        samples={preset.ssao.samples ?? 9}
        radius={preset.ssao.radius ?? 0.1}
        intensity={preset.ssao.intensity ?? 1}
        luminanceInfluence={preset.ssao.luminanceInfluence ?? 0.7}
        worldDistanceThreshold={1}
        worldDistanceFalloff={0.1}
        worldProximityThreshold={0.5}
        worldProximityFalloff={0.1}
      />
    );
  }

  // Combine effects and children into a single array for EffectComposer
  const allEffects = [...effects];
  if (children) {
    if (Array.isArray(children)) {
      allEffects.push(...(children as React.ReactElement[]));
    } else {
      allEffects.push(children as React.ReactElement);
    }
  }

  return <EffectComposer multisampling={multisampling}>{allEffects}</EffectComposer>;
};
