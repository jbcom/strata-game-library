/**
 * Post-Processing React Components
 *
 * Higher-level components for applying post-processing effects using
 * @react-three/postprocessing. Provides preset-based effect stacks for
 * common visual styles.
 */

import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
    EffectComposer,
    Bloom,
    Vignette,
    ChromaticAberration,
    Noise,
    DepthOfField,
    HueSaturation,
    BrightnessContrast,
    Sepia,
    ToneMapping,
    SSAO,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import type {
    PostProcessingPreset,
    BloomSettings,
    DOFSettings,
    VignetteSettings,
    ChromaticAberrationSettings,
    FilmGrainSettings,
    ColorGradingSettings,
    SSAOSettings,
    BrightnessContrastSettings,
    SepiaSettings,
} from '../core/postProcessing';
import { calculateFocusDistanceToMesh } from '../core/postProcessing';

/**
 * Props for EffectStack component
 */
export interface EffectStackProps {
    /** Effect preset configuration */
    preset: PostProcessingPreset;
    /** Enable/disable effects (default true) */
    enabled?: boolean;
    /** Multisampling for anti-aliasing (default 8) */
    multisampling?: number;
    /** Children (additional custom effects) */
    children?: React.ReactNode;
}

/**
 * EffectStack - Apply a preset configuration of effects
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
        effects.push(
            <ToneMapping key="toneMap" mode={preset.toneMapping.mode as ToneMappingMode} />
        );
    }

    if (preset.ssao) {
        effects.push(
            <SSAO
                key="ssao"
                samples={preset.ssao.samples ?? 9}
                radius={preset.ssao.radius ?? 0.1}
                intensity={preset.ssao.intensity ?? 1}
                luminanceInfluence={preset.ssao.luminanceInfluence ?? 0.7}
            />
        );
    }

    return (
        <EffectComposer multisampling={multisampling}>
            <>
                {effects}
                {children}
            </>
        </EffectComposer>
    );
};

/**
 * Props for cinematic effects
 */
