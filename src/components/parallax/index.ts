/**
 * Parallax Background System.
 *
 * A comprehensive system for creating multi-layer parallax scrolling backgrounds
 * for side-scrollers, platformers, and 2.5D games. Supports infinite tiling,
 * day/night cycles, procedural generation, and weather effects.
 *
 * @packageDocumentation
 * @module components/parallax
 * @category Rendering Pipeline
 *
 * ## Features
 *
 * - **Multi-layer parallax** - Unlimited layers with depth-based scroll speeds
 * - **Infinite tiling** - Seamless horizontal and vertical scrolling
 * - **Day/night cycle** - Automatic color transitions based on time of day
 * - **Procedural generation** - Generate backgrounds from biome presets
 * - **Weather effects** - Rain, snow, fog, and ambient particles
 * - **Depth fog** - Atmospheric depth-based fog for distant layers
 *
 * ## Usage
 *
 * ### Basic Parallax Background
 *
 * @example
 * ```tsx
 * import { ParallaxBackground, ParallaxLayer } from '@strata-game-library/core';
 *
 * function GameBackground({ playerX }: { playerX: number }) {
 *   return (
 *     <ParallaxBackground scrollX={playerX} enableDepthFog>
 *       <ParallaxLayer id="sky" depth={10} scrollSpeed={0.05}>
 *         <SkyMesh />
 *       </ParallaxLayer>
 *       <ParallaxLayer id="mountains" depth={8} scrollSpeed={0.15} repeatX contentWidth={512}>
 *         <MountainMesh />
 *       </ParallaxLayer>
 *       <ParallaxLayer id="trees" depth={5} scrollSpeed={0.4} repeatX contentWidth={256}>
 *         <TreesMesh />
 *       </ParallaxLayer>
 *     </ParallaxBackground>
 *   );
 * }
 * ```
 *
 * ### Procedural Background
 *
 * @example
 * ```tsx
 * import { ProceduralBackgroundComponent } from '@strata-game-library/core';
 *
 * function GameBackground({ playerX }: { playerX: number }) {
 *   return (
 *     <ProceduralBackgroundComponent
 *       biome="forest"
 *       layerCount={6}
 *       seed={12345}
 *       scrollX={playerX}
 *       timeOfDay={14}
 *       weather="none"
 *       animated
 *     />
 *   );
 * }
 * ```
 *
 * ### Side-Scroller Shorthand
 *
 * @example
 * ```tsx
 * import { SideScrollerBackground } from '@strata-game-library/core';
 *
 * function GameBackground({ playerX }: { playerX: number }) {
 *   return (
 *     <SideScrollerBackground scrollX={playerX} fog timeOfDay={12}>
 *       <Layer depth={10}><Sky /></Layer>
 *       <Layer depth={5}><Trees /></Layer>
 *     </SideScrollerBackground>
 *   );
 * }
 * ```
 *
 * ### Using the Parallax Hook
 *
 * @example
 * ```tsx
 * import { useParallax } from '@strata-game-library/core';
 *
 * function GameScene() {
 *   const { state, setScroll, getLayerOffset, getLayerOpacity } = useParallax({
 *     enableFog: true,
 *     fogDensity: 0.1,
 *     autoTimeOfDay: true,
 *   });
 *
 *   // Update scroll based on player position
 *   useEffect(() => {
 *     setScroll(playerX, playerY);
 *   }, [playerX, playerY]);
 *
 *   // Use for custom layer positioning
 *   const mountainOffset = getLayerOffset(8);
 *   const mountainOpacity = getLayerOpacity(8);
 *
 *   return <CustomLayer position={mountainOffset} opacity={mountainOpacity} />;
 * }
 * ```
 *
 * ## Biome Presets
 *
 * The procedural generator supports the following biomes:
 *
 * | Biome | Description | Particles |
 * |-------|-------------|-----------|
 * | `forest` | Lush green forest | Falling leaves |
 * | `desert` | Sandy dunes and cacti | Dust particles |
 * | `tundra` | Snowy mountains | Snowflakes |
 * | `marsh` | Murky swampland | Fireflies |
 * | `mountain` | Rocky peaks | Dust |
 * | `ocean` | Coastal waters | Bubbles |
 * | `cave` | Underground caverns | Dust/sparks |
 * | `city` | Urban environment | None |
 *
 * ## Performance Tips
 *
 * - Use `repeatX` with `contentWidth` for infinite scrolling instead of huge meshes
 * - Limit particle count on mobile devices
 * - Use lower `layerCount` for better performance
 * - Disable `animated` for static backgrounds
 */

export type { SideScrollerBackgroundProps } from './ParallaxBackground';
export { ParallaxBackground, SideScrollerBackground } from './ParallaxBackground';
export type { InfiniteRepeaterProps } from './ParallaxLayer';

// Components
export { InfiniteRepeater, ParallaxLayer } from './ParallaxLayer';
export type { ProceduralBackgroundComponentProps } from './ProceduralBackground';
export {
    generateBackgroundLayers,
    ProceduralBackgroundComponent,
} from './ProceduralBackground';
// Types
export type {
    GeneratedLayer,
    ParallaxAnimationData,
    ParallaxBackgroundProps,
    ParallaxElement,
    ParallaxGradientData,
    ParallaxLayerConfig,
    ParallaxLayerProps,
    ParallaxParticleData,
    ParallaxShapeData,
    ParallaxState,
    ProceduralBackgroundConfig,
    UseParallaxReturn,
} from './types';
export type { UseParallaxOptions } from './useParallax';
// Hook
export { calculateRepeats, useParallax } from './useParallax';
