/**
 * Professional Debug and Profiling Tools.
 * @packageDocumentation
 * @module core/debug
 * @category Game Systems
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
