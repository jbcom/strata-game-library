/**
 * Building Template
 *
 * What are the knobs for ANY building?
 * Forms: hut, cabin, tower, barn, temple, bunker, etc.
 */

// ============================================
// ALL THE KNOBS
// ============================================

export interface BuildingParams {
  // --- FOUNDATION ---
  /** Foundation type */
  foundationType: 'none' | 'slab' | 'stilts' | 'stone' | 'raised';
  /** Foundation height */
  foundationHeight: number;
  /** Stilt count (if stilts) */
  stiltCount: number;

  // --- MAIN STRUCTURE ---
  /** Width (front-facing) */
  width: number;
  /** Depth (front-to-back) */
  depth: number;
  /** Wall height per floor */
  wallHeight: number;
  /** Number of floors */
  floors: number;
  /** Wall thickness */
  wallThickness: number;

  // --- SHAPE ---
  /** Base shape */
  baseShape: 'square' | 'rectangle' | 'round' | 'hexagon' | 'octagon';
  /** Wall slant (0 = vertical, positive = wider at bottom) */
  wallSlant: number;
  /** Corner style */
  cornerStyle: 'sharp' | 'rounded' | 'chamfered';

  // --- ROOF ---
  /** Roof type */
  roofType: 'flat' | 'peaked' | 'gabled' | 'hipped' | 'dome' | 'conical' | 'pagoda' | 'none';
  /** Roof height/pitch */
  roofHeight: number;
  /** Roof overhang */
  roofOverhang: number;
  /** Roof thickness */
  roofThickness: number;

  // --- OPENINGS ---
  /** Door count */
  doorCount: number;
  /** Door width */
  doorWidth: number;
  /** Door height */
  doorHeight: number;
  /** Door style */
  doorStyle: 'simple' | 'arched' | 'double' | 'sliding' | 'none';

  /** Window count per wall */
  windowsPerWall: number;
  /** Window width */
  windowWidth: number;
  /** Window height */
  windowHeight: number;
  /** Window style */
  windowStyle: 'square' | 'round' | 'arched' | 'slit' | 'none';
  /** Shutters */
  hasShutters: boolean;

  // --- DECORATIONS ---
  /** Porch/deck presence */
  hasPorch: boolean;
  /** Porch depth */
  porchDepth: number;
  /** Chimney */
  hasChimney: boolean;
  /** Chimney height */
  chimneyHeight: number;
  /** Balcony per floor */
  hasBalcony: boolean;
  /** Support columns */
  columnCount: number;
  /** Column style */
  columnStyle: 'round' | 'square' | 'ornate' | 'none';
  /** Fence/railing */
  hasRailing: boolean;

  // --- MATERIALS ---
  /** Primary wall material */
  wallMaterial: 'wood' | 'stone' | 'brick' | 'mud' | 'metal' | 'thatch';
  /** Roof material */
  roofMaterial: 'thatch' | 'shingle' | 'tile' | 'metal' | 'slate' | 'wood';
  /** Trim material */
  trimMaterial: 'wood' | 'stone' | 'metal' | 'none';

  // --- CONDITION ---
  /** Age/wear (0 = new, 1 = ruined) */
  wear: number;
  /** Overgrown with plants (0-1) */
  overgrown: number;
  /** Damage level */
  damage: number;
}

// ============================================
// DEFAULTS
// ============================================

export const BUILDING_DEFAULTS: BuildingParams = {
  foundationType: 'slab',
  foundationHeight: 0.3,
  stiltCount: 4,

  width: 4,
  depth: 4,
  wallHeight: 2.5,
  floors: 1,
  wallThickness: 0.2,

  baseShape: 'square',
  wallSlant: 0,
  cornerStyle: 'sharp',

  roofType: 'peaked',
  roofHeight: 1.5,
  roofOverhang: 0.3,
  roofThickness: 0.15,

  doorCount: 1,
  doorWidth: 0.9,
  doorHeight: 2.0,
  doorStyle: 'simple',

  windowsPerWall: 1,
  windowWidth: 0.6,
  windowHeight: 0.8,
  windowStyle: 'square',
  hasShutters: false,

  hasPorch: false,
  porchDepth: 1.0,
  hasChimney: false,
  chimneyHeight: 1.0,
  hasBalcony: false,
  columnCount: 0,
  columnStyle: 'none',
  hasRailing: false,

  wallMaterial: 'wood',
  roofMaterial: 'thatch',
  trimMaterial: 'wood',

  wear: 0,
  overgrown: 0,
  damage: 0,
};

// ============================================
// FORMS - Suggested Starting Points
// ============================================

export type BuildingForm =
  | 'hut'
  | 'cabin'
  | 'cottage'
  | 'farmhouse'
  | 'barn'
  | 'tower'
  | 'watchtower'
  | 'temple'
  | 'shrine'
  | 'bunker'
  | 'warehouse'
  | 'shack'
  | 'treehouse'
  | 'dock_house'
  | 'windmill'
  | 'lighthouse';

