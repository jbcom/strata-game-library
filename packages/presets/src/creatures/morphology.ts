/**
 * Detailed Morphology Parameters
 *
 * Even more granular control for character artists and procedural generation.
 * These are the "deep" knobs for fine-tuning creature appearance.
 */

import type { QuadrupedParams } from './quadruped';

/**
 * Detailed eye parameters
 */
export interface EyeMorphology {
  /** Overall size */
  size?: number;
  /** Horizontal position on head (0 = center, 1 = side) */
  position?: number;
  /** Vertical position (0 = low, 1 = high) */
  height?: number;
  /** Distance between eyes */
  spacing?: number;
  /** Pupil shape (0 = round, 1 = vertical slit, -1 = horizontal slit) */
  pupilShape?: number;
  /** Pupil size relative to iris */
  pupilSize?: number;
  /** Iris color */
  irisColor?: string;
  /** Sclera (white) visibility */
  scleraVisible?: number;
  /** Eyelid droop (0 = alert, 1 = sleepy) */
  eyelidDroop?: number;
  /** Brow ridge prominence */
  browRidge?: number;
}

/**
 * Detailed ear parameters
 */
export interface EarMorphology {
  /** Overall size */
  size?: number;
  /** Length (tip to base) */
  length?: number;
  /** Width at base */
  width?: number;
  /** Position height on head */
  position?: number;
  /** Angle from vertical (0 = up, 90 = horizontal) */
  angle?: number;
  /** Roundness of tip (0 = pointed, 1 = round) */
  tipRoundness?: number;
  /** Fold/crease presence */
  fold?: number;
  /** Flop/droop */
  flop?: number;
  /** Inner ear visibility */
  innerVisible?: number;
  /** Fur tufts at tips */
  tufts?: number;
}

/**
 * Detailed snout/muzzle parameters
 */
export interface SnoutMorphology {
  /** Overall length */
  length?: number;
  /** Width at base */
  baseWidth?: number;
  /** Width at tip */
  tipWidth?: number;
  /** Height/depth */
  height?: number;
  /** Bridge curvature (0 = straight, + = convex, - = concave) */
  bridgeCurve?: number;
  /** Nose size */
  noseSize?: number;
  /** Nose shape (0 = round, 1 = triangular) */
  noseShape?: number;
  /** Nose color */
  noseColor?: string;
  /** Nostril visibility */
  nostrilSize?: number;
  /** Lip thickness */
  lipThickness?: number;
  /** Jowl/cheek fullness */
  jowlSize?: number;
}

/**
 * Detailed whisker parameters
 */
export interface WhiskerMorphology {
  /** Are whiskers present */
  present?: boolean;
  /** Length */
  length?: number;
  /** Thickness */
  thickness?: number;
  /** Count per side */
  count?: number;
  /** Spread angle */
  spread?: number;
  /** Droop (0 = straight, 1 = droopy) */
  droop?: number;
  /** Color */
  color?: string;
}

/**
 * Detailed paw/foot parameters
 */
export interface PawMorphology {
  /** Overall size */
  size?: number;
  /** Width relative to length */
  width?: number;
  /** Toe count */
  toeCount?: number;
  /** Toe spread */
  toeSpread?: number;
  /** Webbing between toes (0 = none, 1 = full) */
  webbing?: number;
  /** Pad size */
  padSize?: number;
  /** Pad color */
  padColor?: string;
  /** Claw length */
  clawLength?: number;
  /** Claw curvature */
  clawCurve?: number;
  /** Claw color */
  clawColor?: string;
  /** Fur between toes */
  toeFur?: number;
}

/**
 * Detailed tail parameters
 */
export interface TailMorphology {
  /** Is tail present */
  present?: boolean;
  /** Length */
  length?: number;
  /** Base thickness */
  baseThickness?: number;
  /** Tip thickness (as ratio of base) */
  tipThickness?: number;
  /** Curvature (0 = straight, + = curves up, - = curves down) */
  curve?: number;
  /** Fluffiness */
  fluff?: number;
  /** Fur length on tail vs body */
  furLength?: number;
  /** Has distinct tip (like lion) */
  hasTuft?: boolean;
  /** Ringed pattern (like raccoon) */
  rings?: number;
}

/**
 * Detailed fur/coat parameters
 */
