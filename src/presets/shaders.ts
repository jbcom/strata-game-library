/**
 * Shader presets for Strata
 * Pre-configured shader settings for common visual styles
 */

import type {
    CrystalMaterialOptions,
    DissolveMaterialOptions,
    ForcefieldMaterialOptions,
    GlitchMaterialOptions,
    GradientMaterialOptions,
    HologramMaterialOptions,
    ScanlineMaterialOptions,
    ToonMaterialOptions,
} from '../shaders/materials';

export interface ToonPreset extends ToonMaterialOptions {
    name: string;
    description: string;
}

export const toonPresets: Record<string, ToonPreset> = {
    anime: {
        name: 'Anime',
        description: 'Classic anime cel-shading style',
        color: 0xffaaaa,
        levels: 3,
        rimColor: 0xffffff,
        rimPower: 3.0,
        outlineColor: 0x000000,
        outlineWidth: 0.03,
    },
    comic: {
        name: 'Comic',
        description: 'Bold comic book style with hard shadows',
        color: 0xffcc00,
        levels: 2,
        rimColor: 0xffffff,
        rimPower: 5.0,
        outlineColor: 0x000000,
        outlineWidth: 0.05,
    },
    minimal: {
        name: 'Minimal',
        description: 'Subtle toon shading with soft edges',
        color: 0xeeeeee,
        levels: 5,
        rimColor: 0x8888ff,
        rimPower: 2.0,
        outlineColor: 0x333333,
        outlineWidth: 0.01,
    },
    pastel: {
        name: 'Pastel',
        description: 'Soft pastel colors with gentle shading',
        color: 0xffccee,
        levels: 4,
        rimColor: 0xccffee,
        rimPower: 2.5,
        outlineColor: 0x886688,
        outlineWidth: 0.02,
    },
};

export interface HologramPreset extends HologramMaterialOptions {
    name: string;
    description: string;
}

export const hologramPresets: Record<string, HologramPreset> = {
    blue: {
        name: 'Blue Hologram',
        description: 'Classic sci-fi blue hologram',
        color: 0x00ffff,
        scanlineIntensity: 0.5,
        scanlineDensity: 100,
        flickerSpeed: 1.0,
        fresnelPower: 2.0,
        alpha: 0.8,
    },
    red: {
        name: 'Red Alert',
        description: 'Warning/alert style hologram',
        color: 0xff3333,
        scanlineIntensity: 0.7,
        scanlineDensity: 80,
        flickerSpeed: 2.0,
        fresnelPower: 2.5,
        alpha: 0.9,
    },
    matrix: {
        name: 'Matrix',
        description: 'Green matrix-style hologram',
        color: 0x00ff00,
        scanlineIntensity: 0.6,
        scanlineDensity: 150,
        flickerSpeed: 0.5,
        fresnelPower: 1.5,
        alpha: 0.7,
    },
    ghost: {
        name: 'Ghost',
        description: 'Ethereal white hologram',
        color: 0xffffff,
        scanlineIntensity: 0.3,
        scanlineDensity: 50,
        flickerSpeed: 0.3,
        fresnelPower: 3.0,
        alpha: 0.5,
    },
    purple: {
        name: 'Mystic',
        description: 'Magical purple hologram',
        color: 0xaa00ff,
        scanlineIntensity: 0.4,
        scanlineDensity: 120,
        flickerSpeed: 0.8,
        fresnelPower: 2.0,
        alpha: 0.75,
    },
};

export interface DissolvePreset extends DissolveMaterialOptions {
    name: string;
    description: string;
}