export const BUILDING_FORMS: Record<BuildingForm, Partial<BuildingParams>> = {
  hut: {
    width: 3,
    depth: 3,
    wallHeight: 2.2,
    foundationType: 'stilts',
    foundationHeight: 1.0,
    roofType: 'conical',
    roofHeight: 2.0,
    wallMaterial: 'wood',
    roofMaterial: 'thatch',
    windowsPerWall: 0,
    windowStyle: 'none',
  },

  cabin: {
    width: 4,
    depth: 5,
    wallHeight: 2.5,
    roofType: 'gabled',
    hasChimney: true,
    chimneyHeight: 1.5,
    hasPorch: true,
    porchDepth: 1.2,
    wallMaterial: 'wood',
    roofMaterial: 'shingle',
    hasShutters: true,
  },

  cottage: {
    width: 5,
    depth: 6,
    wallHeight: 2.4,
    roofType: 'gabled',
    roofOverhang: 0.5,
    hasChimney: true,
    windowsPerWall: 2,
    windowStyle: 'arched',
    hasShutters: true,
    wallMaterial: 'stone',
    roofMaterial: 'tile',
    cornerStyle: 'rounded',
  },

  farmhouse: {
    width: 6,
    depth: 8,
    floors: 2,
    wallHeight: 2.8,
    roofType: 'gabled',
    hasPorch: true,
    porchDepth: 2.0,
    hasChimney: true,
    windowsPerWall: 2,
    hasRailing: true,
    wallMaterial: 'wood',
    roofMaterial: 'shingle',
  },

  barn: {
    width: 8,
    depth: 12,
    wallHeight: 4,
    roofType: 'gabled',
    roofHeight: 3,
    doorWidth: 2.5,
    doorHeight: 3.5,
    doorStyle: 'double',
    windowsPerWall: 0,
    windowStyle: 'slit',
    wallMaterial: 'wood',
    roofMaterial: 'metal',
  },

  tower: {
    width: 3,
    depth: 3,
    floors: 3,
    wallHeight: 3,
    baseShape: 'round',
    roofType: 'conical',
    roofHeight: 2,
    windowsPerWall: 1,
    windowStyle: 'slit',
    wallMaterial: 'stone',
    roofMaterial: 'slate',
    wallThickness: 0.5,
  },

  watchtower: {
    width: 2.5,
    depth: 2.5,
    floors: 4,
    wallHeight: 2.5,
    foundationType: 'stone',
    foundationHeight: 0.5,
    roofType: 'peaked',
    hasBalcony: true,
    hasRailing: true,
    windowsPerWall: 1,
    windowStyle: 'slit',
    wallMaterial: 'stone',
    roofMaterial: 'wood',
  },

  temple: {
    width: 8,
    depth: 10,
    wallHeight: 4,
    foundationType: 'raised',
    foundationHeight: 1.0,
    roofType: 'gabled',
    roofHeight: 2,
    roofOverhang: 1.0,
    columnCount: 6,
    columnStyle: 'ornate',
    doorWidth: 2,
    doorHeight: 3,
    doorStyle: 'arched',
    windowsPerWall: 0,
    wallMaterial: 'stone',
    roofMaterial: 'tile',
    cornerStyle: 'chamfered',
  },

  shrine: {
    width: 2,
    depth: 2,
    wallHeight: 2,
    foundationType: 'raised',
    foundationHeight: 0.5,
    roofType: 'pagoda',
    roofHeight: 1.5,
    roofOverhang: 0.5,
    columnCount: 4,
    columnStyle: 'round',
    doorStyle: 'none',
    windowsPerWall: 0,
    wallMaterial: 'wood',
    roofMaterial: 'tile',
  },

  bunker: {
    width: 5,
    depth: 6,
    wallHeight: 2,
    foundationType: 'slab',
    roofType: 'flat',
    roofHeight: 0.3,
    windowsPerWall: 0,
    windowStyle: 'slit',
    doorStyle: 'simple',
    wallMaterial: 'stone',
    roofMaterial: 'metal',
    wallThickness: 0.6,
    cornerStyle: 'chamfered',
  },

  warehouse: {
    width: 10,
    depth: 15,
    wallHeight: 5,
    roofType: 'gabled',
    roofHeight: 2,
    doorWidth: 3,
    doorHeight: 4,
    doorStyle: 'sliding',
    windowsPerWall: 3,
    windowStyle: 'square',
    wallMaterial: 'metal',
    roofMaterial: 'metal',
  },

  shack: {
    width: 2.5,
    depth: 3,
    wallHeight: 2,
    roofType: 'flat',
    roofHeight: 0.3,
    windowsPerWall: 0,
    wallMaterial: 'wood',
    roofMaterial: 'metal',
    wear: 0.5,
    wallSlant: 0.05,
  },

  treehouse: {
    width: 3,
    depth: 3,
    wallHeight: 2,
    foundationType: 'stilts',
    foundationHeight: 3,
    stiltCount: 1,
    roofType: 'peaked',
    hasPorch: true,
    hasRailing: true,
    wallMaterial: 'wood',
    roofMaterial: 'thatch',
  },

  dock_house: {
    width: 4,
    depth: 5,
    wallHeight: 2.5,
    foundationType: 'stilts',
    foundationHeight: 1.5,
    stiltCount: 6,
    roofType: 'gabled',
    hasPorch: true,
    porchDepth: 1.5,
    hasRailing: true,
    wallMaterial: 'wood',
    roofMaterial: 'metal',
  },

  windmill: {
    width: 4,
    depth: 4,
    floors: 3,
    wallHeight: 3,
    baseShape: 'round',
    wallSlant: 0.05,
    roofType: 'dome',
    roofHeight: 1,
    wallMaterial: 'stone',
    roofMaterial: 'wood',
    // Note: actual windmill blades would be separate attachment
  },

  lighthouse: {
    width: 3,
    depth: 3,
    floors: 5,
    wallHeight: 2.5,
    baseShape: 'round',
    wallSlant: 0.03,
    roofType: 'dome',
    roofHeight: 1.5,
    hasBalcony: true,
    hasRailing: true,
    windowsPerWall: 1,
    windowStyle: 'round',
    wallMaterial: 'stone',
    roofMaterial: 'metal',
  },
};

// ============================================
// FACTORY
// ============================================

export function createBuilding(
  form: BuildingForm,
  customizations?: Partial<BuildingParams>
): BuildingParams {
  return {
    ...BUILDING_DEFAULTS,
    ...BUILDING_FORMS[form],
    ...customizations,
  };
}
