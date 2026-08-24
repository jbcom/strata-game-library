/**
 * Collision layer bitmask system.
 *
 * Owns the layer vocabulary and the ready-made filter presets that decide which
 * categories of body are allowed to interact. Pure integer bitmask work — no
 * three.js, no simulation state.
 *
 * @packageDocumentation
 * @module core/physics/collision
 * @category Entities & Simulation
 */

/**
 * Collision layer bitmask definitions for physics interaction filtering.
 * Allows selective collision between different object types for performance and gameplay.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * // Character only collides with static, dynamic, trigger, and water
 * const characterFilter = {
 *   memberships: CollisionLayer.Character,
 *   filter: CollisionLayer.Static | CollisionLayer.Dynamic | CollisionLayer.Trigger | CollisionLayer.Water
 * };
 * ```
 */
export enum CollisionLayer {
  /** Default layer for uncategorized objects. */
  Default = 0x0001,
  /** Static environment geometry (walls, floors). */
  Static = 0x0002,
  /** Dynamic physics objects (crates, props). */
  Dynamic = 0x0004,
  /** Player-controlled character bodies. */
  Character = 0x0008,
  /** Vehicle chassis and wheels. */
  Vehicle = 0x0010,
  /** Fast-moving projectiles (bullets, arrows). */
  Projectile = 0x0020,
  /** Sensor volumes for event triggering. */
  Trigger = 0x0040,
  /** Small destructible fragments. */
  Debris = 0x0080,
  /** Fluid volumes for buoyancy simulation. */
  Water = 0x0100,
  /** All layers combined (collide with everything). */
  All = 0xffff,
}

/**
 * Collision filter configuration for selective physics interactions.
 * Determines which collision layers an object belongs to and which layers it can collide with.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * // Projectile that hits characters and vehicles but not other projectiles
 * const projectileFilter: CollisionFilter = {
 *   memberships: CollisionLayer.Projectile,
 *   filter: CollisionLayer.Static | CollisionLayer.Character | CollisionLayer.Vehicle
 * };
 * ```
 */
export interface CollisionFilter {
  /** The collision layer(s) this object belongs to (bitmask). */
  memberships: number;
  /** The collision layer(s) this object should interact with (bitmask). */
  filter: number;
}

/**
 * Predefined collision filter presets for common object types.
 *
 * **Symmetry rule.** Physics backends (Rapier, PhysX, Bullet) only report a contact
 * when *both* bodies accept each other — the test is
 * `(a.filter & b.memberships) && (b.filter & a.memberships)`. A pair is therefore
 * only enabled if each side names the other, and a one-sided entry silently disables
 * the interaction it looks like it is granting. Keep these presets symmetric: adding
 * layer B to preset A means adding A's layer to preset B.
 *
 * @category Entities & Simulation
 */
export const collisionFilters: Record<string, CollisionFilter> = {
  default: {
    memberships: CollisionLayer.Default,
    filter: CollisionLayer.All,
  },
  static: {
    memberships: CollisionLayer.Static,
    filter: CollisionLayer.All,
  },
  character: {
    memberships: CollisionLayer.Character,
    filter:
      CollisionLayer.Static |
      CollisionLayer.Dynamic |
      CollisionLayer.Character |
      CollisionLayer.Vehicle |
      CollisionLayer.Projectile |
      CollisionLayer.Trigger |
      CollisionLayer.Water,
  },
  vehicle: {
    memberships: CollisionLayer.Vehicle,
    filter:
      CollisionLayer.Static |
      CollisionLayer.Dynamic |
      CollisionLayer.Character |
      CollisionLayer.Vehicle |
      CollisionLayer.Projectile |
      CollisionLayer.Trigger,
  },
  projectile: {
    memberships: CollisionLayer.Projectile,
    filter:
      CollisionLayer.Static |
      CollisionLayer.Dynamic |
      CollisionLayer.Character |
      CollisionLayer.Vehicle,
  },
  debris: {
    memberships: CollisionLayer.Debris,
    filter: CollisionLayer.Static | CollisionLayer.Dynamic,
  },
  trigger: {
    memberships: CollisionLayer.Trigger,
    filter: CollisionLayer.Character | CollisionLayer.Vehicle,
  },
  water: {
    memberships: CollisionLayer.Water,
    filter:
      CollisionLayer.Character |
      CollisionLayer.Dynamic |
      CollisionLayer.Vehicle |
      CollisionLayer.Debris,
  },
};
