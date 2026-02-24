/**
 * Debug Module Type Definitions.
 *
 * Framework-agnostic interfaces for debug panels, performance monitoring,
 * and portal-based debug overlays.
 *
 * @packageDocumentation
 * @module core/debug/types
 * @category Game Systems
 */

import type * as React from 'react';

/**
 * Configuration for creating a debug panel.
 * @category Game Systems
 */
export interface DebugPanelConfig {
  /** Unique store name for the panel. */
  name?: string;
  /** Whether the panel is collapsed by default. */
  collapsed?: boolean;
  /** Whether the panel is hidden by default. */
  hidden?: boolean;
  /** Custom theme overrides for visual appearance. */
  theme?: Partial<DebugPanelTheme>;
  /** Fixed position of the panel on screen. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Configuration for the interactive title bar. */
  titleBar?: boolean | { drag?: boolean; title?: string; filter?: boolean };
  /** Whether the panel should fill its container. */
  fill?: boolean;
  /** Whether to disable nested folders. */
  flat?: boolean;
  /** Whether to show labels on the same line as inputs. */
  oneLineLabels?: boolean;
  /** Debounce delay in milliseconds for control updates. */
  debounce?: number;
}

/**
 * Theme configuration for debug panels.
 * @category Game Systems
 */
export interface DebugPanelTheme {
  /** Color palette overrides. */
  colors?: {
    elevation1?: string;
    elevation2?: string;
    elevation3?: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
    highlight1?: string;
    highlight2?: string;
    highlight3?: string;
    vivid1?: string;
    folderWidgetColor?: string;
    folderTextColor?: string;
    toolTipBackground?: string;
    toolTipText?: string;
  };
  /** Corner radius overrides. */
  radii?: {
    xs?: string;
    sm?: string;
    lg?: string;
  };
  /** Layout spacing overrides. */
  space?: {
    sm?: string;
    md?: string;
    rowGap?: string;
    colGap?: string;
  };
  /** Font family overrides. */
  fonts?: {
    mono?: string;
    sans?: string;
  };
  /** Font size overrides. */
  fontSizes?: {
    root?: string;
    toolTip?: string;
  };
  /** Dimensions for various UI elements. */
  sizes?: {
    rootWidth?: string;
    controlWidth?: string;
    numberInputMinWidth?: string;
    scrubberWidth?: string;
    scrubberHeight?: string;
    rowHeight?: string;
    folderTitleHeight?: string;
    checkboxSize?: string;
    joystickWidth?: string;
    joystickHeight?: string;
    colorPickerWidth?: string;
    colorPickerHeight?: string;
    imagePreviewWidth?: string;
    imagePreviewHeight?: string;
    monitorHeight?: string;
    titleBarHeight?: string;
  };
  /** Line and border width overrides. */
  borderWidths?: {
    root?: string;
    input?: string;
    focus?: string;
    hover?: string;
    active?: string;
    folder?: string;
  };
  /** Typographic weight overrides. */
  fontWeights?: {
    label?: string;
    folder?: string;
    button?: string;
  };
}

/**
 * Supported data types for debug controls.
 * @category Game Systems
 */
export type DebugValue =
  | number
  | string
  | boolean
  | { x: number; y: number }
  | { x: number; y: number; z: number }
  | { r: number; g: number; b: number; a?: number }
  | number[]
  | string[];

/**
 * Interactive control schema definition.
 * @category Game Systems
 */
export type DebugSchema = Record<string, unknown>;

/**
 * Interface for a managed debug store.
 * @category Game Systems
 */
export interface DebugStore {
  /** Get all current data in the store. */
  getData: () => Record<string, unknown>;
  /** Update a specific value in the store. */
  setValueAtPath: (path: string, value: unknown, fromPanel: boolean) => void;
  /** Retrieve a specific value from the store. */
  getValueAtPath: (path: string) => unknown;
  /** Hook for subscribing to a specific store path. */
  useStore: <T>(path: string) => T;
}

/**
 * Generic map of debug input definitions.
 * @category Game Systems
 */
export type DebugInputs = Record<string, unknown>;

/**
 * Configuration for a debug portal tunnel.
 * @category Game Systems
 */
export interface TunnelConfig {
  /** Unique identifier for the tunnel. */
  id?: string;
  /** Human-readable description. */
  description?: string;
}

/**
 * Portal tunnel instance.
 * @category Game Systems
 */
export interface Tunnel {
  /** React component to push content into the tunnel. */
  In: React.FC<{ children: React.ReactNode }>;
  /** React component to render the tunnel's content. */
  Out: React.FC;
}

/**
 * Common debug tunnel identifiers.
 * @category Game Systems
 */
export type DebugTunnelId = 'debug-overlay' | 'fps-counter' | 'stats-panel' | 'custom';

/**
 * Performance metrics data snapshot.
 * @category Game Systems
 */
export interface PerformanceStats {
  /** Average frames per second. */
  fps: number;
  /** Average time per frame in milliseconds. */
  frameTime: number;
  /** Browser memory consumption (if supported). */
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  /** Current number of WebGL draw calls. */
  drawCalls?: number;
  /** Current number of triangles being rendered. */
  triangles?: number;
  /** Total number of textures in memory. */
  textures?: number;
  /** Total number of unique geometries in memory. */
  geometries?: number;
  /** Unix timestamp of the measurement. */
  timestamp: number;
}

/**
 * Configuration for the performance monitor.
 * @category Game Systems
 */
export interface StatsConfig {
  /** Frequency of updates in milliseconds. Default: 100. */
  updateInterval?: number;
  /** Whether to track heap memory usage. Default: true. */
  trackMemory?: boolean;
  /** Number of samples to use for rolling averages. Default: 60. */
  maxSamples?: number;
}

/**
 * Reusable debug configuration preset.
 * @category Game Systems
 */
export interface DebugPreset {
  /** Unique name for the preset. */
  name: string;
  /** Schema definition for the preset's controls. */
  schema: DebugSchema;
  /** Initial/default values for the controls. */
  defaults?: Record<string, DebugValue>;
}

/**
 * Standard camera debug settings.
 * @category Game Systems
 */
export interface CameraDebugValues {
  fov: number;
  near: number;
  far: number;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
}

/**
 * Standard physics engine debug settings.
 * @category Game Systems
 */
export interface PhysicsDebugValues {
  gravity: { x: number; y: number; z: number };
  timeScale: number;
  showColliders: boolean;
  showVelocities: boolean;
  showContacts: boolean;
}

/**
 * Standard scene lighting debug settings.
 * @category Game Systems
 */
export interface LightingDebugValues {
  ambientIntensity: number;
  ambientColor: string;
  sunIntensity: number;
  sunColor: string;
  sunPosition: { x: number; y: number; z: number };
  shadowsEnabled: boolean;
  shadowMapSize: number;
}

/**
 * Standard post-processing debug settings.
 * @category Game Systems
 */
export interface PostProcessingDebugValues {
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  chromaticAberration: number;
  noise: number;
}