export const dissolvePresets: Record<string, DissolvePreset> = {
    fire: {
        name: 'Fire',
        description: 'Burning away effect with orange edges',
        color: 0xffffff,
        edgeColor: 0xff6600,
        edgeWidth: 0.08,
        noiseScale: 3.0,
    },
    ice: {
        name: 'Ice',
        description: 'Freezing/crystallizing effect',
        color: 0xffffff,
        edgeColor: 0x88ddff,
        edgeWidth: 0.05,
        noiseScale: 5.0,
    },
    magic: {
        name: 'Magic',
        description: 'Magical sparkle dissolve',
        color: 0xffffff,
        edgeColor: 0xff00ff,
        edgeWidth: 0.1,
        noiseScale: 4.0,
    },
    disintegrate: {
        name: 'Disintegrate',
        description: 'Thanos-snap style disintegration',
        color: 0x888888,
        edgeColor: 0xffaa00,
        edgeWidth: 0.03,
        noiseScale: 8.0,
    },
    electric: {
        name: 'Electric',
        description: 'Electric discharge dissolve',
        color: 0xffffff,
        edgeColor: 0x00ffff,
        edgeWidth: 0.06,
        noiseScale: 6.0,
    },
};

export interface ForcefieldPreset extends ForcefieldMaterialOptions {
    name: string;
    description: string;
}

export const forcefieldPresets: Record<string, ForcefieldPreset> = {
    scifi: {
        name: 'Sci-Fi Shield',
        description: 'Classic sci-fi energy shield',
        color: 0x00ffff,
        secondaryColor: 0x0088ff,
        fresnelPower: 3.0,
        pulseSpeed: 1.0,
        hexagonScale: 10.0,
        alpha: 0.6,
    },
    magic: {
        name: 'Magic Barrier',
        description: 'Fantasy magic barrier',
        color: 0xff00ff,
        secondaryColor: 0x8800ff,
        fresnelPower: 2.5,
        pulseSpeed: 0.5,
        hexagonScale: 15.0,
        alpha: 0.5,
    },
    fire: {
        name: 'Fire Shield',
        description: 'Protective fire barrier',
        color: 0xff6600,
        secondaryColor: 0xff0000,
        fresnelPower: 2.0,
        pulseSpeed: 2.0,
        hexagonScale: 8.0,
        alpha: 0.7,
    },
    holy: {
        name: 'Holy Shield',
        description: 'Divine protection barrier',
        color: 0xffffaa,
        secondaryColor: 0xffcc00,
        fresnelPower: 4.0,
        pulseSpeed: 0.3,
        hexagonScale: 12.0,
        alpha: 0.4,
    },
};

export interface GlitchPreset extends GlitchMaterialOptions {
    name: string;
    description: string;
}

export const glitchPresets: Record<string, GlitchPreset> = {
    subtle: {
        name: 'Subtle',
        description: 'Occasional minor glitches',
        color: 0xffffff,
        glitchIntensity: 0.05,
        scanlineIntensity: 0.2,
        rgbShiftAmount: 0.005,
    },
    moderate: {
        name: 'Moderate',
        description: 'Noticeable digital corruption',
        color: 0xffffff,
        glitchIntensity: 0.1,
        scanlineIntensity: 0.3,
        rgbShiftAmount: 0.01,
    },
    extreme: {
        name: 'Extreme',
        description: 'Heavy digital corruption',
        color: 0xffffff,
        glitchIntensity: 0.2,
        scanlineIntensity: 0.5,
        rgbShiftAmount: 0.02,
    },
    vhs: {
        name: 'VHS',
        description: 'Old VHS tape effect',
        color: 0xffffee,
        glitchIntensity: 0.08,
        scanlineIntensity: 0.4,
        rgbShiftAmount: 0.015,
    },
};

export interface CrystalPreset extends CrystalMaterialOptions {
    name: string;
    description: string;
}

