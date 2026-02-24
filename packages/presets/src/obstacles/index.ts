/**
 * Obstacle Template
 *
 * What are the knobs for ANY obstacle?
 * Forms: rock, log, crate, barrel, fence, wall, pit, spike, etc.
 */

// ============================================
// ALL THE KNOBS
// ============================================

export interface ObstacleParams {
  // --- SIZE & SHAPE ---
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Depth */
  depth: number;
  /** Base shape */
  shape: 'box' | 'cylinder' | 'sphere' | 'cone' | 'irregular' | 'flat';
  /** Roundness of edges */
  rounding: number;
  /** Taper (0 = straight, positive = narrower at top) */
  taper: number;

  // --- SURFACE ---
  /** Surface material */
  material:
    | 'wood'
    | 'stone'
    | 'metal'
    | 'ice'
    | 'crystal'
    | 'organic'
    | 'water'
    | 'fire'
    | 'energy';
  /** Surface roughness */
  roughness: number;
  /** Bumpiness/displacement */
  bumpiness: number;
  /** Moss/growth coverage */
  mossCoverage: number;
  /** Cracks/damage */
  crackLevel: number;
  /** Wetness */
  wetness: number;

  // --- BEHAVIOR ---
  /** Is it solid/blocking */
  solid: boolean;
  /** Can be destroyed */
  destructible: boolean;
  /** Health if destructible */
  health: number;
  /** Deals damage on contact */
  damaging: boolean;
  /** Damage amount */
  damageAmount: number;
  /** Slows player on contact */
  slowing: boolean;
  /** Slow factor (1 = no slow) */
  slowFactor: number;
  /** Bouncy */
  bouncy: boolean;
  /** Bounce strength */
  bounceStrength: number;

  // --- MOVEMENT ---
  /** Moving obstacle */
  moving: boolean;
  /** Movement pattern */
  movementPattern: 'none' | 'horizontal' | 'vertical' | 'circular' | 'random';
  /** Movement distance */
  movementDistance: number;
  /** Movement speed */
  movementSpeed: number;
  /** Rotating */
  rotating: boolean;
  /** Rotation speed */
  rotationSpeed: number;
  /** Rotation axis */
  rotationAxis: 'x' | 'y' | 'z';

  // --- EFFECTS ---
  /** Particle effect */
  particles: 'none' | 'dust' | 'sparks' | 'bubbles' | 'fire' | 'ice' | 'energy';
  /** Sound on hit */
  hitSound: 'none' | 'thud' | 'clang' | 'splash' | 'crack' | 'shatter';
  /** Glowing */
  glow: number;
  /** Shadow intensity */
  shadowIntensity: number;
}

// ============================================
// DEFAULTS
// ============================================

export const OBSTACLE_DEFAULTS: ObstacleParams = {
  width: 1,
  height: 1,
  depth: 1,
  shape: 'box',
  rounding: 0,
  taper: 0,

  material: 'stone',
  roughness: 0.7,
  bumpiness: 0,
  mossCoverage: 0,
  crackLevel: 0,
  wetness: 0,

  solid: true,
  destructible: false,
  health: 100,
  damaging: false,
  damageAmount: 10,
  slowing: false,
  slowFactor: 0.5,
  bouncy: false,
  bounceStrength: 1,

  moving: false,
  movementPattern: 'none',
  movementDistance: 2,
  movementSpeed: 1,
  rotating: false,
  rotationSpeed: 1,
  rotationAxis: 'y',

  particles: 'none',
  hitSound: 'thud',
  glow: 0,
  shadowIntensity: 1,
};

// ============================================
// FORMS
// ============================================

export type ObstacleForm =
  | 'rock'
  | 'boulder'
  | 'log'
  | 'stump'
  | 'crate'
  | 'barrel'
  | 'fence'
  | 'wall'
  | 'pillar'
  | 'pit'
  | 'spike'
  | 'icicle'
  | 'crystal'
  | 'bush'
  | 'tree'
  | 'fire_pit'
  | 'water_pool'
  | 'mud_puddle'
  | 'ice_patch'
  | 'whirlpool'
  | 'energy_field';

