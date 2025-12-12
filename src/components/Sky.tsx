/**
 * Procedural Sky component
 *
 * Lifted from Otterfall biome selector diorama.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { createSkyGeometry, createSkyMaterial } from '../core/sky';

export interface TimeOfDayState {
    /** Sun intensity 0-1 */
    sunIntensity: number;
    /** Sun angle in degrees (0=horizon, 90=zenith) */
    sunAngle: number;
    /** Ambient light level 0-1 */
    ambientLight: number;
    /** Star visibility 0-1 */
    starVisibility: number;
    /** Fog density 0-1 */
    fogDensity: number;
}

export interface WeatherState {
    /** Weather intensity 0-1 */
    intensity: number;
}

interface ProceduralSkyProps {
    /** Time of day settings */
    timeOfDay?: Partial<TimeOfDayState>;
    /** Weather settings */
    weather?: Partial<WeatherState>;
    /** Size of the sky plane */
    size?: [number, number];
    /** Distance from camera */
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
 * Procedural sky with day/night cycle, stars, clouds, and weather effects
 */
export function ProceduralSky({
    timeOfDay: timeOfDayProp = {},
    weather: weatherProp = {},
    size = [200, 100],
    distance = 50,
}: ProceduralSkyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const timeOfDay = { ...defaultTimeOfDay, ...timeOfDayProp };
    const weather = { ...defaultWeather, ...weatherProp };

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

            // Subtle gyroscopic effect
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
 * Convenience function to create time of day state from hour
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
