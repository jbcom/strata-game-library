/**
 * Parallax Background Component.
 *
 * Complete parallax background system for side-scrollers and 2.5D games.
 * Manages multiple layers with depth-based scrolling, day/night cycles,
 * weather effects, and infinite tiling.
 *
 * @packageDocumentation
 * @module components/parallax/ParallaxBackground
 * @category Rendering Pipeline
 */

import { useFrame } from '@react-three/fiber';
import { createContext, type ReactNode, useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ParallaxLayer } from './ParallaxLayer';
import type { ParallaxBackgroundProps, ParallaxContextValue } from './types';

/**
 * Context for sharing parallax state with child layers.
 */
export const ParallaxContext = createContext<ParallaxContextValue | null>(null);

/**
 * Hook to use the parallax context.
 */
export function useParallaxContext() {
    return useContext(ParallaxContext);
}

/**
 * Complete parallax background system.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <ParallaxBackground
 *   scrollX={playerX}
 *   scrollY={playerY}
 *   timeOfDay={12}
 *   enableDepthFog
 *   fogColor={0x88aacc}
 * >
 *   <ParallaxLayer depth={10} scrollSpeed={0.1}>
 *     <SkyGradient />
 *   </ParallaxLayer>
 *   <ParallaxLayer depth={8} scrollSpeed={0.2}>
 *     <DistantMountains />
 *   </ParallaxLayer>
 *   <ParallaxLayer depth={5} scrollSpeed={0.4}>
 *     <MidgroundTrees />
 *   </ParallaxLayer>
 * </ParallaxBackground>
 * ```
 */
export function ParallaxBackground({
    layers,
    children,
    scrollX = 0,
    scrollY = 0,
    timeOfDay = 12,
    autoScroll = false,
    autoScrollSpeed = 10,
    enableDepthFog = false,
    fogColor = 0x88aacc,
    fogDensity = 0.05,
}: ParallaxBackgroundProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Track auto-scroll offset
    const autoScrollOffset = useRef(0);

    // Memoize fog color
    const fogColorObj = useMemo(() => new THREE.Color(fogColor), [fogColor]);

    // Calculate time-of-day ambient color
    const ambientColor = useMemo(() => {
        const t = timeOfDay;
        if (t < 5 || t >= 21) {
            // Night - deep blue
            return new THREE.Color(0x1a1a3a);
        } else if (t < 7) {
            // Dawn - orange/pink gradient
            const blend = (t - 5) / 2;
            return new THREE.Color(0x1a1a3a).lerp(new THREE.Color(0xff8866), blend);
        } else if (t < 17) {
            // Day - bright
            return new THREE.Color(0xffffff);
        } else if (t < 19) {
            // Dusk - orange
            const blend = (t - 17) / 2;
            return new THREE.Color(0xffffff).lerp(new THREE.Color(0xff6644), blend);
        } else {
            // Night transition
            const blend = (t - 19) / 2;
            return new THREE.Color(0xff6644).lerp(new THREE.Color(0x1a1a3a), blend);
        }
    }, [timeOfDay]);

    // Update auto-scroll
    useFrame((_, delta) => {
        if (autoScroll) {
            autoScrollOffset.current += autoScrollSpeed * delta;
        }
    });

    // Effective scroll position
    const effectiveScrollX = scrollX + (autoScroll ? autoScrollOffset.current : 0);

    const contextValue = useMemo(
        (): ParallaxContextValue => ({
            scrollX: effectiveScrollX,
            scrollY,
            timeOfDay,
            enableDepthFog,
            fogColor: fogColorObj,
            fogDensity,
        }),
        [effectiveScrollX, scrollY, timeOfDay, enableDepthFog, fogColorObj, fogDensity]
    );

    return (
        <ParallaxContext.Provider value={contextValue}>
            <group ref={groupRef}>
                {/* Ambient light affected by time of day */}
                <ambientLight color={ambientColor} intensity={0.6} />

                {/* Render child layers */}
                {children}

                {/* If layers config is provided, render them */}
                {layers?.map((layer) => (
                    <ParallaxLayer key={layer.id} {...layer} />
                ))}
            </group>
        </ParallaxContext.Provider>
    );
}

/**
 * Props for SideScrollerBackground component.
 */
export interface SideScrollerBackgroundProps {
    /** Current camera/player X position */
    scrollX: number;
    /** Background layers (children) */
    children: ReactNode;
    /** Enable depth-based fog */
    fog?: boolean;
    /** Fog color */
    fogColor?: THREE.ColorRepresentation;
    /** Time of day (0-24) */
    timeOfDay?: number;
}

/**
 * Simplified parallax background specifically for side-scrollers.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <SideScrollerBackground scrollX={playerX} fog timeOfDay={14}>
 *   <Layer depth={10}><Sky /></Layer>
 *   <Layer depth={8}><Mountains /></Layer>
 *   <Layer depth={5}><Trees /></Layer>
 *   <Layer depth={2}><Bushes /></Layer>
 * </SideScrollerBackground>
 * ```
 */
export function SideScrollerBackground({
    scrollX,
    children,
    fog = false,
    fogColor = 0x88aacc,
    timeOfDay = 12,
}: SideScrollerBackgroundProps) {
    return (
        <ParallaxBackground
            scrollX={scrollX}
            scrollY={0}
            enableDepthFog={fog}
            fogColor={fogColor}
            timeOfDay={timeOfDay}
        >
            {children}
        </ParallaxBackground>
    );
}
