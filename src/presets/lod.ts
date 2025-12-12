/**
 * LOD Presets
 *
 * Provides pre-configured LOD profiles for different performance targets
 * and device capabilities.
 */

import type { LODConfig, VegetationLODConfig } from '../core/lod';

export type LODPresetName = 'performance' | 'quality' | 'mobile' | 'desktop' | 'ultra';

export interface LODPreset {
    name: LODPresetName;
    description: string;
    distances: {
        high: number;
        medium: number;
        low: number;
        impostor: number;
        cull: number;
    };
    hysteresis: number;
    transitionDuration: number;
    fadeMode: 'instant' | 'crossfade' | 'dither';
    simplificationRatios: {
        medium: number;
        low: number;
    };
    vegetationDensityMultiplier: number;
    shadowLODLevel: number;
    impostorViews: number;
    impostorResolution: number;
}

export const LOD_PRESETS: Record<LODPresetName, LODPreset> = {
    performance: {
        name: 'performance',
        description: 'Aggressive LOD transitions for maximum performance',
        distances: {
            high: 10,
            medium: 25,
            low: 50,
            impostor: 100,
            cull: 200,
        },
        hysteresis: 0.15,
        transitionDuration: 0.1,
        fadeMode: 'instant',
        simplificationRatios: {
            medium: 0.3,
            low: 0.1,
        },
        vegetationDensityMultiplier: 0.5,
        shadowLODLevel: 1,
        impostorViews: 4,
        impostorResolution: 128,
    },

    quality: {
        name: 'quality',
        description: 'Subtle LOD transitions for visual quality',
        distances: {
            high: 50,
            medium: 100,
            low: 200,
            impostor: 400,
            cull: 1000,
        },
        hysteresis: 0.05,
        transitionDuration: 0.5,
        fadeMode: 'crossfade',
        simplificationRatios: {
            medium: 0.7,
            low: 0.4,
        },
        vegetationDensityMultiplier: 1.0,
        shadowLODLevel: 2,
        impostorViews: 16,
        impostorResolution: 512,
    },

    mobile: {
        name: 'mobile',
        description: 'Very aggressive LOD for mobile devices',
        distances: {
            high: 5,
            medium: 15,
            low: 30,
            impostor: 60,
            cull: 120,
        },
        hysteresis: 0.2,
        transitionDuration: 0,
        fadeMode: 'instant',
        simplificationRatios: {
            medium: 0.2,
            low: 0.05,
        },
        vegetationDensityMultiplier: 0.25,
        shadowLODLevel: 0,
        impostorViews: 4,
        impostorResolution: 64,
    },

    desktop: {
        name: 'desktop',
        description: 'Balanced LOD for desktop systems',
        distances: {
            high: 30,
            medium: 60,
            low: 120,
            impostor: 250,
            cull: 500,
        },
        hysteresis: 0.1,
        transitionDuration: 0.3,
        fadeMode: 'crossfade',
        simplificationRatios: {
            medium: 0.5,
            low: 0.2,
        },
        vegetationDensityMultiplier: 0.75,
        shadowLODLevel: 1,
        impostorViews: 8,
        impostorResolution: 256,
    },

    ultra: {
        name: 'ultra',
        description: 'Minimal LOD for high-end systems',
        distances: {
            high: 100,
            medium: 200,
            low: 400,
            impostor: 800,
            cull: 2000,
        },
        hysteresis: 0.02,
        transitionDuration: 0.8,
        fadeMode: 'crossfade',
        simplificationRatios: {
            medium: 0.85,
            low: 0.6,
        },
        vegetationDensityMultiplier: 1.5,
        shadowLODLevel: 3,
        impostorViews: 32,
        impostorResolution: 1024,
    },
};

export function getLODPreset(name: LODPresetName): LODPreset {
    return LOD_PRESETS[name];
}

export function createLODConfigFromPreset(preset: LODPreset | LODPresetName): LODConfig {
    const p = typeof preset === 'string' ? LOD_PRESETS[preset] : preset;

    return {
        levels: [
            { distance: p.distances.high },
            { distance: p.distances.medium },
            { distance: p.distances.low },
            { distance: p.distances.impostor },
            { distance: p.distances.cull, visible: false },
        ],
        hysteresis: p.hysteresis,
        transitionDuration: p.transitionDuration,
        fadeMode: p.fadeMode,
    };
}

