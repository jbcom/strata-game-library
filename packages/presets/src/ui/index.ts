/**
 * Specialized In-Game UI Style Presets.
 * @packageDocumentation
 * @module presets/ui
 */

import type {
  CrosshairConfig,
  DialogConfig,
  InventoryConfig,
  MinimapConfig,
  NotificationConfig,
  ProgressBarConfig,
} from '@strata-game-library/core';

export type HealthBarPresetName = 'rpg' | 'fps' | 'mmo' | 'minimalist' | 'retro';
export type InventoryPresetName = 'grid' | 'list' | 'wheel' | 'hotbar';
export type DialogPresetName = 'rpg' | 'visual_novel' | 'subtitle' | 'comic';
export type NotificationPresetName = 'success' | 'warning' | 'error' | 'info' | 'quest';
export type CrosshairPresetName = 'default' | 'dot' | 'circle' | 'tactical' | 'sniper';
export type MinimapPresetName = 'circular' | 'square' | 'radar' | 'compass';

export interface HealthBarPreset extends Partial<ProgressBarConfig> {
  name: HealthBarPresetName;
  description: string;
}

export interface InventoryPreset extends Partial<InventoryConfig> {
  name: InventoryPresetName;
  description: string;
}

export interface DialogPreset extends Partial<DialogConfig> {
  name: DialogPresetName;
  description: string;
}

export interface NotificationPreset extends Partial<NotificationConfig> {
  name: NotificationPresetName;
  description: string;
}

export interface CrosshairPreset extends Partial<CrosshairConfig> {
  name: CrosshairPresetName;
  description: string;
}

export interface MinimapPreset extends Partial<MinimapConfig> {
  name: MinimapPresetName;
  description: string;
}

export const healthBarPresets: Record<HealthBarPresetName, HealthBarPreset> = {
  rpg: {
    name: 'rpg',
    description: 'Classic RPG health bar with segments',
    width: 200,
    height: 20,
    backgroundColor: 'rgba(40, 0, 0, 0.8)',
    fillColor: '#dc2626',
    borderColor: '#7f1d1d',
    borderWidth: 2,
    borderRadius: 4,
    showText: true,
    textFormat: 'fraction',
    segments: 10,
    glowColor: '#dc2626',
    glowIntensity: 0.3,
  },
  fps: {
    name: 'fps',
    description: 'Minimalist FPS health indicator',
    width: 150,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    fillColor: '#22c55e',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    showText: false,
    animationDuration: 150,
  },
  mmo: {
    name: 'mmo',
    description: 'MMO-style health bar with gradient',
    width: 180,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    fillColor: 'linear-gradient(to right, #dc2626, #f87171)',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 2,
    showText: true,
    textFormat: 'percentage',
  },
  minimalist: {
    name: 'minimalist',
    description: 'Clean minimalist health bar',
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fillColor: '#ffffff',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 2,
    showText: false,
    animationDuration: 200,
  },
  retro: {
    name: 'retro',
    description: 'Pixel-art style health bar',
    width: 160,
    height: 12,
    backgroundColor: '#1a1a2e',
    fillColor: '#e94560',
    borderColor: '#0f3460',
    borderWidth: 3,
    borderRadius: 0,
    showText: true,
    textFormat: 'value',
    segments: 8,
  },
};

export const inventoryPresets: Record<InventoryPresetName, InventoryPreset> = {
  grid: {
    name: 'grid',
    description: 'Traditional grid-based inventory',
    columns: 6,
    rows: 4,
    slotSize: 48,
    slotGap: 4,
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
    slotBackgroundColor: 'rgba(50, 50, 60, 0.8)',
    slotBorderColor: 'rgba(80, 80, 90, 0.5)',
    selectedSlotBorderColor: '#d4af37',
    showTooltips: true,
    allowDrag: true,
    showQuantity: true,
  },
  list: {
    name: 'list',
    description: 'List-style inventory',
    columns: 1,
    rows: 10,
    slotSize: 40,
    slotGap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    slotBackgroundColor: 'rgba(40, 40, 40, 0.6)',
    slotBorderColor: 'rgba(60, 60, 60, 0.3)',
    selectedSlotBorderColor: '#60a5fa',
    showTooltips: true,
    allowDrag: false,
    showQuantity: true,
  },
  wheel: {
    name: 'wheel',
    description: 'Radial wheel inventory',
    columns: 8,
    rows: 1,
    slotSize: 56,
    slotGap: 8,
    backgroundColor: 'transparent',
    slotBackgroundColor: 'rgba(0, 0, 0, 0.7)',
    slotBorderColor: 'rgba(255, 255, 255, 0.2)',
    selectedSlotBorderColor: '#fbbf24',
    showTooltips: true,
    allowDrag: false,
    showQuantity: true,
  },
  hotbar: {
    name: 'hotbar',
    description: 'Horizontal hotbar for quick access',
    columns: 9,
    rows: 1,
    slotSize: 44,
    slotGap: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    slotBackgroundColor: 'rgba(30, 30, 30, 0.8)',
    slotBorderColor: 'rgba(70, 70, 70, 0.5)',
    selectedSlotBorderColor: '#ffffff',
    showTooltips: false,
    allowDrag: true,
    showQuantity: true,
  },
};

