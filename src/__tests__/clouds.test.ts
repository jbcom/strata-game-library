import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
    CloudLayerConfig,
    WindConfig,
    DayNightConfig,
    createCloudLayerMaterial,
    createVolumetricCloudMaterial,
    createCloudLayerGeometry,
    createVolumetricCloudGeometry,
    adaptCloudColorsForTimeOfDay,
    calculateWindOffset,
    fbmNoise2D,
    sampleCloudDensity,
    createDefaultCloudSkyConfig,
} from '../core/clouds';

describe('createCloudLayerMaterial', () => {
    it('should create cloud layer material with defaults', () => {
        const material = createCloudLayerMaterial({
            layer: { coverage: 0.5 },
        });
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should create material with custom coverage', () => {
        const material = createCloudLayerMaterial({
            layer: { coverage: 0.8 },
        });
        expect(material).toBeDefined();
    });

    it('should create material with custom density', () => {
        const material = createCloudLayerMaterial({
            layer: { density: 0.6 },
        });
        expect(material).toBeDefined();
    });

    it('should create material with wind settings', () => {
        const material = createCloudLayerMaterial({
            layer: { coverage: 0.5 },
            wind: {
                direction: new THREE.Vector2(1, 0),
                speed: 0.02,
            },
        });
        expect(material).toBeDefined();
    });

    it('should create material with day/night settings', () => {
        const material = createCloudLayerMaterial({
            layer: { coverage: 0.5 },
            dayNight: {
                sunIntensity: 0.8,
                sunAngle: 45,
            },
        });
        expect(material).toBeDefined();
    });

    it('should throw error for invalid coverage', () => {
        expect(() =>
            createCloudLayerMaterial({
                layer: { coverage: 1.5 },
            })
        ).toThrow();
        expect(() =>
            createCloudLayerMaterial({
                layer: { coverage: -0.5 },
            })
        ).toThrow();
    });

    it('should throw error for negative density', () => {
        expect(() =>
            createCloudLayerMaterial({
                layer: { density: -1 },
            })
        ).toThrow();
    });
});

describe('createVolumetricCloudMaterial', () => {
    it('should create volumetric cloud material with defaults', () => {
        const material = createVolumetricCloudMaterial();
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should create material with custom settings', () => {
        const material = createVolumetricCloudMaterial({
            cloudBase: 100,
            cloudHeight: 80,
            coverage: 0.6,
            density: 0.8,
        });
        expect(material).toBeDefined();
    });

    it('should create material with custom steps', () => {
        const material = createVolumetricCloudMaterial({
            steps: 64,
            lightSteps: 8,
        });
        expect(material).toBeDefined();
    });

    it('should throw error for invalid coverage', () => {
        expect(() =>
            createVolumetricCloudMaterial({
                coverage: 2.0,
            })
        ).toThrow();
    });

    it('should throw error for negative density', () => {
        expect(() =>
            createVolumetricCloudMaterial({
                density: -1,
            })
        ).toThrow();
    });
});

describe('createCloudLayerGeometry', () => {
    it('should create cloud layer geometry with defaults', () => {
        const geometry = createCloudLayerGeometry();
        expect(geometry).toBeInstanceOf(THREE.PlaneGeometry);
    });

    it('should create geometry with custom size', () => {
        const geometry = createCloudLayerGeometry([500, 500]);
        expect(geometry).toBeDefined();
    });

    it('should create geometry with custom segments', () => {
        const geometry = createCloudLayerGeometry([200, 200], [4, 4]);
        expect(geometry).toBeDefined();
    });
});

describe('createVolumetricCloudGeometry', () => {
    it('should create volumetric cloud geometry with defaults', () => {
        const geometry = createVolumetricCloudGeometry();
        expect(geometry).toBeInstanceOf(THREE.SphereGeometry);
    });

    it('should create geometry with custom radius', () => {
        const geometry = createVolumetricCloudGeometry(1000);
        expect(geometry).toBeDefined();
    });

    it('should create geometry with custom segments', () => {
        const geometry = createVolumetricCloudGeometry(500, 64, 32);
        expect(geometry).toBeDefined();
    });
});

describe('adaptCloudColorsForTimeOfDay', () => {
    it('should return colors for midday', () => {
        const baseColor = new THREE.Color(1, 1, 1);
        const shadowColor = new THREE.Color(0.7, 0.75, 0.85);
        const result = adaptCloudColorsForTimeOfDay(baseColor, shadowColor, 60, 1.0);
        expect(result.cloudColor).toBeInstanceOf(THREE.Color);
        expect(result.shadowColor).toBeInstanceOf(THREE.Color);
        expect(result.sunColor).toBeInstanceOf(THREE.Color);
    });

    it('should return warm colors at sunrise/sunset', () => {
        const baseColor = new THREE.Color(1, 1, 1);
        const shadowColor = new THREE.Color(0.7, 0.75, 0.85);
        const result = adaptCloudColorsForTimeOfDay(baseColor, shadowColor, 10, 1.0);
        expect(result.sunColor.r).toBeGreaterThan(result.sunColor.b);
    });

    it('should darken colors at night', () => {
        const baseColor = new THREE.Color(1, 1, 1);
        const shadowColor = new THREE.Color(0.7, 0.75, 0.85);
        const result = adaptCloudColorsForTimeOfDay(baseColor, shadowColor, 60, 0.1);
        expect(result.cloudColor.r).toBeLessThan(1);
    });

    it('should handle low sun angle', () => {
        const baseColor = new THREE.Color(1, 1, 1);
        const shadowColor = new THREE.Color(0.7, 0.75, 0.85);
        const result = adaptCloudColorsForTimeOfDay(baseColor, shadowColor, 5, 1.0);
        expect(result).toBeDefined();
    });
});

