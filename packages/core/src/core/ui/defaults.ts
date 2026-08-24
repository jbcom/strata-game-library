/**
 * Default configurations and theme lookups for UI widgets.
 *
 * Every `createDefault*` factory returns a freshly allocated, sensibly styled
 * config for one widget, so callers can spread-override rather than assemble a
 * shape from scratch. The `get*Color` / `get*Icon` helpers map a semantic
 * category onto the palette those defaults use.
 *
 * Renderer-free: these are plain data factories.
 *
 * @packageDocumentation
 * @module core/ui/defaults
 * @category UI & Interaction
 */

import type {
  CrosshairConfig,
  DamageNumberConfig,
  DialogConfig,
  InventoryConfig,
  InventorySlot,
  MinimapConfig,
  NameplateConfig,
  NotificationConfig,
  ProgressBarConfig,
  TooltipConfig,
} from './types';

/**
 * Creates a default ProgressBar configuration with common gaming styles.
 * @category UI & Interaction
 */
export function createDefaultProgressBar(): ProgressBarConfig {
  return {
    value: 100,
    maxValue: 100,
    width: 100,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    fillColor: '#4ade80',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 2,
    showText: false,
    textFormat: 'percentage',
    animationDuration: 300,
  };
}

/**
 * Creates a default inventory configuration with a specified grid size.
 * @category UI & Interaction
 * @param columns - Number of columns (default: 6).
 * @param rows - Number of rows (default: 4).
 */
export function createDefaultInventory(columns: number = 6, rows: number = 4): InventoryConfig {
  const slots: InventorySlot[] = [];
  for (let i = 0; i < columns * rows; i++) {
    slots.push({ id: `slot-${i}` });
  }

  return {
    slots,
    columns,
    rows,
    slotSize: 48,
    slotGap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    slotBackgroundColor: 'rgba(50, 50, 50, 0.8)',
    slotBorderColor: 'rgba(100, 100, 100, 0.5)',
    selectedSlotBorderColor: '#d4af37',
    showTooltips: true,
    allowDrag: true,
    showQuantity: true,
    rarityColors: {
      common: '#9ca3af',
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b',
    },
  };
}

/**
 * Creates a default dialogue system configuration.
 * @category UI & Interaction
 */
export function createDefaultDialog(): DialogConfig {
  return {
    lines: [],
    currentLine: 0,
    typewriterSpeed: 30,
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    speakerColor: '#d4af37',
    fontSize: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textDirection: 'auto',
    showSpeakerImage: true,
    imagePosition: 'left',
    continueIndicator: '▼',
    skipEnabled: true,
    padding: 20,
    maxWidth: 600,
    position: 'bottom',
  };
}

/**
 * Creates a default tooltip configuration with standard dark-mode styling.
 * @category UI & Interaction
 */
export function createDefaultTooltip(): TooltipConfig {
  return {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderColor: 'rgba(100, 100, 100, 0.5)',
    textColor: '#ffffff',
    maxWidth: 250,
    fontSize: 14,
    padding: 12,
    showDelay: 200,
    hideDelay: 0,
  };
}

/**
 * Creates a default notification configuration.
 * @category UI & Interaction
 */
export function createDefaultNotification(): NotificationConfig {
  return {
    message: '',
    type: 'info',
    duration: 5000,
    position: 'topRight',
    dismissible: true,
    progress: true,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    textColor: '#ffffff',
    animationIn: 'slideIn',
    animationOut: 'fadeOut',
  };
}

/**
 * Creates a default minimap configuration.
 * @category UI & Interaction
 */
export function createDefaultMinimap(): MinimapConfig {
  return {
    size: 150,
    zoom: 1,
    rotation: 0,
    followPlayer: true,
    rotateWithPlayer: false,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderRadius: 75,
    playerColor: '#4ade80',
    playerSize: 8,
    fogOfWar: false,
    showCompass: true,
  };
}

/**
 * Creates a default crosshair configuration.
 * @category UI & Interaction
 */
export function createDefaultCrosshair(): CrosshairConfig {
  return {
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
    dynamic: false,
    spreadMultiplier: 1,
  };
}

/**
 * Creates a default damage number configuration with standard impact styling.
 * @category UI & Interaction
 */
export function createDefaultDamageNumber(): DamageNumberConfig {
  return {
    value: 0,
    type: 'normal',
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Impact, sans-serif',
    fontWeight: 'bold',
    duration: 1500,
    floatDistance: 60,
    fadeStart: 0.5,
    scale: 1,
    randomOffset: 20,
  };
}

/**
 * Creates a default nameplate configuration.
 * @category UI & Interaction
 */
export function createDefaultNameplate(): NameplateConfig {
  return {
    name: 'Unknown',
    nameColor: '#ffffff',
    titleColor: '#a8a29e',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    showHealthBar: true,
    showLevel: true,
    fadeStart: 15,
    fadeEnd: 25,
  };
}

/**
 * Gets the standard color for a damage number type.
 * @category UI & Interaction
 * @param type - The category of damage (e.g., 'critical', 'heal').
 * @returns CSS-compatible color string.
 */
export function getDamageNumberColor(type: DamageNumberConfig['type']): string {
  switch (type) {
    case 'critical':
      return '#ff6b6b';
    case 'heal':
      return '#4ade80';
    case 'miss':
      return '#9ca3af';
    case 'block':
      return '#60a5fa';
    default:
      return '#ffffff';
  }
}

/**
 * Gets the standard icon character for a notification type.
 * @category UI & Interaction
 * @param type - The notification category.
 * @returns A single-character icon string.
 */
export function getNotificationIcon(type: NotificationConfig['type']): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'warning':
      return '⚠';
    case 'error':
      return '✕';
    default:
      return 'ℹ';
  }
}

/**
 * Gets the standard theme color for a notification type.
 * @category UI & Interaction
 * @param type - The notification category.
 * @returns CSS-compatible color string.
 */
export function getNotificationColor(type: NotificationConfig['type']): string {
  switch (type) {
    case 'success':
      return '#4ade80';
    case 'warning':
      return '#fbbf24';
    case 'error':
      return '#ef4444';
    default:
      return '#60a5fa';
  }
}
