
import { createFlockMemberPreset } from './FlockMemberPreset';
import type { AIPresetResult, FlockMemberPresetConfig } from './types';

/**
 * Configuration for creating a flock of entities.
 * @category Entities & Simulation
 */
export interface FlockConfig extends FlockMemberPresetConfig {
    /** Total number of members in the flock. */
    count: number;
    /** Area within which members are initially spawned. */
    spawnArea?: { min: [number, number, number]; max: [number, number, number] };
}

/**
 * Create a Flock of autonomous agents.
 *
 * Spawns multiple agents with flocking behaviors (alignment, cohesion, separation)
 * within a specified world volume.
 *
 * @category Entities & Simulation
 * @example
 * ```typescript
 * const birds = createFlock({
 *   count: 50,
 *   spawnArea: { min: [-20, 10, -20], max: [20, 30, 20] }
 * });
 * ```
 */
export function createFlock(config: FlockConfig): AIPresetResult[] {
    const { count, spawnArea = { min: [-10, 0, -10], max: [10, 0, 10] }, ...memberConfig } = config;

    const members: AIPresetResult[] = [];

    for (let i = 0; i < count; i++) {
        const member = createFlockMemberPreset(memberConfig);

        member.vehicle.position.set(
            spawnArea.min[0] + Math.random() * (spawnArea.max[0] - spawnArea.min[0]),
            spawnArea.min[1] + Math.random() * (spawnArea.max[1] - spawnArea.min[1]),
            spawnArea.min[2] + Math.random() * (spawnArea.max[2] - spawnArea.min[2])
        );

        members.push(member);
    }

    return members;
}
