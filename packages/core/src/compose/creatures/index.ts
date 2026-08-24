/**
 * Creature composition system and preset definitions.
 *
 * Creatures are composed from skeletons, material coverings, AI behaviors,
 * stats, animations, and spawn rules. This module is the public barrel over
 * the focused submodules that implement it:
 *
 * - `presets` — the built-in {@link CREATURES} registry (plain data).
 * - `definitions` — cloning and merging definitions ({@link createCreature}).
 * - `vector-math` / `bone-geometry` — renderer-free tuple math, covering
 *   pattern matching, bone world positions, bounds, and volume estimation.
 * - `animation-graph` — {@link createCreatureAnimationGraph}.
 * - `rig-binding` — {@link createCreatureRigBindingPlan}.
 * - `ik` — {@link createCreatureIKRigPlan} and {@link createCreatureIKPosePlan}.
 * - `runtime` — {@link resolveCreatureComposition} and runtime assembly.
 *
 * @module Creatures
 * @category Entities & Simulation
 */

export { createCreatureAnimationGraph } from './animation-graph';
export { createCreature } from './definitions';
export { createCreatureIKPosePlan, createCreatureIKRigPlan } from './ik';
export { CREATURES } from './presets';
export { createCreatureRigBindingPlan } from './rig-binding';
export { resolveCreatureComposition } from './runtime';
export * from './types';
