import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
    GodRaysMaterialOptions,
    RadialBlurOptions,
    calculateRadialBlur,
    calculateSunOcclusion,
    calculateScatteringIntensity,
    getLightScreenPosition,
    calculateGodRayIntensityFromAngle,
    createGodRaysMaterial,
    createVolumetricSpotlightMaterial,
    createVolumetricPointLightMaterial,
    createSpotlightConeGeometry,
    createPointLightSphereGeometry,
    updateGodRaysLightPosition,
    blendGodRayColors,
} from '../core/godRays';

describe('calculateRadialBlur', () => {
    it('should calculate radial blur intensity', () => {
        const uv = new THREE.Vector2(0.7, 0.5);
        const center = new THREE.Vector2(0.5, 0.5);
        const options: RadialBlurOptions = {
            center,
            samples: 10,
            decay: 0.95,
            density: 1.0,
            weight: 0.1,
        };
        const result = calculateRadialBlur(uv, center, options);
        expect(result.intensity).toBeGreaterThan(0);
        expect(result.direction).toBeInstanceOf(THREE.Vector2);
    });

    it('should decrease intensity with distance from center', () => {
        const center = new THREE.Vector2(0.5, 0.5);
        const options: RadialBlurOptions = {
            center,
            samples: 10,
            decay: 0.95,
            density: 1.0,
            weight: 0.1,
        };
        const near = calculateRadialBlur(new THREE.Vector2(0.6, 0.5), center, options);
        const far = calculateRadialBlur(new THREE.Vector2(0.9, 0.5), center, options);
        expect(near.intensity).toBeGreaterThan(far.intensity);
    });
});

describe('calculateSunOcclusion', () => {
    it('should calculate sun occlusion', () => {
        const sunPos = new THREE.Vector3(0, 100, -100);
        const camera = new THREE.PerspectiveCamera();
        const occluders: THREE.Object3D[] = [];

        const result = calculateSunOcclusion(sunPos, camera, occluders);
        expect(result.visibleFraction).toBeDefined();
        expect(result.occluded).toBeDefined();
        expect(result.occlusionFactor).toBeDefined();
    });

    it('should return full visibility with no occluders', () => {
        const sunPos = new THREE.Vector3(0, 100, -100);
        const camera = new THREE.PerspectiveCamera();
        const occluders: THREE.Object3D[] = [];

        const result = calculateSunOcclusion(sunPos, camera, occluders, 8);
        expect(result.visibleFraction).toBe(1);
        expect(result.occluded).toBe(false);
    });
});

describe('calculateScatteringIntensity', () => {
    it('should return high intensity when looking at light', () => {
        const viewDir = new THREE.Vector3(0, 0, -1);
        const lightDir = new THREE.Vector3(0, 0, -1);
        const intensity = calculateScatteringIntensity(viewDir, lightDir);
        expect(intensity).toBeGreaterThan(0.5);
    });

    it('should return low intensity when looking away from light', () => {
        const viewDir = new THREE.Vector3(0, 0, -1);
        const lightDir = new THREE.Vector3(0, 0, 1);
        const intensity = calculateScatteringIntensity(viewDir, lightDir);
        expect(intensity).toBeLessThan(0.5);
    });

    it('should apply custom intensity parameter', () => {
        const viewDir = new THREE.Vector3(0, 0, -1);
        const lightDir = new THREE.Vector3(0, 0, -1);
        const intensity = calculateScatteringIntensity(viewDir, lightDir, { intensity: 2.0 });
        expect(intensity).toBeGreaterThan(1);
    });
});