export interface CoatMorphology {
  /** Base fur length */
  length?: number;
  /** Fur density */
  density?: number;
  /** Softness (affects how light interacts) */
  softness?: number;
  /** Guard hair length (longer outer hairs) */
  guardHairLength?: number;
  /** Undercoat density */
  undercoatDensity?: number;
  /** Mane presence (0 = none, 1 = full) */
  mane?: number;
  /** Mane length */
  maneLength?: number;
  /** Ruff/neck fur */
  ruff?: number;
  /** Belly fur length (vs body) */
  bellyFur?: number;
  /** Ear tufts */
  earTufts?: number;
  /** Cheek fluff */
  cheekFluff?: number;
  /** Wetness appearance */
  wetness?: number;
}

/**
 * Full detailed morphology
 */
export interface DetailedMorphology {
  eyes: EyeMorphology;
  ears: EarMorphology;
  snout: SnoutMorphology;
  whiskers: WhiskerMorphology;
  paws: PawMorphology;
  tail: TailMorphology;
  coat: CoatMorphology;
}

/**
 * Default detailed morphology
 */
export const MORPHOLOGY_DEFAULTS: DetailedMorphology = {
  eyes: {
    size: 1,
    position: 0.3,
    height: 0.5,
    spacing: 1,
    pupilShape: 0,
    pupilSize: 0.5,
    irisColor: '#4A3728',
    scleraVisible: 0.1,
    eyelidDroop: 0,
    browRidge: 0.3,
  },
  ears: {
    size: 1,
    length: 1,
    width: 1,
    position: 0.7,
    angle: 30,
    tipRoundness: 0.5,
    fold: 0,
    flop: 0,
    innerVisible: 0.5,
    tufts: 0,
  },
  snout: {
    length: 1,
    baseWidth: 1,
    tipWidth: 0.7,
    height: 0.8,
    bridgeCurve: 0,
    noseSize: 1,
    noseShape: 0.5,
    noseColor: '#1A1A1A',
    nostrilSize: 0.5,
    lipThickness: 0.3,
    jowlSize: 0.5,
  },
  whiskers: {
    present: true,
    length: 1,
    thickness: 0.5,
    count: 4,
    spread: 45,
    droop: 0.1,
    color: '#FFFFFF',
  },
  paws: {
    size: 1,
    width: 1,
    toeCount: 4,
    toeSpread: 0.3,
    webbing: 0,
    padSize: 0.8,
    padColor: '#2C2C2C',
    clawLength: 0.5,
    clawCurve: 0.3,
    clawColor: '#1A1A1A',
    toeFur: 0.3,
  },
  tail: {
    present: true,
    length: 1,
    baseThickness: 1,
    tipThickness: 0.5,
    curve: 0,
    fluff: 0.5,
    furLength: 1,
    hasTuft: false,
    rings: 0,
  },
  coat: {
    length: 1,
    density: 1,
    softness: 0.7,
    guardHairLength: 1.2,
    undercoatDensity: 0.8,
    mane: 0,
    maneLength: 1,
    ruff: 0,
    bellyFur: 0.9,
    earTufts: 0,
    cheekFluff: 0.3,
    wetness: 0,
  },
};

/**
 * Species-specific morphology presets
 */
