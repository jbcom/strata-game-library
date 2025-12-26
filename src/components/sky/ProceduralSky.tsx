/**
 * High-performance Sky system for realistic day/night cycles and atmosphere.
 *
 * Provides a dynamic procedural sky with Rayleigh/Mie scattering simulation,
 * integrated day/night cycles, star visibility, and weather-aware coloring.
 * Optimized for performance across mobile and desktop.
 *
 * @packageDocumentation
 * @module components/sky
 * @category World Building
 *
 * ## Interactive Demos
 * <iframe src="../../demos/sky.html" width="100%" height="400px" style="border-radius: 8px; border: 1px solid #1e293b;"></iframe>
 *
 * - 🎮 [Full Screen Sky Demo](../../demos/sky.html)
 * - 📦 [Sky & Volumetrics Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/sky-volumetrics)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/nodejs-strata/blob/main/EXAMPLES_API_MAP.md#sky-and-atmosphere)
 *
 * @example
 * ```tsx
 * // Morning sky
 * <ProceduralSky
 *   timeOfDay={{
 *     sunAngle: 30,
 *     sunIntensity: 0.8
 *   }}
 * />
 * ```
 *
 * @see {@link createTimeOfDay} for generating complete sky states based on a 24h clock.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createSkyGeometry, createSkyMaterial } from '../../core/sky';

/**
 * State representing the time of day and atmospheric light levels.
 * @category World Building
 */
export interface TimeOfDayState {
    /** Sun intensity (0-1). 0 = night, 1 = maximum brightness. */
    sunIntensity: number;
    /** Sun angle in degrees (0 = horizon, 90 = zenith/noon, 180 = sunset). */
    sunAngle: number;
    /** Alias for sunAngle. @deprecated Use sunAngle instead. */
    sunElevation?: number;
    /** Ambient light level (0-1). Base light level for the scene. */
    ambientLight: number;
    /** Star visibility (0-1). 0 = hidden, 1 = fully visible. */
    starVisibility: number;
    /** Fog density (0-1). Affects atmospheric scattering depth. */
    fogDensity: number;
}

/**
 * State representing current weather intensity.
 * @category World Building
 */
export interface WeatherState {
    /** Weather intensity (0-1). 0 = clear, 1 = stormy/heavy precipitation. */
    intensity: number;
}

/**
 * Props for the ProceduralSky component.
 * @category World Building
 */
export interface ProceduralSkyProps {
    /** Time of day settings (sun angle, intensity, etc.). */
    timeOfDay?: Partial<TimeOfDayState>;
    /** Weather settings (intensity, cloud coverage). */
    weather?: Partial<WeatherState>;
    /** Size of the sky plane [width, height]. Default: [200, 100]. */
    size?: [number, number];
    /** Distance of the sky plane from the camera. Default: 50. */
    distance?: number;
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

/**
 * Procedural sky component with dynamic day/night cycles and weather integration.
 *
 * Renders a large sky plane that simulates atmospheric scattering. Automatically
 * updates shader uniforms for sun position, star field visibility, and fog density.
 *
 * @category World Building
 * @example
 * ```tsx
 * <ProceduralSky
 *   timeOfDay={{ sunAngle: 90, sunIntensity: 1.0 }}
 *   weather={{ intensity: 0.2 }}
 *   distance={100}
 * />
 * ```
 */
export function ProceduralSky({
    timeOfDay: timeOfDayProp = {},
    weather: weatherProp = {},
    size = [200, 100],
    distance = 50,
}: ProceduralSkyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific properties listed for stable dependency
    const timeOfDay = useMemo(
        () => ({ ...defaultTimeOfDay, ...timeOfDayProp }),
        [
            timeOfDayProp.sunIntensity,
            timeOfDayProp.sunAngle,
            timeOfDayProp.sunElevation,
            timeOfDayProp.ambientLight,
            timeOfDayProp.starVisibility,
            timeOfDayProp.fogDensity,
        ]
    );
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific properties listed for stable dependency
    const weather = useMemo(() => ({ ...defaultWeather, ...weatherProp }), [weatherProp.intensity]);

    const material = useMemo(() => {
        return createSkyMaterial({
            timeOfDay,
            weather,
        });
    }, [timeOfDay, weather]);

    const geometry = useMemo(() => {
        return createSkyGeometry(size);
    }, [size]);

    useFrame((state) => {
        if (meshRef.current && material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uSunIntensity.value = timeOfDay.sunIntensity;
            material.uniforms.uSunAngle.value = timeOfDay.sunAngle;
            material.uniforms.uAmbientLight.value = timeOfDay.ambientLight;
            material.uniforms.uStarVisibility.value = timeOfDay.starVisibility;
            material.uniforms.uFogDensity.value = timeOfDay.fogDensity;
            material.uniforms.uWeatherIntensity.value = weather.intensity;

            // Subtle gyroscopic effect for immersive feel
            const tiltX = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
            const tiltY = Math.cos(state.clock.elapsedTime * 0.15) * 0.02;
            material.uniforms.uGyroTilt.value.set(tiltX, tiltY);
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh ref={meshRef as any} position={[0, 0, -distance]} geometry={geometry as any}>
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * Convenience utility to generate time of day state from a decimal hour.
 *
 * Automatically calculates sun angle, intensity, ambient light, and star visibility
 * based on a 24-hour cycle.
 *
 * @category World Building
 * @param hour - Hour of the day (0-24, where 12.0 is noon).
 * @returns Fully populated TimeOfDayState.
 *
 * @example
 * ```typescript
 * const morning = createTimeOfDay(8.5); // 8:30 AM
 * const midnight = createTimeOfDay(0);   // Midnight
 * ```
 */
export function createTimeOfDay(hour: number): TimeOfDayState {
    // Normalize to 0-24
    const normalizedHour = ((hour % 24) + 24) % 24;

    // Sun angle: peaks at noon (90°), 0 at 6am/6pm
    const sunAngle = Math.max(0, Math.sin(((normalizedHour - 6) / 12) * Math.PI) * 90);

    // Sun intensity based on time
    let sunIntensity = 0;
    if (normalizedHour >= 6 && normalizedHour <= 18) {
        sunIntensity = Math.sin(((normalizedHour - 6) / 12) * Math.PI);
    }

    // Star visibility (inverse of sun)
    const starVisibility = Math.max(0, 1 - sunIntensity * 2);

    // Ambient light
    const ambientLight = 0.2 + sunIntensity * 0.6;

    return {
        sunIntensity,
        sunAngle,
        ambientLight,
        starVisibility,
        fogDensity: 0,
    };
}
