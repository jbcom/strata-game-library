/**
 * Guards the public surface of `core/ui`.
 *
 * `src/core/index.ts` does `export * from './ui'`, and the package root
 * re-exports that in turn, so anything dropped here silently breaks published
 * consumers (adapters/r3f, adapters/reactylon). This test pins the exact set.
 */
import { describe, expect, it } from 'vitest';
import * as ui from '../index';

/** Every runtime (value) export the module published before the split. */
const RUNTIME_EXPORTS = [
  'calculateFade',
  'clampProgress',
  'createDefaultCrosshair',
  'createDefaultDamageNumber',
  'createDefaultDialog',
  'createDefaultInventory',
  'createDefaultMinimap',
  'createDefaultNameplate',
  'createDefaultNotification',
  'createDefaultProgressBar',
  'createDefaultTooltip',
  'easeOutCubic',
  'easeOutElastic',
  'formatNumber',
  'formatProgressText',
  'getAnchorOffset',
  'getDamageNumberColor',
  'getNotificationColor',
  'getNotificationIcon',
  'getTextDirection',
  'lerp',
  'screenToWorld',
  'worldToScreen',
].sort();

describe('core/ui public surface', () => {
  it('exports exactly the expected runtime symbols, no more and no fewer', () => {
    expect(Object.keys(ui).sort()).toEqual(RUNTIME_EXPORTS);
  });

  it('exports every runtime symbol as a callable function', () => {
    // Enumerated via Object.entries rather than indexing the namespace object,
    // which would defeat tree shaking (biome noDynamicNamespaceImportAccess).
    const entries = Object.entries(ui);
    expect(entries).toHaveLength(RUNTIME_EXPORTS.length);
    for (const [name, value] of entries) {
      expect(value, `${name} should be callable`).toBeTypeOf('function');
    }
  });

  it('re-exports the math easing helpers rather than redefining them', async () => {
    const math = await import('../../math/utils');
    expect(ui.lerp).toBe(math.lerp);
    expect(ui.easeOutCubic).toBe(math.easeOutCubic);
    expect(ui.easeOutElastic).toBe(math.easeOutElastic);
  });

  it('re-exports the same function identities as the submodules', async () => {
    const [projection, format, defaults] = await Promise.all([
      import('../projection'),
      import('../format'),
      import('../defaults'),
    ]);
    expect(ui.worldToScreen).toBe(projection.worldToScreen);
    expect(ui.calculateFade).toBe(projection.calculateFade);
    expect(ui.formatNumber).toBe(format.formatNumber);
    expect(ui.getTextDirection).toBe(format.getTextDirection);
    expect(ui.createDefaultCrosshair).toBe(defaults.createDefaultCrosshair);
    expect(ui.getNotificationIcon).toBe(defaults.getNotificationIcon);
  });

  it('keeps the re-exported easing helpers behaviourally intact', () => {
    expect(ui.lerp(0, 10, 0.5)).toBeCloseTo(5, 10);
    expect(ui.easeOutCubic(0)).toBeCloseTo(0, 10);
    expect(ui.easeOutCubic(1)).toBeCloseTo(1, 10);
  });

  it('confines renderer coupling to the projection module', async () => {
    // The format and defaults modules must stay importable as pure logic. If
    // either grows a three.js import, this package's "pure TypeScript
    // algorithms" claim degrades further — fail loudly here instead.
    //
    // three.js installs no global side effects, so source text cannot be
    // inspected portably here. Instead assert the observable consequence:
    // these modules' exports must never hand back THREE-backed objects, and
    // must behave identically with no WebGL/DOM context present.
    const [format, defaults] = await Promise.all([import('../format'), import('../defaults')]);

    for (const mod of [format, defaults]) {
      for (const [name, value] of Object.entries(mod)) {
        expect(value, `${name} should be a plain function`).toBeTypeOf('function');
      }
    }

    // Every default config must be a plain JSON-serialisable object graph:
    // a THREE.Color or Vector3 leaking into these would not survive this.
    for (const factory of [
      defaults.createDefaultProgressBar,
      defaults.createDefaultCrosshair,
      defaults.createDefaultMinimap,
      defaults.createDefaultNameplate,
      defaults.createDefaultDamageNumber,
      defaults.createDefaultTooltip,
      defaults.createDefaultNotification,
      defaults.createDefaultDialog,
      defaults.createDefaultInventory,
    ]) {
      const config = factory();
      expect(JSON.parse(JSON.stringify(config))).toEqual(config);
    }
  });
});
