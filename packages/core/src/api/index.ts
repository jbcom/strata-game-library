/**
 * @jbcom/strata API
 *
 * Strata organizes its API into six domains based on how you'll use them:
 *
 * ## Domains
 *
 * ### World Building
 * Terrain, water, vegetation, sky, and atmosphere - the foundation of your 3D environment.
 *
 * ### Entities & Simulation
 * Characters, physics, animation, and AI - dynamic objects that move and interact.
 *
 * ### Effects & Atmosphere
 * Particles, weather, decals, lighting effects - visual polish that brings scenes to life.
 *
 * ### Player Experience
 * Cameras, input, audio, and UI - how players see, control, hear, and understand your game.
 *
 * ### Game Systems
 * State management, save/load, checkpoints - the infrastructure powering your game.
 *
 * ### Compositional Objects
 * Materials, skeletons, props, and creatures - define complex objects declaratively.
 *
 * ### Rendering Pipeline
 * Shaders, post-processing, materials - low-level graphics for advanced customization.
 *
 * ## Quick Start
 *
 * ```tsx
 * // Import from specific domains
 * import { Terrain, Water, ProceduralSky } from '@jbcom/strata/api/world';
 * import { CharacterController, Ragdoll } from '@jbcom/strata/api/entities';
 * import { ParticleEmitter, Rain } from '@jbcom/strata/api/effects';
 *
 * // Or import everything
 * import * as Strata from '@jbcom/strata';
 * ```
 *
 * @module API
 * @category Overview
 */

export * from '../game/game-presets';
export * from '../game/scene-shell-presets';
export * from '../game/shell-flow-presets';
export * from './compose';
export * from './createGame';
export * from './effects';
export * from './entities';
export * from './experience';
export * from './rendering';
// StrataGame moved to @strata-game-library/r3f (React-dependent)
export * from './systems';
export * from './world';