export const SPECIES_MORPHOLOGY: Record<string, Partial<DetailedMorphology>> = {
  otter: {
    ears: { size: 0.7, tipRoundness: 0.8, position: 0.6 },
    snout: { length: 0.8, tipWidth: 0.8, noseSize: 0.9 },
    whiskers: { length: 0.7, count: 5 },
    paws: { webbing: 0.7, toeSpread: 0.5 },
    tail: { length: 0.9, baseThickness: 1.2, fluff: 0.2, curve: -0.1 },
    coat: { length: 0.8, density: 1.2, softness: 0.9, wetness: 0 },
  },
  fox: {
    ears: { size: 1.4, tipRoundness: 0.1, position: 0.85, tufts: 0.3 },
    snout: { length: 1.4, tipWidth: 0.5, bridgeCurve: 0.1 },
    whiskers: { length: 0.6, count: 4 },
    tail: { length: 1.3, fluff: 1, furLength: 1.3 },
    coat: { length: 1.1, ruff: 0.5, cheekFluff: 0.6 },
  },
  cat: {
    eyes: { size: 1.2, pupilShape: 0.8, scleraVisible: 0 },
    ears: { size: 1.2, tipRoundness: 0.2, position: 0.85, tufts: 0.2 },
    snout: { length: 0.6, jowlSize: 0.3 },
    whiskers: { length: 1.2, spread: 60, count: 6 },
    paws: { clawLength: 0.7, clawCurve: 0.5 },
    tail: { length: 1.1, curve: 0.2, fluff: 0.4 },
  },
  dog: {
    ears: { size: 1.1, flop: 0.3, tipRoundness: 0.4 },
    snout: { length: 1.2, jowlSize: 0.6, lipThickness: 0.5 },
    whiskers: { present: true, length: 0.3 },
    paws: { size: 1.1, padSize: 1 },
    tail: { curve: 0.3, fluff: 0.6 },
  },
  wolf: {
    ears: { size: 1.2, tipRoundness: 0.2, position: 0.8 },
    snout: { length: 1.3, baseWidth: 1.1, jowlSize: 0.7 },
    paws: { size: 1.1, toeSpread: 0.4 },
    tail: { length: 1.1, fluff: 0.8 },
    coat: { length: 1.3, ruff: 0.7, mane: 0.3 },
  },
  bear: {
    ears: { size: 0.6, tipRoundness: 0.9, position: 0.6 },
    snout: { length: 1.1, baseWidth: 1.2, noseSize: 1.3 },
    whiskers: { present: false },
    paws: { size: 1.3, clawLength: 1, padSize: 1.2 },
    tail: { length: 0.2, fluff: 0.5 },
    coat: { length: 1.3, density: 1.2 },
  },
  horse: {
    eyes: { size: 1, position: 0.6, scleraVisible: 0.3 },
    ears: { size: 0.9, tipRoundness: 0.2, position: 0.9 },
    snout: { length: 1.6, tipWidth: 1.2, noseSize: 1.4, nostrilSize: 0.8 },
    whiskers: { present: false },
    paws: { toeCount: 1, clawLength: 0 },
    tail: { length: 1.4, fluff: 1, furLength: 2 },
    coat: { length: 0.3, mane: 1, maneLength: 1.5 },
  },
};

/**
 * Create detailed morphology from species
 */
export function createMorphology(
  species?: keyof typeof SPECIES_MORPHOLOGY,
  overrides?: Partial<DetailedMorphology>
): DetailedMorphology {
  const morph = JSON.parse(JSON.stringify(MORPHOLOGY_DEFAULTS)) as DetailedMorphology;

  if (species && SPECIES_MORPHOLOGY[species]) {
    const speciesOverrides = SPECIES_MORPHOLOGY[species];
    for (const key in speciesOverrides) {
      const k = key as keyof DetailedMorphology;
      (morph as any)[k] = { ...morph[k], ...speciesOverrides[k] };
    }
  }

  if (overrides) {
    for (const key in overrides) {
      const k = key as keyof DetailedMorphology;
      (morph as any)[k] = { ...morph[k], ...overrides[k] };
    }
  }

  return morph;
}

/**
 * Convert simplified QuadrupedParams to detailed morphology
 */
export function quadrupedToMorphology(params: QuadrupedParams): DetailedMorphology {
  return {
    eyes: {
      ...MORPHOLOGY_DEFAULTS.eyes,
      size: params.eyeSize,
      position: params.eyePosition,
      pupilShape: params.pupilShape,
    },
    ears: {
      ...MORPHOLOGY_DEFAULTS.ears,
      size: params.earSize,
      tipRoundness: params.earRoundness,
      flop: params.earDroop,
      position: params.earPosition,
    },
    snout: {
      ...MORPHOLOGY_DEFAULTS.snout,
      length: params.snoutLength,
      baseWidth: params.snoutWidth,
    },
    whiskers: {
      ...MORPHOLOGY_DEFAULTS.whiskers,
      length: params.whiskerLength,
      present: params.whiskerLength > 0,
    },
    paws: {
      ...MORPHOLOGY_DEFAULTS.paws,
      size: params.pawSize,
      webbing: params.webbing,
      clawLength: params.clawLength,
    },
    tail: {
      ...MORPHOLOGY_DEFAULTS.tail,
      present: params.hasTail,
      length: params.tailLength,
      baseThickness: params.tailThickness,
      fluff: params.tailFluff,
    },
    coat: {
      ...MORPHOLOGY_DEFAULTS.coat,
      length: params.furLength,
      density: params.furDensity,
      mane: params.mane,
    },
  };
}
