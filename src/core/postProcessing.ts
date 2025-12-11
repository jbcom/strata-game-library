/**
 * Post-Processing Core Utilities
 *
 * Provides types, interfaces, and helper functions for post-processing effects.
 * Designed to work with @react-three/postprocessing.
 */

import * as THREE from 'three';

/**
 * Mood/style presets for post-processing
 */
export type PostProcessingMood =
    | 'cinematic'
    | 'dreamy'
    | 'horror'
    | 'neon'
    | 'realistic'
    | 'vintage'
    | 'noir'
    | 'sci-fi';

/**
 * Bloom effect settings
 */
export interface BloomSettings {
    /** Bloom intensity (0-3, default 1) */
    intensity: number;
    /** Luminance threshold for bloom (0-1, default 0.9) */
    luminanceThreshold: number;
    /** Smoothing for luminance threshold (0-1, default 0.025) */
    luminanceSmoothing: number;
    /** Mip map blur (default true) */
    mipmapBlur?: boolean;
    /** Blur radius (default 0.85) */
    radius?: number;
    /** Number of blur levels (default 8) */
    levels?: number;
}

/**
 * Depth of Field effect settings
 */
export interface DOFSettings {
    /** Focus distance from camera (in world units) */
    focusDistance: number;
    /** Focal length of lens (mm, default 50) */
    focalLength: number;
    /** Bokeh scale (0-5, default 2) */
    bokehScale: number;
    /** Blur resolution (default 512) */
    resolution?: number;
    /** Enable pentagon-shaped bokeh (default true) */
    pentagon?: boolean;
}

/**
 * Vignette effect settings
 */
export interface VignetteSettings {
    /** Darkness of vignette (0-1, default 0.5) */
    darkness: number;
    /** Offset from center (0-1, default 0.5) */
    offset: number;
    /** Technique: 'default' or 'eskil' (default 'default') */
    technique?: 'default' | 'eskil';
}

/**
 * Chromatic Aberration effect settings
 */
export interface ChromaticAberrationSettings {
    /** Offset vector for chromatic shift */
    offset: { x: number; y: number };
    /** Radial modulation (default true) */
    radialModulation?: boolean;
    /** Modulation offset (default 0.15) */
    modulationOffset?: number;
}

/**
 * Film Grain effect settings
 */
export interface FilmGrainSettings {
    /** Grain intensity (0-1, default 0.1) */
    intensity: number;
    /** Grain luminance (0-1, default 0.8) */
    luminance?: number;
}

/**
 * Color Grading / HueSaturation settings
 */
export interface ColorGradingSettings {
    /** Hue shift in radians (-π to π) */
    hue: number;
    /** Saturation adjustment (-1 to 1, 0 is neutral) */
    saturation: number;
    /** Brightness adjustment (-1 to 1, 0 is neutral) */
    brightness?: number;
}

/**
 * SSAO (Screen Space Ambient Occlusion) settings
 */
export interface SSAOSettings {
    /** Blend mode */
    blendFunction?: number;
    /** Sample count (default 9) */
    samples?: number;
    /** Occlusion hemisphere radius */
    radius?: number;
    /** Intensity multiplier (default 1) */
    intensity?: number;
    /** Distance threshold */
    distanceThreshold?: number;
    /** Distance falloff */
    distanceFalloff?: number;
    /** Range threshold */
    rangeThreshold?: number;
    /** Range falloff */
    rangeFalloff?: number;
    /** Luminance influence (default 0.7) */
    luminanceInfluence?: number;
    /** Bias (default 0.5) */
    bias?: number;
}

/**
 * Tone Mapping settings
 */
export interface ToneMappingSettings {
    /** Tone mapping mode (0-5) */
    mode: number;
    /** Exposure (default 1) */
    exposure?: number;
    /** White point (default 4) */
    whitePoint?: number;
}

/**
 * Noise effect settings
 */
export interface NoiseSettings {
    /** Premultiply noise (default false) */
    premultiply?: boolean;
    /** Blend function */
    blendFunction?: number;
}

/**
 * Brightness/Contrast settings
 */
export interface BrightnessContrastSettings {
    /** Brightness adjustment (-1 to 1, 0 is neutral) */
    brightness: number;
    /** Contrast adjustment (-1 to 1, 0 is neutral) */
    contrast: number;
}

/**
 * Sepia effect settings
 */
export interface SepiaSettings {
    /** Intensity (0-1, default 1) */
    intensity: number;
}

/**
 * Complete post-processing preset configuration
 */
