/**
 * Physics Presets
 *
 * Pre-configured physics settings for common use cases.
 * @module presets/physics
 */

import type {
    BuoyancyConfig,
    CharacterControllerConfig,
    DestructibleConfig,
    PhysicsMaterial,
    VehicleConfig,
} from '../core/physics';
import {
    createDefaultBuoyancyConfig,
    createDefaultCharacterConfig,
    createDefaultDestructibleConfig,
    createDefaultVehicleConfig,
} from '../core/physics';

/**
 * Character preset definition
 */
export interface CharacterPreset {
    name: string;
    description: string;
    config: CharacterControllerConfig;
}

/**
 * Vehicle preset definition
 */
export interface VehiclePreset {
    name: string;
    description: string;
    config: VehicleConfig;
}

/**
 * Material preset definition
 */
export interface MaterialPreset {
    name: string;
    description: string;
    material: PhysicsMaterial;
}

/**
 * Destructible preset definition
 */
export interface DestructiblePreset {
    name: string;
    description: string;
    config: DestructibleConfig;
}

/**
 * Buoyancy preset definition
 */
export interface BuoyancyPreset {
    name: string;
    description: string;
    config: BuoyancyConfig;
}

/**
 * FPS character preset - tight controls, instant response
 */
export const FPS_CHARACTER_PRESET: CharacterPreset = {
    name: 'FPS',
    description: 'First-person shooter character with tight, responsive controls',
    config: {
        ...createDefaultCharacterConfig(),
        capsuleRadius: 0.25,
        capsuleHeight: 1.6,
        mass: 75,
        maxSpeed: 7,
        acceleration: 50,
        deceleration: 40,
        jumpForce: 7,
        maxJumps: 1,
        groundCheckDistance: 0.08,
        slopeLimit: Math.PI / 4,
        stepHeight: 0.4,
        coyoteTime: 0.1,
        jumpBufferTime: 0.08,
        airControl: 0.2,
        gravityScale: 2.5,
        snapToGroundDistance: 0.2,
        skinWidth: 0.01,
        autoStepEnabled: true,
        slideEnabled: true,
    },
};

/**
 * Third-person character preset - smoother, more floaty movement
 */
export const THIRD_PERSON_CHARACTER_PRESET: CharacterPreset = {
    name: 'Third Person',
    description: 'Third-person character with smoother, more animated-friendly movement',
    config: {
        ...createDefaultCharacterConfig(),
        capsuleRadius: 0.35,
        capsuleHeight: 1.8,
        mass: 80,
        maxSpeed: 5,
        acceleration: 25,
        deceleration: 15,
        jumpForce: 9,
        maxJumps: 1,
        groundCheckDistance: 0.12,
        slopeLimit: Math.PI / 3,
        stepHeight: 0.45,
        coyoteTime: 0.2,
        jumpBufferTime: 0.15,
        airControl: 0.4,
        gravityScale: 1.8,
        snapToGroundDistance: 0.4,
        skinWidth: 0.02,
        autoStepEnabled: true,
        slideEnabled: true,
    },
};

/**
 * Platformer character preset - high jumps, great air control
 */
export const PLATFORMER_CHARACTER_PRESET: CharacterPreset = {
    name: 'Platformer',
    description: 'Platformer character with high jumps and excellent air control',
    config: {
        ...createDefaultCharacterConfig(),
        capsuleRadius: 0.4,
        capsuleHeight: 1.2,
        mass: 50,
        maxSpeed: 8,
        acceleration: 40,
        deceleration: 25,
        jumpForce: 12,
        maxJumps: 2,
        groundCheckDistance: 0.1,
        slopeLimit: Math.PI / 3.5,
        stepHeight: 0.3,
        coyoteTime: 0.2,
        jumpBufferTime: 0.15,
        airControl: 0.8,
        gravityScale: 2,
        snapToGroundDistance: 0.25,
        skinWidth: 0.02,
        autoStepEnabled: true,
        slideEnabled: false,
    },
};

/**
 * Tank character preset - slow, heavy, hard to push
 */