export const crystalPresets: Record<string, CrystalPreset> = {
    diamond: {
        name: 'Diamond',
        description: 'Clear diamond-like crystal',
        color: 0xffffff,
        fresnelPower: 5.0,
        rainbowIntensity: 0.4,
    },
    ruby: {
        name: 'Ruby',
        description: 'Red ruby crystal',
        color: 0xff2244,
        fresnelPower: 4.0,
        rainbowIntensity: 0.2,
    },
    emerald: {
        name: 'Emerald',
        description: 'Green emerald crystal',
        color: 0x22ff44,
        fresnelPower: 4.0,
        rainbowIntensity: 0.25,
    },
    sapphire: {
        name: 'Sapphire',
        description: 'Blue sapphire crystal',
        color: 0x2244ff,
        fresnelPower: 4.0,
        rainbowIntensity: 0.25,
    },
    amethyst: {
        name: 'Amethyst',
        description: 'Purple amethyst crystal',
        color: 0x8844ff,
        fresnelPower: 3.5,
        rainbowIntensity: 0.3,
    },
    opal: {
        name: 'Opal',
        description: 'Iridescent opal',
        color: 0xffeedd,
        fresnelPower: 3.0,
        rainbowIntensity: 0.6,
    },
};

export interface GradientPreset extends GradientMaterialOptions {
    name: string;
    description: string;
}

export const gradientPresets: Record<string, GradientPreset> = {
    sunset: {
        name: 'Sunset',
        description: 'Warm sunset gradient',
        colorStart: 0xff6b35,
        colorMiddle: 0xf7931e,
        colorEnd: 0xffd700,
        direction: 'vertical',
        useThreeColors: true,
    },
    ocean: {
        name: 'Ocean',
        description: 'Deep ocean blue gradient',
        colorStart: 0x1a1a2e,
        colorMiddle: 0x16213e,
        colorEnd: 0x0f3460,
        direction: 'vertical',
        useThreeColors: true,
    },
    forest: {
        name: 'Forest',
        description: 'Lush forest green gradient',
        colorStart: 0x1b4332,
        colorMiddle: 0x2d6a4f,
        colorEnd: 0x40916c,
        direction: 'vertical',
        useThreeColors: true,
    },
    fire: {
        name: 'Fire',
        description: 'Hot fire gradient',
        colorStart: 0xff0000,
        colorMiddle: 0xff6600,
        colorEnd: 0xffff00,
        direction: 'vertical',
        useThreeColors: true,
    },
    ice: {
        name: 'Ice',
        description: 'Cold ice gradient',
        colorStart: 0xffffff,
        colorMiddle: 0x88ddff,
        colorEnd: 0x0066ff,
        direction: 'vertical',
        useThreeColors: true,
    },
    neon: {
        name: 'Neon',
        description: 'Vibrant neon gradient',
        colorStart: 0xff00ff,
        colorEnd: 0x00ffff,
        direction: 'horizontal',
        useThreeColors: false,
    },
    grayscale: {
        name: 'Grayscale',
        description: 'Black to white gradient',
        colorStart: 0x000000,
        colorEnd: 0xffffff,
        direction: 'radial',
        useThreeColors: false,
    },
};

export interface ScanlinePreset extends ScanlineMaterialOptions {
    name: string;
    description: string;
}

export const scanlinePresets: Record<string, ScanlinePreset> = {
    crt: {
        name: 'CRT',
        description: 'Classic CRT monitor effect',
        color: 0x00ff00,
        backgroundColor: 0x001100,
        scanlineDensity: 400,
        scanlineOpacity: 0.3,
        flickerIntensity: 0.03,
        curvature: 0.1,
    },
    retro: {
        name: 'Retro',
        description: 'Retro gaming console look',
        color: 0xffcc00,
        backgroundColor: 0x110800,
        scanlineDensity: 300,
        scanlineOpacity: 0.4,
        flickerIntensity: 0.05,
        curvature: 0.15,
    },
    terminal: {
        name: 'Terminal',
        description: 'Old computer terminal',
        color: 0x00ff88,
        backgroundColor: 0x000a04,
        scanlineDensity: 500,
        scanlineOpacity: 0.25,
        flickerIntensity: 0.02,
        curvature: 0.05,
    },
    arcade: {
        name: 'Arcade',
        description: 'Arcade cabinet monitor',
        color: 0xffffff,
        backgroundColor: 0x000000,
        scanlineDensity: 350,
        scanlineOpacity: 0.35,
        flickerIntensity: 0.04,
        curvature: 0.12,
    },
};

