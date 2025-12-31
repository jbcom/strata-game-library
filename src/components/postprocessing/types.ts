import type { ToneMappingMode } from 'postprocessing';
import type React from 'react';
import type * as THREE from 'three';
import type {
    BloomSettings,
    BrightnessContrastSettings,
    ChromaticAberrationSettings,
    ColorGradingSettings,
    DOFSettings,
    FilmGrainSettings,
    PostProcessingPreset,
    SepiaSettings,
    SSAOSettings,
    VignetteSettings,
} from '../../core/postProcessing';

/**
 * Props for the EffectStack component.
 * @category Rendering Pipeline
 */
export interface EffectStackProps {
    /** Preset configuration containing specific effect settings. */
    preset: PostProcessingPreset;
    /** Whether post-processing effects are active. Default: true. */
    enabled?: boolean;
    /** Number of samples for multi-sampling anti-aliasing. Default: 8. */
    multisampling?: number;
    /** Additional custom effects to be added to the stack. */
    children?: React.ReactNode;
}

/**
 * Props for specialized visual effect presets.
 * @category Rendering Pipeline
 */
export interface EffectPresetProps {
    /** Whether the effect is active. Default: true. */
    enabled?: boolean;
    /** Anti-aliasing quality. Default: 8. */
    multisampling?: number;
}

/**
 * Props for the CinematicEffects component.
 * @category Rendering Pipeline
 */
export interface CinematicEffectsProps extends EffectPresetProps {
    /** Intensity of the bloom glow (0-3). Default: 1.0. */
    bloomIntensity?: number;
    /** Darkness multiplier for corners. Default: 0.4. */
    vignetteDarkness?: number;
    /** Color separation strength. Default: 0.003. */
    chromaticAberration?: number;
    /** Whether to add film grain noise. Default: true. */
    filmGrain?: boolean;
}

/**
 * Props for the DreamyEffects component.
 * @category Rendering Pipeline
 */
export interface DreamyEffectsProps extends EffectPresetProps {
    /** Intensity of the soft bloom glow. Default: 2.0. */
    bloomIntensity?: number;
    /** Color saturation adjustment (-1 to 1). Default: -0.2. */
    saturation?: number;
    /** Overall brightness adjustment. Default: 0.1. */
    brightness?: number;
}

/**
 * Props for the HorrorEffects component.
 * @category Rendering Pipeline
 */
export interface HorrorEffectsProps extends EffectPresetProps {
    /** Color desaturation amount. Default: -0.5. */
    desaturation?: number;
    /** Intensity of visual noise. Default: 0.2. */
    noiseIntensity?: number;
    /** Darkness multiplier for corners. Default: 0.7. */
    vignetteDarkness?: number;
    /** Whether to enable color separation. Default: true. */
    chromaticAberration?: boolean;
}

/**
 * Props for the NeonEffects component.
 * @category Rendering Pipeline
 */
export interface NeonEffectsProps extends EffectPresetProps {
    /** High intensity bloom for neon glow. Default: 3.0. */
    bloomIntensity?: number;
    /** Boost for color saturation. Default: 0.3. */
    saturation?: number;
    /** Threshold for what parts of the image glow. Default: 0.6. */
    luminanceThreshold?: number;
}

/**
 * Props for the RealisticEffects component.
 * @category Rendering Pipeline
 */
export interface RealisticEffectsProps extends EffectPresetProps {
    /** Whether to enable Screen Space Ambient Occlusion. Default: true. */
    ssao?: boolean;
    /** Intensity of AO shadows. Default: 1.0. */
    ssaoIntensity?: number;
    /** Subtle bloom for light highlights. Default: 0.5. */
    bloomIntensity?: number;
    /** Tone mapping algorithm. Default: ACES_FILMIC. */
    toneMappingMode?: ToneMappingMode;
}

/**
 * Props for the VintageEffects component.
 * @category Rendering Pipeline
 */
export interface VintageEffectsProps extends EffectPresetProps {
    /** Sepia tone intensity. Default: 0.4. */
    sepiaIntensity?: number;
    /** Darkness of corners. Default: 0.5. */
    vignetteDarkness?: number;
    /** Add photographic grain. Default: true. */
    filmGrain?: boolean;
    /** Color saturation adjustment. Default: -0.3. */
    saturation?: number;
}

/**
 * Props for the DynamicDOF component.
 * @category Rendering Pipeline
 */
export interface DynamicDOFProps extends EffectPresetProps {
    /** Target object to track for focusing. */
    target?: React.RefObject<THREE.Object3D>;
    /** Fixed focus distance if no target is provided. Default: 5.0. */
    focusDistance?: number;
    /** Virtual lens focal length in mm. Default: 50. */
    focalLength?: number;
    /** Size of the bokeh blur circles. Default: 2.0. */
    bokehScale?: number;
    /** Speed of focus tracking adjustment. Default: 5.0. */
    focusSpeed?: number;
}

/**
 * Ref interface for DynamicDOF imperative control.
 * @category Rendering Pipeline
 */
export interface DynamicDOFRef {
    /** Manually set the focus to a specific object. */
    focusOnTarget: (target: THREE.Object3D) => void;
    /** Get current focus distance in units. */
    getFocusDistance: () => number;
}

/**
 * Props for the MotionBlurEffect component.
 * @category Rendering Pipeline
 */
export interface MotionBlurEffectProps extends EffectPresetProps {
    /** Blur strength multiplier. Default: 0.5. */
    intensity?: number;
    /** Amount of noise jitter in the blur. Default: 0.5. */
    jitter?: number;
    /** Number of samples for blur quality. Default: 9. */
    samples?: number;
}

export type {
    BloomSettings,
    BrightnessContrastSettings,
    ChromaticAberrationSettings,
    ColorGradingSettings,
    DOFSettings,
    FilmGrainSettings,
    PostProcessingPreset,
    SepiaSettings,
    SSAOSettings,
    VignetteSettings,
};
