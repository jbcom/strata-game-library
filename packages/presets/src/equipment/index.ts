/**
 * Equipment Template (Weapons, Armor, Backpacks, etc.)
 *
 * Migrated from otter-elite-force component library.
 */

// ============================================
// ALL THE KNOBS
// ============================================

export interface EquipmentParams {
  // --- TYPE ---
  /** Equipment category */
  type: 'weapon' | 'armor' | 'headgear' | 'backpack';

  // --- WEAPON COMPONENTS (Modular Assembly) ---
  /** Main body of the weapon */
  receiver: 'none' | 'pistol' | 'rifle' | 'shotgun';
  /** Front extension */
  barrel: 'none' | 'short' | 'long' | 'double';
  /** Handle */
  grip: 'none' | 'pistol' | 'standard';
  /** Rear support */
  stock: 'none' | 'tactical' | 'wood';
  /** Ammo container */
  magazine: 'none' | 'box' | 'drum' | 'internal';

  // --- STYLE & VARIANT ---
  /** Visual style/theme */
  style: 'none' | 'tactical' | 'light' | 'standard' | 'bandana' | 'radio' | 'medic' | 'scuba';
  /** Protection level (0 = none, 1 = full protection) */
  protection: number;
  /** Storage capacity (0 = none, 1 = maximum) */
  capacity: number;

  // --- PHYSICAL ---
  /** Overall scale */
  size: number;
  /** Weight/mass in kg */
  weight: number;
  /** Material finish */
  materialType: 'metal' | 'plastic' | 'fabric' | 'leather';

  // --- CONDITION ---
  /** Wear and tear (0 = new, 1 = destroyed) */
  wear: number;
  /** Dirt/grime coverage (0 = clean, 1 = filthy) */
  dirt: number;
  /** Camouflage pattern strength (0 = solid color, 1 = full camo) */
  camo: number;
}

// ============================================
// DEFAULTS
// ============================================

export const EQUIPMENT_DEFAULTS: EquipmentParams = {
  type: 'weapon',

  receiver: 'none',
  barrel: 'none',
  grip: 'none',
  stock: 'none',
  magazine: 'none',

  style: 'none',
  protection: 0,
  capacity: 0,

  size: 1,
  weight: 1,
  materialType: 'metal',

  wear: 0,
  dirt: 0,
  camo: 0,
};

// ============================================
// FORMS
// ============================================

export type EquipmentForm =
  // Weapons
  | 'pistol-standard'
  | 'rifle-assault'
  | 'shotgun-pump'
  // Armor
  | 'vest-tactical'
  | 'vest-light'
  // Headgear
  | 'helmet-standard'
  | 'helmet-bandana'
  // Backpacks
  | 'backpack-radio'
  | 'backpack-medic'
  | 'backpack-scuba';

export const EQUIPMENT_FORMS: Record<EquipmentForm, Partial<EquipmentParams>> = {
  // --- WEAPONS ---
  'pistol-standard': {
    type: 'weapon',
    receiver: 'pistol',
    barrel: 'short',
    grip: 'pistol',
    weight: 0.8,
  },
  'rifle-assault': {
    type: 'weapon',
    receiver: 'rifle',
    barrel: 'long',
    stock: 'tactical',
    magazine: 'box',
    weight: 3.5,
  },
  'shotgun-pump': {
    type: 'weapon',
    receiver: 'shotgun',
    barrel: 'double',
    stock: 'wood',
    weight: 4.2,
  },

  // --- ARMOR ---
  'vest-tactical': {
    type: 'armor',
    style: 'tactical',
    protection: 0.8,
    weight: 5,
    materialType: 'fabric',
  },
  'vest-light': {
    type: 'armor',
    style: 'light',
    protection: 0.3,
    weight: 1.5,
    materialType: 'fabric',
  },

  // --- HEADGEAR ---
  'helmet-standard': {
    type: 'headgear',
    style: 'standard',
    protection: 0.5,
    weight: 1.2,
    materialType: 'plastic',
  },
  'helmet-bandana': {
    type: 'headgear',
    style: 'bandana',
    protection: 0,
    weight: 0.1,
    materialType: 'fabric',
  },

  // --- BACKPACKS ---
  'backpack-radio': {
    type: 'backpack',
    style: 'radio',
    capacity: 0.2,
    weight: 8,
    materialType: 'metal',
  },
  'backpack-medic': {
    type: 'backpack',
    style: 'medic',
    capacity: 0.8,
    weight: 4,
    materialType: 'fabric',
  },
  'backpack-scuba': {
    type: 'backpack',
    style: 'scuba',
    capacity: 0.5,
    weight: 12,
    materialType: 'metal',
  },
};

// ============================================
// FACTORY
// ============================================

/**
 * Create equipment preset from a form
 *
 * @param form - Starting form (e.g. 'rifle-assault', 'vest-tactical')
 * @param customizations - Optional parameter overrides
 * @returns Complete EquipmentParams object
 */
export function createEquipment(
  form: EquipmentForm,
  customizations?: Partial<EquipmentParams>
): EquipmentParams {
  return {
    ...EQUIPMENT_DEFAULTS,
    ...EQUIPMENT_FORMS[form],
    ...customizations,
  };
}

/**
 * Generate an AI prompt from equipment params
 *
 * @param params - Equipment parameters
 * @param name - Optional display name
 * @returns Descriptive string for AI model generation
 */
export function generateEquipmentPrompt(params: EquipmentParams, name?: string): string {
  const parts: string[] = [];

  // Type/Name
  if (name) {
    parts.push(name);
  } else {
    parts.push(params.type);
  }

  // Style
  if (params.style !== 'none') {
    parts.push(`${params.style} style`);
  }

  // Material
  parts.push(`${params.materialType} material`);

  // Weapon components
  if (params.type === 'weapon') {
    if (params.receiver !== 'none') parts.push(`${params.receiver} receiver`);
    if (params.barrel !== 'none') parts.push(`${params.barrel} barrel`);
    if (params.stock !== 'none') parts.push(`${params.stock} stock`);
    if (params.magazine !== 'none') parts.push(`${params.magazine} magazine`);
  }

  // Size
  if (params.size < 0.5) parts.push('tiny');
  else if (params.size > 1.5) parts.push('large');

  // Condition
  if (params.wear > 0.5) parts.push('worn and damaged');
  else if (params.wear > 0.2) parts.push('weathered');

  if (params.dirt > 0.5) parts.push('filthy');
  else if (params.dirt > 0.2) parts.push('dusty');

  if (params.camo > 0.5) parts.push('camouflage pattern');

  return parts.join(', ');
}

/**
 * Suggest gameplay stats for equipment based on physical parameters
 *
 * @param params - Equipment parameters
 * @returns Gameplay-ready stats
 */
export function suggestEquipmentStats(params: EquipmentParams): {
  weight: number;
  durability: number;
  protection?: number;
  capacity?: number;
} {
  return {
    weight: params.weight,
    durability: Math.max(0, 1 - params.wear),
    ...(params.type === 'armor' || params.type === 'headgear'
      ? { protection: params.protection }
      : {}),
    ...(params.type === 'backpack' ? { capacity: params.capacity } : {}),
  };
}