export interface ColorPalette {
    name: string;
    description: string;
    colors: number[];
}

export const colorPalettes: Record<string, ColorPalette> = {
    sunset: {
        name: 'Sunset',
        description: 'Warm sunset colors',
        colors: [0xff6b35, 0xf7931e, 0xffd700, 0xff8c00, 0xdc143c],
    },
    forest: {
        name: 'Forest',
        description: 'Natural forest greens',
        colors: [0x1b4332, 0x2d6a4f, 0x40916c, 0x52b788, 0x74c69d],
    },
    ocean: {
        name: 'Ocean',
        description: 'Deep ocean blues',
        colors: [0x03045e, 0x023e8a, 0x0077b6, 0x0096c7, 0x00b4d8],
    },
    cyberpunk: {
        name: 'Cyberpunk',
        description: 'Neon cyberpunk colors',
        colors: [0xff00ff, 0x00ffff, 0xff0066, 0x00ff66, 0xffff00],
    },
    pastel: {
        name: 'Pastel',
        description: 'Soft pastel colors',
        colors: [0xffc8dd, 0xffafcc, 0xbde0fe, 0xa2d2ff, 0xcdb4db],
    },
    earth: {
        name: 'Earth',
        description: 'Natural earth tones',
        colors: [0x8b4513, 0xa0522d, 0xcd853f, 0xdeb887, 0xf5deb3],
    },
    monochrome: {
        name: 'Monochrome',
        description: 'Grayscale palette',
        colors: [0x111111, 0x333333, 0x666666, 0x999999, 0xcccccc],
    },
    vintage: {
        name: 'Vintage',
        description: 'Retro vintage colors',
        colors: [0xd4a373, 0xe9c46a, 0x264653, 0x2a9d8f, 0xe76f51],
    },
};

export type ToonPresetName = keyof typeof toonPresets;
export type HologramPresetName = keyof typeof hologramPresets;
export type DissolvePresetName = keyof typeof dissolvePresets;
export type ForcefieldPresetName = keyof typeof forcefieldPresets;
export type GlitchPresetName = keyof typeof glitchPresets;
export type CrystalPresetName = keyof typeof crystalPresets;
export type GradientPresetName = keyof typeof gradientPresets;
export type ScanlinePresetName = keyof typeof scanlinePresets;
export type ColorPaletteName = keyof typeof colorPalettes;

export function getToonPreset(name: ToonPresetName): ToonPreset {
    return toonPresets[name] || toonPresets.anime;
}

export function getHologramPreset(name: HologramPresetName): HologramPreset {
    return hologramPresets[name] || hologramPresets.blue;
}

export function getDissolvePreset(name: DissolvePresetName): DissolvePreset {
    return dissolvePresets[name] || dissolvePresets.fire;
}

export function getForcefieldPreset(name: ForcefieldPresetName): ForcefieldPreset {
    return forcefieldPresets[name] || forcefieldPresets.scifi;
}

export function getGlitchPreset(name: GlitchPresetName): GlitchPreset {
    return glitchPresets[name] || glitchPresets.moderate;
}

export function getCrystalPreset(name: CrystalPresetName): CrystalPreset {
    return crystalPresets[name] || crystalPresets.diamond;
}

export function getGradientPreset(name: GradientPresetName): GradientPreset {
    return gradientPresets[name] || gradientPresets.sunset;
}

export function getScanlinePreset(name: ScanlinePresetName): ScanlinePreset {
    return scanlinePresets[name] || scanlinePresets.crt;
}

export function getColorPalette(name: ColorPaletteName): ColorPalette {
    return colorPalettes[name] || colorPalettes.sunset;
}