export interface PostProcessingPreset {
    /** Preset name */
    name: string;
    /** Description */
    description: string;
    /** Mood category */
    mood: PostProcessingMood;
    /** Bloom settings */
    bloom?: Partial<BloomSettings>;
    /** Depth of field settings */
    dof?: Partial<DOFSettings>;
    /** Vignette settings */
    vignette?: Partial<VignetteSettings>;
    /** Chromatic aberration settings */
    chromaticAberration?: Partial<ChromaticAberrationSettings>;
    /** Film grain settings */
    filmGrain?: Partial<FilmGrainSettings>;
    /** Color grading settings */
    colorGrading?: Partial<ColorGradingSettings>;
    /** SSAO settings */
    ssao?: Partial<SSAOSettings>;
    /** Tone mapping settings */
    toneMapping?: Partial<ToneMappingSettings>;
    /** Noise settings */
    noise?: Partial<NoiseSettings>;
    /** Brightness/contrast settings */
    brightnessContrast?: Partial<BrightnessContrastSettings>;
    /** Sepia settings */
    sepia?: Partial<SepiaSettings>;
}

/**
 * LUT (Look-Up Table) configuration for color grading
 */
export interface LUTConfig {
    /** LUT texture URL or data */
    textureUrl?: string;
    /** LUT size (default 64) */
    size?: number;
    /** LUT intensity (0-1, default 1) */
    intensity?: number;
}

/**
 * Pre-defined LUT configurations
 */
export const lutConfigs: Record<string, LUTConfig> = {
    neutral: { intensity: 0 },
    warm: { intensity: 0.5 },
    cool: { intensity: 0.5 },
    cinematic: { intensity: 0.8 },
    vintage: { intensity: 0.7 },
};

/**
 * Calculate focus distance from camera to a target object
 * @param camera The camera
 * @param targetPosition Target position in world space
 * @returns Distance from camera to target
 */
export function calculateFocusDistance(
    camera: THREE.Camera,
    targetPosition: THREE.Vector3
): number {
    const cameraWorldPos = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPos);
    return cameraWorldPos.distanceTo(targetPosition);
}

/**
 * Calculate focus distance to center of a mesh
 * @param camera The camera
 * @param mesh Target mesh
 * @returns Distance from camera to mesh center
 */
export function calculateFocusDistanceToMesh(
    camera: THREE.Camera,
    mesh: THREE.Object3D
): number {
    const meshWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(meshWorldPos);
    return calculateFocusDistance(camera, meshWorldPos);
}

/**
 * Convert focal length (mm) to field of view (radians)
 * @param focalLength Focal length in mm
 * @param sensorHeight Sensor height in mm (default 24 for full frame)
 * @returns Field of view in radians
 */
export function focalLengthToFOV(focalLength: number, sensorHeight: number = 24): number {
    return 2 * Math.atan(sensorHeight / (2 * focalLength));
}

/**
 * Convert field of view (radians) to focal length (mm)
 * @param fov Field of view in radians
 * @param sensorHeight Sensor height in mm (default 24 for full frame)
 * @returns Focal length in mm
 */
export function fovToFocalLength(fov: number, sensorHeight: number = 24): number {
    return sensorHeight / (2 * Math.tan(fov / 2));
}

/**
 * Calculate bokeh scale based on aperture (f-stop)
 * @param fStop Aperture f-stop value (e.g., 1.4, 2.8, 5.6)
 * @returns Bokeh scale value
 */
export function apertureToBokehScale(fStop: number): number {
    return Math.max(0.5, 8 / fStop);
}

/**
 * Get DOF settings for common photography scenarios
 */
export const dofScenarios = {
    /** Portrait: shallow DOF, f/1.4 equivalent */
    portrait: {
        focusDistance: 2,
        focalLength: 85,
        bokehScale: 5,
    },
    /** Landscape: deep DOF, f/11 equivalent */
    landscape: {
        focusDistance: 50,
        focalLength: 24,
        bokehScale: 0.7,
    },
    /** Macro: very shallow DOF */
    macro: {
        focusDistance: 0.3,
        focalLength: 100,
        bokehScale: 8,
    },
    /** Street: moderate DOF, f/4 equivalent */
    street: {
        focusDistance: 5,
        focalLength: 35,
        bokehScale: 2,
    },
    /** Cinematic: film-like DOF */
    cinematic: {
        focusDistance: 4,
        focalLength: 50,
        bokehScale: 3,
    },
};

/**
 * Default settings for each effect type
 */
