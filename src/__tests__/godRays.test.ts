import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
    blendGodRayColors,
    calculateGodRayIntensityFromAngle,
    calculateScatteringIntensity,
    createGodRaysMaterial,
    createPointLightSphereGeometry,
    createSpotlightConeGeometry,
    createVolumetricPointLightMaterial,
    createVolumetricSpotlightMaterial,
    type GodRaysMaterialOptions,
    getLightScreenPosition,
    type VolumetricPointLightMaterialOptions,
    type VolumetricSpotlightMaterialOptions,
} from '../core/godRays';

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
});

describe('getLightScreenPosition', () => {
    it('should return screen position for visible light', () => {
        const lightPos = new THREE.Vector3(0, 0, -10);
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 0);
        camera.updateMatrixWorld();

        const result = getLightScreenPosition(lightPos, camera);
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

        const result = getLightScreenPosition(lightPos, camera);
        expect(result).toBe(null);
    });
});

describe('calculateGodRayIntensityFromAngle', () => {
    it('should return value based on sun angle', () => {
        const intensity = calculateGodRayIntensityFromAngle(45, 1.0);
        expect(intensity).toBeGreaterThan(0);
    });

    it('should return higher intensity at horizon', () => {
        const horizonIntensity = calculateGodRayIntensityFromAngle(0, 1.0);
        const noonIntensity = calculateGodRayIntensityFromAngle(90, 1.0);
        expect(horizonIntensity).toBeGreaterThan(noonIntensity);
    });
});

describe('createGodRaysMaterial', () => {
    const defaultOptions: GodRaysMaterialOptions = {
        lightPosition: new THREE.Vector3(0, 100, -100),
        lightColor: new THREE.Color(1, 0.95, 0.8),
        intensity: 0.5,
        decay: 0.95,
        density: 0.8,
        samples: 50,
        exposure: 0.3,
        scattering: 0.5,
        noiseFactor: 0.1,
    };

    it('should create god rays material', () => {
        const material = createGodRaysMaterial(defaultOptions);
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should have correct uniforms', () => {
        const material = createGodRaysMaterial(defaultOptions);
        expect(material.uniforms.uIntensity.value).toBe(0.5);
        expect(material.uniforms.uDecay.value).toBe(0.95);
    });
});

describe('createVolumetricSpotlightMaterial', () => {
    const defaultOptions: VolumetricSpotlightMaterialOptions = {
        lightPosition: new THREE.Vector3(0, 5, 0),
        lightDirection: new THREE.Vector3(0, -1, 0),
        lightColor: new THREE.Color(1, 1, 1),
        intensity: 1.0,
        angle: Math.PI / 6,
        penumbra: 0.1,
        distance: 10,
        dustDensity: 0.5,
    };

    it('should create volumetric spotlight material', () => {
        const material = createVolumetricSpotlightMaterial(defaultOptions);
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should have correct uniforms', () => {
        const material = createVolumetricSpotlightMaterial(defaultOptions);
        expect(material.uniforms.uIntensity.value).toBe(1.0);
        expect(material.uniforms.uAngle.value).toBe(Math.PI / 6);
    });
});

describe('createVolumetricPointLightMaterial', () => {
    const defaultOptions: VolumetricPointLightMaterialOptions = {
        lightPosition: new THREE.Vector3(0, 2, 0),
        lightColor: new THREE.Color(1, 0.8, 0.6),
        intensity: 1.5,
        radius: 5,
        dustDensity: 0.3,
    };

    it('should create volumetric point light material', () => {
        const material = createVolumetricPointLightMaterial(defaultOptions);
        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('should have correct uniforms', () => {
        const material = createVolumetricPointLightMaterial(defaultOptions);
        expect(material.uniforms.uIntensity.value).toBe(1.5);
        expect(material.uniforms.uRadius.value).toBe(5);
    });

    it('should support flicker option', () => {
        const material = createVolumetricPointLightMaterial({
            ...defaultOptions,
            flicker: 0.5,
        });
        expect(material.uniforms.uFlicker.value).toBe(0.5);
    });
});

describe('createSpotlightConeGeometry', () => {
    it('should create cylinder geometry', () => {
        const geometry = createSpotlightConeGeometry(Math.PI / 6, 10);
        expect(geometry).toBeInstanceOf(THREE.CylinderGeometry);
    });
});

describe('createPointLightSphereGeometry', () => {
    it('should create sphere geometry', () => {
        const geometry = createPointLightSphereGeometry(5);
        expect(geometry).toBeInstanceOf(THREE.SphereGeometry);
    });
});

describe('blendGodRayColors', () => {
    it('should blend colors based on sun altitude', () => {
        const baseColor = new THREE.Color(1, 0.9, 0.7);
        const atmosphereColor = new THREE.Color(1, 0.5, 0.3);
        const result = blendGodRayColors(baseColor, atmosphereColor, 30);
        expect(result).toBeInstanceOf(THREE.Color);
    });

    it('should return blended color for low altitude', () => {
        const baseColor = new THREE.Color(1, 0.9, 0.7);
        const atmosphereColor = new THREE.Color(1, 0.5, 0.3);
        const result = blendGodRayColors(baseColor, atmosphereColor, 0);
        // At horizon (0 degrees), should blend towards atmosphere color
        expect(result.r).toBeCloseTo(1, 1);
    });
});