describe('calculateWindOffset', () => {
    it('should calculate offset for wind direction', () => {
        const direction = new THREE.Vector2(1, 0);
        const offset = calculateWindOffset(1.0, direction, 5.0);
        expect(offset.x).toBeCloseTo(5.0, 2);
        expect(offset.y).toBeCloseTo(0.0, 2);
    });

    it('should scale offset with time', () => {
        const direction = new THREE.Vector2(0, 1);
        const offset = calculateWindOffset(2.0, direction, 10.0);
        expect(offset.y).toBeCloseTo(20.0, 2);
    });

    it('should handle zero wind speed', () => {
        const direction = new THREE.Vector2(1, 1);
        const offset = calculateWindOffset(1.0, direction, 0.0);
        expect(offset.x).toBeCloseTo(0.0, 2);
        expect(offset.y).toBeCloseTo(0.0, 2);
    });

    it('should handle diagonal direction', () => {
        const direction = new THREE.Vector2(1, 1);
        const offset = calculateWindOffset(1.0, direction, 1.0);
        expect(offset).toBeInstanceOf(THREE.Vector2);
    });
});

describe('fbmNoise2D', () => {
    it('should return value between 0 and 1', () => {
        const value = fbmNoise2D(0, 0);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
    });

    it('should vary with position', () => {
        const value1 = fbmNoise2D(0, 0);
        const value2 = fbmNoise2D(10, 10);
        expect(value1).not.toBe(value2);
    });

    it('should respect octave count', () => {
        const value = fbmNoise2D(0, 0, 3);
        expect(value).toBeDefined();
    });

    it('should produce smooth variations', () => {
        const value1 = fbmNoise2D(0, 0);
        const value2 = fbmNoise2D(0.01, 0);
        const diff = Math.abs(value1 - value2);
        expect(diff).toBeLessThan(0.5);
    });
});

describe('sampleCloudDensity', () => {
    it('should return 0 outside cloud layer', () => {
        const density = sampleCloudDensity(0, -10, 0, 0.5, 0, 100);
        expect(density).toBe(0);
    });

    it('should return value inside cloud layer', () => {
        const density = sampleCloudDensity(0, 50, 0, 0.8, 0, 100);
        expect(density).toBeGreaterThanOrEqual(0);
    });

    it('should vary with coverage', () => {
        const lowCoverage = sampleCloudDensity(0, 50, 0, 0.2, 0, 100);
        const highCoverage = sampleCloudDensity(0, 50, 0, 0.9, 0, 100);
        expect(highCoverage).toBeGreaterThanOrEqual(lowCoverage);
    });
});

describe('createDefaultCloudSkyConfig', () => {
    it('should return default cloud sky config', () => {
        const config = createDefaultCloudSkyConfig();
        expect(config.layers).toBeDefined();
        expect(config.layers.length).toBeGreaterThan(0);
        expect(config.wind).toBeDefined();
        expect(config.dayNight).toBeDefined();
    });

    it('should have multiple layers', () => {
        const config = createDefaultCloudSkyConfig();
        expect(config.layers.length).toBe(3);
    });

    it('should have wind configuration', () => {
        const config = createDefaultCloudSkyConfig();
        expect(config.wind.direction).toBeInstanceOf(THREE.Vector2);
        expect(config.wind.speed).toBeDefined();
    });

    it('should have day/night configuration', () => {
        const config = createDefaultCloudSkyConfig();
        expect(config.dayNight.sunIntensity).toBeDefined();
        expect(config.dayNight.sunAngle).toBeDefined();
        expect(config.dayNight.sunColor).toBeInstanceOf(THREE.Color);
    });
});

describe('CloudLayerConfig interface', () => {
    it('should create config with all options', () => {
        const config: CloudLayerConfig = {
            altitude: 1500,
            coverage: 0.6,
            density: 0.4,
            cloudColor: new THREE.Color(1, 1, 1),
            shadowColor: new THREE.Color(0.7, 0.75, 0.85),
            scale: 1.5,
        };
        expect(config.altitude).toBe(1500);
        expect(config.coverage).toBe(0.6);
    });
});

describe('WindConfig interface', () => {
    it('should create wind config', () => {
        const config: WindConfig = {
            direction: new THREE.Vector2(1, 0),
            speed: 0.02,
        };
        expect(config.direction).toBeInstanceOf(THREE.Vector2);
        expect(config.speed).toBe(0.02);
    });
});

describe('DayNightConfig interface', () => {
    it('should create day/night config', () => {
        const config: DayNightConfig = {
            sunIntensity: 1.0,
            sunAngle: 60,
            sunColor: new THREE.Color(1, 0.95, 0.8),
        };
        expect(config.sunIntensity).toBe(1.0);
        expect(config.sunAngle).toBe(60);
    });
});
