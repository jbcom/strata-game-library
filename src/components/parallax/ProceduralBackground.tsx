/**
 * Procedural Background Generator.
 *
 * Generates multi-layer parallax backgrounds procedurally based on biome type.
 * Perfect for infinite side-scrollers with varied environments.
 *
 * @packageDocumentation
 * @module components/parallax/ProceduralBackground
 * @category World Building
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { ParallaxBackground } from './ParallaxBackground';
import type { GeneratedLayer, ProceduralBackgroundConfig } from './types';

/**
 * Seeded random number generator for deterministic backgrounds.
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }

    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    int(min: number, max: number): number {
        return Math.floor(this.range(min, max + 1));
    }

    pick<T>(array: T[]): T {
        return array[this.int(0, array.length - 1)];
    }
}

/**
 * Biome color palettes.
 */
const BIOME_PALETTES: Record<
    ProceduralBackgroundConfig['biome'],
    {
        sky: [number, number]; // top, bottom gradient
        mountains: number[];
        foliage: number[];
        ground: number[];
        fog: number;
        ambient: number;
    }
> = {
    forest: {
        sky: [0x87ceeb, 0xb0e0e6],
        mountains: [0x2d5016, 0x3d6b22],
        foliage: [0x228b22, 0x32cd32, 0x006400],
        ground: [0x654321, 0x8b4513],
        fog: 0xaaccaa,
        ambient: 0x88aa88,
    },
    desert: {
        sky: [0x87ceeb, 0xffefd5],
        mountains: [0xd2691e, 0xcd853f],
        foliage: [0x9acd32, 0x6b8e23],
        ground: [0xedc9af, 0xdeb887],
        fog: 0xffeedd,
        ambient: 0xffddaa,
    },
    tundra: {
        sky: [0xb0c4de, 0xe6e6fa],
        mountains: [0x708090, 0x778899],
        foliage: [0x2f4f4f, 0x556b2f],
        ground: [0xfffafa, 0xf0f8ff],
        fog: 0xccddee,
        ambient: 0xaabbcc,
    },
    marsh: {
        sky: [0x4a5568, 0x718096],
        mountains: [0x2d3748, 0x4a5568],
        foliage: [0x2f855a, 0x276749, 0x22543d],
        ground: [0x4a5568, 0x2d3748],
        fog: 0x667788,
        ambient: 0x556677,
    },
    mountain: {
        sky: [0x4682b4, 0x87ceeb],
        mountains: [0x696969, 0x808080, 0xa9a9a9],
        foliage: [0x228b22, 0x006400],
        ground: [0x808080, 0x696969],
        fog: 0x9999aa,
        ambient: 0x8888aa,
    },
    ocean: {
        sky: [0x00bfff, 0x87ceeb],
        mountains: [0x4682b4, 0x5f9ea0],
        foliage: [0x20b2aa, 0x008b8b],
        ground: [0x008b8b, 0x006666],
        fog: 0x88ccdd,
        ambient: 0x66aacc,
    },
    cave: {
        sky: [0x1a1a2e, 0x16213e],
        mountains: [0x2d3436, 0x1e272e],
        foliage: [0x4d4d4d, 0x333333],
        ground: [0x2d2d2d, 0x1a1a1a],
        fog: 0x222233,
        ambient: 0x333344,
    },
    city: {
        sky: [0x4a5568, 0x2d3748],
        mountains: [0x1a202c, 0x2d3748],
        foliage: [0x2f855a, 0x276749],
        ground: [0x4a5568, 0x2d3748],
        fog: 0x445566,
        ambient: 0x556677,
    },
};

/**
 * Generate procedural background layers for a biome.
 */