describe('getLightScreenPosition', () => {
    it('should return screen position for visible light', () => {
        const lightPos = new THREE.Vector3(0, 0, -10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.updateMatrixWorld();

        const result = getLightScreenPosition(lightPos, camera, new THREE.Vector2(800, 600));
        expect(result).not.toBe(null);
        if (result) {
            expect(result.x).toBeGreaterThanOrEqual(0);
            expect(result.x).toBeLessThanOrEqual(1);
        }
    });

    it('should return null for light behind camera', () => {
        const lightPos = new THREE.Vector3(0, 0, 10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.updateMatrixWorld();

        const result = getLightScreenPosition(lightPos, camera, new THREE.Vector2(800, 600));
        expect(result).toBe(null);
    });
});

describe('calculateGodRayIntensityFromAngle', () => {
    it('should return 0 for negative sun altitude', () => {
        const intensity = calculateGodRayIntensityFromAngle(-10);
        expect(intensity).toBe(0);
    });

    it('should return high intensity for mid-altitude', () => {
        const intensity = calculateGodRayIntensityFromAngle(45);
        expect(intensity).toBeGreaterThan(0.5);
    });

    it('should apply max intensity', () => {
        const intensity = calculateGodRayIntensityFromAngle(45, 0.5);
        expect(intensity).toBeLessThanOrEqual(0.5);
    });
});

describe('createGodRaysMaterial', () => {
    it('should create god rays material with defaults', () => {
        const material = createGodRaysMaterial();
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should create material with custom options', () => {
        const material = createGodRaysMaterial({
            intensity: 0.8,
            decay: 0.9,
            samples: 60,
        });
        expect(material).toBeDefined();
    });

    it('should throw for negative intensity', () => {
        expect(() => createGodRaysMaterial({ intensity: -1 })).toThrow();
    });

    it('should throw for invalid samples', () => {
        expect(() => createGodRaysMaterial({ samples: 0 })).toThrow();
        expect(() => createGodRaysMaterial({ samples: 150 })).toThrow();
    });

    it('should throw for invalid decay', () => {
        expect(() => createGodRaysMaterial({ decay: 1.5 })).toThrow();
        expect(() => createGodRaysMaterial({ decay: -0.5 })).toThrow();
    });
});

describe('createVolumetricSpotlightMaterial', () => {
    it('should create volumetric spotlight material', () => {
        const material = createVolumetricSpotlightMaterial();
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should create material with custom options', () => {
        const material = createVolumetricSpotlightMaterial({
            intensity: 1.5,
            angle: Math.PI / 8,
            penumbra: 0.2,
        });
        expect(material).toBeDefined();
    });

    it('should throw for negative intensity', () => {
        expect(() => createVolumetricSpotlightMaterial({ intensity: -1 })).toThrow();
    });

    it('should throw for invalid angle', () => {
        expect(() => createVolumetricSpotlightMaterial({ angle: 0 })).toThrow();
    });

    it('should throw for invalid distance', () => {
        expect(() => createVolumetricSpotlightMaterial({ distance: -5 })).toThrow();
    });
});

describe('createVolumetricPointLightMaterial', () => {
    it('should create volumetric point light material', () => {
        const material = createVolumetricPointLightMaterial();
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should create material with custom options', () => {
        const material = createVolumetricPointLightMaterial({
            intensity: 2.0,
            radius: 10,
            dustDensity: 0.8,
        });
        expect(material).toBeDefined();
    });

    it('should throw for negative intensity', () => {
        expect(() => createVolumetricPointLightMaterial({ intensity: -1 })).toThrow();
    });

    it('should throw for invalid radius', () => {
        expect(() => createVolumetricPointLightMaterial({ radius: 0 })).toThrow();
    });

    it('should throw for invalid flicker', () => {
        expect(() => createVolumetricPointLightMaterial({ flicker: 1.5 })).toThrow();
    });
});

describe('createSpotlightConeGeometry', () => {
    it('should create cone geometry', () => {
        const geometry = createSpotlightConeGeometry(Math.PI / 6, 10);
        expect(geometry).toBeInstanceOf(THREE.ConeGeometry);
    });

    it('should use custom segments', () => {
        const geometry = createSpotlightConeGeometry(Math.PI / 6, 10, 64);
        expect(geometry).toBeDefined();
    });
});

describe('createPointLightSphereGeometry', () => {
    it('should create sphere geometry', () => {
        const geometry = createPointLightSphereGeometry(5);
        expect(geometry).toBeInstanceOf(THREE.SphereGeometry);
    });

    it('should use custom segments', () => {
        const geometry = createPointLightSphereGeometry(5, 64);
        expect(geometry).toBeDefined();
    });
});

describe('updateGodRaysLightPosition', () => {
    it('should update material uniform for visible light', () => {
        const material = createGodRaysMaterial();
        const lightPos = new THREE.Vector3(0, 0, -10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.updateMatrixWorld();

        const result = updateGodRaysLightPosition(material, lightPos, camera);
        expect(typeof result).toBe('boolean');
    });

    it('should return false for light behind camera', () => {
        const material = createGodRaysMaterial();
        const lightPos = new THREE.Vector3(0, 0, 10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.updateMatrixWorld();

        const result = updateGodRaysLightPosition(material, lightPos, camera);
        expect(result).toBe(false);
    });
});

describe('blendGodRayColors', () => {
    it('should blend colors based on sun altitude', () => {
        const baseColor = new THREE.Color(1, 0.9, 0.7);
        const atmosphereColor = new THREE.Color(1, 0.5, 0.3);
        const result = blendGodRayColors(baseColor, atmosphereColor, 30);
        expect(result).toBeInstanceOf(THREE.Color);
    });

    it('should return atmosphere color for low altitude', () => {
        const baseColor = new THREE.Color(1, 0.9, 0.7);
        const atmosphereColor = new THREE.Color(1, 0.5, 0.3);
        const result = blendGodRayColors(baseColor, atmosphereColor, 0);
        expect(result.r).toBeCloseTo(atmosphereColor.r, 1);
    });
});
