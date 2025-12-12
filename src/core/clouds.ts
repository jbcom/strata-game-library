/**
 * Cloud System - Core TypeScript (no React)
 *
 * Pure TypeScript functions for creating procedural cloud materials and geometries
 */

import * as THREE from 'three';
import {
    cloudLayerFragmentShader,
    cloudLayerVertexShader,
    createCloudLayerUniforms,
    createVolumetricCloudUniforms,
    volumetricCloudFragmentShader,
    volumetricCloudVertexShader,
} from '../shaders/clouds';

export interface CloudLayerConfig {
    altitude: number;
    density: number;
    coverage: number;
    cloudColor: THREE.Color;
    shadowColor: THREE.Color;
    scale?: number;
}

export interface WindConfig {
    direction: THREE.Vector2;
    speed: number;
}

export interface DayNightConfig {
    sunIntensity: number;
    sunAngle: number;
    sunColor: THREE.Color;
}

export interface CloudMaterialOptions {
    layer: Partial<CloudLayerConfig>;
    wind?: Partial<WindConfig>;
    dayNight?: Partial<DayNightConfig>;
    time?: number;
}

export interface VolumetricCloudOptions {
    cloudBase?: number;
    cloudHeight?: number;
    coverage?: number;
    density?: number;
    cloudColor?: THREE.Color;
    shadowColor?: THREE.Color;
    wind?: Partial<WindConfig>;
    dayNight?: Partial<DayNightConfig>;
    steps?: number;
    lightSteps?: number;
    time?: number;
}

export interface CloudSkyConfig {
    layers: CloudLayerConfig[];
    wind: WindConfig;
    dayNight: DayNightConfig;
}

const defaultCloudLayer: CloudLayerConfig = {
    altitude: 100,
    density: 1.0,
    coverage: 0.5,
    cloudColor: new THREE.Color(1, 1, 1),
    shadowColor: new THREE.Color(0.7, 0.75, 0.85),
    scale: 5.0,
};

const defaultWind: WindConfig = {
    direction: new THREE.Vector2(1, 0),
    speed: 0.01,
};

const defaultDayNight: DayNightConfig = {
    sunIntensity: 1.0,
    sunAngle: 60,
    sunColor: new THREE.Color(1, 0.95, 0.8),
};

export function createCloudLayerMaterial(options: CloudMaterialOptions): THREE.ShaderMaterial {
    const { layer, wind = {}, dayNight = {}, time = 0 } = options;

    if (layer.coverage !== undefined && (layer.coverage < 0 || layer.coverage > 1)) {
        throw new Error('createCloudLayerMaterial: coverage must be between 0 and 1');
    }
    if (layer.density !== undefined && layer.density < 0) {
        throw new Error('createCloudLayerMaterial: density must be non-negative');
    }

    const mergedLayer = { ...defaultCloudLayer, ...layer };
    const mergedWind = { ...defaultWind, ...wind };
    const mergedDayNight = { ...defaultDayNight, ...dayNight };

    const uniforms = createCloudLayerUniforms({
        coverage: mergedLayer.coverage,
        density: mergedLayer.density,
        altitude: mergedLayer.altitude,
        cloudColor: mergedLayer.cloudColor,
        shadowColor: mergedLayer.shadowColor,
        windDirection: mergedWind.direction,
        windSpeed: mergedWind.speed,
        sunIntensity: mergedDayNight.sunIntensity,
        sunAngle: mergedDayNight.sunAngle,
        sunColor: mergedDayNight.sunColor,
        scale: mergedLayer.scale,
    });
    uniforms.uTime.value = time;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: cloudLayerVertexShader,
        fragmentShader: cloudLayerFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
}

export function createVolumetricCloudMaterial(
    options: VolumetricCloudOptions = {}
): THREE.ShaderMaterial {
    const {
        cloudBase = 50,
        cloudHeight = 50,
        coverage = 0.5,
        density = 1.0,
        cloudColor = new THREE.Color(1, 1, 1),
        shadowColor = new THREE.Color(0.6, 0.65, 0.75),
        wind = {},
        dayNight = {},
        steps = 32,
        lightSteps = 4,
        time = 0,
    } = options;

    if (coverage < 0 || coverage > 1) {
        throw new Error('createVolumetricCloudMaterial: coverage must be between 0 and 1');
    }
    if (density < 0) {
        throw new Error('createVolumetricCloudMaterial: density must be non-negative');
    }

    const mergedWind = { ...defaultWind, ...wind };
    const mergedDayNight = { ...defaultDayNight, ...dayNight };

    const uniforms = createVolumetricCloudUniforms({
        coverage,
        density,
        cloudBase,
        cloudHeight,
        cloudColor,
        shadowColor,
        windDirection: mergedWind.direction,
        windSpeed: mergedWind.speed,
        sunIntensity: mergedDayNight.sunIntensity,
        sunAngle: mergedDayNight.sunAngle,
        sunColor: mergedDayNight.sunColor,
        steps,
        lightSteps,
    });
    uniforms.uTime.value = time;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: volumetricCloudVertexShader,
        fragmentShader: volumetricCloudFragmentShader,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
    });
}

