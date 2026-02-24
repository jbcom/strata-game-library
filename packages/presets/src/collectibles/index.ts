/**
 * Collectible Template
 *
 * What are the knobs for ANY collectible item?
 * Forms: coin, gem, orb, star, heart, key, potion, etc.
 */

// ============================================
// ALL THE KNOBS
// ============================================

export interface CollectibleParams {
  // --- SHAPE ---
  /** Base shape */
  shape: 'circle' | 'sphere' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'custom';
  /** Overall size */
  size: number;
  /** Height/thickness */
  thickness: number;
  /** Points (for star shape) */
  points: number;
  /** Corner rounding (0 = sharp, 1 = fully round) */
  rounding: number;

  // --- SURFACE ---
  /** Faceted like a gem */
  faceted: boolean;
  /** Number of facets */
  facetCount: number;
  /** Beveled edge */
  bevelSize: number;
  /** Inner cutout (like a ring) */
  hollowCenter: boolean;
  /** Hollow size ratio */
  hollowRatio: number;

  // --- DECORATION ---
  /** Emblem/symbol on face */
  hasEmblem: boolean;
  /** Emblem type */
  emblemType: 'none' | 'star' | 'skull' | 'crown' | 'lightning' | 'heart' | 'custom';
  /** Border/rim */
  hasBorder: boolean;
  /** Border thickness */
  borderThickness: number;
  /** Notches around edge */
  notchCount: number;

  // --- MATERIAL ---
  /** Material type */
  materialType: 'metal' | 'gem' | 'glass' | 'plastic' | 'organic' | 'energy';
  /** Roughness */
  roughness: number;
  /** Metalness */
  metalness: number;
  /** Transparency (0 = opaque, 1 = transparent) */
  transparency: number;
  /** Emissive/glow strength */
  glow: number;

  // --- ANIMATION ---
  /** Rotation speed */
  rotationSpeed: number;
  /** Bobbing amplitude */
  bobAmount: number;
  /** Bobbing speed */
  bobSpeed: number;
  /** Pulse/scale animation */
  pulseAmount: number;
  /** Sparkle particles */
  sparkles: boolean;
  /** Trail effect */
  hasTrail: boolean;
}

// ============================================
// DEFAULTS
// ============================================

export const COLLECTIBLE_DEFAULTS: CollectibleParams = {
  shape: 'circle',
  size: 1,
  thickness: 0.2,
  points: 5,
  rounding: 0.1,

  faceted: false,
  facetCount: 8,
  bevelSize: 0.05,
  hollowCenter: false,
  hollowRatio: 0.3,

  hasEmblem: false,
  emblemType: 'none',
  hasBorder: false,
  borderThickness: 0.05,
  notchCount: 0,

  materialType: 'metal',
  roughness: 0.3,
  metalness: 0.8,
  transparency: 0,
  glow: 0,

  rotationSpeed: 1,
  bobAmount: 0.1,
  bobSpeed: 1,
  pulseAmount: 0,
  sparkles: false,
  hasTrail: false,
};

// ============================================
// FORMS
// ============================================

export type CollectibleForm =
  | 'coin'
  | 'gem'
  | 'crystal'
  | 'orb'
  | 'star'
  | 'heart'
  | 'key'
  | 'ring'
  | 'potion'
  | 'scroll'
  | 'rune'
  | 'shard'
  | 'feather'
  | 'shell'
  | 'pearl'
  | 'acorn'
  | 'fish';

