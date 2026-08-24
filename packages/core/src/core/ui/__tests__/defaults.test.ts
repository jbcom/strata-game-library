import { describe, expect, it } from 'vitest';
import {
  createDefaultCrosshair,
  createDefaultDamageNumber,
  createDefaultDialog,
  createDefaultInventory,
  createDefaultMinimap,
  createDefaultNameplate,
  createDefaultNotification,
  createDefaultProgressBar,
  createDefaultTooltip,
  getDamageNumberColor,
  getNotificationColor,
  getNotificationIcon,
} from '../defaults';

const FACTORIES = [
  ['progress bar', createDefaultProgressBar],
  ['inventory', createDefaultInventory],
  ['dialog', createDefaultDialog],
  ['tooltip', createDefaultTooltip],
  ['notification', createDefaultNotification],
  ['minimap', createDefaultMinimap],
  ['crosshair', createDefaultCrosshair],
  ['damage number', createDefaultDamageNumber],
  ['nameplate', createDefaultNameplate],
] as const;

describe('default factories return fresh, independent objects', () => {
  for (const [name, factory] of FACTORIES) {
    it(`returns a new ${name} object on every call`, () => {
      const a = factory();
      const b = factory();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });

    it(`does not leak mutations of a ${name} into later calls`, () => {
      const first = factory() as Record<string, unknown>;
      first.backgroundColor = '#mutated';
      const second = factory() as Record<string, unknown>;
      expect(second.backgroundColor).not.toBe('#mutated');
    });
  }
});

describe('createDefaultProgressBar', () => {
  it('starts full, at 100 of 100', () => {
    const bar = createDefaultProgressBar();
    expect(bar.value).toBe(100);
    expect(bar.maxValue).toBe(100);
  });

  it('defaults to a hidden percentage readout', () => {
    const bar = createDefaultProgressBar();
    expect(bar.showText).toBe(false);
    expect(bar.textFormat).toBe('percentage');
  });

  it('uses non-negative geometry', () => {
    const bar = createDefaultProgressBar();
    expect(bar.width).toBeGreaterThan(0);
    expect(bar.height).toBeGreaterThan(0);
    expect(bar.borderWidth).toBeGreaterThanOrEqual(0);
    expect(bar.borderRadius).toBeGreaterThanOrEqual(0);
  });
});

