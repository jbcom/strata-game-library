/**
 * Procedural Cloud Components
 *
 * Cloud layer, multi-layer sky, and volumetric cloud components
 * for realistic atmospheric rendering.
 * @module components/Clouds
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    createCloudLayerMaterial,
    createVolumetricCloudMaterial,
    createCloudLayerGeometry,
    createVolumetricCloudGeometry,
    CloudLayerConfig,
    WindConfig,
    DayNightConfig,
    adaptCloudColorsForTimeOfDay,
} from '../core/clouds';

/**
 * Props for the CloudLayer component
 *
 * @property altitude - Height of the cloud layer in world units
 * @property density - Cloud density/thickness (0-1)
 * @property coverage - Percentage of sky covered by clouds (0-1)
 * @property cloudColor - Base color of clouds
 * @property shadowColor - Color of cloud shadows/undersides
 * @property scale - Scale factor for cloud noise pattern
 * @property size - Width and depth of the cloud plane [width, depth]
 * @property windDirection - Direction of wind [x, z]
 * @property windSpeed - Speed of cloud movement
 * @property sunIntensity - Brightness of sun lighting
 * @property sunAngle - Sun elevation angle in degrees
 * @property sunColor - Color of sunlight
 * @property adaptToTimeOfDay - Auto-adjust colors based on sun angle
 */
export interface CloudLayerProps {
    altitude?: number;
    density?: number;
    coverage?: number;
    cloudColor?: THREE.Color | string;
    shadowColor?: THREE.Color | string;
    scale?: number;
    size?: [number, number];
    windDirection?: [number, number];
    windSpeed?: number;
    sunIntensity?: number;
    sunAngle?: number;
    sunColor?: THREE.Color | string;
    adaptToTimeOfDay?: boolean;
}

/**
 * Props for the CloudSky component
 *
 * @property layers - Array of individual layer configurations
 * @property windDirection - Global wind direction [x, z]
 * @property windSpeed - Base wind speed for all layers
 * @property sunIntensity - Sun brightness for lighting calculations
 * @property sunAngle - Sun elevation angle in degrees
 * @property sunColor - Color of sunlight affecting clouds
 * @property size - Size of the cloud dome [width, depth]
 * @property adaptToTimeOfDay - Auto-adjust colors for sunrise/sunset
 */
export interface CloudSkyProps {
    layers?: Partial<CloudLayerConfig>[];
    windDirection?: [number, number];
    windSpeed?: number;
    sunIntensity?: number;
    sunAngle?: number;
    sunColor?: THREE.Color | string;
    size?: [number, number];
    adaptToTimeOfDay?: boolean;
}

/**
 * Props for the VolumetricClouds component
 *
 * @property cloudBase - Lowest altitude of cloud formation
 * @property cloudHeight - Vertical thickness of cloud layer
 * @property coverage - Cloud coverage percentage (0-1)
 * @property density - Cloud density for raymarching
 * @property cloudColor - Base cloud color
 * @property shadowColor - Shadow color for depth
 * @property radius - Radius of the cloud dome
 * @property windDirection - Wind direction [x, z]
 * @property windSpeed - Cloud movement speed
 * @property sunIntensity - Sun brightness
 * @property sunAngle - Sun elevation in degrees
 * @property sunColor - Sunlight color
 * @property steps - Raymarching steps (quality vs performance)
 * @property lightSteps - Light scattering steps
 * @property adaptToTimeOfDay - Auto-adjust for time of day
 */
export interface VolumetricCloudsProps {
    cloudBase?: number;
    cloudHeight?: number;
    coverage?: number;
    density?: number;
    cloudColor?: THREE.Color | string;
    shadowColor?: THREE.Color | string;
    radius?: number;
    windDirection?: [number, number];
    windSpeed?: number;
    sunIntensity?: number;
    sunAngle?: number;
    sunColor?: THREE.Color | string;
    steps?: number;
    lightSteps?: number;
    adaptToTimeOfDay?: boolean;
}

function toColor(value: THREE.Color | string | undefined, defaultColor: THREE.Color): THREE.Color {
    if (!value) return defaultColor;
    if (value instanceof THREE.Color) return value;
    return new THREE.Color(value);
}

