import { describe, expect, it } from 'vitest';
import {
  CIRCLE_CROSSHAIR,
  CIRCULAR_MINIMAP,
  COMIC_DIALOG,
  COMPASS_MINIMAP,
  createCustomDialog,
  createCustomHealthBar,
  createCustomInventory,
  crosshairPresets,
  DEFAULT_CROSSHAIR,
  dialogPresets,
  DOT_CROSSHAIR,
  ERROR_NOTIFICATION,
  FPS_HEALTH_BAR,
  getCrosshairPreset,
  getDialogPreset,
  getHealthBarPreset,
  getInventoryPreset,
  getMinimapPreset,
  getNotificationPreset,
  GRID_INVENTORY,
  healthBarPresets,
  HOTBAR_INVENTORY,
  INFO_NOTIFICATION,
  inventoryPresets,
  LIST_INVENTORY,
  minimapPresets,
  MINIMALIST_HEALTH_BAR,
  MMO_HEALTH_BAR,
  notificationPresets,
  QUEST_NOTIFICATION,
  RADAR_MINIMAP,
  RETRO_HEALTH_BAR,
  RPG_DIALOG,
  RPG_HEALTH_BAR,
  SNIPER_CROSSHAIR,
  SQUARE_MINIMAP,
  SUBTITLE_DIALOG,
  SUCCESS_NOTIFICATION,
  TACTICAL_CROSSHAIR,
  VISUAL_NOVEL_DIALOG,
  WARNING_NOTIFICATION,
  WHEEL_INVENTORY,
} from '../src/ui';

