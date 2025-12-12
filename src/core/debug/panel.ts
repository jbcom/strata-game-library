/**
 * Debug Panel Integration
 *
 * Thin wrapper around leva for game development debug panels.
 * Provides presets for common game debugging scenarios.
 *
 * @module core/debug/panel
 * @public
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
 */
export interface DebugPanelInstance {
    /** The leva store instance */
    store: ReturnType<typeof useCreateStore>;
    /** The original configuration */
    config: DebugPanelConfig;
    /** Props to spread on LevaPanel/Leva component */
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
 * @param config - Panel configuration options
 * @returns Debug panel instance with store, config, and levaProps
 *
 * @example
 * ```tsx
 * import { createDebugPanel, Leva } from '@jbcom/strata/core/debug';
 *
 * function DebugControls() {
 *   const panel = createDebugPanel({
 *     name: 'Game Debug',
 *     collapsed: false,
 *     position: 'top-right',
 *   });
 *
 *   return <Leva store={panel.store} {...panel.levaProps} />;
 * }
 * ```
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
 * @param schema - Control schema definition
 * @param deps - Dependencies array for re-evaluation
 * @returns Control values object
 *
 * @example
 * ```typescript
 * import { useDebugControls } from '@jbcom/strata/core/debug';
 *
 * function GameScene() {
 *   const { showGrid, gridSize, wireframe } = useDebugControls({
 *     showGrid: true,
 *     gridSize: { value: 10, min: 1, max: 100, step: 1 },
 *     wireframe: false,
 *   });
 *
 *   return (
 *     <>
 *       {showGrid && <Grid size={gridSize} />}
 *       <Mesh wireframe={wireframe} />
 *     </>
 *   );
 * }
 * ```
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
 * @param folderName - Name of the folder in the debug panel
 * @param schema - Control schema definition
 * @param collapsed - Whether the folder is collapsed by default
 * @returns Control values object
 *
 * @example
 * ```typescript
 * import { useDebugFolder } from '@jbcom/strata/core/debug';
 *
 * function PlayerDebug() {
 *   const values = useDebugFolder('Player', {
 *     health: { value: 100, min: 0, max: 100 },
 *     speed: { value: 5, min: 0, max: 20 },
 *     invincible: false,
 *   });
 *
 *   return null; // Debug controls appear in panel
 * }
 * ```
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
 *
 * @returns Schema for camera debugging controls
 *
 * @example
 * ```typescript
 * import { useCameraDebug } from '@jbcom/strata/core/debug';
 *
 * function CameraController() {
 *   const { fov, near, far, position } = useCameraDebug();
 *
 *   return (
 *     <PerspectiveCamera
 *       fov={fov}
 *       near={near}
 *       far={far}
 *       position={[position.x, position.y, position.z]}
 *     />
 *   );
 * }
 * ```
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
 *
 * @returns Schema for physics debugging controls
 *
 * @example
 * ```typescript
 * import { usePhysicsDebug } from '@jbcom/strata/core/debug';
 *
 * function PhysicsWorld() {
 *   const { gravity, timeScale, showColliders } = usePhysicsDebug();
 *
 *   return (
 *     <Physics gravity={[gravity.x, gravity.y, gravity.z]} timeScale={timeScale}>
 *       {showColliders && <Debug />}
 *       <Scene />
 *     </Physics>
 *   );
 * }
 * ```
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
 *
 * @returns Schema for lighting debugging controls
 *
 * @example
 * ```typescript
 * import { useLightingDebug } from '@jbcom/strata/core/debug';
 *
 * function Lighting() {
 *   const { ambientIntensity, sunIntensity, sunPosition } = useLightingDebug();
 *
 *   return (
 *     <>
 *       <ambientLight intensity={ambientIntensity} />
 *       <directionalLight
 *         intensity={sunIntensity}
 *         position={[sunPosition.x, sunPosition.y, sunPosition.z]}
 *       />
 *     </>
 *   );
 * }
 * ```
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
 *
 * @returns Schema for post-processing debugging controls
 *
 * @example
 * ```typescript
 * import { usePostProcessingDebug } from '@jbcom/strata/core/debug';
 *
 * function PostProcessing() {
 *   const { bloomEnabled, bloomIntensity } = usePostProcessingDebug();
 *
 *   return (
 *     <EffectComposer>
 *       {bloomEnabled && <Bloom intensity={bloomIntensity} />}
 *     </EffectComposer>
 *   );
 * }
 * ```
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
 * @param onClick - Click handler
 * @returns Button schema for use in useControls
 *
 * @example
 * ```typescript
 * import { useDebugControls, createDebugButton } from '@jbcom/strata/core/debug';
 *
 * function DebugActions() {
 *   useDebugControls({
 *     'Reset Position': createDebugButton(() => {
 *       player.position.set(0, 0, 0);
 *     }),
 *     'Spawn Enemy': createDebugButton(spawnEnemy),
 *   });
 *
 *   return null;
 * }
 * ```
 */
export function createDebugButton(onClick: () => void): ReturnType<typeof button> {
    return button(onClick);
}

export { Leva, LevaPanel, useControls, folder, button, useCreateStore };
