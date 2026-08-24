/**
 * Physics force, impulse and kinematics math.
 *
 * The computational half of the physics module: converting desired velocity into
 * impulses and forces, resolving slopes and ground projection, and modelling
 * suspension, buoyancy and explosion falloff.
 *
 * This is the ONLY part of `core/physics` that depends on three.js, and it does so
 * solely for `THREE.Vector3` as a vector value type. Keeping it isolated means the
 * configuration types, collision layers and presets stay renderer-free.
 *
 * @packageDocumentation
 * @module core/physics/forces
 * @category Entities & Simulation
 */

import * as THREE from 'three';

/**
 * Calculate an impulse to apply based on desired velocity change
 * @param currentVelocity - Current velocity vector
 * @param targetVelocity - Target velocity vector
 * @param mass - Object mass
 * @returns Impulse vector to apply
 */
export function calculateImpulse(
  currentVelocity: THREE.Vector3,
  targetVelocity: THREE.Vector3,
  mass: number
): THREE.Vector3 {
  const deltaV = targetVelocity.clone().sub(currentVelocity);
  return deltaV.multiplyScalar(mass);
}

/**
 * Calculate continuous force to achieve target velocity
 * @param currentVelocity - Current velocity
 * @param targetVelocity - Target velocity
 * @param mass - Object mass
 * @param deltaTime - Time step
 * @returns Force vector to apply
 */
export function calculateForce(
  currentVelocity: THREE.Vector3,
  targetVelocity: THREE.Vector3,
  mass: number,
  deltaTime: number
): THREE.Vector3 {
  const impulse = calculateImpulse(currentVelocity, targetVelocity, mass);
  return impulse.divideScalar(deltaTime);
}

/**
 * Calculate jump impulse for character controllers
 * @param jumpHeight - Desired jump height
 * @param gravity - Gravity magnitude
 * @param mass - Character mass
 * @returns Upward impulse magnitude
 */
export function calculateJumpImpulse(jumpHeight: number, gravity: number, mass: number): number {
  return Math.sqrt(2 * Math.abs(gravity) * jumpHeight) * mass;
}

/**
 * Calculate landing velocity from fall height
 * @param fallHeight - Height of the fall
 * @param gravity - Gravity magnitude
 * @returns Landing velocity magnitude
 */
export function calculateLandingVelocity(fallHeight: number, gravity: number): number {
  return Math.sqrt(2 * Math.abs(gravity) * fallHeight);
}

/**
 * Apply drag force to velocity
 * @param velocity - Current velocity
 * @param dragCoefficient - Drag coefficient
 * @param deltaTime - Time step
 * @returns New velocity after drag
 */
export function applyDrag(
  velocity: THREE.Vector3,
  dragCoefficient: number,
  deltaTime: number
): THREE.Vector3 {
  const dragFactor = 1 - dragCoefficient * deltaTime;
  return velocity.clone().multiplyScalar(Math.max(0, dragFactor));
}

/**
 * Calculate buoyancy force for a submerged point
 * @param depth - Depth below water surface (positive = submerged)
 * @param buoyancyStrength - Strength multiplier
 * @param mass - Object mass
 * @returns Upward buoyancy force magnitude
 */
export function calculateBuoyancyForce(
  depth: number,
  buoyancyStrength: number,
  mass: number
): number {
  if (depth <= 0) return 0;
  return depth * buoyancyStrength * mass;
}

/**
 * Calculate slope angle from surface normal
 * @param normal - Surface normal vector
 * @returns Slope angle in radians
 */
export function calculateSlopeAngle(normal: THREE.Vector3): number {
  const up = new THREE.Vector3(0, 1, 0);
  return Math.acos(Math.min(1, Math.max(-1, normal.dot(up))));
}

/**
 * Check if slope is walkable
 * @param normal - Surface normal vector
 * @param maxSlopeAngle - Maximum walkable slope angle in radians
 * @returns Whether the slope can be walked on
 */
export function isWalkableSlope(normal: THREE.Vector3, maxSlopeAngle: number): boolean {
  return calculateSlopeAngle(normal) <= maxSlopeAngle;
}

/**
 * Project velocity onto ground plane
 * @param velocity - Input velocity
 * @param groundNormal - Ground surface normal
 * @returns Velocity projected onto ground plane
 */
export function projectVelocityOntoGround(
  velocity: THREE.Vector3,
  groundNormal: THREE.Vector3
): THREE.Vector3 {
  const dot = velocity.dot(groundNormal);
  return velocity.clone().sub(groundNormal.clone().multiplyScalar(dot));
}

/**
 * Calculate steering force for vehicle physics
 * @param currentDirection - Current forward direction
 * @param targetDirection - Target direction
 * @param maxSteerAngle - Maximum steering angle
 * @returns Steering angle to apply
 */
export function calculateSteeringAngle(
  currentDirection: THREE.Vector3,
  targetDirection: THREE.Vector3,
  maxSteerAngle: number
): number {
  const cross = new THREE.Vector3().crossVectors(currentDirection, targetDirection);
  const angle = Math.atan2(cross.y, currentDirection.dot(targetDirection));
  return Math.max(-maxSteerAngle, Math.min(maxSteerAngle, angle));
}

/**
 * Calculate suspension force using spring-damper model
 * @param compression - Current suspension compression (0-1)
 * @param velocity - Vertical velocity
 * @param stiffness - Spring stiffness
 * @param damping - Damping coefficient
 * @returns Suspension force magnitude
 */
export function calculateSuspensionForce(
  compression: number,
  velocity: number,
  stiffness: number,
  damping: number
): number {
  const springForce = compression * stiffness;
  const damperForce = -velocity * damping;
  return springForce + damperForce;
}

/**
 * Calculate explosion impulse falloff
 * @param distance - Distance from explosion center
 * @param explosionRadius - Explosion radius
 * @param maxForce - Maximum force at center
 * @returns Force at given distance
 */
export function calculateExplosionForce(
  distance: number,
  explosionRadius: number,
  maxForce: number
): number {
  if (distance >= explosionRadius) return 0;
  const falloff = 1 - distance / explosionRadius;
  return maxForce * falloff * falloff;
}

/**
 * Generate random debris velocity for destructible objects
 * @param explosionCenter - Center of explosion
 * @param debrisPosition - Position of debris piece
 * @param baseForce - Base explosion force
 * @param randomness - Randomness factor (0-1)
 * @returns Velocity vector for debris
 */
export function generateDebrisVelocity(
  explosionCenter: THREE.Vector3,
  debrisPosition: THREE.Vector3,
  baseForce: number,
  randomness: number = 0.3
): THREE.Vector3 {
  const direction = debrisPosition.clone().sub(explosionCenter).normalize();
  const force = baseForce * (1 + (Math.random() - 0.5) * randomness);

  direction.x += (Math.random() - 0.5) * randomness;
  direction.y += Math.random() * randomness * 0.5;
  direction.z += (Math.random() - 0.5) * randomness;

  return direction.normalize().multiplyScalar(force);
}