export function createCloudLayerGeometry(
    size: [number, number] = [200, 200],
    segments: [number, number] = [1, 1]
): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
}

export function createVolumetricCloudGeometry(
    radius: number = 500,
    widthSegments: number = 32,
    heightSegments: number = 16
): THREE.SphereGeometry {
    return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

export function adaptCloudColorsForTimeOfDay(
    baseCloudColor: THREE.Color,
    baseShadowColor: THREE.Color,
    sunAngle: number,
    sunIntensity: number
): { cloudColor: THREE.Color; shadowColor: THREE.Color; sunColor: THREE.Color } {
    const sunHeight = Math.sin((sunAngle * Math.PI) / 180);

    let sunColor: THREE.Color;
    if (sunHeight < 0.1) {
        sunColor = new THREE.Color(1.0, 0.4, 0.2);
    } else if (sunHeight < 0.3) {
        sunColor = new THREE.Color(1.0, 0.7, 0.4);
    } else {
        sunColor = new THREE.Color(1.0, 0.95, 0.85);
    }

    const cloudColor = baseCloudColor.clone();
    const shadowColor = baseShadowColor.clone();

    if (sunHeight < 0.3) {
        const warmth = 1 - sunHeight / 0.3;
        cloudColor.lerp(new THREE.Color(1.0, 0.85, 0.7), warmth * 0.5);
        shadowColor.lerp(new THREE.Color(0.6, 0.4, 0.5), warmth * 0.3);
    }

    if (sunIntensity < 0.3) {
        const darkness = 1 - sunIntensity / 0.3;
        cloudColor.multiplyScalar(1 - darkness * 0.5);
        shadowColor.multiplyScalar(1 - darkness * 0.3);
    }

    return { cloudColor, shadowColor, sunColor };
}

/**
 * Calculate wind offset for cloud animation
 * @param time Current time value
 * @param windDirection Wind direction vector
 * @param windSpeed Wind speed multiplier
 * @param target Optional target vector to avoid allocations in render loops
 * @returns Wind offset vector
 */
export function calculateWindOffset(
    time: number,
    windDirection: THREE.Vector2,
    windSpeed: number,
    target: THREE.Vector2 = new THREE.Vector2()
): THREE.Vector2 {
    return target.set(windDirection.x * windSpeed * time, windDirection.y * windSpeed * time);
}

export function fbmNoise2D(x: number, y: number, octaves: number = 6): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let maxValue = 0;

    const hash = (px: number, py: number): number => {
        const n = Math.sin(px * 127.1 + py * 311.7) * 43758.5453;
        return n - Math.floor(n);
    };

    const noise = (px: number, py: number): number => {
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const fx = px - ix;
        const fy = py - iy;
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);

        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);

        return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy;
    };

    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return value / maxValue;
}

export function sampleCloudDensity(
    x: number,
    y: number,
    z: number,
    coverage: number,
    cloudBase: number,
    cloudHeight: number
): number {
    // Guard against division by zero when cloudHeight is 0
    if (cloudHeight <= 0) return 0;

    const heightFactor = (y - cloudBase) / cloudHeight;
    if (heightFactor < 0 || heightFactor > 1) return 0;

    const heightShape = 4 * heightFactor * (1 - heightFactor);
    const baseNoise = fbmNoise2D(x * 0.01, z * 0.01, 5);
    const threshold = 1 - coverage;

    // Guard against division by zero when coverage is 0 (threshold = 1)
    if (threshold >= 1) return 0;

    const cloud = Math.max(0, baseNoise - threshold) / (1 - threshold);

    return cloud * heightShape;
}

export function createDefaultCloudSkyConfig(): CloudSkyConfig {
    return {
        layers: [
            {
                altitude: 80,
                density: 0.8,
                coverage: 0.4,
                cloudColor: new THREE.Color(1, 1, 1),
                shadowColor: new THREE.Color(0.75, 0.8, 0.9),
                scale: 4.0,
            },
            {
                altitude: 120,
                density: 0.6,
                coverage: 0.3,
                cloudColor: new THREE.Color(0.95, 0.95, 1),
                shadowColor: new THREE.Color(0.7, 0.75, 0.85),
                scale: 6.0,
            },
            {
                altitude: 160,
                density: 0.4,
                coverage: 0.2,
                cloudColor: new THREE.Color(0.9, 0.9, 0.95),
                shadowColor: new THREE.Color(0.65, 0.7, 0.8),
                scale: 8.0,
            },
        ],
        wind: {
            direction: new THREE.Vector2(1, 0.3),
            speed: 0.01,
        },
        dayNight: {
            sunIntensity: 1.0,
            sunAngle: 60,
            sunColor: new THREE.Color(1, 0.95, 0.8),
        },
    };
}
