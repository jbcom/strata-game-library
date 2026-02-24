/**
 * React Portal Utilities for Debug UI.
 *
 * Provides a tunnel system powered by `tunnel-rat` for rendering debug information,
 * performance stats, and control panels in specific DOM locations outside the
 * React Three Fiber canvas.
 *
 * @packageDocumentation
 * @module core/debug/tunnel
 * @category Game Systems
 */

import tunnelRat from 'tunnel-rat';
import type { DebugTunnelId, Tunnel } from './types';

/**
 * Creates a new tunnel for React portals.
 * Tunnels allow rendering content in a different location in the DOM tree.
 *
 * @category Game Systems
 * @returns A tunnel with In and Out components.
 */
export function createTunnel(): Tunnel {
  return tunnelRat();
}

const tunnelRegistry = new Map<string, Tunnel>();

/**
 * Gets or creates a tunnel by ID.
 * Reuses existing tunnels with the same ID for consistency.
 *
 * @category Game Systems
 * @param id - Unique tunnel identifier.
 * @returns A tunnel with In and Out components.
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
 * @category Game Systems
 */
export function clearTunnels(): void {
  tunnelRegistry.clear();
}

/**
 * Pre-configured tunnel for debug overlay content.
 * Use this for FPS counters, stats displays, etc.
 * @category Game Systems
 */
export const DebugOverlayTunnel: Tunnel = createTunnel();

/**
 * Pre-configured tunnel for FPS counter display.
 * @category Game Systems
 */
export const FPSCounterTunnel: Tunnel = createTunnel();

/**
 * Pre-configured tunnel for stats panel display.
 * @category Game Systems
 */
export const StatsPanelTunnel: Tunnel = createTunnel();

/**
 * Gets a pre-configured debug tunnel by ID.
 *
 * @category Game Systems
 * @param id - Debug tunnel identifier.
 * @returns The corresponding tunnel.
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