export function generateBackgroundLayers(config: ProceduralBackgroundConfig): GeneratedLayer[] {
    const { biome, layerCount, seed = Date.now(), animated = true } = config;
    const rng = new SeededRandom(seed);
    const palette = BIOME_PALETTES[biome];
    const layers: GeneratedLayer[] = [];

    // Layer 0: Sky gradient (always present)
    layers.push({
        config: {
            id: 'sky',
            depth: layerCount + 2,
            scrollSpeed: 0,
            opacity: 1,
        },
        elements: [
            {
                type: 'gradient',
                x: 0,
                y: 0,
                width: 1000,
                height: 500,
                gradientData: {
                    type: 'linear',
                    angle: 90,
                    stops: [
                        { offset: 0, color: palette.sky[0] },
                        { offset: 1, color: palette.sky[1] },
                    ],
                },
            },
        ],
    });

    // Generate mountain/hill layers
    const mountainLayers = Math.min(2, Math.floor(layerCount / 3));
    for (let i = 0; i < mountainLayers; i++) {
        const depth = layerCount - i;
        const color = rng.pick(palette.mountains);

        layers.push({
            config: {
                id: `mountains-${i}`,
                depth,
                scrollSpeed: 0.1 + i * 0.05,
                repeatX: true,
                contentWidth: 512 + rng.int(0, 256),
                opacity: 0.9 - i * 0.1,
                affectedByDayNight: true,
                dayNightColors: {
                    day: color,
                    night: new THREE.Color(color).multiplyScalar(0.3).getHex(),
                    dawn: new THREE.Color(color).lerp(new THREE.Color(0xff8866), 0.2).getHex(),
                    dusk: new THREE.Color(color).lerp(new THREE.Color(0xff6644), 0.3).getHex(),
                },
            },
            elements: generateMountainSilhouette(rng, color, 512 + rng.int(0, 256)),
        });
    }

    // Generate foliage/tree layers
    const foliageLayers = Math.min(3, Math.ceil(layerCount / 2));
    for (let i = 0; i < foliageLayers; i++) {
        const depth = Math.floor(layerCount / 2) - i;
        const color = rng.pick(palette.foliage);

        layers.push({
            config: {
                id: `foliage-${i}`,
                depth: Math.max(1, depth),
                scrollSpeed: 0.3 + i * 0.15,
                repeatX: true,
                contentWidth: 256 + rng.int(0, 128),
                opacity: 1,
            },
            elements: generateFoliageSilhouette(rng, color, biome, 256 + rng.int(0, 128)),
        });
    }

    // Add animated particles if enabled
    if (animated) {
        const particleType = getParticleTypeForBiome(biome, config.weather ?? 'none');
        if (particleType) {
            layers.push({
                config: {
                    id: 'particles',
                    depth: 1,
                    scrollSpeed: 0.8,
                    opacity: 0.8,
                },
                elements: [
                    {
                        type: 'particles',
                        x: 0,
                        y: 0,
                        width: 1000,
                        height: 500,
                        particleData: {
                            particleType,
                            count: getParticleCount(particleType, config.weatherIntensity ?? 0.5),
                            color: getParticleColor(particleType, palette),
                            sizeRange: [1, 3],
                            speedRange: [0.5, 2],
                            lifetime: 5,
                            spawnArea:
                                particleType === 'rain' || particleType === 'snow' ? 'top' : 'full',
                        },
                    },
                ],
            });
        }
    }

    return layers;
}

/**
 * Generate a mountain/hill silhouette.
 */
function generateMountainSilhouette(
    rng: SeededRandom,
    color: number,
    width: number
): GeneratedLayer['elements'] {
    const points: [number, number][] = [];
    const segments = rng.int(8, 16);
    const segmentWidth = width / segments;

    // Start at bottom left
    points.push([0, 200]);

    // Generate peaks
    for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const baseHeight = 50 + rng.range(0, 100);
        const peakVariation = rng.range(-30, 30);
        points.push([x, baseHeight + peakVariation]);
    }

    // Close at bottom right
    points.push([width, 200]);

    return [
        {
            type: 'shape',
            x: 0,
            y: 0,
            width,
            height: 200,
            shapeData: {
                shape: 'polygon',
                color,
                points,
            },
        },
    ];
}

/**
 * Generate foliage silhouette based on biome.
 */
function generateFoliageSilhouette(
    rng: SeededRandom,
    color: number,
    biome: ProceduralBackgroundConfig['biome'],
    width: number
): GeneratedLayer['elements'] {
    const elements: GeneratedLayer['elements'] = [];

    switch (biome) {
        case 'forest':
        case 'mountain': {
            // Generate tree shapes
            const treeCount = rng.int(3, 6);
            for (let i = 0; i < treeCount; i++) {
                const x = rng.range(0, width);
                const height = rng.range(40, 80);
                elements.push({
                    type: 'shape',
                    x,
                    y: 150 - height,
                    width: height * 0.6,
                    height,
                    shapeData: {
                        shape: 'triangle',
                        color,
                        points: [
                            [height * 0.3, 0],
                            [0, height],
                            [height * 0.6, height],
                        ],
                    },
                    animation: {
                        type: 'sway',
                        amplitude: 2,
                        frequency: 0.5 + rng.range(0, 0.3),
                        phase: rng.range(0, Math.PI * 2),
                    },
                });
            }
            break;
        }

        case 'marsh': {
            // Generate reed/grass shapes
            const reedCount = rng.int(10, 20);
            for (let i = 0; i < reedCount; i++) {
                const x = rng.range(0, width);
                const height = rng.range(20, 50);
                elements.push({
                    type: 'shape',
                    x,
                    y: 150 - height,
                    width: 3,
                    height,
                    shapeData: {
                        shape: 'rect',
                        color,
                    },
                    animation: {
                        type: 'sway',
                        amplitude: 4,
                        frequency: 0.3 + rng.range(0, 0.2),
                        phase: rng.range(0, Math.PI * 2),
                    },
                });
            }
            break;
        }

        case 'desert': {
            // Generate cactus shapes
            const cactusCount = rng.int(2, 4);
            for (let i = 0; i < cactusCount; i++) {
                const x = rng.range(0, width);
                const height = rng.range(30, 60);
                elements.push({
                    type: 'shape',
                    x,
                    y: 150 - height,
                    width: 10,
                    height,
                    shapeData: {
                        shape: 'rect',
                        color,
                        borderRadius: 5,
                    },
                });
            }
            break;
        }

        default: {
            // Generic bushes
            const bushCount = rng.int(4, 8);
            for (let i = 0; i < bushCount; i++) {
                const x = rng.range(0, width);
                const radius = rng.range(15, 30);
                elements.push({
                    type: 'shape',
                    x,
                    y: 150 - radius,
                    width: radius * 2,
                    height: radius,
                    shapeData: {
                        shape: 'ellipse',
                        color,
                    },
                });
            }
        }
    }

    return elements;
}

