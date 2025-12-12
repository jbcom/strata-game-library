/**
 * Debug Module
 *
 * Debug utilities integrating leva for control panels and tunnel-rat for
 * React portals. Provides game development debugging tools with minimal overhead.
 *
 * @module core/debug
 * @public
 *
 * @example
 * ```typescript
 * import {
 *   useControls,
 *   useDebugControls,
 *   useCameraDebug,
 *   useStats,
 *   DebugOverlayTunnel,
 *   Leva
 * } from '@jbcom/strata/core/debug';
 *
 * function Game() {
 *   const camera = useCameraDebug();
 *   const stats = useStats();
 *
 *   const { wireframe, showGrid } = useDebugControls({
 *     wireframe: false,
 *     showGrid: true,
 *   });
 *
 *   return (
 *     <>
 *       <Leva collapsed />
 *       <Canvas>
 *         <PerspectiveCamera fov={camera.fov} />
 *         {showGrid && <Grid />}
 *         <Scene wireframe={wireframe} />
 *         <DebugOverlayTunnel.In>
 *           <div className="fps">FPS: {stats.fps.toFixed(0)}</div>
 *         </DebugOverlayTunnel.In>
 *       </Canvas>
 *       <DebugOverlayTunnel.Out />
 *     </>
 *   );
 * }
 * ```
 */

export {
    button,
    createDebugButton,
    createDebugPanel,
    folder,
    Leva,
    LevaPanel,
    useCameraDebug,
    useControls,
    useCreateStore,
    useDebugControls,
    useDebugFolder,
    useLightingDebug,
    usePhysicsDebug,
    usePostProcessingDebug,
} from './panel';
export type { FormatStatsOptions, FormattedStats, StatsSnapshot } from './stats';

export { calculateAverageStats, createStatsSnapshot, formatStats, useStats } from './stats';
export {
    clearTunnels,
    createTunnel,
    DebugOverlayTunnel,
    FPSCounterTunnel,
    getDebugTunnel,
    getTunnel,
    StatsPanelTunnel,
    tunnelRat,
} from './tunnel';
export type {
    CameraDebugValues,
    DebugInputs,
    DebugPanelConfig,
    DebugPanelTheme,
    DebugPreset,
    DebugSchema,
    DebugStore,
    DebugTunnelId,
    DebugValue,
    LightingDebugValues,
    PerformanceStats,
    PhysicsDebugValues,
    PostProcessingDebugValues,
    StatsConfig,
    Tunnel,
    TunnelConfig,
} from './types';