export const defaultEffectSettings = {
    bloom: {
        intensity: 1,
        luminanceThreshold: 0.9,
        luminanceSmoothing: 0.025,
        mipmapBlur: true,
        radius: 0.85,
        levels: 8,
    } as BloomSettings,
    dof: {
        focusDistance: 5,
        focalLength: 50,
        bokehScale: 2,
        resolution: 512,
        pentagon: true,
    } as DOFSettings,
    vignette: {
        darkness: 0.5,
        offset: 0.5,
        technique: 'default',
    } as VignetteSettings,
    chromaticAberration: {
        offset: { x: 0.002, y: 0.002 },
        radialModulation: true,
        modulationOffset: 0.15,
    } as ChromaticAberrationSettings,
    filmGrain: {
        intensity: 0.1,
        luminance: 0.8,
    } as FilmGrainSettings,
    colorGrading: {
        hue: 0,
        saturation: 0,
        brightness: 0,
    } as ColorGradingSettings,
    ssao: {
        samples: 9,
        radius: 0.1,
        intensity: 1,
        luminanceInfluence: 0.7,
        bias: 0.5,
    } as SSAOSettings,
    toneMapping: {
        mode: 1,
        exposure: 1,
        whitePoint: 4,
    } as ToneMappingSettings,
    noise: {
        premultiply: false,
    } as NoiseSettings,
    brightnessContrast: {
        brightness: 0,
        contrast: 0,
    } as BrightnessContrastSettings,
    sepia: {
        intensity: 1,
    } as SepiaSettings,
};

/**
 * Blend two preset configurations
 * @param presetA First preset
 * @param presetB Second preset
 * @param t Blend factor (0 = presetA, 1 = presetB)
 * @returns Blended preset
 */
export function blendPostProcessingPresets(
    presetA: PostProcessingPreset,
    presetB: PostProcessingPreset,
    t: number
): PostProcessingPreset {
    const clampedT = Math.max(0, Math.min(1, t));

    const blend = (a: number | undefined, b: number | undefined, def: number): number => {
        const va = a ?? def;
        const vb = b ?? def;
        return va + (vb - va) * clampedT;
    };

    return {
        name: `${presetA.name} → ${presetB.name}`,
        description: `Blend between ${presetA.name} and ${presetB.name}`,
        mood: clampedT < 0.5 ? presetA.mood : presetB.mood,
        bloom: presetA.bloom || presetB.bloom ? {
            intensity: blend(presetA.bloom?.intensity, presetB.bloom?.intensity, 1),
            luminanceThreshold: blend(presetA.bloom?.luminanceThreshold, presetB.bloom?.luminanceThreshold, 0.9),
            luminanceSmoothing: blend(presetA.bloom?.luminanceSmoothing, presetB.bloom?.luminanceSmoothing, 0.025),
            radius: blend(presetA.bloom?.radius, presetB.bloom?.radius, 0.85),
        } : undefined,
        vignette: presetA.vignette || presetB.vignette ? {
            darkness: blend(presetA.vignette?.darkness, presetB.vignette?.darkness, 0.5),
            offset: blend(presetA.vignette?.offset, presetB.vignette?.offset, 0.5),
        } : undefined,
        filmGrain: presetA.filmGrain || presetB.filmGrain ? {
            intensity: blend(presetA.filmGrain?.intensity, presetB.filmGrain?.intensity, 0.1),
        } : undefined,
        colorGrading: presetA.colorGrading || presetB.colorGrading ? {
            hue: blend(presetA.colorGrading?.hue, presetB.colorGrading?.hue, 0),
            saturation: blend(presetA.colorGrading?.saturation, presetB.colorGrading?.saturation, 0),
            brightness: blend(presetA.colorGrading?.brightness, presetB.colorGrading?.brightness, 0),
        } : undefined,
        chromaticAberration: presetA.chromaticAberration || presetB.chromaticAberration ? {
            offset: {
                x: blend(presetA.chromaticAberration?.offset?.x, presetB.chromaticAberration?.offset?.x, 0.002),
                y: blend(presetA.chromaticAberration?.offset?.y, presetB.chromaticAberration?.offset?.y, 0.002),
            },
        } : undefined,
    };
}

/**
 * Calculate effect intensity based on time of day
 * @param hours Current hour (0-24)
 * @returns Object with recommended effect intensities
 */
export function getTimeOfDayEffects(hours: number): {
    bloomIntensity: number;
    vignetteOffset: number;
    colorTemperature: number;
} {
    const normalizedTime = hours / 24;

    const sunIntensity = Math.max(0, Math.sin((normalizedTime - 0.25) * Math.PI * 2));

    const isGoldenHour = (hours >= 6 && hours <= 8) || (hours >= 17 && hours <= 19);
    const isNight = hours < 6 || hours > 20;

    return {
        bloomIntensity: isGoldenHour ? 1.5 : isNight ? 0.5 : 1.0,
        vignetteOffset: isNight ? 0.3 : 0.5,
        colorTemperature: isGoldenHour ? 0.2 : isNight ? -0.1 : 0,
    };
}
