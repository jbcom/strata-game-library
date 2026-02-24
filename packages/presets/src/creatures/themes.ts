/**
 * Color Themes - Apply to ANY creature
 *
 * Themes are completely separate from form/shape.
 * Any creature can use any theme.
 */

export interface CreatureTheme {
  id: string;
  name: string;

  /** Main body color */
  primary: string;
  /** Secondary/marking color */
  secondary: string;
  /** Underbelly/chest color */
  underbelly: string;
  /** Accent highlights */
  accent?: string;

  /** Eye color */
  eyes: string;
  /** Nose/paw pad color */
  nose: string;
  /** Claw/hoof color */
  claws: string;

  /** Pattern type */
  pattern: 'solid' | 'gradient' | 'spotted' | 'striped' | 'patched' | 'tuxedo';

  /** Material properties */
  roughness: number;
  metalness: number;

  /** Tags for categorization */
  tags: string[];
}

// ============================================
// NATURAL THEMES - Realistic animal colors
// ============================================

export const NATURAL_THEMES: Record<string, CreatureTheme> = {
  brown: {
    id: 'brown',
    name: 'Classic Brown',
    primary: '#5D4037',
    secondary: '#8D6E63',
    underbelly: '#D7CCC8',
    eyes: '#4A3728',
    nose: '#1A1A1A',
    claws: '#2C2C2C',
    pattern: 'solid',
    roughness: 0.7,
    metalness: 0,
    tags: ['natural', 'common'],
  },

  tan: {
    id: 'tan',
    name: 'Sandy Tan',
    primary: '#C4A77D',
    secondary: '#A38B5E',
    underbelly: '#F5E6D3',
    eyes: '#5D4037',
    nose: '#3E2723',
    claws: '#3E2723',
    pattern: 'solid',
    roughness: 0.65,
    metalness: 0,
    tags: ['natural', 'desert'],
  },

  gray: {
    id: 'gray',
    name: 'Silver Gray',
    primary: '#757575',
    secondary: '#9E9E9E',
    underbelly: '#E0E0E0',
    eyes: '#424242',
    nose: '#212121',
    claws: '#424242',
    pattern: 'solid',
    roughness: 0.7,
    metalness: 0,
    tags: ['natural', 'common'],
  },

  black: {
    id: 'black',
    name: 'Midnight Black',
    primary: '#212121',
    secondary: '#424242',
    underbelly: '#616161',
    eyes: '#FFC107',
    nose: '#1A1A1A',
    claws: '#1A1A1A',
    pattern: 'solid',
    roughness: 0.6,
    metalness: 0,
    tags: ['natural', 'dark'],
  },

  white: {
    id: 'white',
    name: 'Pure White',
    primary: '#FAFAFA',
    secondary: '#F5F5F5',
    underbelly: '#FFFFFF',
    eyes: '#2196F3',
    nose: '#FFCDD2',
    claws: '#E0E0E0',
    pattern: 'solid',
    roughness: 0.6,
    metalness: 0,
    tags: ['natural', 'arctic'],
  },

  ginger: {
    id: 'ginger',
    name: 'Ginger Orange',
    primary: '#E65100',
    secondary: '#FF9800',
    underbelly: '#FFE0B2',
    eyes: '#4CAF50',
    nose: '#BF360C',
    claws: '#3E2723',
    pattern: 'solid',
    roughness: 0.7,
    metalness: 0,
    tags: ['natural', 'warm'],
  },

  spotted: {
    id: 'spotted',
    name: 'Spotted',
    primary: '#FFF8E1',
    secondary: '#3E2723',
    underbelly: '#FFFFFF',
    eyes: '#795548',
    nose: '#1A1A1A',
    claws: '#3E2723',
    pattern: 'spotted',
    roughness: 0.7,
    metalness: 0,
    tags: ['natural', 'pattern'],
  },

  striped: {
    id: 'striped',
    name: 'Tiger Stripe',
    primary: '#E65100',
    secondary: '#1A1A1A',
    underbelly: '#FFE0B2',
    eyes: '#FFEB3B',
    nose: '#BF360C',
    claws: '#212121',
    pattern: 'striped',
    roughness: 0.65,
    metalness: 0,
    tags: ['natural', 'pattern'],
  },

  tuxedo: {
    id: 'tuxedo',
    name: 'Tuxedo',
    primary: '#212121',
    secondary: '#FAFAFA',
    underbelly: '#FFFFFF',
    eyes: '#4CAF50',
    nose: '#1A1A1A',
    claws: '#424242',
    pattern: 'tuxedo',
    roughness: 0.65,
    metalness: 0,
    tags: ['natural', 'pattern'],
  },
};

// ============================================
// FANTASY THEMES - Magical/stylized colors
// ============================================