export interface CinematicEffectsProps {
    /** Bloom intensity (0-3, default 1) */
    bloomIntensity?: number;
    /** Vignette darkness (0-1, default 0.4) */
    vignetteDarkness?: number;
    /** Chromatic aberration strength (default 0.003) */
    chromaticAberration?: number;
    /** Enable film grain (default true) */
    filmGrain?: boolean;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * CinematicEffects - Film-like look with bloom, vignette, chromatic aberration
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

/**
 * Props for dreamy effects
 */
export interface DreamyEffectsProps {
    /** Bloom intensity (default 2) */
    bloomIntensity?: number;
    /** Saturation reduction (default -0.2) */
    saturation?: number;
    /** Brightness boost (default 0.1) */
    brightness?: number;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * DreamyEffects - Soft, ethereal look with high bloom and soft colors
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

/**
 * Props for horror effects
 */
export interface HorrorEffectsProps {
    /** Desaturation amount (default -0.5) */
    desaturation?: number;
    /** Noise intensity (default 0.2) */
    noiseIntensity?: number;
    /** Vignette darkness (default 0.7) */
    vignetteDarkness?: number;
    /** Enable chromatic aberration (default true) */
    chromaticAberration?: boolean;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * HorrorEffects - Desaturated, noisy, dark atmosphere
 */
export const HorrorEffects: React.FC<HorrorEffectsProps> = ({
    desaturation = -0.5,
    noiseIntensity = 0.2,
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

/**
 * Props for neon effects
 */
export interface NeonEffectsProps {
    /** Bloom intensity (default 3) */
    bloomIntensity?: number;
    /** Saturation boost (default 0.3) */
    saturation?: number;
    /** Luminance threshold (default 0.6) */
    luminanceThreshold?: number;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * NeonEffects - High bloom, saturated colors for cyberpunk/neon aesthetics
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

/**
 * Props for realistic effects
 */
export interface RealisticEffectsProps {
    /** Enable SSAO (default true) */
    ssao?: boolean;
    /** SSAO intensity (default 1) */
    ssaoIntensity?: number;
    /** Subtle bloom intensity (default 0.5) */
    bloomIntensity?: number;
    /** Tone mapping mode (default ACES_FILMIC) */
    toneMappingMode?: ToneMappingMode;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * RealisticEffects - Subtle, physically-based rendering enhancements
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

/**
 * Props for vintage effects
 */
export interface VintageEffectsProps {
    /** Sepia intensity (default 0.4) */
    sepiaIntensity?: number;
    /** Vignette darkness (default 0.5) */
    vignetteDarkness?: number;
    /** Film grain (default true) */
    filmGrain?: boolean;
    /** Saturation (default -0.3) */
    saturation?: number;
    /** Enable effects (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * VintageEffects - Old film/photograph look
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

/**
 * DynamicDOF ref interface
 */
export interface DynamicDOFRef {
    /** Update focus to target */
    focusOnTarget: (target: THREE.Object3D) => void;
    /** Get current focus distance */
    getFocusDistance: () => number;
}

/**
 * Props for DynamicDOF
 */
export interface DynamicDOFProps {
    /** Target to follow (ref to a mesh) */
    target?: React.RefObject<THREE.Object3D>;
    /** Fixed focus distance (used if target not provided) */
    focusDistance?: number;
    /** Focal length in mm (default 50) */
    focalLength?: number;
    /** Bokeh scale (default 2) */
    bokehScale?: number;
    /** Focus tracking speed (default 5) */
    focusSpeed?: number;
    /** Enable effect (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * DynamicDOF - Depth of field that follows a target object
 */
export const DynamicDOF = forwardRef<DynamicDOFRef, DynamicDOFProps>(
    (
        {
            target,
            focusDistance: fixedFocusDistance = 5,
            focalLength = 50,
            bokehScale = 2,
            focusSpeed = 5,
            enabled = true,
            multisampling = 8,
        },
        ref
    ) => {
        const { camera } = useThree();
        const focusDistanceRef = useRef(fixedFocusDistance);
        const targetFocusRef = useRef(fixedFocusDistance);

        useImperativeHandle(ref, () => ({
            focusOnTarget: (newTarget: THREE.Object3D) => {
                targetFocusRef.current = calculateFocusDistanceToMesh(camera, newTarget);
            },
            getFocusDistance: () => focusDistanceRef.current,
        }));

        useFrame((_, delta) => {
            if (target?.current) {
                targetFocusRef.current = calculateFocusDistanceToMesh(camera, target.current);
            }

            const diff = targetFocusRef.current - focusDistanceRef.current;
            focusDistanceRef.current += diff * focusSpeed * delta;
        });

        if (!enabled) return null;

        return (
            <EffectComposer multisampling={multisampling}>
                <DepthOfField
                    focusDistance={focusDistanceRef.current}
                    focalLength={focalLength}
                    bokehScale={bokehScale}
                />
            </EffectComposer>
        );
    }
);

DynamicDOF.displayName = 'DynamicDOF';

/**
 * Props for MotionBlurEffect
 * Note: Motion blur requires object velocity information
 */
export interface MotionBlurEffectProps {
    /** Blur intensity (default 0.5) */
    intensity?: number;
    /** Jitter (default 0.5) */
    jitter?: number;
    /** Number of samples (default 9) */
    samples?: number;
    /** Enable effect (default true) */
    enabled?: boolean;
    /** Multisampling (default 8) */
    multisampling?: number;
}

/**
 * MotionBlurEffect - Camera motion blur effect
 * Note: This uses camera motion blur. Per-object motion blur requires velocity buffers.
 */
export const MotionBlurEffect: React.FC<MotionBlurEffectProps> = ({
    intensity = 0.5,
    jitter = 0.5,
    samples = 9,
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

/**
 * Export types from core
 */
export type {
    PostProcessingPreset,
    BloomSettings,
    DOFSettings,
    VignetteSettings,
    ChromaticAberrationSettings,
    FilmGrainSettings,
    ColorGradingSettings,
    SSAOSettings,
    BrightnessContrastSettings,
    SepiaSettings,
};