export const dialogPresets: Record<DialogPresetName, DialogPreset> = {
  rpg: {
    name: 'rpg',
    description: 'Classic RPG dialog box',
    typewriterSpeed: 40,
    textColor: '#ffffff',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    speakerColor: '#fbbf24',
    fontSize: 16,
    fontFamily: 'Georgia, serif',
    showSpeakerImage: true,
    imagePosition: 'left',
    continueIndicator: '▼',
    skipEnabled: true,
    padding: 24,
    maxWidth: 650,
  },
  visual_novel: {
    name: 'visual_novel',
    description: 'Visual novel style dialog',
    typewriterSpeed: 50,
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    speakerColor: '#f472b6',
    fontSize: 18,
    fontFamily: '"Noto Sans", sans-serif',
    showSpeakerImage: false,
    continueIndicator: '►',
    skipEnabled: true,
    padding: 30,
    maxWidth: 800,
  },
  subtitle: {
    name: 'subtitle',
    description: 'Cinematic subtitle style',
    typewriterSpeed: 60,
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    speakerColor: '#a78bfa',
    fontSize: 20,
    fontFamily: 'system-ui, sans-serif',
    showSpeakerImage: false,
    continueIndicator: '',
    skipEnabled: false,
    padding: 16,
    maxWidth: 700,
  },
  comic: {
    name: 'comic',
    description: 'Comic book speech bubble style',
    typewriterSpeed: 35,
    textColor: '#1a1a1a',
    backgroundColor: '#ffffff',
    speakerColor: '#dc2626',
    fontSize: 16,
    fontFamily: '"Comic Sans MS", cursive',
    showSpeakerImage: false,
    continueIndicator: '...',
    skipEnabled: true,
    padding: 20,
    maxWidth: 400,
  },
};

export const notificationPresets: Record<NotificationPresetName, NotificationPreset> = {
  success: {
    name: 'success',
    description: 'Success notification',
    type: 'success',
    duration: 4000,
    dismissible: true,
    progress: true,
    backgroundColor: 'rgba(20, 40, 20, 0.95)',
    textColor: '#ffffff',
    borderColor: '#22c55e',
  },
  warning: {
    name: 'warning',
    description: 'Warning notification',
    type: 'warning',
    duration: 6000,
    dismissible: true,
    progress: true,
    backgroundColor: 'rgba(40, 35, 15, 0.95)',
    textColor: '#ffffff',
    borderColor: '#fbbf24',
  },
  error: {
    name: 'error',
    description: 'Error notification',
    type: 'error',
    duration: 8000,
    dismissible: true,
    progress: true,
    backgroundColor: 'rgba(40, 15, 15, 0.95)',
    textColor: '#ffffff',
    borderColor: '#ef4444',
  },
  info: {
    name: 'info',
    description: 'Info notification',
    type: 'info',
    duration: 5000,
    dismissible: true,
    progress: true,
    backgroundColor: 'rgba(15, 25, 40, 0.95)',
    textColor: '#ffffff',
    borderColor: '#60a5fa',
  },
  quest: {
    name: 'quest',
    description: 'Quest update notification',
    type: 'info',
    duration: 5000,
    dismissible: true,
    progress: false,
    backgroundColor: 'rgba(30, 25, 10, 0.95)',
    textColor: '#ffffff',
    borderColor: '#d4af37',
  },
};

export const crosshairPresets: Record<CrosshairPresetName, CrosshairPreset> = {
  default: {
    name: 'default',
    description: 'Standard crosshair',
    type: 'cross',
    size: 20,
    thickness: 2,
    gap: 4,
    color: '#ffffff',
    outlineColor: '#000000',
    outlineWidth: 1,
    opacity: 0.8,
    dot: true,
    dotSize: 2,
  },
  dot: {
    name: 'dot',
    description: 'Simple dot crosshair',
    type: 'dot',
    size: 4,
    color: '#ff0000',
    outlineColor: '#000000',
    outlineWidth: 1,
    opacity: 1,
    dot: false,
  },
  circle: {
    name: 'circle',
    description: 'Circle crosshair',
    type: 'circle',
    size: 24,
    thickness: 1,
    color: '#00ff00',
    outlineColor: '#000000',
    outlineWidth: 1,
    opacity: 0.7,
    dot: true,
    dotSize: 2,
  },
  tactical: {
    name: 'tactical',
    description: 'Tactical military crosshair',
    type: 'cross',
    size: 16,
    thickness: 1,
    gap: 3,
    color: '#00ff00',
    outlineColor: '#000000',
    outlineWidth: 1,
    opacity: 0.9,
    dot: false,
    dynamic: true,
    spreadMultiplier: 2,
  },
  sniper: {
    name: 'sniper',
    description: 'Sniper scope crosshair',
    type: 'cross',
    size: 60,
    thickness: 1,
    gap: 10,
    color: '#000000',
    outlineColor: 'transparent',
    outlineWidth: 0,
    opacity: 0.6,
    dot: true,
    dotSize: 2,
  },
};