describe('createDefaultInventory', () => {
  it('builds a 6x4 grid of 24 slots by default', () => {
    const inventory = createDefaultInventory();
    expect(inventory.columns).toBe(6);
    expect(inventory.rows).toBe(4);
    expect(inventory.slots).toHaveLength(24);
  });

  it('honours an explicit grid size', () => {
    const inventory = createDefaultInventory(3, 2);
    expect(inventory.columns).toBe(3);
    expect(inventory.rows).toBe(2);
    expect(inventory.slots).toHaveLength(6);
  });

  it('numbers slot ids sequentially from zero', () => {
    const inventory = createDefaultInventory(2, 2);
    expect(inventory.slots.map((s) => s.id)).toEqual(['slot-0', 'slot-1', 'slot-2', 'slot-3']);
  });

  it('gives every slot a unique id', () => {
    const inventory = createDefaultInventory(5, 5);
    expect(new Set(inventory.slots.map((s) => s.id)).size).toBe(25);
  });

  it('leaves every slot empty and unlocked', () => {
    for (const slot of createDefaultInventory(2, 2).slots) {
      expect(slot.itemId).toBeUndefined();
      expect(slot.quantity).toBeUndefined();
      expect(slot.locked).toBeUndefined();
    }
  });

  it('produces an empty grid for a zero dimension', () => {
    expect(createDefaultInventory(0, 4).slots).toHaveLength(0);
    expect(createDefaultInventory(6, 0).slots).toHaveLength(0);
    expect(createDefaultInventory(0, 0).slots).toHaveLength(0);
  });

  it('produces an empty grid rather than throwing for negative dimensions', () => {
    const inventory = createDefaultInventory(-3, 4);
    expect(inventory.slots).toHaveLength(0);
    expect(inventory.columns).toBe(-3);
  });

  it('supplies a color for each of the five rarities', () => {
    const colors = createDefaultInventory().rarityColors ?? {};
    for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
      expect(colors[rarity]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('does not share the slot array between calls', () => {
    const first = createDefaultInventory(2, 1);
    first.slots.push({ id: 'extra' });
    expect(createDefaultInventory(2, 1).slots).toHaveLength(2);
  });

  it('does not share the rarity color map between calls', () => {
    const first = createDefaultInventory();
    (first.rarityColors as Record<string, string>).common = '#000000';
    expect(createDefaultInventory().rarityColors?.common).not.toBe('#000000');
  });
});

describe('createDefaultDialog', () => {
  it('starts with no lines, positioned at the first index', () => {
    const dialog = createDefaultDialog();
    expect(dialog.lines).toEqual([]);
    expect(dialog.currentLine).toBe(0);
  });

  it('auto-detects text direction so RTL scripts orient themselves', () => {
    expect(createDefaultDialog().textDirection).toBe('auto');
  });

  it('anchors to the bottom of the screen with a positive typewriter speed', () => {
    const dialog = createDefaultDialog();
    expect(dialog.position).toBe('bottom');
    expect(dialog.typewriterSpeed).toBeGreaterThan(0);
  });

  it('does not share the lines array between calls', () => {
    const first = createDefaultDialog();
    first.lines.push({ text: 'hello' });
    expect(createDefaultDialog().lines).toHaveLength(0);
  });
});

describe('createDefaultNotification', () => {
  it('is an info toast with an empty message', () => {
    const notification = createDefaultNotification();
    expect(notification.type).toBe('info');
    expect(notification.message).toBe('');
  });

  it('auto-dismisses after a positive duration and can be closed manually', () => {
    const notification = createDefaultNotification();
    expect(notification.duration).toBeGreaterThan(0);
    expect(notification.dismissible).toBe(true);
  });

  it('anchors to the top-right corner', () => {
    expect(createDefaultNotification().position).toBe('topRight');
  });
});

describe('createDefaultMinimap', () => {
  it('follows the player without rotating with them', () => {
    const minimap = createDefaultMinimap();
    expect(minimap.followPlayer).toBe(true);
    expect(minimap.rotateWithPlayer).toBe(false);
  });

  it('is circular, with a radius of half its size', () => {
    const minimap = createDefaultMinimap();
    expect(minimap.borderRadius).toBe((minimap.size ?? 0) / 2);
  });

  it('starts unrotated at unit zoom with fog-of-war off', () => {
    const minimap = createDefaultMinimap();
    expect(minimap.rotation).toBe(0);
    expect(minimap.zoom).toBe(1);
    expect(minimap.fogOfWar).toBe(false);
  });
});

describe('createDefaultCrosshair', () => {
  it('is a cross with a center dot', () => {
    const crosshair = createDefaultCrosshair();
    expect(crosshair.type).toBe('cross');
    expect(crosshair.dot).toBe(true);
  });

  it('is static, with an opacity inside the 0..1 range', () => {
    const crosshair = createDefaultCrosshair();
    expect(crosshair.dynamic).toBe(false);
    expect(crosshair.opacity).toBeGreaterThan(0);
    expect(crosshair.opacity).toBeLessThanOrEqual(1);
  });

  it('keeps the dot smaller than the crosshair itself', () => {
    const crosshair = createDefaultCrosshair();
    expect(crosshair.dotSize).toBeLessThan(crosshair.size ?? 0);
  });
});

describe('createDefaultDamageNumber', () => {
  it('is a normal-type zero that floats upward and fades midway', () => {
    const damage = createDefaultDamageNumber();
    expect(damage.value).toBe(0);
    expect(damage.type).toBe('normal');
    expect(damage.floatDistance).toBeGreaterThan(0);
    expect(damage.fadeStart).toBeGreaterThan(0);
    expect(damage.fadeStart).toBeLessThanOrEqual(1);
  });

  it('matches the palette entry for its own type', () => {
    const damage = createDefaultDamageNumber();
    expect(damage.color).toBe(getDamageNumberColor(damage.type));
  });
});

describe('createDefaultNameplate', () => {
  it('is an unknown entity showing its health bar and level', () => {
    const nameplate = createDefaultNameplate();
    expect(nameplate.name).toBe('Unknown');
    expect(nameplate.showHealthBar).toBe(true);
    expect(nameplate.showLevel).toBe(true);
  });

  it('starts fading before it fully disappears', () => {
    const nameplate = createDefaultNameplate();
    expect(nameplate.fadeStart).toBeLessThan(nameplate.fadeEnd ?? 0);
  });
});

describe('createDefaultTooltip', () => {
  it('delays appearing but hides immediately', () => {
    const tooltip = createDefaultTooltip();
    expect(tooltip.showDelay).toBeGreaterThan(0);
    expect(tooltip.hideDelay).toBe(0);
  });

  it('constrains its width and carries no content by default', () => {
    const tooltip = createDefaultTooltip();
    expect(tooltip.maxWidth).toBeGreaterThan(0);
    expect(tooltip.title).toBeUndefined();
    expect(tooltip.description).toBeUndefined();
  });
});

describe('getDamageNumberColor', () => {
  it('maps each damage type to a distinct hex color', () => {
    const types = ['critical', 'heal', 'miss', 'block', 'normal'] as const;
    const colors = types.map(getDamageNumberColor);
    expect(new Set(colors).size).toBe(types.length);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('uses white for normal hits', () => {
    expect(getDamageNumberColor('normal')).toBe('#ffffff');
  });

  it('falls back to the normal color for undefined and unknown types', () => {
    expect(getDamageNumberColor(undefined)).toBe('#ffffff');
    expect(getDamageNumberColor('nonsense' as never)).toBe('#ffffff');
  });
});

describe('getNotificationIcon', () => {
  it('maps each notification type to a distinct single-character icon', () => {
    const types = ['success', 'warning', 'error', 'info'] as const;
    const icons = types.map(getNotificationIcon);
    expect(icons).toEqual(['✓', '⚠', '✕', 'ℹ']);
    expect(new Set(icons).size).toBe(types.length);
    for (const icon of icons) {
      expect([...icon]).toHaveLength(1);
    }
  });

  it('falls back to the info icon for undefined and unknown types', () => {
    expect(getNotificationIcon(undefined)).toBe('ℹ');
    expect(getNotificationIcon('nonsense' as never)).toBe('ℹ');
  });
});

describe('getNotificationColor', () => {
  it('maps each notification type to a distinct hex color', () => {
    const types = ['success', 'warning', 'error', 'info'] as const;
    const colors = types.map(getNotificationColor);
    expect(new Set(colors).size).toBe(types.length);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('falls back to the info color for undefined and unknown types', () => {
    expect(getNotificationColor(undefined)).toBe('#60a5fa');
    expect(getNotificationColor('nonsense' as never)).toBe('#60a5fa');
  });

  it('shares the success color with the healing damage color', () => {
    expect(getNotificationColor('success')).toBe(getDamageNumberColor('heal'));
  });
});
