/**
 * Debug Module Type Definitions
 *
 * Type definitions for leva debug panels and tunnel-rat portals.
 * Framework-agnostic types for cross-platform debug utilities.
 *
 * @module core/debug/types
 */

import type * as React from 'react';

/**
 * Configuration for creating a debug panel.
 *
 * @public
 */
export interface DebugPanelConfig {
    /** Unique store name for the panel */
    name?: string;
    /** Whether the panel is collapsed by default */
    collapsed?: boolean;
    /** Whether the panel is hidden by default */
    hidden?: boolean;
    /** Custom theme overrides */
    theme?: Partial<DebugPanelTheme>;
    /** Position of the panel on screen */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Whether to show the title bar */
    titleBar?: boolean | { drag?: boolean; title?: string; filter?: boolean };
    /** Fill mode for the panel */
    fill?: boolean;
    /** Flat mode - no nested folders */
    flat?: boolean;
    /** One-line mode for compact display */
    oneLineLabels?: boolean;
    /** Debounce delay in ms for control updates */
    debounce?: number;
}

/**
 * Theme configuration for debug panels.
 *
 * @public
 */
export interface DebugPanelTheme {
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
    radii?: {
        xs?: string;
        sm?: string;
        lg?: string;
    };
    space?: {
        sm?: string;
        md?: string;
        rowGap?: string;
        colGap?: string;
    };
    fonts?: {
        mono?: string;
        sans?: string;
    };
    fontSizes?: {
        root?: string;
        toolTip?: string;
    };
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
    borderWidths?: {
        root?: string;
        input?: string;
        focus?: string;
        hover?: string;
        active?: string;
        folder?: string;
    };
    fontWeights?: {
        label?: string;
        folder?: string;
        button?: string;
    };
}

/**
 * Debug value types that can be controlled via leva.
 *
 * @public
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
 * Schema for debug controls.
 * Mirrors leva's Schema type for control definitions.
 *
 * @public
 */
export type DebugSchema = Record<string, unknown>;

/**
 * Store type for debug panels.
 * Represents a leva store instance.
 *
 * @public
 */
export interface DebugStore {
    getData: () => Record<string, unknown>;
    setValueAtPath: (path: string, value: unknown, fromPanel: boolean) => void;
    getValueAtPath: (path: string) => unknown;
    useStore: <T>(path: string) => T;
}

/**
 * Input types available in debug panels.
 *
 * @public
 */
export type DebugInputs = Record<string, unknown>;

/**
 * Configuration for creating a tunnel (React portal).
 *
 * @public
 */
export interface TunnelConfig {
    /** Unique identifier for the tunnel */
    id?: string;
    /** Description for debugging purposes */
    description?: string;
}

/**
 * Tunnel instance with In and Out components.
 *
 * @public
 */
export interface Tunnel {
    /** Component to place content into the tunnel */
    In: React.FC<{ children: React.ReactNode }>;
    /** Component that renders tunnel content */
    Out: React.FC;
}

/**
 * Common debug tunnel identifiers.
 *
 * @public
 */
export type DebugTunnelId = 'debug-overlay' | 'fps-counter' | 'stats-panel' | 'custom';

/**
 * Performance statistics data structure.
 *
 * @public
 */
export interface PerformanceStats {
    /** Frames per second */
    fps: number;
    /** Frame time in milliseconds */
    frameTime: number;
    /** Memory usage in MB (if available) */
    memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
    /** WebGL draw calls (if tracked) */
    drawCalls?: number;
    /** Triangle count (if tracked) */
    triangles?: number;
    /** Texture count (if tracked) */
    textures?: number;
    /** Geometry count (if tracked) */
    geometries?: number;
    /** Timestamp of measurement */
    timestamp: number;
}

/**
 * Configuration for stats monitoring.
 *
 * @public
 */
export interface StatsConfig {
    /** Update interval in milliseconds */
    updateInterval?: number;
    /** Whether to track memory usage (Chromium-based browsers only) */
    trackMemory?: boolean;
    /** Maximum samples for averaging */
    maxSamples?: number;
}

/**
 * Preset configurations for common game debug scenarios.
 *
 * @public
 */
export interface DebugPreset {
    /** Unique preset name */
    name: string;
    /** Schema definition for the preset */
    schema: DebugSchema;
    /** Default values */
    defaults?: Record<string, DebugValue>;
}

/**
 * Camera debug preset values.
 *
 * @public
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
 * Physics debug preset values.
 *
 * @public
 */
export interface PhysicsDebugValues {
    gravity: { x: number; y: number; z: number };
    timeScale: number;
    showColliders: boolean;
    showVelocities: boolean;
    showContacts: boolean;
}

/**
 * Lighting debug preset values.
 *
 * @public
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
 * Post-processing debug preset values.
 *
 * @public
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
