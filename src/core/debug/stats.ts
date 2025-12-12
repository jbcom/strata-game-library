/**
 * Performance Statistics Monitoring
 *
 * Utilities for monitoring FPS, memory usage, and WebGL statistics.
 * Provides formatted output for debug displays.
 *
 * @module core/debug/stats
 * @public
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PerformanceStats, StatsConfig } from './types';

const DEFAULT_CONFIG: Required<StatsConfig> = {
    updateInterval: 100,
    trackMemory: true,
    maxSamples: 60,
};

/**
 * Hook for monitoring performance statistics.
 * Tracks FPS, frame time, memory usage, and optionally WebGL stats.
 *
 * @param config - Stats configuration options
 * @returns Current performance statistics
 *
 * @example
 * ```typescript
 * import { useStats } from '@jbcom/strata/core/debug';
 *
 * function DebugPanel() {
 *   const stats = useStats({ updateInterval: 100 });
 *
 *   return (
 *     <div className="stats">
 *       <p>FPS: {stats.fps.toFixed(1)}</p>
 *       <p>Frame Time: {stats.frameTime.toFixed(2)}ms</p>
 *       {stats.memory && (
 *         <p>Memory: {(stats.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStats(config: StatsConfig = {}): PerformanceStats {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameTimeRef = useRef<number>(performance.now());
    const rafIdRef = useRef<number | null>(null);

    const [stats, setStats] = useState<PerformanceStats>(() => ({
        fps: 60,
        frameTime: 16.67,
        memory: undefined,
        drawCalls: undefined,
        triangles: undefined,
        textures: undefined,
        geometries: undefined,
        timestamp: Date.now(),
    }));

    const updateStats = useCallback(() => {
        const now = performance.now();
        const frameTime = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;

        frameTimesRef.current.push(frameTime);
        if (frameTimesRef.current.length > mergedConfig.maxSamples) {
            frameTimesRef.current.shift();
        }

        const avgFrameTime =
            frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = 1000 / avgFrameTime;

        let memory: PerformanceStats['memory'];
        if (
            mergedConfig.trackMemory &&
            typeof performance !== 'undefined' &&
            'memory' in performance
        ) {
            const perfMemory = (
                performance as Performance & {
                    memory?: {
                        usedJSHeapSize: number;
                        totalJSHeapSize: number;
                        jsHeapSizeLimit: number;
                    };
                }
            ).memory;
            if (perfMemory) {
                memory = {
                    usedJSHeapSize: perfMemory.usedJSHeapSize,
                    totalJSHeapSize: perfMemory.totalJSHeapSize,
                    jsHeapSizeLimit: perfMemory.jsHeapSizeLimit,
                };
            }
        }

        setStats({
            fps,
            frameTime: avgFrameTime,
            memory,
            drawCalls: undefined,
            triangles: undefined,
            textures: undefined,
            geometries: undefined,
            timestamp: Date.now(),
        });
    }, [mergedConfig.maxSamples, mergedConfig.trackMemory]);

    useEffect(() => {
        let lastUpdate = 0;

        const loop = (time: number) => {
            if (time - lastUpdate >= mergedConfig.updateInterval) {
                updateStats();
                lastUpdate = time;
            }
            rafIdRef.current = requestAnimationFrame(loop);
        };

        rafIdRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [mergedConfig.updateInterval, updateStats]);

    return stats;
}

/**
 * Formats performance statistics for display.
 *
 * @param stats - Performance statistics to format
 * @param options - Formatting options
 * @returns Formatted statistics object
 *
 * @example
 * ```typescript
 * import { useStats, formatStats } from '@jbcom/strata/core/debug';
 *
 * function StatsDisplay() {
 *   const stats = useStats();
 *   const formatted = formatStats(stats);
 *
 *   return (
 *     <pre>{JSON.stringify(formatted, null, 2)}</pre>
 *   );
 * }
 * ```
 */