export const FANTASY_THEMES: Record<string, CreatureTheme> = {
  arctic: {
    id: 'arctic',
    name: 'Arctic Frost',
    primary: '#E3F2FD',
    secondary: '#90CAF9',
    underbelly: '#FFFFFF',
    accent: '#64B5F6',
    eyes: '#00BCD4',
    nose: '#B3E5FC',
    claws: '#CFD8DC',
    pattern: 'gradient',
    roughness: 0.5,
    metalness: 0.1,
    tags: ['fantasy', 'ice', 'cold'],
  },

  ember: {
    id: 'ember',
    name: 'Ember Fire',
    primary: '#BF360C',
    secondary: '#FF5722',
    underbelly: '#FFAB91',
    accent: '#FF9100',
    eyes: '#FFEB3B',
    nose: '#4A0000',
    claws: '#212121',
    pattern: 'gradient',
    roughness: 0.6,
    metalness: 0.1,
    tags: ['fantasy', 'fire', 'hot'],
  },

  forest: {
    id: 'forest',
    name: 'Deep Forest',
    primary: '#2E7D32',
    secondary: '#4CAF50',
    underbelly: '#A5D6A7',
    accent: '#81C784',
    eyes: '#FFEB3B',
    nose: '#1B5E20',
    claws: '#3E2723',
    pattern: 'gradient',
    roughness: 0.7,
    metalness: 0,
    tags: ['fantasy', 'nature', 'forest'],
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Deep',
    primary: '#0277BD',
    secondary: '#03A9F4',
    underbelly: '#B3E5FC',
    accent: '#4FC3F7',
    eyes: '#E1F5FE',
    nose: '#01579B',
    claws: '#263238',
    pattern: 'gradient',
    roughness: 0.4,
    metalness: 0.15,
    tags: ['fantasy', 'water', 'aquatic'],
  },

  shadow: {
    id: 'shadow',
    name: 'Shadow',
    primary: '#1A1A2E',
    secondary: '#16213E',
    underbelly: '#0F3460',
    accent: '#533483',
    eyes: '#E94560',
    nose: '#0A0A15',
    claws: '#0A0A15',
    pattern: 'solid',
    roughness: 0.8,
    metalness: 0.05,
    tags: ['fantasy', 'dark', 'stealth'],
  },

  toxic: {
    id: 'toxic',
    name: 'Toxic',
    primary: '#1B5E20',
    secondary: '#76FF03',
    underbelly: '#B2FF59',
    accent: '#00E676',
    eyes: '#FF1744',
    nose: '#33691E',
    claws: '#212121',
    pattern: 'spotted',
    roughness: 0.5,
    metalness: 0.2,
    tags: ['fantasy', 'poison', 'glow'],
  },

  royal: {
    id: 'royal',
    name: 'Royal Purple',
    primary: '#4A148C',
    secondary: '#7B1FA2',
    underbelly: '#CE93D8',
    accent: '#FFD700',
    eyes: '#FFD700',
    nose: '#311B92',
    claws: '#FFD700',
    pattern: 'solid',
    roughness: 0.5,
    metalness: 0.2,
    tags: ['fantasy', 'noble', 'magic'],
  },

  celestial: {
    id: 'celestial',
    name: 'Celestial',
    primary: '#1A237E',
    secondary: '#283593',
    underbelly: '#C5CAE9',
    accent: '#FFEB3B',
    eyes: '#FFFFFF',
    nose: '#3949AB',
    claws: '#FFD54F',
    pattern: 'spotted',
    roughness: 0.4,
    metalness: 0.3,
    tags: ['fantasy', 'space', 'cosmic'],
  },

  golden: {
    id: 'golden',
    name: 'Golden',
    primary: '#FF8F00',
    secondary: '#FFC107',
    underbelly: '#FFECB3',
    accent: '#FFD54F',
    eyes: '#4E342E',
    nose: '#E65100',
    claws: '#FFD700',
    pattern: 'solid',
    roughness: 0.3,
    metalness: 0.5,
    tags: ['fantasy', 'treasure', 'rare'],
  },

  crystalline: {
    id: 'crystalline',
    name: 'Crystalline',
    primary: '#E1BEE7',
    secondary: '#CE93D8',
    underbelly: '#F3E5F5',
    accent: '#EA80FC',
    eyes: '#00BCD4',
    nose: '#9C27B0',
    claws: '#B388FF',
    pattern: 'gradient',
    roughness: 0.2,
    metalness: 0.4,
    tags: ['fantasy', 'crystal', 'magic'],
  },
};

// ============================================
// ALL THEMES COMBINED
// ============================================

export const ALL_THEMES: Record<string, CreatureTheme> = {
  ...NATURAL_THEMES,
  ...FANTASY_THEMES,
};

// ============================================
// THEME UTILITIES
// ============================================

/**
 * Get themes by tag
 */
export function getThemesByTag(tag: string): CreatureTheme[] {
  return Object.values(ALL_THEMES).filter((t) => t.tags.includes(tag));
}

/**
 * Get natural themes only
 */
export function getNaturalThemes(): CreatureTheme[] {
  return Object.values(NATURAL_THEMES);
}

/**
 * Get fantasy themes only
 */
export function getFantasyThemes(): CreatureTheme[] {
  return Object.values(FANTASY_THEMES);
}