describe('ui presets', () => {
  describe('healthBarPresets', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(healthBarPresets)).toHaveLength(5);
    });

    it('has correct convenience aliases', () => {
      expect(RPG_HEALTH_BAR).toBe(healthBarPresets.rpg);
      expect(FPS_HEALTH_BAR).toBe(healthBarPresets.fps);
      expect(MMO_HEALTH_BAR).toBe(healthBarPresets.mmo);
      expect(MINIMALIST_HEALTH_BAR).toBe(healthBarPresets.minimalist);
      expect(RETRO_HEALTH_BAR).toBe(healthBarPresets.retro);
    });

    const names = Object.keys(healthBarPresets) as Array<keyof typeof healthBarPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = healthBarPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('width');
      expect(preset).toHaveProperty('height');
      expect(preset).toHaveProperty('backgroundColor');
      expect(preset).toHaveProperty('fillColor');
    });

    it.each(names)('preset "%s" has positive dimensions', (name) => {
      const preset = healthBarPresets[name];
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
    });
  });

  describe('inventoryPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(inventoryPresets)).toHaveLength(4);
    });

    it('has correct convenience aliases', () => {
      expect(GRID_INVENTORY).toBe(inventoryPresets.grid);
      expect(LIST_INVENTORY).toBe(inventoryPresets.list);
      expect(WHEEL_INVENTORY).toBe(inventoryPresets.wheel);
      expect(HOTBAR_INVENTORY).toBe(inventoryPresets.hotbar);
    });

    const names = Object.keys(inventoryPresets) as Array<keyof typeof inventoryPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = inventoryPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('columns');
      expect(preset).toHaveProperty('rows');
      expect(preset).toHaveProperty('slotSize');
    });

    it('grid inventory has multiple rows and columns', () => {
      expect(inventoryPresets.grid.columns).toBeGreaterThan(1);
      expect(inventoryPresets.grid.rows).toBeGreaterThan(1);
    });

    it('hotbar is single row', () => {
      expect(inventoryPresets.hotbar.rows).toBe(1);
    });
  });

  describe('dialogPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(dialogPresets)).toHaveLength(4);
    });

    it('has correct convenience aliases', () => {
      expect(RPG_DIALOG).toBe(dialogPresets.rpg);
      expect(VISUAL_NOVEL_DIALOG).toBe(dialogPresets.visual_novel);
      expect(SUBTITLE_DIALOG).toBe(dialogPresets.subtitle);
      expect(COMIC_DIALOG).toBe(dialogPresets.comic);
    });

    const names = Object.keys(dialogPresets) as Array<keyof typeof dialogPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = dialogPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('typewriterSpeed');
      expect(preset).toHaveProperty('textColor');
      expect(preset).toHaveProperty('backgroundColor');
      expect(preset).toHaveProperty('fontSize');
    });

    it.each(names)('preset "%s" has positive typewriter speed', (name) => {
      expect(dialogPresets[name].typewriterSpeed).toBeGreaterThan(0);
    });
  });

  describe('notificationPresets', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(notificationPresets)).toHaveLength(5);
    });

    it('has correct convenience aliases', () => {
      expect(SUCCESS_NOTIFICATION).toBe(notificationPresets.success);
      expect(WARNING_NOTIFICATION).toBe(notificationPresets.warning);
      expect(ERROR_NOTIFICATION).toBe(notificationPresets.error);
      expect(INFO_NOTIFICATION).toBe(notificationPresets.info);
      expect(QUEST_NOTIFICATION).toBe(notificationPresets.quest);
    });

    const names = Object.keys(notificationPresets) as Array<keyof typeof notificationPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = notificationPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('type');
      expect(preset).toHaveProperty('duration');
    });

    it('error has longest duration', () => {
      expect(ERROR_NOTIFICATION.duration).toBeGreaterThan(SUCCESS_NOTIFICATION.duration!);
    });
  });

  describe('crosshairPresets', () => {
    it('contains all 5 presets', () => {
      expect(Object.keys(crosshairPresets)).toHaveLength(5);
    });

    it('has correct convenience aliases', () => {
      expect(DEFAULT_CROSSHAIR).toBe(crosshairPresets.default);
      expect(DOT_CROSSHAIR).toBe(crosshairPresets.dot);
      expect(CIRCLE_CROSSHAIR).toBe(crosshairPresets.circle);
      expect(TACTICAL_CROSSHAIR).toBe(crosshairPresets.tactical);
      expect(SNIPER_CROSSHAIR).toBe(crosshairPresets.sniper);
    });

    const names = Object.keys(crosshairPresets) as Array<keyof typeof crosshairPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = crosshairPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('type');
      expect(preset).toHaveProperty('size');
      expect(preset).toHaveProperty('color');
    });

    it('tactical has dynamic crosshair', () => {
      expect(TACTICAL_CROSSHAIR.dynamic).toBe(true);
    });
  });

  describe('minimapPresets', () => {
    it('contains all 4 presets', () => {
      expect(Object.keys(minimapPresets)).toHaveLength(4);
    });

    it('has correct convenience aliases', () => {
      expect(CIRCULAR_MINIMAP).toBe(minimapPresets.circular);
      expect(SQUARE_MINIMAP).toBe(minimapPresets.square);
      expect(RADAR_MINIMAP).toBe(minimapPresets.radar);
      expect(COMPASS_MINIMAP).toBe(minimapPresets.compass);
    });

    const names = Object.keys(minimapPresets) as Array<keyof typeof minimapPresets>;

    it.each(names)('preset "%s" has required fields', (name) => {
      const preset = minimapPresets[name];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('size');
      expect(preset).toHaveProperty('borderRadius');
      expect(preset).toHaveProperty('backgroundColor');
    });

    it('radar rotates with player', () => {
      expect(RADAR_MINIMAP.rotateWithPlayer).toBe(true);
    });

    it('circular has borderRadius = half size', () => {
      expect(CIRCULAR_MINIMAP.borderRadius).toBe(CIRCULAR_MINIMAP.size! / 2);
    });
  });

  describe('getter functions', () => {
    it('getHealthBarPreset returns correct preset', () => {
      expect(getHealthBarPreset('rpg')).toBe(healthBarPresets.rpg);
    });

    it('getInventoryPreset returns correct preset', () => {
      expect(getInventoryPreset('grid')).toBe(inventoryPresets.grid);
    });

    it('getDialogPreset returns correct preset', () => {
      expect(getDialogPreset('rpg')).toBe(dialogPresets.rpg);
    });

    it('getNotificationPreset returns correct preset', () => {
      expect(getNotificationPreset('success')).toBe(notificationPresets.success);
    });

    it('getCrosshairPreset returns correct preset', () => {
      expect(getCrosshairPreset('default')).toBe(crosshairPresets.default);
    });

    it('getMinimapPreset returns correct preset', () => {
      expect(getMinimapPreset('circular')).toBe(minimapPresets.circular);
    });
  });

  describe('custom preset factories', () => {
    it('createCustomHealthBar merges overrides with base', () => {
      const custom = createCustomHealthBar('rpg', { width: 300, height: 30 });
      expect(custom.width).toBe(300);
      expect(custom.height).toBe(30);
      expect(custom.name).toBe('rpg');
      // Should retain base properties not overridden
      expect(custom.fillColor).toBe(healthBarPresets.rpg.fillColor);
    });

    it('createCustomInventory merges overrides with base', () => {
      const custom = createCustomInventory('grid', { columns: 8 });
      expect(custom.columns).toBe(8);
      expect(custom.name).toBe('grid');
      expect(custom.rows).toBe(inventoryPresets.grid.rows);
    });

    it('createCustomDialog merges overrides with base', () => {
      const custom = createCustomDialog('rpg', { fontSize: 24 });
      expect(custom.fontSize).toBe(24);
      expect(custom.name).toBe('rpg');
      expect(custom.typewriterSpeed).toBe(dialogPresets.rpg.typewriterSpeed);
    });
  });
});