export function formatStats(
    stats: PerformanceStats,
    options: FormatStatsOptions = {}
): FormattedStats {
    const { precision = 1, includeUnits = true } = options;

    const formatNumber = (n: number, unit?: string): string => {
        const formatted = n.toFixed(precision);
        return includeUnits && unit ? `${formatted} ${unit}` : formatted;
    };

    const formatBytes = (bytes: number): string => {
        const mb = bytes / 1024 / 1024;
        return formatNumber(mb, 'MB');
    };

    return {
        fps: formatNumber(stats.fps, 'FPS'),
        frameTime: formatNumber(stats.frameTime, 'ms'),
        memory: stats.memory
            ? {
                  used: formatBytes(stats.memory.usedJSHeapSize),
                  total: formatBytes(stats.memory.totalJSHeapSize),
                  limit: formatBytes(stats.memory.jsHeapSizeLimit),
                  percentage: `${((stats.memory.usedJSHeapSize / stats.memory.jsHeapSizeLimit) * 100).toFixed(1)}%`,
              }
            : undefined,
        drawCalls: stats.drawCalls?.toString(),
        triangles:
            stats.triangles !== undefined ? formatTriangles(stats.triangles, precision) : undefined,
        textures: stats.textures?.toString(),
        geometries: stats.geometries?.toString(),
        timestamp: new Date(stats.timestamp).toISOString(),
    };
}

/**
 * Options for formatting statistics.
 *
 * @public
 */
export interface FormatStatsOptions {
    /** Decimal precision for numbers */
    precision?: number;
    /** Whether to include units in output */
    includeUnits?: boolean;
}

/**
 * Formatted statistics ready for display.
 *
 * @public
 */
export interface FormattedStats {
    fps: string;
    frameTime: string;
    memory?: {
        used: string;
        total: string;
        limit: string;
        percentage: string;
    };
    drawCalls?: string;
    triangles?: string;
    textures?: string;
    geometries?: string;
    timestamp: string;
}

/**
 * Formats triangle count with K/M suffix.
 *
 * @param count - Triangle count
 * @param precision - Decimal precision
 * @returns Formatted string
 */
function formatTriangles(count: number, precision: number): string {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(precision)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(precision)}K`;
    }
    return count.toString();
}

/**
 * Creates a stats snapshot for logging or debugging.
 *
 * @param stats - Performance statistics
 * @returns Plain object snapshot
 *
 * @example
 * ```typescript
 * import { useStats, createStatsSnapshot } from '@jbcom/strata/core/debug';
 *
 * function DebugLogger() {
 *   const stats = useStats();
 *
 *   const logStats = () => {
 *     const snapshot = createStatsSnapshot(stats);
 *     console.log('[Performance]', snapshot);
 *   };
 *
 *   return <button onClick={logStats}>Log Stats</button>;
 * }
 * ```
 */
export function createStatsSnapshot(stats: PerformanceStats): StatsSnapshot {
    return {
        fps: Math.round(stats.fps),
        frameTime: Math.round(stats.frameTime * 100) / 100,
        memoryMB: stats.memory
            ? Math.round((stats.memory.usedJSHeapSize / 1024 / 1024) * 10) / 10
            : undefined,
        drawCalls: stats.drawCalls,
        triangles: stats.triangles,
        timestamp: stats.timestamp,
    };
}

/**
 * Stats snapshot for logging.
 *
 * @public
 */
export interface StatsSnapshot {
    fps: number;
    frameTime: number;
    memoryMB?: number;
    drawCalls?: number;
    triangles?: number;
    timestamp: number;
}

/**
 * Calculates average stats over a set of samples.
 *
 * @param samples - Array of performance stats samples
 * @returns Averaged statistics
 *
 * @example
 * ```typescript
 * import { calculateAverageStats } from '@jbcom/strata/core/debug';
 *
 * const samples = [stats1, stats2, stats3];
 * const average = calculateAverageStats(samples);
 * console.log(`Average FPS: ${average.fps}`);
 * ```
 */
export function calculateAverageStats(samples: PerformanceStats[]): PerformanceStats {
    if (samples.length === 0) {
        return {
            fps: 0,
            frameTime: 0,
            timestamp: Date.now(),
        };
    }

    const sum = samples.reduce(
        (acc, s) => ({
            fps: acc.fps + s.fps,
            frameTime: acc.frameTime + s.frameTime,
            drawCalls: (acc.drawCalls ?? 0) + (s.drawCalls ?? 0),
            triangles: (acc.triangles ?? 0) + (s.triangles ?? 0),
        }),
        { fps: 0, frameTime: 0, drawCalls: 0, triangles: 0 }
    );

    const count = samples.length;

    // Check if any sample had optional fields
    const hasDrawCalls = samples.some((s) => s.drawCalls !== undefined);
    const hasTriangles = samples.some((s) => s.triangles !== undefined);

    return {
        fps: sum.fps / count,
        frameTime: sum.frameTime / count,
        drawCalls: hasDrawCalls ? Math.round(sum.drawCalls / count) : undefined,
        triangles: hasTriangles ? Math.round(sum.triangles / count) : undefined,
        timestamp: Date.now(),
    };
}