export const COLLECTIBLE_FORMS: Record<CollectibleForm, Partial<CollectibleParams>> = {
  coin: {
    shape: 'circle',
    thickness: 0.15,
    hasBorder: true,
    borderThickness: 0.08,
    hasEmblem: true,
    emblemType: 'star',
    notchCount: 0,
    materialType: 'metal',
    metalness: 0.9,
    roughness: 0.2,
  },

  gem: {
    shape: 'diamond',
    thickness: 0.8,
    faceted: true,
    facetCount: 12,
    materialType: 'gem',
    metalness: 0.1,
    roughness: 0.1,
    transparency: 0.3,
    glow: 0.2,
    sparkles: true,
  },

  crystal: {
    shape: 'hexagon',
    thickness: 1.5,
    faceted: true,
    facetCount: 6,
    rounding: 0,
    materialType: 'gem',
    transparency: 0.5,
    glow: 0.3,
    sparkles: true,
  },

  orb: {
    shape: 'sphere',
    thickness: 1,
    materialType: 'glass',
    transparency: 0.4,
    glow: 0.5,
    roughness: 0.05,
    pulseAmount: 0.1,
    sparkles: true,
    hasTrail: true,
  },

  star: {
    shape: 'star',
    points: 5,
    thickness: 0.3,
    materialType: 'metal',
    metalness: 0.9,
    glow: 0.3,
    rotationSpeed: 2,
    sparkles: true,
  },

  heart: {
    shape: 'heart',
    thickness: 0.4,
    rounding: 0.3,
    materialType: 'gem',
    transparency: 0.2,
    glow: 0.4,
    pulseAmount: 0.15,
  },

  key: {
    shape: 'custom',
    thickness: 0.2,
    materialType: 'metal',
    metalness: 0.95,
    roughness: 0.3,
    rotationSpeed: 0.5,
    bobAmount: 0.05,
  },

  ring: {
    shape: 'circle',
    thickness: 0.3,
    hollowCenter: true,
    hollowRatio: 0.6,
    materialType: 'metal',
    metalness: 0.95,
    roughness: 0.15,
    glow: 0.1,
  },

  potion: {
    shape: 'custom',
    materialType: 'glass',
    transparency: 0.6,
    glow: 0.3,
    bobAmount: 0.08,
    bobSpeed: 0.8,
  },

  scroll: {
    shape: 'custom',
    materialType: 'organic',
    roughness: 0.8,
    metalness: 0,
    rotationSpeed: 0,
    bobAmount: 0.05,
  },

  rune: {
    shape: 'hexagon',
    thickness: 0.15,
    hasEmblem: true,
    emblemType: 'custom',
    materialType: 'metal',
    glow: 0.5,
    pulseAmount: 0.08,
  },

  shard: {
    shape: 'diamond',
    thickness: 0.5,
    rounding: 0,
    faceted: true,
    facetCount: 4,
    materialType: 'gem',
    transparency: 0.4,
    glow: 0.4,
    sparkles: true,
  },

  feather: {
    shape: 'custom',
    materialType: 'organic',
    roughness: 0.6,
    rotationSpeed: 0.3,
    bobAmount: 0.15,
    bobSpeed: 0.5,
  },

  shell: {
    shape: 'custom',
    materialType: 'organic',
    roughness: 0.4,
    metalness: 0.2,
    rotationSpeed: 0.5,
  },

  pearl: {
    shape: 'sphere',
    size: 0.6,
    materialType: 'organic',
    roughness: 0.2,
    metalness: 0.3,
    glow: 0.1,
  },

  acorn: {
    shape: 'custom',
    materialType: 'organic',
    roughness: 0.7,
    rotationSpeed: 0.3,
    bobAmount: 0.05,
  },

  fish: {
    shape: 'custom',
    materialType: 'organic',
    roughness: 0.3,
    metalness: 0.1,
    bobAmount: 0.12,
    bobSpeed: 1.5,
    rotationSpeed: 0,
  },
};

// ============================================
// RARITY TIERS
// ============================================

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_MODIFIERS: Record<RarityTier, Partial<CollectibleParams>> = {
  common: {
    glow: 0,
    sparkles: false,
    pulseAmount: 0,
  },
  uncommon: {
    glow: 0.1,
    sparkles: false,
    pulseAmount: 0.02,
  },
  rare: {
    glow: 0.3,
    sparkles: true,
    pulseAmount: 0.05,
  },
  epic: {
    glow: 0.5,
    sparkles: true,
    pulseAmount: 0.08,
    hasTrail: true,
  },
  legendary: {
    glow: 0.8,
    sparkles: true,
    pulseAmount: 0.12,
    hasTrail: true,
    rotationSpeed: 1.5,
  },
};

// ============================================
// FACTORY
// ============================================

export function createCollectible(
  form: CollectibleForm,
  rarity?: RarityTier,
  customizations?: Partial<CollectibleParams>
): CollectibleParams {
  let params = {
    ...COLLECTIBLE_DEFAULTS,
    ...COLLECTIBLE_FORMS[form],
  };

  if (rarity) {
    params = { ...params, ...RARITY_MODIFIERS[rarity] };
  }

  if (customizations) {
    params = { ...params, ...customizations };
  }

  return params;
}
