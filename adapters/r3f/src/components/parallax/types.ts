/**
 * Parallax Background System Types.
 *
 * Types for creating multi-layer parallax scrolling backgrounds
 * for side-scrollers, platformers, and 2.5D games.
 *
 * @packageDocumentation
 * @module components/parallax/types
 * @category Rendering Pipeline
 */

import type { ReactNode } from 'react';
import type * as THREE from 'three';

/**
 * Configuration for a single parallax layer.
 */
export interface ParallaxLayerConfig {
  /** Unique identifier for this layer */
  id: string;
  /** Z-depth (higher = further back, affects render order) */
  depth: number;
  /** Scroll speed multiplier relative to camera (0 = static, 1 = moves with camera) */
  scrollSpeed: number;
  /** Vertical scroll multiplier (for vertical parallax) */
  verticalScrollSpeed?: number;
  /** Whether to repeat horizontally */
  repeatX?: boolean;
  /** Whether to repeat vertically */
  repeatY?: boolean;
  /** Width of the layer content (for repeat calculations) */
  contentWidth?: number;
  /** Height of the layer content */
  contentHeight?: number;
  /** Opacity of this layer (0-1) */
  opacity?: number;
  /** Color tint applied to this layer */
  tint?: THREE.Color | string | number;
  /** Whether this layer responds to time-of-day */
  affectedByDayNight?: boolean;
  /** Day/night color multipliers */
  dayNightColors?: {
    day: THREE.Color | string | number;
    night: THREE.Color | string | number;
    dawn: THREE.Color | string | number;
    dusk: THREE.Color | string | number;
  };
  /** Optional elements to render in this layer */
  elements?: ParallaxElement[];
}

/**
 * Props for the ParallaxLayer component.
 */
export interface ParallaxLayerProps extends ParallaxLayerConfig {
  /** Child elements to render in this layer */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Props for the ParallaxBackground component.
 */
export interface ParallaxBackgroundProps {
  /** Array of layer configurations */
  layers?: ParallaxLayerConfig[];
  /** Children (ParallaxLayer components) */
  children?: ReactNode;
  /** Current camera/scroll position X */
  scrollX?: number;
  /** Current camera/scroll position Y */
  scrollY?: number;
  /** Base width for calculations */
  baseWidth?: number;
  /** Base height for calculations */
  baseHeight?: number;
  /** Time of day (0-24) for day/night effects */
  timeOfDay?: number;
  /** Enable auto-scroll for animated backgrounds */
  autoScroll?: boolean;
  /** Auto-scroll speed (pixels per second) */
  autoScrollSpeed?: number;
  /** Enable fog effect on distant layers */
  enableDepthFog?: boolean;
  /** Fog color */
  fogColor?: THREE.Color | string | number;
  /** Fog density per unit depth */
  fogDensity?: number;
}

/**
 * Configuration for procedural background generation.
 */
export interface ProceduralBackgroundConfig {
  /** Biome type for theming */
  biome: 'forest' | 'desert' | 'tundra' | 'marsh' | 'mountain' | 'ocean' | 'cave' | 'city';
  /** Number of parallax layers to generate */
  layerCount: number;
  /** Seed for procedural generation */
  seed?: number;
  /** Include animated elements (clouds, birds, etc.) */
  animated?: boolean;
  /** Include weather particles */
  weather?: 'none' | 'rain' | 'snow' | 'fog' | 'storm';
  /** Weather intensity (0-1) */
  weatherIntensity?: number;
  /** Time of day (0-24) */
  timeOfDay?: number;
}

/**
 * Generated background layer data.
 */
export interface GeneratedLayer {
  /** Layer configuration */
  config: ParallaxLayerConfig;
  /** Drawing commands or geometry data */
  elements: ParallaxElement[];
}

/**
 * A single element within a parallax layer.
 */
export interface ParallaxElement {
  /** Element type */
  type: 'shape' | 'sprite' | 'gradient' | 'pattern' | 'particles';
  /** Position within layer */
  x: number;
  y: number;
  /** Element width */
  width: number;
  /** Element height */
  height: number;
  /** Shape-specific data */
  shapeData?: ParallaxShapeData;
  /** Gradient-specific data */
  gradientData?: ParallaxGradientData;
  /** Particle-specific data */
  particleData?: ParallaxParticleData;
  /** Animation data */
  animation?: ParallaxAnimationData;
}

/**
 * Shape data for procedural elements.
 */
export interface ParallaxShapeData {
  /** Shape type */
  shape: 'rect' | 'ellipse' | 'triangle' | 'polygon' | 'path';
  /** Fill color */
  color: THREE.Color | string | number;
  /** Polygon points (for polygon/path shapes) */
  points?: [number, number][];
  /** Corner radius for rects */
  borderRadius?: number;
}

/**
 * Gradient data for sky/atmosphere.
 */
export interface ParallaxGradientData {
  /** Gradient type */
  type: 'linear' | 'radial';
  /** Gradient stops */
  stops: Array<{
    offset: number;
    color: THREE.Color | string | number;
  }>;
  /** Angle for linear gradients (degrees) */
  angle?: number;
}

/**
 * Particle emitter data for ambient effects.
 */
export interface ParallaxParticleData {
  /** Particle type */
  particleType: 'firefly' | 'leaf' | 'snow' | 'rain' | 'dust' | 'spark' | 'bubble';
  /** Number of particles */
  count: number;
  /** Particle color */
  color: THREE.Color | string | number;
  /** Particle size range */
  sizeRange: [number, number];
  /** Particle speed range */
  speedRange: [number, number];
  /** Particle lifetime */
  lifetime: number;
  /** Spawn area */
  spawnArea: 'full' | 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Animation data for moving elements.
 */
export interface ParallaxAnimationData {
  /** Animation type */
  type: 'sway' | 'float' | 'pulse' | 'drift' | 'wave';
  /** Animation amplitude */
  amplitude: number;
  /** Animation frequency */
  frequency: number;
  /** Animation phase offset */
  phase?: number;
}

/**
 * Parallax system state.
 */
export interface ParallaxState {
  /** Current scroll position X */
  scrollX: number;
  /** Current scroll position Y */
  scrollY: number;
  /** Current time of day (0-24) */
  timeOfDay: number;
  /** Elapsed time for animations */
  elapsedTime: number;
  /** Active weather type */
  weather: 'none' | 'rain' | 'snow' | 'fog' | 'storm';
  /** Weather intensity */
  weatherIntensity: number;
}

/**
 * Hook return type for useParallax.
 */
export interface UseParallaxReturn {
  /** Current parallax state */
  state: ParallaxState;
  /** Update scroll position */
  setScroll: (x: number, y: number) => void;
  /** Update time of day */
  setTimeOfDay: (time: number) => void;
  /** Update weather */
  setWeather: (weather: ParallaxState['weather'], intensity?: number) => void;
  /** Get layer offset for a given depth */
  getLayerOffset: (depth: number) => { x: number; y: number };
  /** Get layer opacity with fog */
  getLayerOpacity: (depth: number, baseOpacity?: number) => number;
  /** Get layer tint for time of day */
  getLayerTint: (config: ParallaxLayerConfig) => THREE.Color;
}

/**
 * Context for sharing parallax state with child layers.
 */
export interface ParallaxContextValue {
  scrollX: number;
  scrollY: number;
  timeOfDay: number;
  enableDepthFog: boolean;
  fogColor: THREE.Color;
  fogDensity: number;
}