export const TANK_CHARACTER_PRESET: CharacterPreset = {
    name: 'Tank',
    description: 'Heavy tank-like character that is slow but hard to move',
    config: {
        ...createDefaultCharacterConfig(),
        capsuleRadius: 0.5,
        capsuleHeight: 2.2,
        mass: 200,
        maxSpeed: 3.5,
        acceleration: 15,
        deceleration: 10,
        jumpForce: 6,
        maxJumps: 1,
        groundCheckDistance: 0.15,
        slopeLimit: Math.PI / 5,
        stepHeight: 0.5,
        coyoteTime: 0.1,
        jumpBufferTime: 0.1,
        airControl: 0.1,
        gravityScale: 3,
        snapToGroundDistance: 0.3,
        skinWidth: 0.03,
        autoStepEnabled: true,
        slideEnabled: true,
    },
};

/**
 * All character presets
 */
export const characterPresets: Record<string, CharacterPreset> = {
    fps: FPS_CHARACTER_PRESET,
    thirdPerson: THIRD_PERSON_CHARACTER_PRESET,
    platformer: PLATFORMER_CHARACTER_PRESET,
    tank: TANK_CHARACTER_PRESET,
};

/**
 * Car vehicle preset - standard sedan handling
 */
export const CAR_VEHICLE_PRESET: VehiclePreset = {
    name: 'Car',
    description: 'Standard car with balanced handling',
    config: {
        ...createDefaultVehicleConfig(),
        chassisMass: 1400,
        chassisSize: [1.8, 0.7, 4.2],
        wheelRadius: 0.32,
        wheelWidth: 0.22,
        wheelPositions: [
            [-0.8, -0.2, 1.3],
            [0.8, -0.2, 1.3],
            [-0.8, -0.2, -1.2],
            [0.8, -0.2, -1.2],
        ],
        suspensionRestLength: 0.3,
        suspensionStiffness: 25,
        suspensionDamping: 4,
        suspensionTravel: 0.2,
        maxSteerAngle: Math.PI / 5,
        driveWheels: 'front',
        motorForce: 6000,
        brakeForce: 4000,
        frictionSlip: 2.5,
        rollInfluence: 0.15,
        antiRoll: 0.4,
        centerOfMassOffset: [0, -0.25, 0],
    },
};

/**
 * Truck vehicle preset - heavy, powerful, less agile
 */
export const TRUCK_VEHICLE_PRESET: VehiclePreset = {
    name: 'Truck',
    description: 'Heavy truck with powerful engine but slower handling',
    config: {
        ...createDefaultVehicleConfig(),
        chassisMass: 4000,
        chassisSize: [2.5, 1.5, 6],
        wheelRadius: 0.5,
        wheelWidth: 0.35,
        wheelPositions: [
            [-1.1, -0.4, 2.2],
            [1.1, -0.4, 2.2],
            [-1.1, -0.4, -1.8],
            [1.1, -0.4, -1.8],
        ],
        suspensionRestLength: 0.4,
        suspensionStiffness: 40,
        suspensionDamping: 6,
        suspensionTravel: 0.3,
        maxSteerAngle: Math.PI / 7,
        driveWheels: 'rear',
        motorForce: 15000,
        brakeForce: 8000,
        frictionSlip: 1.8,
        rollInfluence: 0.08,
        antiRoll: 0.6,
        centerOfMassOffset: [0, -0.5, 0.5],
    },
};

/**
 * Motorcycle vehicle preset - light, nimble, easy to flip
 */
export const MOTORCYCLE_VEHICLE_PRESET: VehiclePreset = {
    name: 'Motorcycle',
    description: 'Light and nimble motorcycle',
    config: {
        ...createDefaultVehicleConfig(),
        chassisMass: 250,
        chassisSize: [0.4, 0.6, 2],
        wheelRadius: 0.28,
        wheelWidth: 0.12,
        wheelPositions: [
            [0, -0.2, 0.7],
            [0, -0.2, -0.7],
        ],
        suspensionRestLength: 0.25,
        suspensionStiffness: 35,
        suspensionDamping: 5,
        suspensionTravel: 0.2,
        maxSteerAngle: Math.PI / 4,
        driveWheels: 'rear',
        motorForce: 3000,
        brakeForce: 2000,
        frictionSlip: 3,
        rollInfluence: 0.5,
        antiRoll: 0.1,
        centerOfMassOffset: [0, -0.15, 0],
    },
};

/**
 * Sports car preset - fast, responsive, rear-wheel drive
 */
