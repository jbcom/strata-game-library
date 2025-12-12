/**
 * Sky Materials - Core TypeScript (no React)
 *
 * Pure TypeScript functions for creating sky materials
 */

import * as THREE from 'three';
import { createSkyUniforms, skyFragmentShader, skyVertexShader } from '../shaders/sky';

export interface TimeOfDayState {
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    starVisibility: number;
    fogDensity: number;
}

export interface WeatherState {
    intensity: number;
}

export interface SkyMaterialOptions {
    timeOfDay: Partial<TimeOfDayState>;
    weather?: Partial<WeatherState>;
    gyroTilt?: THREE.Vector2;
    time?: number;
}

/**
 * Create sky material (pure TypeScript)
 */
export function createSkyMaterial(options: SkyMaterialOptions): THREE.ShaderMaterial {
    const { timeOfDay, weather = {}, gyroTilt, time = 0 } = options;

    // Input validation
    if (
        timeOfDay &&
        timeOfDay.sunIntensity !== undefined &&
        (timeOfDay.sunIntensity < 0 || timeOfDay.sunIntensity > 1)
    ) {
        throw new Error('createSkyMaterial: sunIntensity must be between 0 and 1');
    }
    if (
        timeOfDay &&
        timeOfDay.sunAngle !== undefined &&
        (timeOfDay.sunAngle < 0 || timeOfDay.sunAngle > 180)
    ) {
        throw new Error('createSkyMaterial: sunAngle must be between 0 and 180');
    }

    const defaultTimeOfDay: TimeOfDayState = {
        sunIntensity: 1.0,
        sunAngle: 60,
        ambientLight: 0.8,
        starVisibility: 0,
        fogDensity: 0,
    };

    const defaultWeather: WeatherState = {
        intensity: 0,
    };

    const mergedTimeOfDay = { ...defaultTimeOfDay, ...timeOfDay };
    const mergedWeather = { ...defaultWeather, ...weather };

    const uniforms = createSkyUniforms(mergedTimeOfDay, mergedWeather, gyroTilt);
    uniforms.uTime.value = time;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        side: THREE.DoubleSide,
    });
}

/**
 * Create sky geometry (pure TypeScript)
 */
export function createSkyGeometry(size: [number, number] = [200, 100]): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(size[0], size[1], 1, 1);
}