export const minimapPresets: Record<MinimapPresetName, MinimapPreset> = {
  circular: {
    name: 'circular',
    description: 'Circular minimap',
    size: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    showCompass: true,
    rotateWithPlayer: false,
  },
  square: {
    name: 'square',
    description: 'Square minimap',
    size: 160,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(100, 100, 100, 0.5)',
    borderWidth: 1,
    showCompass: true,
    rotateWithPlayer: false,
  },
  radar: {
    name: 'radar',
    description: 'Radar-style minimap',
    size: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 30, 0, 0.8)',
    borderColor: '#22c55e',
    borderWidth: 2,
    showCompass: false,
    rotateWithPlayer: true,
    playerColor: '#00ff00',
  },
  compass: {
    name: 'compass',
    description: 'Horizontal compass bar',
    size: 200,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'transparent',
    borderWidth: 0,
    showCompass: true,
    rotateWithPlayer: false,
  },
};

export function getHealthBarPreset(name: HealthBarPresetName): HealthBarPreset {
  return healthBarPresets[name];
}

export function getInventoryPreset(name: InventoryPresetName): InventoryPreset {
  return inventoryPresets[name];
}

export function getDialogPreset(name: DialogPresetName): DialogPreset {
  return dialogPresets[name];
}

export function getNotificationPreset(name: NotificationPresetName): NotificationPreset {
  return notificationPresets[name];
}

export function getCrosshairPreset(name: CrosshairPresetName): CrosshairPreset {
  return crosshairPresets[name];
}

export function getMinimapPreset(name: MinimapPresetName): MinimapPreset {
  return minimapPresets[name];
}

export function createCustomHealthBar(
  base: HealthBarPresetName,
  overrides: Partial<ProgressBarConfig>
): HealthBarPreset {
  return {
    ...healthBarPresets[base],
    ...overrides,
    name: base,
    description: `Custom ${base} health bar`,
  };
}

export function createCustomInventory(
  base: InventoryPresetName,
  overrides: Partial<InventoryConfig>
): InventoryPreset {
  return {
    ...inventoryPresets[base],
    ...overrides,
    name: base,
    description: `Custom ${base} inventory`,
  };
}

export function createCustomDialog(
  base: DialogPresetName,
  overrides: Partial<DialogConfig>
): DialogPreset {
  return {
    ...dialogPresets[base],
    ...overrides,
    name: base,
    description: `Custom ${base} dialog`,
  };
}

export const RPG_HEALTH_BAR = healthBarPresets.rpg;
export const FPS_HEALTH_BAR = healthBarPresets.fps;
export const MMO_HEALTH_BAR = healthBarPresets.mmo;
export const MINIMALIST_HEALTH_BAR = healthBarPresets.minimalist;
export const RETRO_HEALTH_BAR = healthBarPresets.retro;

export const GRID_INVENTORY = inventoryPresets.grid;
export const LIST_INVENTORY = inventoryPresets.list;
export const WHEEL_INVENTORY = inventoryPresets.wheel;
export const HOTBAR_INVENTORY = inventoryPresets.hotbar;

export const RPG_DIALOG = dialogPresets.rpg;
export const VISUAL_NOVEL_DIALOG = dialogPresets.visual_novel;
export const SUBTITLE_DIALOG = dialogPresets.subtitle;
export const COMIC_DIALOG = dialogPresets.comic;

export const SUCCESS_NOTIFICATION = notificationPresets.success;
export const WARNING_NOTIFICATION = notificationPresets.warning;
export const ERROR_NOTIFICATION = notificationPresets.error;
export const INFO_NOTIFICATION = notificationPresets.info;
export const QUEST_NOTIFICATION = notificationPresets.quest;

export const DEFAULT_CROSSHAIR = crosshairPresets.default;
export const DOT_CROSSHAIR = crosshairPresets.dot;
export const CIRCLE_CROSSHAIR = crosshairPresets.circle;
export const TACTICAL_CROSSHAIR = crosshairPresets.tactical;
export const SNIPER_CROSSHAIR = crosshairPresets.sniper;

export const CIRCULAR_MINIMAP = minimapPresets.circular;
export const SQUARE_MINIMAP = minimapPresets.square;
export const RADAR_MINIMAP = minimapPresets.radar;
export const COMPASS_MINIMAP = minimapPresets.compass;
