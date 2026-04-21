import { describe, expect, it, vi } from 'vitest';
import {
  createActionState,
  createRPGState,
  createSandboxState,
  createStateFromPreset,
  getStatePresetDefinition,
  isBuiltInStatePreset,
} from '../../../src/game/state-presets';

describe('game state presets', () => {
  it('creates RPG state with deep partial overrides', () => {
    const state = createRPGState({
      currentRegion: 'marsh',
      player: {
        name: 'Scout',
        stats: {
          dexterity: 14,
        },
      },
    });

    expect(state.currentRegion).toBe('marsh');
    expect(state.player.name).toBe('Scout');
    expect(state.player.level).toBe(1);
    expect(state.player.stats.dexterity).toBe(14);
    expect(state.player.stats.strength).toBe(10);
  });

  it('creates action state with stable defaults', () => {
    const state = createActionState({
      player: {
        score: 2500,
      },
    });

    expect(state.player.score).toBe(2500);
    expect(state.player.lives).toBe(3);
    expect(state.level).toBe(1);
  });

  it('creates sandbox state with a generated seed when one is not provided', () => {
    vi.spyOn(Date, 'now').mockReturnValue(424242);

    const state = createSandboxState({
      worldName: 'River Delta',
    });

    expect(state.worldName).toBe('River Delta');
    expect(state.worldSeed).toBe(424242);
  });

  it('creates state from preset registry metadata', () => {
    const state = createStateFromPreset('racing', {
      currentTrack: 'delta_run',
      racer: {
        boost: 65,
      },
    });

    expect(state.currentTrack).toBe('delta_run');
    expect(state.racer.boost).toBe(65);
    expect(state.totalLaps).toBe(3);
  });

  it('exposes preset definitions and preset guards', () => {
    const rpgPreset = getStatePresetDefinition('rpg');

    expect(rpgPreset.name).toBe('rpg');
    expect(rpgPreset.store.maxUndoHistory).toBe(100);
    expect(isBuiltInStatePreset('sandbox')).toBe(true);
    expect(isBuiltInStatePreset('custom')).toBe(false);
  });
});