export function createVegetationLODConfigFromPreset(
    preset: LODPreset | LODPresetName
): VegetationLODConfig {
    const p = typeof preset === 'string' ? LOD_PRESETS[preset] : preset;

    return {
        highDetailDistance: p.distances.high,
        mediumDetailDistance: p.distances.medium,
        lowDetailDistance: p.distances.low,
        impostorDistance: p.distances.impostor,
        cullDistance: p.distances.cull,
        transitionWidth: p.distances.high * 0.2,
    };
}

export function interpolateLODPresets(
    preset1: LODPreset,
    preset2: LODPreset,
    t: number
): LODPreset {
    const lerp = (a: number, b: number) => a + (b - a) * t;

    return {
        name: t < 0.5 ? preset1.name : preset2.name,
        description: `Interpolated between ${preset1.name} and ${preset2.name}`,
        distances: {
            high: lerp(preset1.distances.high, preset2.distances.high),
            medium: lerp(preset1.distances.medium, preset2.distances.medium),
            low: lerp(preset1.distances.low, preset2.distances.low),
            impostor: lerp(preset1.distances.impostor, preset2.distances.impostor),
            cull: lerp(preset1.distances.cull, preset2.distances.cull),
        },
        hysteresis: lerp(preset1.hysteresis, preset2.hysteresis),
        transitionDuration: lerp(preset1.transitionDuration, preset2.transitionDuration),
        fadeMode: t < 0.5 ? preset1.fadeMode : preset2.fadeMode,
        simplificationRatios: {
            medium: lerp(preset1.simplificationRatios.medium, preset2.simplificationRatios.medium),
            low: lerp(preset1.simplificationRatios.low, preset2.simplificationRatios.low),
        },
        vegetationDensityMultiplier: lerp(
            preset1.vegetationDensityMultiplier,
            preset2.vegetationDensityMultiplier
        ),
        shadowLODLevel: Math.round(lerp(preset1.shadowLODLevel, preset2.shadowLODLevel)),
        impostorViews: Math.round(lerp(preset1.impostorViews, preset2.impostorViews)),
        impostorResolution: Math.round(
            lerp(preset1.impostorResolution, preset2.impostorResolution)
        ),
    };
}

export function detectOptimalPreset(): LODPresetName {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return 'desktop';
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    if (isMobile) {
        return 'mobile';
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
        return 'performance';
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const rendererLower = renderer.toLowerCase();

        if (
            rendererLower.includes('rtx') ||
            rendererLower.includes('radeon rx 7') ||
            rendererLower.includes('radeon rx 6')
        ) {
            return 'ultra';
        }

        if (
            rendererLower.includes('gtx 10') ||
            rendererLower.includes('gtx 16') ||
            rendererLower.includes('rtx 20') ||
            rendererLower.includes('radeon rx 5')
        ) {
            return 'quality';
        }

        if (
            rendererLower.includes('intel') ||
            rendererLower.includes('hd graphics') ||
            rendererLower.includes('uhd graphics')
        ) {
            return 'performance';
        }
    }

    const memory = (navigator as any).deviceMemory;
    if (memory !== undefined) {
        if (memory >= 8) return 'quality';
        if (memory >= 4) return 'desktop';
        if (memory >= 2) return 'performance';
        return 'mobile';
    }

    return 'desktop';
}

export function createAdaptiveLODPreset(
    basePreset: LODPresetName = 'desktop',
    fpsTarget: number = 60
): {
    readonly preset: LODPreset;
    adapt: (currentFPS: number) => LODPreset;
} {
    let currentPreset = LOD_PRESETS[basePreset];
    let smoothedFPS = fpsTarget;

    const presetOrder: LODPresetName[] = ['mobile', 'performance', 'desktop', 'quality', 'ultra'];
    let currentIndex = presetOrder.indexOf(basePreset);

    return {
        // Use getter to always return current preset value
        get preset() {
            return currentPreset;
        },
        adapt: (currentFPS: number) => {
            smoothedFPS = smoothedFPS * 0.9 + currentFPS * 0.1;

            if (smoothedFPS < fpsTarget * 0.8 && currentIndex > 0) {
                currentIndex--;
                currentPreset = LOD_PRESETS[presetOrder[currentIndex]];
            } else if (smoothedFPS > fpsTarget * 1.1 && currentIndex < presetOrder.length - 1) {
                currentIndex++;
                currentPreset = LOD_PRESETS[presetOrder[currentIndex]];
            }

            return currentPreset;
        },
    };
}

export const PERFORMANCE_PRESET = LOD_PRESETS.performance;
export const QUALITY_PRESET = LOD_PRESETS.quality;
export const MOBILE_PRESET = LOD_PRESETS.mobile;
export const DESKTOP_PRESET = LOD_PRESETS.desktop;
export const ULTRA_PRESET = LOD_PRESETS.ultra;
