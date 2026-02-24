/**
 * @jbcom/strata API
 *
 * Strata organizes its API into six domains based on how you'll use them:
 *
 * ## Domains
 *
 * ### {@link world | World Building}
 * Terrain, water, vegetation, sky, and atmosphere - the foundation of your 3D environment.
 *
 * ### {@link entities | Entities & Simulation}
 * Characters, physics, animation, and AI - dynamic objects that move and interact.
 *
 * ### {@link effects | Effects & Atmosphere}
 * Particles, weather, decals, lighting effects - visual polish that brings scenes to life.
 *
 * ### {@link experience | Player Experience}
 * Cameras, input, audio, and UI - how players see, control, hear, and understand your game.
 *
 * ### {@link systems | Game Systems}
 * State management, save/load, checkpoints - the infrastructure powering your game.
 *
 * ### {@link compose | Compositional Objects}
 * Materials, skeletons, props, and creatures - define complex objects declaratively.
 *
 * ### {@link rendering | Rendering Pipeline}
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

export * from './compose';
export * from './createGame';
export * from './effects';
export * from './entities';
export * from './experience';
export * from './rendering';
// StrataGame moved to @strata-game-library/r3f (React-dependent)
export * from './systems';
export * from './world';
