import { describe, expect, it } from 'vitest';
import {
  COLLECTIBLE_DEFAULTS,
  COLLECTIBLE_FORMS,
  type CollectibleForm,
  createCollectible,
  RARITY_MODIFIERS,
  type RarityTier,
} from '../src/collectibles';

describe('createCollectible', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createCollectible('coin');

      expect(result).toHaveProperty('shape');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('materialType');
      expect(result).toHaveProperty('glow');
      expect(result).toHaveProperty('rotationSpeed');
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(COLLECTIBLE_FORMS) as CollectibleForm[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createCollectible(form);

      expect(typeof result.size).toBe('number');
      expect(typeof result.glow).toBe('number');
      expect(result.size).toBeGreaterThan(0);
    });

    it('coin has metallic properties', () => {
      const coin = createCollectible('coin');

      expect(coin.materialType).toBe('metal');
      expect(coin.metalness).toBeGreaterThan(0.5);
      expect(coin.hasBorder).toBe(true);
      expect(coin.hasEmblem).toBe(true);
    });

    it('gem has crystal properties', () => {
      const gem = createCollectible('gem');

      expect(gem.faceted).toBe(true);
      expect(gem.materialType).toBe('gem');
      expect(gem.transparency).toBeGreaterThan(0);
      expect(gem.sparkles).toBe(true);
    });

    it('orb has glass properties', () => {
      const orb = createCollectible('orb');

      expect(orb.shape).toBe('sphere');
      expect(orb.materialType).toBe('glass');
      expect(orb.transparency).toBeGreaterThan(0);
      expect(orb.glow).toBeGreaterThan(0);
    });

    it('heart pulses', () => {
      const heart = createCollectible('heart');

      expect(heart.shape).toBe('heart');
      expect(heart.pulseAmount).toBeGreaterThan(0);
    });

    it('key rotates slowly', () => {
      const key = createCollectible('key');

      expect(key.rotationSpeed).toBeLessThan(1);
    });
  });

  describe('rarity tiers', () => {
    const rarities: RarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    it.each(rarities)('rarity "%s" applies modifiers', (rarity) => {
      const result = createCollectible('coin', rarity);
      const modifiers = RARITY_MODIFIERS[rarity];

      for (const key of Object.keys(modifiers)) {
        expect(result[key as keyof typeof result]).toBe(modifiers[key as keyof typeof modifiers]);
      }
    });

    it('common has no glow', () => {
      const common = createCollectible('gem', 'common');
      expect(common.glow).toBe(0);
      expect(common.sparkles).toBe(false);
    });

    it('legendary has maximum effects', () => {
      const legendary = createCollectible('gem', 'legendary');

      expect(legendary.glow).toBeGreaterThan(0.5);
      expect(legendary.sparkles).toBe(true);
      expect(legendary.hasTrail).toBe(true);
      expect(legendary.pulseAmount).toBeGreaterThan(0);
    });

    it('rarity progression increases effects', () => {
      const common = createCollectible('coin', 'common');
      const uncommon = createCollectible('coin', 'uncommon');
      const rare = createCollectible('coin', 'rare');
      const epic = createCollectible('coin', 'epic');
      const legendary = createCollectible('coin', 'legendary');

      expect(uncommon.glow).toBeGreaterThan(common.glow);
      expect(rare.glow).toBeGreaterThan(uncommon.glow);
      expect(epic.glow).toBeGreaterThan(rare.glow);
      expect(legendary.glow).toBeGreaterThan(epic.glow);
    });
  });

  describe('customization', () => {
    it('allows size override', () => {
      const result = createCollectible('gem', undefined, { size: 2.5 });
      expect(result.size).toBe(2.5);
    });

    it('customization overrides rarity', () => {
      const result = createCollectible('gem', 'legendary', { glow: 0 });
      expect(result.glow).toBe(0);
    });

    it('allows animation customization', () => {
      const result = createCollectible('star', undefined, {
        rotationSpeed: 5,
        bobAmount: 0.5,
        pulseAmount: 0.3,
      });

      expect(result.rotationSpeed).toBe(5);
      expect(result.bobAmount).toBe(0.5);
      expect(result.pulseAmount).toBe(0.3);
    });
  });
});