export const OBSTACLE_FORMS: Record<ObstacleForm, Partial<ObstacleParams>> = {
  rock: {
    shape: 'irregular',
    width: 1.2,
    height: 0.8,
    depth: 1,
    rounding: 0.3,
    bumpiness: 0.3,
    hitSound: 'thud',
  },

  boulder: {
    shape: 'sphere',
    width: 2,
    height: 2,
    depth: 2,
    rounding: 0.8,
    bumpiness: 0.2,
    hitSound: 'thud',
  },

  log: {
    shape: 'cylinder',
    width: 0.5,
    height: 0.5,
    depth: 3,
    material: 'wood',
    roughness: 0.8,
    rounding: 0.9,
  },

  stump: {
    shape: 'cylinder',
    width: 0.8,
    height: 0.6,
    depth: 0.8,
    material: 'wood',
    roughness: 0.9,
    crackLevel: 0.3,
  },

  crate: {
    shape: 'box',
    width: 1,
    height: 1,
    depth: 1,
    material: 'wood',
    destructible: true,
    health: 30,
    hitSound: 'crack',
  },

  barrel: {
    shape: 'cylinder',
    width: 0.7,
    height: 1,
    depth: 0.7,
    taper: -0.1,
    material: 'wood',
    destructible: true,
    health: 40,
  },

  fence: {
    shape: 'box',
    width: 3,
    height: 1,
    depth: 0.1,
    material: 'wood',
    destructible: true,
    health: 20,
  },

  wall: {
    shape: 'box',
    width: 3,
    height: 2,
    depth: 0.3,
    material: 'stone',
    bumpiness: 0.1,
  },

  pillar: {
    shape: 'cylinder',
    width: 0.5,
    height: 3,
    depth: 0.5,
    material: 'stone',
    taper: 0.05,
  },

  pit: {
    shape: 'flat',
    width: 2,
    height: -1,
    depth: 2,
    solid: false,
    damaging: true,
    damageAmount: 50,
    shadowIntensity: 2,
  },

  spike: {
    shape: 'cone',
    width: 0.3,
    height: 0.8,
    depth: 0.3,
    taper: 0.9,
    material: 'metal',
    damaging: true,
    damageAmount: 25,
    hitSound: 'clang',
  },

  icicle: {
    shape: 'cone',
    width: 0.2,
    height: 1.2,
    depth: 0.2,
    taper: 0.95,
    material: 'ice',
    roughness: 0.1,
    glow: 0.1,
    destructible: true,
    health: 15,
    damaging: true,
    damageAmount: 20,
    hitSound: 'shatter',
  },

  crystal: {
    shape: 'cone',
    width: 0.4,
    height: 1.5,
    depth: 0.4,
    taper: 0.7,
    material: 'crystal',
    roughness: 0.1,
    glow: 0.4,
    particles: 'energy',
  },

  bush: {
    shape: 'sphere',
    width: 1.2,
    height: 0.8,
    depth: 1.2,
    material: 'organic',
    solid: false,
    slowing: true,
    slowFactor: 0.7,
  },

  tree: {
    shape: 'cylinder',
    width: 0.6,
    height: 4,
    depth: 0.6,
    material: 'wood',
    roughness: 0.9,
  },

  fire_pit: {
    shape: 'flat',
    width: 1.5,
    height: 0.3,
    depth: 1.5,
    material: 'fire',
    damaging: true,
    damageAmount: 15,
    particles: 'fire',
    glow: 0.8,
  },

  water_pool: {
    shape: 'flat',
    width: 2,
    height: 0.1,
    depth: 2,
    material: 'water',
    solid: false,
    slowing: true,
    slowFactor: 0.6,
    particles: 'bubbles',
    hitSound: 'splash',
  },

  mud_puddle: {
    shape: 'flat',
    width: 2,
    height: 0.05,
    depth: 2,
    material: 'organic',
    solid: false,
    slowing: true,
    slowFactor: 0.4,
    wetness: 1,
  },

  ice_patch: {
    shape: 'flat',
    width: 2,
    height: 0.02,
    depth: 2,
    material: 'ice',
    solid: false,
    slowing: false,
    bouncy: true,
    bounceStrength: 0.2,
    roughness: 0.05,
  },

  whirlpool: {
    shape: 'flat',
    width: 2.5,
    height: -0.5,
    depth: 2.5,
    material: 'water',
    solid: false,
    rotating: true,
    rotationSpeed: 2,
    damaging: true,
    damageAmount: 5,
    particles: 'bubbles',
  },

  energy_field: {
    shape: 'box',
    width: 2,
    height: 2,
    depth: 0.2,
    material: 'energy',
    solid: true,
    damaging: true,
    damageAmount: 30,
    glow: 1,
    particles: 'energy',
  },
};

// ============================================
// HAZARD LEVELS
// ============================================

export type HazardLevel = 'harmless' | 'minor' | 'moderate' | 'severe' | 'deadly';

export const HAZARD_MODIFIERS: Record<HazardLevel, Partial<ObstacleParams>> = {
  harmless: {
    damaging: false,
    damageAmount: 0,
  },
  minor: {
    damaging: true,
    damageAmount: 10,
  },
  moderate: {
    damaging: true,
    damageAmount: 25,
  },
  severe: {
    damaging: true,
    damageAmount: 50,
  },
  deadly: {
    damaging: true,
    damageAmount: 100,
  },
};

// ============================================
// FACTORY
// ============================================

export function createObstacle(
  form: ObstacleForm,
  hazardLevel?: HazardLevel,
  customizations?: Partial<ObstacleParams>
): ObstacleParams {
  let params = {
    ...OBSTACLE_DEFAULTS,
    ...OBSTACLE_FORMS[form],
  };

  if (hazardLevel) {
    params = { ...params, ...HAZARD_MODIFIERS[hazardLevel] };
  }

  if (customizations) {
    params = { ...params, ...customizations };
  }

  return params;
}