export const SPORTS_CAR_PRESET: VehiclePreset = {
    name: 'Sports Car',
    description: 'Fast sports car with rear-wheel drive and tight handling',
    config: {
        ...createDefaultVehicleConfig(),
        chassisMass: 1200,
        chassisSize: [1.9, 0.5, 4.5],
        wheelRadius: 0.34,
        wheelWidth: 0.28,
        wheelPositions: [
            [-0.85, -0.15, 1.4],
            [0.85, -0.15, 1.4],
            [-0.85, -0.15, -1.3],
            [0.85, -0.15, -1.3],
        ],
        suspensionRestLength: 0.2,
        suspensionStiffness: 45,
        suspensionDamping: 5.5,
        suspensionTravel: 0.15,
        maxSteerAngle: Math.PI / 5.5,
        driveWheels: 'rear',
        motorForce: 12000,
        brakeForce: 6000,
        frictionSlip: 2.2,
        rollInfluence: 0.08,
        antiRoll: 0.7,
        centerOfMassOffset: [0, -0.2, -0.2],
    },
};

/**
 * All vehicle presets
 */
export const vehiclePresets: Record<string, VehiclePreset> = {
    car: CAR_VEHICLE_PRESET,
    truck: TRUCK_VEHICLE_PRESET,
    motorcycle: MOTORCYCLE_VEHICLE_PRESET,
    sportsCar: SPORTS_CAR_PRESET,
};

/**
 * Ice material - very slippery
 */
export const ICE_MATERIAL_PRESET: MaterialPreset = {
    name: 'Ice',
    description: 'Very slippery ice surface',
    material: {
        friction: 0.05,
        restitution: 0.1,
        frictionCombine: 'min',
        restitutionCombine: 'average',
        density: 917,
    },
};

/**
 * Rubber material - high friction, bouncy
 */
export const RUBBER_MATERIAL_PRESET: MaterialPreset = {
    name: 'Rubber',
    description: 'High friction rubber with bounce',
    material: {
        friction: 1.0,
        restitution: 0.8,
        frictionCombine: 'max',
        restitutionCombine: 'max',
        density: 1100,
    },
};

/**
 * Metal material - medium friction, slight bounce
 */
export const METAL_MATERIAL_PRESET: MaterialPreset = {
    name: 'Metal',
    description: 'Standard metal surface',
    material: {
        friction: 0.4,
        restitution: 0.3,
        frictionCombine: 'average',
        restitutionCombine: 'average',
        density: 7800,
    },
};

/**
 * Wood material - moderate friction, no bounce
 */
export const WOOD_MATERIAL_PRESET: MaterialPreset = {
    name: 'Wood',
    description: 'Wooden surface with moderate grip',
    material: {
        friction: 0.5,
        restitution: 0.2,
        frictionCombine: 'average',
        restitutionCombine: 'min',
        density: 700,
    },
};

/**
 * Concrete material - high friction, no bounce
 */
export const CONCRETE_MATERIAL_PRESET: MaterialPreset = {
    name: 'Concrete',
    description: 'Rough concrete surface',
    material: {
        friction: 0.8,
        restitution: 0.1,
        frictionCombine: 'average',
        restitutionCombine: 'min',
        density: 2400,
    },
};

/**
 * Bouncy material - super bouncy
 */
export const BOUNCY_MATERIAL_PRESET: MaterialPreset = {
    name: 'Bouncy',
    description: 'Super bouncy material like a trampoline',
    material: {
        friction: 0.3,
        restitution: 0.95,
        frictionCombine: 'average',
        restitutionCombine: 'max',
        density: 500,
    },
};

/**
 * Mud material - very high friction, sticky
 */
export const MUD_MATERIAL_PRESET: MaterialPreset = {
    name: 'Mud',
    description: 'Sticky mud that slows movement',
    material: {
        friction: 1.5,
        restitution: 0.0,
        frictionCombine: 'max',
        restitutionCombine: 'min',
        density: 1800,
    },
};

/**
 * All material presets
 */
export const materialPresets: Record<string, MaterialPreset> = {
    ice: ICE_MATERIAL_PRESET,
    rubber: RUBBER_MATERIAL_PRESET,
    metal: METAL_MATERIAL_PRESET,
    wood: WOOD_MATERIAL_PRESET,
    concrete: CONCRETE_MATERIAL_PRESET,
    bouncy: BOUNCY_MATERIAL_PRESET,
    mud: MUD_MATERIAL_PRESET,
};

/**
 * Wooden crate destructible preset
 */