/**
 * Get particle type for biome and weather.
 */
function getParticleTypeForBiome(
    biome: ProceduralBackgroundConfig['biome'],
    weather: ProceduralBackgroundConfig['weather']
): 'firefly' | 'leaf' | 'snow' | 'rain' | 'dust' | null {
    if (weather === 'rain') return 'rain';
    if (weather === 'snow') return 'snow';

    switch (biome) {
        case 'forest':
            return 'leaf';
        case 'marsh':
            return 'firefly';
        case 'desert':
            return 'dust';
        case 'tundra':
            return 'snow';
        default:
            return null;
    }
}

/**
 * Get particle count based on type and intensity.
 */
function getParticleCount(
    type: 'firefly' | 'leaf' | 'snow' | 'rain' | 'dust',
    intensity: number
): number {
    const baseCounts: Record<typeof type, number> = {
        firefly: 20,
        leaf: 15,
        snow: 50,
        rain: 100,
        dust: 30,
    };
    return Math.floor(baseCounts[type] * intensity);
}

/**
 * Get particle color based on type.
 */
function getParticleColor(
    type: 'firefly' | 'leaf' | 'snow' | 'rain' | 'dust',
    palette: (typeof BIOME_PALETTES)[keyof typeof BIOME_PALETTES]
): number {
    switch (type) {
        case 'firefly':
            return 0xffff00;
        case 'leaf':
            return palette.foliage[0];
        case 'snow':
            return 0xffffff;
        case 'rain':
            return 0xaaddff;
        case 'dust':
            return palette.ground[0];
        default:
            return 0xffffff;
    }
}

/**
 * React component props for ProceduralBackground.
 */
export interface ProceduralBackgroundComponentProps extends ProceduralBackgroundConfig {
    /** Current scroll position X */
    scrollX?: number;
    /** Current scroll position Y */
    scrollY?: number;
}

/**
 * Component that generates and renders a procedural parallax background.
 *
 * @category World Building
 * @example
 * ```tsx
 * <ProceduralBackgroundComponent
 *   biome="forest"
 *   layerCount={6}
 *   seed={12345}
 *   scrollX={playerX}
 *   weather="none"
 *   animated
 * />
 * ```
 */
export function ProceduralBackgroundComponent({
    scrollX = 0,
    scrollY = 0,
    ...config
}: ProceduralBackgroundComponentProps) {
    // Destructure config for useMemo stability
    const {
        biome,
        layerCount,
        seed,
        animated,
        weather,
        weatherIntensity,
        timeOfDay: configTimeOfDay,
    } = config;

    // Generate layers only when config changes
    const layers = useMemo(
        () =>
            generateBackgroundLayers({
                biome,
                layerCount,
                seed,
                animated,
                weather,
                weatherIntensity,
            }),
        [biome, layerCount, seed, animated, weather, weatherIntensity]
    );

    // Map generated layers to ParallaxBackground format
    const layerConfigs = useMemo(
        () =>
            layers.map((l) => ({
                ...l.config,
                elements: l.elements,
            })),
        [layers]
    );

    return (
        <ParallaxBackground
            scrollX={scrollX}
            scrollY={scrollY}
            layers={layerConfigs}
            timeOfDay={configTimeOfDay ?? 12}
            enableDepthFog={true}
            fogDensity={0.03}
        />
    );
}
