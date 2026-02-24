/**
 * Vehicle Template
 *
 * ONE template for boats, carts, wagons, and sleds.
 * FORMS are suggested starting points.
 */

// ============================================
// THE TEMPLATE - All Available Knobs
// ============================================

export interface VehicleParams {
  // --- TYPE & CORE ---
  type: 'boat' | 'cart' | 'wagon' | 'sled' | 'raft';

  // --- SIZE & PROPORTIONS ---
  /** Overall scale */
  size: number;
  /** Length of the vehicle body */
  length: number;
  /** Width of the vehicle body */
  width: number;
  /** Height of the vehicle body (excluding canopy/sails) */
  height: number;

  // --- CAPACITY ---
  /** Maximum number of passengers */
  passengerCapacity: number;
  /** Cargo space (0 = none, 1 = standard, 2 = large) */
  cargoCapacity: number;

  // --- PROPULSION ---
  propulsion: 'paddle' | 'sail' | 'wheel' | 'runner' | 'none';
  /** Number of wheels (for carts/wagons) */
  wheelCount: number;
  /** Diameter of wheels */
  wheelSize: number;
  /** Number of sails (for boats) */
  sailCount: number;
  /** Total sail area/scale */
  sailSize: number;
  /** Has oars/paddles */
  hasOars: boolean;
  /** Number of oars */
  oarCount: number;
  /** Has runners (for sleds) */
  hasRunners: boolean;

  // --- DETAILS ---
  /** Material construction */
  material: 'wood' | 'metal' | 'bone' | 'fabric';
  /** Has a cover or canopy */
  hasCanopy: boolean;
  /** Canopy height/scale */
  canopySize: number;
  /** Has a rudder for steering */
  hasRudder: boolean;
  /** Decorative elements (0 = functional, 1 = ornate) */
  ornamentation: number;

  // --- CONDITION ---
  /** Wear/damage (0 = pristine, 1 = ruined) */
  wear: number;
  /** Structural integrity category */
  condition: 'new' | 'used' | 'dilapidated' | 'ruined';
}

// ============================================
// DEFAULT VALUES
// ============================================

export const VEHICLE_DEFAULTS: VehicleParams = {
  type: 'cart',
  size: 1,
  length: 1,
  width: 1,
  height: 1,

  passengerCapacity: 1,
  cargoCapacity: 1,

  propulsion: 'wheel',
  wheelCount: 2,
  wheelSize: 1,
  sailCount: 0,
  sailSize: 0,
  hasOars: false,
  oarCount: 0,
  hasRunners: false,

  material: 'wood',
  hasCanopy: false,
  canopySize: 1,
  hasRudder: false,
  ornamentation: 0,

  wear: 0,
  condition: 'new',
};

// ============================================
// FORMS - Suggested Starting Points
// ============================================

export type VehicleForm =
  | 'canoe'
  | 'rowboat'
  | 'sailboat'
  | 'raft'
  | 'cart'
  | 'wagon'
  | 'chariot'
  | 'sled';

export const VEHICLE_FORMS: Record<VehicleForm, Partial<VehicleParams>> = {
  canoe: {
    type: 'boat',
    propulsion: 'paddle',
    length: 1.5,
    width: 0.4,
    height: 0.3,
    passengerCapacity: 2,
    cargoCapacity: 0.5,
    hasOars: true,
    oarCount: 1,
  },
  rowboat: {
    type: 'boat',
    propulsion: 'paddle',
    length: 1.2,
    width: 0.7,
    height: 0.4,
    passengerCapacity: 4,
    cargoCapacity: 1,
    hasOars: true,
    oarCount: 2,
  },
  sailboat: {
    type: 'boat',
    propulsion: 'sail',
    length: 1.4,
    width: 0.8,
    height: 0.5,
    passengerCapacity: 6,
    cargoCapacity: 2,
    sailCount: 1,
    sailSize: 1,
    hasRudder: true,
  },
  raft: {
    type: 'raft',
    propulsion: 'paddle',
    length: 1.0,
    width: 1.0,
    height: 0.1,
    passengerCapacity: 3,
    cargoCapacity: 1.5,
    hasOars: true,
    oarCount: 1,
  },
  cart: {
    type: 'cart',
    propulsion: 'wheel',
    wheelCount: 2,
    length: 0.8,
    width: 0.7,
    passengerCapacity: 1,
    cargoCapacity: 1.2,
  },
  wagon: {
    type: 'wagon',
    propulsion: 'wheel',
    wheelCount: 4,
    length: 1.5,
    width: 0.8,
    height: 0.6,
    passengerCapacity: 2,
    cargoCapacity: 3,
    hasCanopy: true,
  },
  chariot: {
    type: 'cart',
    propulsion: 'wheel',
    wheelCount: 2,
    length: 0.6,
    width: 0.8,
    height: 0.8,
    passengerCapacity: 2,
    cargoCapacity: 0,
    ornamentation: 0.7,
    material: 'metal',
  },
  sled: {
    type: 'sled',
    propulsion: 'runner',
    length: 1.2,
    width: 0.6,
    height: 0.3,
    hasRunners: true,
    passengerCapacity: 2,
    cargoCapacity: 1,
  },
};

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a vehicle starting from a form
 */
export function createVehicle(
  form: VehicleForm,
  customizations?: Partial<VehicleParams>
): VehicleParams {
  const params = {
    ...VEHICLE_DEFAULTS,
    ...VEHICLE_FORMS[form],
    ...customizations,
  };

  // Adjust wear based on condition if not explicitly provided
  if (customizations?.wear === undefined) {
    if (params.condition === 'dilapidated') params.wear = Math.max(params.wear, 0.6);
    if (params.condition === 'ruined') params.wear = Math.max(params.wear, 0.9);
  }

  return params;
}

/**
 * Generate an AI prompt for a vehicle
 */
export function generateVehiclePrompt(params: VehicleParams, materialName?: string): string {
  const parts: string[] = [];

  if (params.condition !== 'new') parts.push(params.condition);

  parts.push(params.type === 'boat' ? 'vessel' : params.type);

  if (materialName) {
    parts.push(`made of ${materialName}`);
  } else {
    parts.push(`made of ${params.material}`);
  }

  if (params.propulsion === 'sail' && params.sailCount > 0) {
    parts.push(`with ${params.sailCount} sails`);
  }

  if (params.hasCanopy) {
    parts.push('with a canopy cover');
  }

  if (params.wheelCount > 0 && (params.type === 'cart' || params.type === 'wagon')) {
    parts.push(`with ${params.wheelCount} large wheels`);
  }

  if (params.wear > 0.5) {
    parts.push('weathered and worn');
  }

  return parts.join(', ');
}