export const WOODEN_CRATE_PRESET: DestructiblePreset = {
    name: 'Wooden Crate',
    description: 'Breakable wooden crate that shatters easily',
    config: {
        ...createDefaultDestructibleConfig(),
        health: 30,
        breakForce: 20,
        shardCount: 10,
        shardScale: [0.25, 0.15, 0.2],
        explosionForce: 4,
        explosionRadius: 1.5,
        shardLifetime: 4,
        shardMass: 0.3,
        shardAngularVelocity: [8, 8, 8],
    },
};

/**
 * Glass destructible preset
 */
export const GLASS_PRESET: DestructiblePreset = {
    name: 'Glass',
    description: 'Fragile glass that shatters into many pieces',
    config: {
        ...createDefaultDestructibleConfig(),
        health: 10,
        breakForce: 5,
        shardCount: 20,
        shardScale: [0.1, 0.1, 0.02],
        explosionForce: 2,
        explosionRadius: 1,
        shardLifetime: 3,
        shardMass: 0.1,
        shardAngularVelocity: [15, 15, 15],
    },
};

/**
 * Stone destructible preset
 */
export const STONE_PRESET: DestructiblePreset = {
    name: 'Stone',
    description: 'Heavy stone that breaks into large chunks',
    config: {
        ...createDefaultDestructibleConfig(),
        health: 150,
        breakForce: 100,
        shardCount: 6,
        shardScale: [0.4, 0.4, 0.4],
        explosionForce: 3,
        explosionRadius: 2,
        shardLifetime: 8,
        shardMass: 5,
        shardAngularVelocity: [2, 2, 2],
    },
};

/**
 * All destructible presets
 */
export const destructiblePresets: Record<string, DestructiblePreset> = {
    woodenCrate: WOODEN_CRATE_PRESET,
    glass: GLASS_PRESET,
    stone: STONE_PRESET,
};

/**
 * Light buoyancy preset - cork-like floating
 */
export const LIGHT_BUOYANCY_PRESET: BuoyancyPreset = {
    name: 'Light',
    description: 'Light object that floats high in water like cork',
    config: {
        ...createDefaultBuoyancyConfig(),
        buoyancyForce: 25,
        waterDrag: 2,
        waterAngularDrag: 1.5,
    },
};

/**
 * Medium buoyancy preset - standard wood
 */
export const MEDIUM_BUOYANCY_PRESET: BuoyancyPreset = {
    name: 'Medium',
    description: 'Medium density object that floats partially submerged',
    config: {
        ...createDefaultBuoyancyConfig(),
        buoyancyForce: 12,
        waterDrag: 4,
        waterAngularDrag: 3,
    },
};

/**
 * Heavy buoyancy preset - barely floating
 */
export const HEAVY_BUOYANCY_PRESET: BuoyancyPreset = {
    name: 'Heavy',
    description: 'Heavy object that barely floats',
    config: {
        ...createDefaultBuoyancyConfig(),
        buoyancyForce: 6,
        waterDrag: 6,
        waterAngularDrag: 5,
    },
};

/**
 * Boat buoyancy preset - optimized for vessels
 */
export const BOAT_BUOYANCY_PRESET: BuoyancyPreset = {
    name: 'Boat',
    description: 'Stable boat-like buoyancy',
    config: {
        ...createDefaultBuoyancyConfig(),
        buoyancyForce: 20,
        waterDrag: 3,
        waterAngularDrag: 4,
        samplePointCount: 12,
    },
};

/**
 * All buoyancy presets
 */
export const buoyancyPresets: Record<string, BuoyancyPreset> = {
    light: LIGHT_BUOYANCY_PRESET,
    medium: MEDIUM_BUOYANCY_PRESET,
    heavy: HEAVY_BUOYANCY_PRESET,
    boat: BOAT_BUOYANCY_PRESET,
};

/**
 * Get a character preset by name
 */
export function getCharacterPreset(name: keyof typeof characterPresets): CharacterPreset {
    return characterPresets[name];
}

/**
 * Get a vehicle preset by name
 */
export function getVehiclePreset(name: keyof typeof vehiclePresets): VehiclePreset {
    return vehiclePresets[name];
}

/**
 * Get a material preset by name
 */
export function getMaterialPreset(name: keyof typeof materialPresets): MaterialPreset {
    return materialPresets[name];
}

/**
 * Get a destructible preset by name
 */
export function getDestructiblePreset(name: keyof typeof destructiblePresets): DestructiblePreset {
    return destructiblePresets[name];
}

/**
 * Get a buoyancy preset by name
 */
export function getBuoyancyPreset(name: keyof typeof buoyancyPresets): BuoyancyPreset {
    return buoyancyPresets[name];
}
