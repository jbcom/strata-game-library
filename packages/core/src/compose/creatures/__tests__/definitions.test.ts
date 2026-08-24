import { describe, expect, it } from 'vitest';
import { cloneCreatureDefinition, createCreature, titleCaseFromId } from '../definitions';
import { CREATURES } from '../presets';
import type { CreateCreatureInput } from '../types';

const minimalInput = (): CreateCreatureInput => ({
  id: 'test_beast',
  skeleton: 'quadruped_medium',
  covering: { skeleton: 'quadruped_medium', regions: { '*': { material: 'fur_otter' } } },
  stats: { health: 10, speed: 1 },
  ai: 'prey',
});

describe('titleCaseFromId', () => {
  it('splits on underscores and hyphens', () => {
    expect(titleCaseFromId('river_otter')).toBe('River Otter');
    expect(titleCaseFromId('river-otter')).toBe('River Otter');
    expect(titleCaseFromId('river_otter-pup')).toBe('River Otter Pup');
  });

  it('drops empty segments from repeated or edge separators', () => {
    expect(titleCaseFromId('__river___otter__')).toBe('River Otter');
    expect(titleCaseFromId('-river-')).toBe('River');
  });

  it('uppercases only the first letter and leaves the rest alone', () => {
    expect(titleCaseFromId('mcDonald')).toBe('McDonald');
    expect(titleCaseFromId('ABC')).toBe('ABC');
  });

  it('returns an empty string for empty or separator-only input', () => {
    expect(titleCaseFromId('')).toBe('');
    expect(titleCaseFromId('___')).toBe('');
  });

  it('handles a single-character id', () => {
    expect(titleCaseFromId('a')).toBe('A');
  });
});

describe('cloneCreatureDefinition', () => {
  it('produces a value-equal copy', () => {
    const source = CREATURES.otter_river;
    expect(cloneCreatureDefinition(source)).toEqual(source);
  });

  it('does not alias nested arrays and objects', () => {
    const source = CREATURES.otter_river;
    const clone = cloneCreatureDefinition(source);

    expect(clone).not.toBe(source);
    expect(clone.biomes).not.toBe(source.biomes);
    expect(clone.stats).not.toBe(source.stats);
    expect(clone.animations).not.toBe(source.animations);
    expect(clone.covering.regions).not.toBe(source.covering.regions);
    expect(clone.packSize).not.toBe(source.packSize);
    expect(clone.timeOfDay).not.toBe(source.timeOfDay);
    expect(clone.sounds?.idle).not.toBe(source.sounds?.idle);
  });

  it('isolates the clone from mutation of the original', () => {
    const source = CREATURES.otter_river;
    const clone = cloneCreatureDefinition(source);
    const originalBiomes = [...source.biomes];

    clone.biomes.push('desert');
    clone.stats.health = 9999;

    expect(source.biomes).toEqual(originalBiomes);
    expect(source.stats.health).toBe(50);
  });

  it('copies drop tables rather than aliasing them', () => {
    const clone = cloneCreatureDefinition(CREATURES.otter_river);
    expect(clone.drops?.guaranteed?.[0]).not.toBe(CREATURES.otter_river.drops?.guaranteed?.[0]);
    expect(clone.drops?.guaranteed?.[0]).toEqual({ item: 'otter_pelt', count: 1 });
  });

  it('leaves absent optional sections undefined', () => {
    const bare = cloneCreatureDefinition({
      ...CREATURES.otter_river,
      drops: undefined,
      sounds: undefined,
      assets: undefined,
      packSize: undefined,
      timeOfDay: undefined,
    });

    expect(bare.drops).toBeUndefined();
    expect(bare.sounds).toBeUndefined();
    expect(bare.assets).toBeUndefined();
    expect(bare.packSize).toBeUndefined();
    expect(bare.timeOfDay).toBeUndefined();
  });
});

