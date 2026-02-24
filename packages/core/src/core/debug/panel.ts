/**
 * Debug Panel Integration.
 *
 * Provides a managed interface for `leva` debug panels with presets for common
 * game development scenarios including camera, physics, and lighting.
 *
 * @packageDocumentation
 * @module core/debug/panel
 * @category Game Systems
 */

import { button, folder, Leva, LevaPanel, useControls, useCreateStore } from 'leva';
import type {
  CameraDebugValues,
  DebugPanelConfig,
  LightingDebugValues,
  PhysicsDebugValues,
  PostProcessingDebugValues,
} from './types';

/**
 * Debug panel configuration with store.
 * Use with LevaPanel to apply the configuration.
 * @category Game Systems
 */
export interface DebugPanelInstance {
  /** The leva store instance. */
  store: ReturnType<typeof useCreateStore>;
  /** The original configuration. */
  config: DebugPanelConfig;
  /** Props to spread on LevaPanel/Leva component. */
  levaProps: {
    titleBar: { title?: string };
    collapsed?: boolean;
    hideTitleBar?: boolean;
  };
}

/**
 * Creates a debug panel configuration with store and pre-computed Leva props.
 * Returns the store, config, and levaProps to spread on the Leva component.
 *
 * @category Game Systems
 * @param config - Panel configuration options.
 * @returns Debug panel instance with store, config, and levaProps.
 */
export function createDebugPanel(config: DebugPanelConfig = {}): DebugPanelInstance {
  const store = useCreateStore();

  const levaProps = {
    titleBar: { title: config.name },
    collapsed: config.collapsed,
    hideTitleBar: !config.name,
  };

  return { store, config, levaProps };
}

/**
 * Hook for adding debug controls to a panel.
 * Wraps leva's useControls with preset support.
 *
 * @category Game Systems
 * @param schema - Control schema definition.
 * @param deps - Dependencies array for re-evaluation.
 * @returns Control values object.
 */
export function useDebugControls(
  schema: Record<string, unknown>,
  deps?: unknown[]
): Record<string, unknown> {
  return useControls(schema as Parameters<typeof useControls>[0], deps ?? []) as Record<
    string,
    unknown
  >;
}

/**
 * Hook for adding debug controls with a folder name.
 *
 * @category Game Systems
 * @param folderName - Name of the folder in the debug panel.
 * @param schema - Control schema definition.
 * @param collapsed - Whether the folder is collapsed by default.
 * @returns Control values object.
 */
export function useDebugFolder(
  folderName: string,
  schema: Record<string, unknown>,
  collapsed = false
): Record<string, unknown> {
  return useControls({
    [folderName]: folder(schema as Parameters<typeof folder>[0], { collapsed }),
  }) as Record<string, unknown>;
}

/**
 * Camera debug preset schema.
 * @category Game Systems
 * @returns Schema for camera debugging controls.
 */
export function useCameraDebug(defaults: Partial<CameraDebugValues> = {}): CameraDebugValues {
  return useControls('Camera', {
    fov: { value: defaults.fov ?? 75, min: 10, max: 150, step: 1 },
    near: { value: defaults.near ?? 0.1, min: 0.01, max: 10, step: 0.01 },
    far: { value: defaults.far ?? 1000, min: 100, max: 10000, step: 100 },
    position: {
      value: defaults.position ?? { x: 0, y: 5, z: 10 },
    },
    target: {
      value: defaults.target ?? { x: 0, y: 0, z: 0 },
    },
    zoom: { value: defaults.zoom ?? 1, min: 0.1, max: 10, step: 0.1 },
  }) as CameraDebugValues;
}

/**
 * Physics debug preset schema.
 * @category Game Systems
 * @returns Schema for physics debugging controls.
 */
export function usePhysicsDebug(defaults: Partial<PhysicsDebugValues> = {}): PhysicsDebugValues {
  return useControls('Physics', {
    gravity: {
      value: defaults.gravity ?? { x: 0, y: -9.81, z: 0 },
    },
    timeScale: { value: defaults.timeScale ?? 1, min: 0, max: 2, step: 0.1 },
    showColliders: defaults.showColliders ?? false,
    showVelocities: defaults.showVelocities ?? false,
    showContacts: defaults.showContacts ?? false,
  }) as PhysicsDebugValues;
}

/**
 * Lighting debug preset schema.
 * @category Game Systems
 * @returns Schema for lighting debugging controls.
 */
export function useLightingDebug(defaults: Partial<LightingDebugValues> = {}): LightingDebugValues {
  return useControls('Lighting', {
    ambientIntensity: {
      value: defaults.ambientIntensity ?? 0.5,
      min: 0,
      max: 2,
      step: 0.1,
    },
    ambientColor: defaults.ambientColor ?? '#ffffff',
    sunIntensity: {
      value: defaults.sunIntensity ?? 1,
      min: 0,
      max: 5,
      step: 0.1,
    },
    sunColor: defaults.sunColor ?? '#fffaf0',
    sunPosition: {
      value: defaults.sunPosition ?? { x: 10, y: 20, z: 10 },
    },
    shadowsEnabled: defaults.shadowsEnabled ?? true,
    shadowMapSize: {
      value: defaults.shadowMapSize ?? 2048,
      options: [512, 1024, 2048, 4096],
    },
  }) as LightingDebugValues;
}

/**
 * Post-processing debug preset schema.
 * @category Game Systems
 * @returns Schema for post-processing debugging controls.
 */
export function usePostProcessingDebug(
  defaults: Partial<PostProcessingDebugValues> = {}
): PostProcessingDebugValues {
  return useControls('Post Processing', {
    bloomEnabled: defaults.bloomEnabled ?? true,
    bloomIntensity: {
      value: defaults.bloomIntensity ?? 1,
      min: 0,
      max: 5,
      step: 0.1,
    },
    bloomThreshold: {
      value: defaults.bloomThreshold ?? 0.9,
      min: 0,
      max: 1,
      step: 0.01,
    },
    vignetteEnabled: defaults.vignetteEnabled ?? false,
    vignetteIntensity: {
      value: defaults.vignetteIntensity ?? 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    chromaticAberration: {
      value: defaults.chromaticAberration ?? 0,
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    noise: { value: defaults.noise ?? 0, min: 0, max: 1, step: 0.01 },
  }) as PostProcessingDebugValues;
}

/**
 * Creates a debug action button.
 *
 * @category Game Systems
 * @param onClick - Click handler.
 * @returns Button schema for use in useControls.
 */
export function createDebugButton(onClick: () => void): ReturnType<typeof button> {
  return button(onClick);
}

export { Leva, LevaPanel, useControls, folder, button, useCreateStore };
