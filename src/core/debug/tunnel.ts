/**
 * Tunnel-Rat Integration
 *
 * React portal utilities for rendering debug UI in different DOM locations.
 * Useful for overlays, HUDs, and debug information displays.
 *
 * @module core/debug/tunnel
 * @public
 */

import tunnelRat from 'tunnel-rat';
import type { DebugTunnelId, Tunnel } from './types';

/**
 * Creates a new tunnel for React portals.
 * Tunnels allow rendering content in a different location in the DOM tree.
 *
 * @returns A tunnel with In and Out components
 *
 * @example
 * ```typescript
 * import { createTunnel } from '@jbcom/strata/core/debug';
 *
 * const DebugOverlay = createTunnel();
 *
 * // In your 3D scene component
 * function Scene() {
 *   const fps = useFPS();
 *   return (
 *     <>
 *       <mesh />
 *       <DebugOverlay.In>
 *         <div className="fps-counter">FPS: {fps}</div>
 *       </DebugOverlay.In>
 *     </>
 *   );
 * }
 *
 * // In your root layout
 * function Layout() {
 *   return (
 *     <div>
 *       <Canvas><Scene /></Canvas>
 *       <div className="overlay-container">
 *         <DebugOverlay.Out />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function createTunnel(): Tunnel {
    return tunnelRat();
}

const tunnelRegistry = new Map<string, Tunnel>();

/**
 * Gets or creates a tunnel by ID.
 * Reuses existing tunnels with the same ID for consistency.
 *
 * @param id - Unique tunnel identifier
 * @returns A tunnel with In and Out components
 *
 * @example
 * ```typescript
 * import { getTunnel } from '@jbcom/strata/core/debug';
 *
 * // In one component
 * function DebugInfo() {
 *   const overlay = getTunnel('debug-overlay');
 *   return (
 *     <overlay.In>
 *       <div>Debug Info</div>
 *     </overlay.In>
 *   );
 * }
 *
 * // In another component - same tunnel, consistent output location
 * function StatsDisplay() {
 *   const overlay = getTunnel('debug-overlay');
 *   return (
 *     <overlay.In>
 *       <div>Stats</div>
 *     </overlay.In>
 *   );
 * }
 * ```
 */
export function getTunnel(id: string): Tunnel {
    const existing = tunnelRegistry.get(id);
    if (existing) {
        return existing;
    }
    const tunnel = createTunnel();
    tunnelRegistry.set(id, tunnel);
    return tunnel;
}

/**
 * Clears all registered tunnels.
 * Useful for testing or complete app reset.
 *
 * @example
 * ```typescript
 * import { clearTunnels } from '@jbcom/strata/core/debug';
 *
 * // In test cleanup
 * afterEach(() => {
 *   clearTunnels();
 * });
 * ```
 */
export function clearTunnels(): void {
    tunnelRegistry.clear();
}

/**
 * Pre-configured tunnel for debug overlay content.
 * Use this for FPS counters, stats displays, etc.
 *
 * @example
 * ```typescript
 * import { DebugOverlayTunnel } from '@jbcom/strata/core/debug';
 *
 * // Send content to overlay
 * function FPSCounter() {
 *   return (
 *     <DebugOverlayTunnel.In>
 *       <div>FPS: 60</div>
 *     </DebugOverlayTunnel.In>
 *   );
 * }
 *
 * // Render overlay in root
 * function App() {
 *   return (
 *     <>
 *       <Game />
 *       <div className="debug-overlay">
 *         <DebugOverlayTunnel.Out />
 *       </div>
 *     </>
 *   );
 * }
 * ```
 */
export const DebugOverlayTunnel: Tunnel = createTunnel();

/**
 * Pre-configured tunnel for FPS counter display.
 *
 * @example
 * ```typescript
 * import { FPSCounterTunnel } from '@jbcom/strata/core/debug';
 *
 * function FPSDisplay() {
 *   const fps = useFPS();
 *   return (
 *     <FPSCounterTunnel.In>
 *       <span className="fps">{fps.toFixed(0)} FPS</span>
 *     </FPSCounterTunnel.In>
 *   );
 * }
 * ```
 */
export const FPSCounterTunnel: Tunnel = createTunnel();

/**
 * Pre-configured tunnel for stats panel display.
 *
 * @example
 * ```typescript
 * import { StatsPanelTunnel } from '@jbcom/strata/core/debug';
 *
 * function StatsPanel() {
 *   const stats = useStats();
 *   return (
 *     <StatsPanelTunnel.In>
 *       <div className="stats">
 *         <p>FPS: {stats.fps}</p>
 *         <p>Draw Calls: {stats.drawCalls}</p>
 *       </div>
 *     </StatsPanelTunnel.In>
 *   );
 * }
 * ```
 */
export const StatsPanelTunnel: Tunnel = createTunnel();

/**
 * Gets a pre-configured debug tunnel by ID.
 *
 * @param id - Debug tunnel identifier
 * @returns The corresponding tunnel
 *
 * @example
 * ```typescript
 * import { getDebugTunnel } from '@jbcom/strata/core/debug';
 *
 * const overlay = getDebugTunnel('debug-overlay');
 * const fps = getDebugTunnel('fps-counter');
 * ```
 */
export function getDebugTunnel(id: DebugTunnelId): Tunnel {
    switch (id) {
        case 'debug-overlay':
            return DebugOverlayTunnel;
        case 'fps-counter':
            return FPSCounterTunnel;
        case 'stats-panel':
            return StatsPanelTunnel;
        default:
            return getTunnel(id);
    }
}

export { tunnelRat };