describe('createCreature from a preset name', () => {
  it('throws a named error for an unknown preset', () => {
    expect(() => createCreature('no_such_creature')).toThrow(
      /Unknown creature preset: no_such_creature/
    );
  });

  it('reproduces the preset when no overrides are given', () => {
    const created = createCreature('otter_river');
    expect(created.id).toBe('otter_river');
    expect(created.name).toBe('River Otter');
    expect(created.stats.health).toBe(50);
    expect(created.biomes).toEqual(['marsh']);
  });

  it('does not return the registry object itself', () => {
    const created = createCreature('otter_river');
    expect(created).not.toBe(CREATURES.otter_river);
    created.stats.health = 1;
    expect(CREATURES.otter_river.stats.health).toBe(50);
  });

  it('merges stat overrides over the preset instead of replacing the block', () => {
    const created = createCreature('otter_river', { stats: { health: 999, speed: 6 } });
    expect(created.stats.health).toBe(999);
    // swimSpeed came from the preset and survives the partial override.
    expect(created.stats.swimSpeed).toBe(12);
  });

  it('applies a name override and keeps the preset id', () => {
    const created = createCreature('otter_river', { name: 'Sea Otter' });
    expect(created.name).toBe('Sea Otter');
    expect(created.id).toBe('otter_river');
  });

  it('normalises packSize to [min, max] when given out of order', () => {
    const created = createCreature('otter_river', { packSize: [9, 2] });
    expect(created.packSize).toEqual([2, 9]);
  });
});

describe('createCreature from an input object', () => {
  it('derives a title-cased name from the id when none is given', () => {
    const created = createCreature(minimalInput());
    expect(created.name).toBe('Test Beast');
  });

  it('synthesises default idle/walk/run animation names', () => {
    const created = createCreature(minimalInput());
    expect(created.animations.idle).toBe('test_beast_idle');
    expect(created.animations.walk).toBe('test_beast_walk');
    expect(created.animations.run).toBe('test_beast_run');
  });

  it('lets explicit animations win over the synthesised defaults', () => {
    const created = createCreature({ ...minimalInput(), animations: { idle: 'custom_idle' } });
    expect(created.animations.idle).toBe('custom_idle');
    expect(created.animations.walk).toBe('test_beast_walk');
  });

  it('falls back to the skeleton id when no id is supplied', () => {
    const input = minimalInput();
    input.id = undefined;
    const created = createCreature(input);
    expect(created.id).toBe('quadruped_medium');
  });

  it('defaults spawnWeight to 1 and biomes to empty', () => {
    const created = createCreature(minimalInput());
    expect(created.spawnWeight).toBe(1);
    expect(created.biomes).toEqual([]);
  });

  it('rejects a covering whose skeleton disagrees with the creature skeleton', () => {
    expect(() =>
      createCreature({
        ...minimalInput(),
        covering: { skeleton: 'biped', regions: { '*': { material: 'fur_otter' } } },
      })
    ).toThrow(/does not match creature skeleton/);
  });

  it('accepts a covering that omits its skeleton, inheriting the creature one', () => {
    const created = createCreature({
      ...minimalInput(),
      covering: { regions: { '*': { material: 'fur_otter' } } } as CreateCreatureInput['covering'],
    });
    expect(created.covering.skeleton).toBe('quadruped_medium');
  });

  it('lets input win over overrides for the same covering region', () => {
    const created = createCreature(
      { ...minimalInput(), covering: { regions: { '*': { material: 'from_input' } } } as never },
      { covering: { regions: { '*': { material: 'from_override' } } } as never }
    );
    expect(created.covering.regions['*'].material).toBe('from_input');
  });

  it('unions covering regions from overrides and input', () => {
    const created = createCreature(
      { ...minimalInput(), covering: { regions: { head: { material: 'skin' } } } as never },
      { covering: { regions: { '*': { material: 'fur_otter' } } } as never }
    );
    expect(Object.keys(created.covering.regions).sort()).toEqual(['*', 'head']);
  });
});
