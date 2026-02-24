/**
 * Four-Legged Creature Template
 *
 * ONE template with ALL the knobs.
 * FORMS are suggested starting points (otter, horse, cow, etc.)
 * Everything is customizable from any form.
 *
 * @example
 * // Start with otter form, customize from there
 * const myCreature = createQuadruped('otter', {
 *   age: 'baby',
 *   furLength: 1.4, // extra fluffy
 *   tailLength: 0.8,
 * });
 *
 * // Apply any color theme
 * const themed = applyTheme(myCreature, THEMES.arctic);
 */

// ============================================
// THE TEMPLATE - All Available Knobs
// ============================================

export interface QuadrupedParams {
  // --- SIZE & PROPORTIONS ---
  /** Overall size (0.2 = tiny, 1 = medium, 3 = large) */
  size: number;
  /** Body length front-to-back */
  bodyLength: number;
  /** Body width */
  bodyWidth: number;
  /** Body height/bulk */
  bodyBulk: number;

  // --- HEAD ---
  /** Head size relative to body */
  headSize: number;
  /** Snout/muzzle length (0 = flat, 2 = very long) */
  snoutLength: number;
  /** Snout width */
  snoutWidth: number;
  /** Forehead prominence */
  foreheadSize: number;

  // --- EARS ---
  /** Ear size */
  earSize: number;
  /** Ear shape (0 = pointed, 1 = round) */
  earRoundness: number;
  /** Ear droop (0 = erect, 1 = floppy) */
  earDroop: number;
  /** Ear position height on head */
  earPosition: number;

  // --- EYES ---
  /** Eye size */
  eyeSize: number;
  /** Eye position (0 = front-facing, 1 = side) */
  eyePosition: number;
  /** Pupil shape (0 = round, 1 = vertical slit) */
  pupilShape: number;

  // --- NOSE & MOUTH ---
  /** Nose size */
  noseSize: number;
  /** Whisker length (0 = none) */
  whiskerLength: number;
  /** Visible teeth (0 = none, 1 = prominent) */
  teethVisible: number;

  // --- LEGS ---
  /** Leg length */
  legLength: number;
  /** Leg thickness */
  legThickness: number;
  /** Front vs back leg ratio (1 = equal, >1 = longer back) */
  legRatio: number;
  /** Paw/hoof size */
  pawSize: number;
  /** Webbing between toes (0 = none, 1 = full) */
  webbing: number;
  /** Claw/hoof length */
  clawLength: number;

  // --- TAIL ---
  /** Has tail */
  hasTail: boolean;
  /** Tail length */
  tailLength: number;
  /** Tail thickness at base */
  tailThickness: number;
  /** Tail bushiness (0 = sleek, 1 = fluffy) */
  tailFluff: number;

  // --- FUR/COAT ---
  /** Fur length (0.3 = short, 1 = medium, 2 = long) */
  furLength: number;
  /** Fur density/thickness */
  furDensity: number;
  /** Mane presence (0 = none, 1 = full mane) */
  mane: number;

  // --- EXTRAS ---
  /** Horn size (0 = none) */
  hornSize: number;
  /** Horn count */
  hornCount: number;
  /** Tusk size (0 = none) */
  tuskSize: number;

