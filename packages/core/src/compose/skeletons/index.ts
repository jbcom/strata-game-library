/**
 * Skeleton presets and registry for creature body plans.
 *
 * Provides factory functions and pre-configured skeletons for common body
 * types: biped, quadruped (small/medium/large), avian, and serpentine.
 * Skeletons define bone hierarchies, joint constraints, and proportions
 * used by the animation and creature composition systems.
 *
 * @module Skeletons
 * @category Entities & Simulation
 */

import {
  createAvianSkeleton,
  createBipedSkeleton,
  createQuadrupedSkeleton,
  createSerpentineSkeleton,
} from './presets';
import type { SkeletonDefinition } from './types';

export * from './presets';
export * from './types';

export const SKELETONS: Record<string, SkeletonDefinition> = {
  biped: createBipedSkeleton('biped', { height: 1.8 }),
  quadruped_small: createQuadrupedSkeleton('quadruped_small', {
    bodyLength: 0.4,
    legRatio: 0.3,
    tailLength: 0.3,
    headSize: 0.1,
  }),
  quadruped_medium: createQuadrupedSkeleton('quadruped_medium', {
    bodyLength: 0.6,
    legRatio: 0.4,
    tailLength: 0.4,
    headSize: 0.15,
  }),
  quadruped_large: createQuadrupedSkeleton('quadruped_large', {
    bodyLength: 1.2,
    legRatio: 0.5,
    tailLength: 0.6,
    headSize: 0.25,
  }),
  avian: createAvianSkeleton('avian', { wingspan: 1.2, bodyLength: 0.3 }),
  serpentine: createSerpentineSkeleton('serpentine', { length: 2.0, segments: 20 }),
};