/**
 * Single procedural cloud layer using noise-based rendering.
 * Creates a flat cloud plane at a specific altitude with animated movement.
 *
 * @example
 * ```tsx
 * // Simple cumulus layer
 * <CloudLayer
 *   altitude={100}
 *   coverage={0.5}
 *   density={0.8}
 * />
 *
 * // Sunset clouds with custom colors
 * <CloudLayer
 *   altitude={80}
 *   cloudColor="#ffccaa"
 *   shadowColor="#aa6644"
 *   sunAngle={15}
 *   sunIntensity={0.8}
 * />
 *
 * // Fast-moving storm clouds
 * <CloudLayer
 *   altitude={60}
 *   coverage={0.9}
 *   density={1.0}
 *   windSpeed={0.05}
 *   cloudColor="#666666"
 * />
 * ```
 *
 * @param props - CloudLayerProps configuration
 * @returns React element containing the cloud layer mesh
 */
export function CloudLayer({
    altitude = 100,
    density = 1.0,
    coverage = 0.5,
    cloudColor = '#ffffff',
    shadowColor = '#b3bfd9',
    scale = 5.0,
    size = [400, 400],
    windDirection = [1, 0],
    windSpeed = 0.01,
    sunIntensity = 1.0,
    sunAngle = 60,
    sunColor = '#fff3cc',
    adaptToTimeOfDay = true,
}: CloudLayerProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const { material, geometry } = useMemo(() => {
        let finalCloudColor = toColor(cloudColor, new THREE.Color(1, 1, 1));
        let finalShadowColor = toColor(shadowColor, new THREE.Color(0.7, 0.75, 0.85));
        let finalSunColor = toColor(sunColor, new THREE.Color(1, 0.95, 0.8));

        if (adaptToTimeOfDay) {
            const adapted = adaptCloudColorsForTimeOfDay(
                finalCloudColor,
                finalShadowColor,
                sunAngle,
                sunIntensity
            );
            finalCloudColor = adapted.cloudColor;
            finalShadowColor = adapted.shadowColor;
            finalSunColor = adapted.sunColor;
        }

        const mat = createCloudLayerMaterial({
            layer: {
                altitude,
                density,
                coverage,
                cloudColor: finalCloudColor,
                shadowColor: finalShadowColor,
                scale,
            },
            wind: {
                direction: new THREE.Vector2(windDirection[0], windDirection[1]),
                speed: windSpeed,
            },
            dayNight: {
                sunIntensity,
                sunAngle,
                sunColor: finalSunColor,
            },
        });

        const geo = createCloudLayerGeometry(size);

        return { material: mat, geometry: geo };
    }, [
        altitude,
        density,
        coverage,
        cloudColor,
        shadowColor,
        scale,
        size,
        windDirection,
        windSpeed,
        sunIntensity,
        sunAngle,
        sunColor,
        adaptToTimeOfDay,
    ]);

    useFrame((state) => {
        if (material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh
            ref={meshRef}
            position={[0, altitude, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={geometry}
        >
            <primitive object={material} attach="material" />
        </mesh>
    );
}

const defaultLayers: Partial<CloudLayerConfig>[] = [
    {
        altitude: 80,
        density: 0.8,
        coverage: 0.4,
        scale: 4.0,
    },
    {
        altitude: 120,
        density: 0.6,
        coverage: 0.3,
        scale: 6.0,
    },
    {
        altitude: 160,
        density: 0.4,
        coverage: 0.2,
        scale: 8.0,
    },
];

/**
 * Multi-layer cloud sky system with multiple altitude layers.
 * Creates depth and realism with overlapping cloud formations.
 *
 * @example
 * ```tsx
 * // Default three-layer sky
 * <CloudSky />
 *
 * // Custom layered cloudscape
 * <CloudSky
 *   layers={[
 *     { altitude: 50, coverage: 0.3, density: 0.9 },
 *     { altitude: 100, coverage: 0.5, density: 0.7 },
 *     { altitude: 150, coverage: 0.2, density: 0.4 }
 *   ]}
 *   sunAngle={45}
 * />
 *
 * // Sunrise with golden clouds
 * <CloudSky
 *   sunAngle={10}
 *   sunColor="#ffaa44"
 *   sunIntensity={0.8}
 *   adaptToTimeOfDay={true}
 * />
 * ```
 *
 * @param props - CloudSkyProps configuration
 * @returns React element containing multiple cloud layers
 */
export function CloudSky({
    layers = defaultLayers,
    windDirection = [1, 0.3],
    windSpeed = 0.01,
    sunIntensity = 1.0,
    sunAngle = 60,
    sunColor = '#fff3cc',
    size = [500, 500],
    adaptToTimeOfDay = true,
}: CloudSkyProps) {
    return (
        <group>
            {layers.map((layer, index) => (
                <CloudLayer
                    key={index}
                    altitude={layer.altitude ?? 100 + index * 40}
                    density={layer.density ?? 1.0 - index * 0.2}
                    coverage={layer.coverage ?? 0.5 - index * 0.1}
                    cloudColor={
                        layer.cloudColor ?? new THREE.Color(1 - index * 0.02, 1 - index * 0.02, 1)
                    }
                    shadowColor={layer.shadowColor}
                    scale={layer.scale ?? 5.0 + index * 1.5}
                    size={size}
                    windDirection={windDirection}
                    windSpeed={windSpeed * (1 + index * 0.2)}
                    sunIntensity={sunIntensity}
                    sunAngle={sunAngle}
                    sunColor={sunColor}
                    adaptToTimeOfDay={adaptToTimeOfDay}
                />
            ))}
        </group>
    );
}

/**
 * Raymarched volumetric clouds with realistic lighting and shadows.
 * Higher quality but more computationally expensive than CloudLayer.
 *
 * @example
 * ```tsx
 * // Basic volumetric clouds
 * <VolumetricClouds
 *   cloudBase={50}
 *   cloudHeight={30}
 *   coverage={0.5}
 * />
 *
 * // High-quality cinematic clouds
 * <VolumetricClouds
 *   cloudBase={80}
 *   cloudHeight={50}
 *   coverage={0.6}
 *   density={0.8}
 *   steps={64}
 *   lightSteps={8}
 *   radius={800}
 * />
 *
 * // Stormy volumetric clouds
 * <VolumetricClouds
 *   cloudBase={40}
 *   cloudHeight={60}
 *   coverage={0.9}
 *   density={1.2}
 *   cloudColor="#888888"
 *   shadowColor="#444444"
 *   windSpeed={1.5}
 * />
 * ```
 *
 * @param props - VolumetricCloudsProps configuration
 * @returns React element containing volumetric cloud mesh
 */
export function VolumetricClouds({
    cloudBase = 50,
    cloudHeight = 50,
    coverage = 0.5,
    density = 1.0,
    cloudColor = '#ffffff',
    shadowColor = '#99a6bf',
    radius = 500,
    windDirection = [1, 0],
    windSpeed = 0.5,
    sunIntensity = 1.0,
    sunAngle = 60,
    sunColor = '#fff3cc',
    steps = 32,
    lightSteps = 4,
    adaptToTimeOfDay = true,
}: VolumetricCloudsProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const { material, geometry } = useMemo(() => {
        let finalCloudColor = toColor(cloudColor, new THREE.Color(1, 1, 1));
        let finalShadowColor = toColor(shadowColor, new THREE.Color(0.6, 0.65, 0.75));
        let finalSunColor = toColor(sunColor, new THREE.Color(1, 0.95, 0.8));

        if (adaptToTimeOfDay) {
            const adapted = adaptCloudColorsForTimeOfDay(
                finalCloudColor,
                finalShadowColor,
                sunAngle,
                sunIntensity
            );
            finalCloudColor = adapted.cloudColor;
            finalShadowColor = adapted.shadowColor;
            finalSunColor = adapted.sunColor;
        }

        const mat = createVolumetricCloudMaterial({
            cloudBase,
            cloudHeight,
            coverage,
            density,
            cloudColor: finalCloudColor,
            shadowColor: finalShadowColor,
            wind: {
                direction: new THREE.Vector2(windDirection[0], windDirection[1]),
                speed: windSpeed,
            },
            dayNight: {
                sunIntensity,
                sunAngle,
                sunColor: finalSunColor,
            },
            steps,
            lightSteps,
        });

        const geo = createVolumetricCloudGeometry(radius);

        return { material: mat, geometry: geo };
    }, [
        cloudBase,
        cloudHeight,
        coverage,
        density,
        cloudColor,
        shadowColor,
        radius,
        windDirection,
        windSpeed,
        sunIntensity,
        sunAngle,
        sunColor,
        steps,
        lightSteps,
        adaptToTimeOfDay,
    ]);

    useFrame((state) => {
        if (material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    useEffect(() => {
        return () => {
            material.dispose();
            geometry.dispose();
        };
    }, [material, geometry]);

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <primitive object={material} attach="material" />
        </mesh>
    );
}