  // --- CONDITION ---
  /** Age category */
  age: 'baby' | 'young' | 'adult' | 'old';
  /** Build type */
  build: 'thin' | 'lean' | 'average' | 'stocky' | 'heavy';
  /** Wear/scarring (0 = pristine, 1 = battle-worn) */
  wear: number;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const QUADRUPED_DEFAULTS: QuadrupedParams = {
  size: 1,
  bodyLength: 1,
  bodyWidth: 1,
  bodyBulk: 1,

  headSize: 1,
  snoutLength: 1,
  snoutWidth: 1,
  foreheadSize: 1,

  earSize: 1,
  earRoundness: 0.5,
  earDroop: 0,
  earPosition: 0.7,

  eyeSize: 1,
  eyePosition: 0.3,
  pupilShape: 0,

  noseSize: 1,
  whiskerLength: 0,
  teethVisible: 0,

  legLength: 1,
  legThickness: 1,
  legRatio: 1,
  pawSize: 1,
  webbing: 0,
  clawLength: 0.5,

  hasTail: true,
  tailLength: 1,
  tailThickness: 1,
  tailFluff: 0.5,

  furLength: 1,
  furDensity: 1,
  mane: 0,

  hornSize: 0,
  hornCount: 0,
  tuskSize: 0,

  age: 'adult',
  build: 'average',
  wear: 0,
};

// ============================================
// FORMS - Suggested Starting Points
// ============================================

export type FormName =
  | 'otter'
  | 'beaver'
  | 'dog'
  | 'wolf'
  | 'fox'
  | 'cat'
  | 'lion'
  | 'tiger'
  | 'bear'
  | 'horse'
  | 'cow'
  | 'pig'
  | 'deer'
  | 'moose'
  | 'rabbit'
  | 'mouse'
  | 'squirrel';

/**
 * Each form is just suggested parameter values.
 * Only specifies what differs from defaults.
 */
export const QUADRUPED_FORMS: Record<FormName, Partial<QuadrupedParams>> = {
  // --- MUSTELIDS ---
  otter: {
    bodyLength: 1.3,
    bodyBulk: 0.85,
    snoutLength: 0.8,
    earSize: 0.7,
    earRoundness: 0.8,
    whiskerLength: 0.7,
    legLength: 0.6,
    webbing: 0.7,
    tailLength: 0.9,
    tailThickness: 1.2,
    tailFluff: 0.3,
    furLength: 0.8,
  },

  beaver: {
    bodyLength: 1.2,
    bodyBulk: 1.2,
    snoutLength: 0.6,
    earSize: 0.5,
    earRoundness: 0.9,
    teethVisible: 0.4,
    legLength: 0.5,
    webbing: 0.8,
    tailLength: 0.8,
    tailThickness: 2.0,
    tailFluff: 0,
    furLength: 0.9,
  },

  // --- CANINES ---
  dog: {
    snoutLength: 1.2,
    earSize: 1.1,
    earRoundness: 0.4,
    earDroop: 0.3,
    whiskerLength: 0.2,
    legLength: 1.1,
    tailLength: 1.0,
    tailFluff: 0.6,
  },

  wolf: {
    size: 1.2,
    snoutLength: 1.3,
    earSize: 1.2,
    earRoundness: 0.2,
    earPosition: 0.8,
    legLength: 1.2,
    pawSize: 1.1,
    tailLength: 1.1,
    tailFluff: 0.8,
    furLength: 1.3,
  },

  fox: {
    snoutLength: 1.4,
    snoutWidth: 0.8,
    earSize: 1.4,
    earRoundness: 0.1,
    earPosition: 0.85,
    legLength: 1.0,
    legThickness: 0.8,
    tailLength: 1.3,
    tailFluff: 1.0,
    furLength: 1.1,
  },

  // --- FELINES ---
  cat: {
    snoutLength: 0.6,
    earSize: 1.2,
    earRoundness: 0.2,
    earPosition: 0.85,
    eyeSize: 1.2,
    pupilShape: 0.7,
    whiskerLength: 1.0,
    legLength: 0.9,
    clawLength: 0.6,
    tailLength: 1.1,
    tailFluff: 0.4,
  },

  lion: {
    size: 1.4,
    bodyBulk: 1.2,
    snoutLength: 0.9,
    headSize: 1.2,
    earSize: 0.8,
    earRoundness: 0.6,
    legLength: 1.1,
    legThickness: 1.2,
    pawSize: 1.2,
    tailLength: 1.2,
    tailFluff: 0.8,
    mane: 1.0, // Males only, but available as toggle
  },

  tiger: {
    size: 1.3,
    bodyLength: 1.2,
    bodyBulk: 1.15,
    snoutLength: 0.8,
    earSize: 0.9,
    earRoundness: 0.5,
    legThickness: 1.2,
    pawSize: 1.2,
    tailLength: 1.1,
  },

  // --- URSINES ---
  bear: {
    size: 1.6,
    bodyBulk: 1.4,
    bodyWidth: 1.3,
    snoutLength: 1.1,
    headSize: 1.1,
    earSize: 0.6,
    earRoundness: 0.9,
    legLength: 0.9,
    legThickness: 1.4,
    pawSize: 1.3,
    clawLength: 1.0,
    hasTail: true,
    tailLength: 0.2,
    furLength: 1.3,
  },

  // --- EQUINES ---
  horse: {
    size: 1.8,
    bodyLength: 1.3,
    bodyBulk: 1.1,
    headSize: 1.1,
    snoutLength: 1.6,
    snoutWidth: 0.9,
    foreheadSize: 0.9,
    earSize: 0.9,
    earRoundness: 0.2,
    earPosition: 0.9,
    eyePosition: 0.6,
    noseSize: 1.3,
    legLength: 1.5,
    legThickness: 0.7,
    pawSize: 0.8,
    clawLength: 0, // Hooves
    tailLength: 1.4,
    tailFluff: 1.0,
    mane: 1.0,
    furLength: 0.3,
  },

  // --- BOVINES ---
  cow: {
    size: 1.7,
    bodyBulk: 1.4,
    bodyWidth: 1.3,
    headSize: 1.0,
    snoutLength: 0.8,
    snoutWidth: 1.4,
    earSize: 1.0,
    earDroop: 0.4,
    earRoundness: 0.6,
    legLength: 1.0,
    legThickness: 1.1,
    tailLength: 1.0,
    tailFluff: 0.3,
    hornSize: 0.6,
    hornCount: 2,
    furLength: 0.3,
  },

  // --- SUINES ---
  pig: {
    bodyBulk: 1.3,
    bodyWidth: 1.2,
    snoutLength: 0.7,
    snoutWidth: 1.3,
    noseSize: 1.4,
    earSize: 1.1,
    earDroop: 0.6,
    earRoundness: 0.5,
    legLength: 0.6,
    legThickness: 1.0,
    tailLength: 0.3,
    tailFluff: 0,
    furLength: 0.2,
  },

  // --- CERVINES ---
  deer: {
    size: 1.3,
    bodyLength: 1.1,
    snoutLength: 1.1,
    earSize: 1.3,
    earRoundness: 0.4,
    eyeSize: 1.1,
    eyePosition: 0.5,
    legLength: 1.4,
    legThickness: 0.6,
    tailLength: 0.3,
    hornSize: 0.8,
    hornCount: 2,
    furLength: 0.5,
  },

  moose: {
    size: 2.0,
    bodyBulk: 1.3,
    headSize: 1.2,
    snoutLength: 1.3,
    snoutWidth: 1.2,
    earSize: 1.0,
    legLength: 1.5,
    legThickness: 0.8,
    tailLength: 0.2,
    hornSize: 1.5,
    hornCount: 2,
    furLength: 0.6,
  },

  // --- RODENTS ---
  rabbit: {
    bodyBulk: 0.9,
    headSize: 1.1,
    snoutLength: 0.5,
    earSize: 2.0,
    earRoundness: 0.3,
    earPosition: 0.9,
    eyeSize: 1.2,
    eyePosition: 0.4,
    legLength: 0.8,
    legRatio: 1.4, // Longer back legs
    tailLength: 0.2,
    tailFluff: 1.0,
    furLength: 1.0,
  },

  mouse: {
    size: 0.3,
    headSize: 1.2,
    snoutLength: 0.6,
    earSize: 1.6,
    earRoundness: 0.9,
    eyeSize: 1.4,
    whiskerLength: 1.2,
    legLength: 0.7,
    tailLength: 1.2,
    tailThickness: 0.3,
    tailFluff: 0,
    furLength: 0.4,
  },

  squirrel: {
    size: 0.4,
    bodyLength: 0.9,
    headSize: 1.1,
    snoutLength: 0.6,
    earSize: 1.0,
    earRoundness: 0.3,
    earPosition: 0.9,
    eyeSize: 1.3,
    legRatio: 1.2,
    clawLength: 0.7,
    tailLength: 1.4,
    tailThickness: 1.0,
    tailFluff: 1.0,
    furLength: 0.8,
  },
};

// ============================================
// AGE ADJUSTMENTS
// ============================================

const AGE_ADJUSTMENTS: Record<QuadrupedParams['age'], Partial<QuadrupedParams>> = {
  baby: {
    size: 0.4,
    headSize: 1.4,
    eyeSize: 1.5,
    earSize: 1.2,
    legLength: 0.7,
    tailLength: 0.6,
    furLength: 1.2,
    whiskerLength: 0.2,
    wear: 0,
  },
  young: {
    size: 0.7,
    headSize: 1.15,
    eyeSize: 1.2,
    legLength: 0.9,
    wear: 0,
  },
  adult: {
    // No adjustments - baseline
  },
  old: {
    size: 0.95,
    earDroop: 0.2,
    eyeSize: 0.9,
    furDensity: 0.9,
    whiskerLength: 1.3,
    wear: 0.2,
  },
};

// ============================================
// BUILD ADJUSTMENTS
// ============================================

const BUILD_ADJUSTMENTS: Record<QuadrupedParams['build'], Partial<QuadrupedParams>> = {
  thin: {
    bodyBulk: 0.7,
    bodyWidth: 0.75,
    legThickness: 0.7,
  },
  lean: {
    bodyBulk: 0.85,
    bodyWidth: 0.9,
    legThickness: 0.85,
  },
  average: {},
  stocky: {
    bodyBulk: 1.2,
    bodyWidth: 1.15,
    legThickness: 1.15,
  },
  heavy: {
    bodyBulk: 1.4,
    bodyWidth: 1.3,
    legThickness: 1.3,
    legLength: 0.9,
  },
};

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a quadruped starting from a form
 *
 * @param form - Starting form (otter, dog, horse, etc.)
 * @param customizations - Any parameter overrides
 * @returns Complete parameter set
 *
 * @example
 * // Baby otter with extra fluffy fur
 * const babyOtter = createQuadruped('otter', {
 *   age: 'baby',
 *   furLength: 1.5,
 * });
 *
 * // Battle-scarred old wolf
 * const alphaWolf = createQuadruped('wolf', {
 *   age: 'old',
 *   build: 'heavy',
 *   wear: 0.7,
 *   size: 1.4,
 * });
 */
export function createQuadruped(
  form: FormName,
  customizations?: Partial<QuadrupedParams>
): QuadrupedParams {
  // Start with defaults
  let params = { ...QUADRUPED_DEFAULTS };

  // Apply form
  const formParams = QUADRUPED_FORMS[form];
  params = { ...params, ...formParams };

  // Apply age adjustments (from customization or form)
  const age = customizations?.age ?? params.age;
  const ageAdj = AGE_ADJUSTMENTS[age];
  for (const key in ageAdj) {
    if (key !== 'age') {
      const k = key as keyof QuadrupedParams;
      const baseVal = params[k];
      const adjVal = ageAdj[k];
      if (typeof baseVal === 'number' && typeof adjVal === 'number') {
        (params as Record<string, any>)[k] = baseVal === 0 ? adjVal : baseVal * adjVal;
      }
    }
  }
  params.age = age;

  // Apply build adjustments
  const build = customizations?.build ?? params.build;
  const buildAdj = BUILD_ADJUSTMENTS[build];
  for (const key in buildAdj) {
    if (key !== 'build') {
      const k = key as keyof QuadrupedParams;
      const baseVal = params[k];
      const adjVal = buildAdj[k];
      if (typeof baseVal === 'number' && typeof adjVal === 'number') {
        (params as Record<string, any>)[k] = baseVal === 0 ? adjVal : baseVal * adjVal;
      }
    }
  }
  params.build = build;

  // Apply direct customizations last (override everything)
  if (customizations) {
    params = { ...params, ...customizations };
  }

  return params;
}

/**
 * Create a fully custom quadruped from scratch
 */
export function createCustomQuadruped(params: Partial<QuadrupedParams>): QuadrupedParams {
  return { ...QUADRUPED_DEFAULTS, ...params };
}
