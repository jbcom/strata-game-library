import { describe, expect, it } from 'vitest';
import {
  addExperience,
  addInventoryItem,
  ALL_STATE_PRESETS,
  AUTOSAVE_CONFIG_DISABLED,
  AUTOSAVE_CONFIG_FREQUENT,
  AUTOSAVE_CONFIG_INFREQUENT,
  AUTOSAVE_CONFIG_MODERATE,
  collectCoin,
  completeQuest,
  COUNTER_STATE_PRESET,
  createPlatformerState,
  createPuzzleState,
  createRPGState,
  createSandboxState,
  DEFAULT_COUNTER_STATE,
  DEFAULT_PLATFORMER_STATE,
  DEFAULT_PUZZLE_STATE,
  DEFAULT_RPG_STATE,
  DEFAULT_SANDBOX_STATE,
  getStatePreset,
  loseLife,
  placeBlock,
  PLATFORMER_STATE_PRESET,
  PUZZLE_STATE_PRESET,
  removeBlock,
  RPG_STATE_PRESET,
  SANDBOX_STATE_PRESET,
  unlockLevel,
  type InventoryItem,
  type RPGState,
} from '../src/state';

describe('Default States', () => {
  describe('DEFAULT_RPG_STATE', () => {
    it('has valid player stats', () => {
      const { player } = DEFAULT_RPG_STATE;

      expect(player.level).toBe(1);
      expect(player.experience).toBe(0);
      expect(player.health).toBe(100);
      expect(player.maxHealth).toBe(100);
      expect(player.mana).toBe(50);
      expect(player.maxMana).toBe(50);
      expect(player.strength).toBe(10);
      expect(player.dexterity).toBe(10);
      expect(player.intelligence).toBe(10);
    });

    it('starts with empty inventory', () => {
      expect(DEFAULT_RPG_STATE.inventory).toHaveLength(0);
      expect(DEFAULT_RPG_STATE.gold).toBe(0);
    });

    it('starts at starting village', () => {
      expect(DEFAULT_RPG_STATE.currentLocation).toBe('starting_village');
      expect(DEFAULT_RPG_STATE.visitedLocations).toContain('starting_village');
    });
  });

  describe('DEFAULT_PUZZLE_STATE', () => {
    it('starts at level 1', () => {
      expect(DEFAULT_PUZZLE_STATE.currentLevel).toBe(1);
      expect(DEFAULT_PUZZLE_STATE.score).toBe(0);
      expect(DEFAULT_PUZZLE_STATE.moves).toBe(0);
    });

    it('has hints available', () => {
      expect(DEFAULT_PUZZLE_STATE.hints).toBeGreaterThan(0);
    });

    it('starts not paused', () => {
      expect(DEFAULT_PUZZLE_STATE.isPaused).toBe(false);
    });

    it('has first level unlocked', () => {
      expect(DEFAULT_PUZZLE_STATE.unlockedLevels).toContain(1);
    });
  });

  describe('DEFAULT_PLATFORMER_STATE', () => {
    it('starts with lives', () => {
      expect(DEFAULT_PLATFORMER_STATE.lives).toBe(3);
      expect(DEFAULT_PLATFORMER_STATE.maxLives).toBe(5);
    });

    it('starts with no coins or score', () => {
      expect(DEFAULT_PLATFORMER_STATE.coins).toBe(0);
      expect(DEFAULT_PLATFORMER_STATE.score).toBe(0);
    });

    it('starts at world 1, level 1', () => {
      expect(DEFAULT_PLATFORMER_STATE.currentWorld).toBe(1);
      expect(DEFAULT_PLATFORMER_STATE.currentLevel).toBe(1);
    });
  });

  describe('DEFAULT_SANDBOX_STATE', () => {
    it('starts with empty world', () => {
      expect(DEFAULT_SANDBOX_STATE.blocks).toHaveLength(0);
      expect(DEFAULT_SANDBOX_STATE.entities).toHaveLength(0);
    });

    it('starts with clear weather', () => {
      expect(DEFAULT_SANDBOX_STATE.weather).toBe('clear');
    });

    it('starts in survival mode', () => {
      expect(DEFAULT_SANDBOX_STATE.gameMode).toBe('survival');
      expect(DEFAULT_SANDBOX_STATE.difficulty).toBe('normal');
    });
  });
});

describe('State Presets', () => {
  it('has all expected presets', () => {
    expect(ALL_STATE_PRESETS).toHaveLength(5);
  });

  it.each([
    ['rpg', RPG_STATE_PRESET],
    ['puzzle', PUZZLE_STATE_PRESET],
    ['platformer', PLATFORMER_STATE_PRESET],
    ['sandbox', SANDBOX_STATE_PRESET],
    ['counter', COUNTER_STATE_PRESET],
  ] as const)('preset "%s" has required properties', (name, preset) => {
    expect(preset.name).toBe(name);
    expect(typeof preset.description).toBe('string');
    expect(preset.description.length).toBeGreaterThan(0);
    expect(preset).toHaveProperty('initialState');
    expect(preset).toHaveProperty('autoSaveConfig');
    expect(typeof preset.maxUndoSize).toBe('number');
    expect(preset.maxUndoSize).toBeGreaterThan(0);
  });

  it.each([
    ['rpg', RPG_STATE_PRESET],
    ['puzzle', PUZZLE_STATE_PRESET],
    ['platformer', PLATFORMER_STATE_PRESET],
    ['sandbox', SANDBOX_STATE_PRESET],
    ['counter', COUNTER_STATE_PRESET],
  ] as const)('preset "%s" has valid autosave config', (_name, preset) => {
    const config = preset.autoSaveConfig;
    expect(typeof config.enabled).toBe('boolean');

    if (config.enabled) {
      expect(config.intervalMs).toBeGreaterThan(0);
      expect(config.maxSlots).toBeGreaterThan(0);
      expect(typeof config.storageKey).toBe('string');
    }
  });
});

describe('Autosave Configs', () => {
  it('frequent has short interval', () => {
    expect(AUTOSAVE_CONFIG_FREQUENT.intervalMs).toBeLessThanOrEqual(30000);
    expect(AUTOSAVE_CONFIG_FREQUENT.saveOnChange).toBe(true);
  });

  it('moderate has medium interval', () => {
    expect(AUTOSAVE_CONFIG_MODERATE.intervalMs).toBe(120000);
    expect(AUTOSAVE_CONFIG_MODERATE.saveOnChange).toBe(false);
  });

  it('infrequent has long interval', () => {
    expect(AUTOSAVE_CONFIG_INFREQUENT.intervalMs).toBeGreaterThanOrEqual(300000);
  });

  it('disabled is fully off', () => {
    expect(AUTOSAVE_CONFIG_DISABLED.enabled).toBe(false);
    expect(AUTOSAVE_CONFIG_DISABLED.intervalMs).toBe(0);
    expect(AUTOSAVE_CONFIG_DISABLED.maxSlots).toBe(0);
  });
});

describe('getStatePreset', () => {
  it('returns correct preset by name', () => {
    expect(getStatePreset('rpg')?.name).toBe('rpg');
    expect(getStatePreset('puzzle')?.name).toBe('puzzle');
    expect(getStatePreset('platformer')?.name).toBe('platformer');
    expect(getStatePreset('sandbox')?.name).toBe('sandbox');
    expect(getStatePreset('counter')?.name).toBe('counter');
  });
});

describe('State Factory Functions', () => {
  describe('createRPGState', () => {
    it('creates default state', () => {
      const state = createRPGState();
      expect(state.player.level).toBe(1);
      expect(state.inventory).toHaveLength(0);
    });

    it('allows overrides', () => {
      const state = createRPGState({ gold: 500, currentLocation: 'castle' });
      expect(state.gold).toBe(500);
      expect(state.currentLocation).toBe('castle');
    });
  });

  describe('createPuzzleState', () => {
    it('creates default state', () => {
      const state = createPuzzleState();
      expect(state.currentLevel).toBe(1);
      expect(state.score).toBe(0);
    });

    it('allows overrides', () => {
      const state = createPuzzleState({ currentLevel: 5, score: 1000 });
      expect(state.currentLevel).toBe(5);
      expect(state.score).toBe(1000);
    });
  });

  describe('createPlatformerState', () => {
    it('creates default state', () => {
      const state = createPlatformerState();
      expect(state.lives).toBe(3);
      expect(state.coins).toBe(0);
    });

    it('allows overrides', () => {
      const state = createPlatformerState({ lives: 5, coins: 50 });
      expect(state.lives).toBe(5);
      expect(state.coins).toBe(50);
    });
  });

  describe('createSandboxState', () => {
    it('creates state with random seed', () => {
      const state1 = createSandboxState();
      const state2 = createSandboxState();

      // Seeds should be different (generated from Date.now())
      // There's a tiny chance they could be the same if called in same ms
      expect(state1.worldSeed).toBeGreaterThan(0);
      expect(state2.worldSeed).toBeGreaterThan(0);
    });

    it('allows custom seed', () => {
      const state = createSandboxState({ worldSeed: 42 });
      expect(state.worldSeed).toBe(42);
    });

    it('allows overrides', () => {
      const state = createSandboxState({
        worldName: 'My World',
        gameMode: 'creative',
        difficulty: 'peaceful',
      });
      expect(state.worldName).toBe('My World');
      expect(state.gameMode).toBe('creative');
      expect(state.difficulty).toBe('peaceful');
    });
  });
});

describe('RPG State Helpers', () => {
  describe('addExperience', () => {
    it('adds experience without leveling', () => {
      const state = createRPGState();
      const updated = addExperience(state, 50);

      expect(updated.player.experience).toBe(50);
      expect(updated.player.level).toBe(1);
    });

    it('levels up at threshold', () => {
      const state = createRPGState();
      // Level 1 needs 100 exp
      const updated = addExperience(state, 100);

      expect(updated.player.level).toBe(2);
      expect(updated.player.experience).toBe(0);
    });

    it('handles multiple level-ups', () => {
      const state = createRPGState();
      // Level 1 needs 100, level 2 needs 200 => 300 total
      const updated = addExperience(state, 300);

      expect(updated.player.level).toBe(3);
      expect(updated.player.experience).toBe(0);
    });

    it('increases max health on level up', () => {
      const state = createRPGState();
      const updated = addExperience(state, 100);

      expect(updated.player.maxHealth).toBe(110);
      expect(updated.player.health).toBe(110);
    });

    it('increases max mana on level up', () => {
      const state = createRPGState();
      const updated = addExperience(state, 100);

      expect(updated.player.maxMana).toBe(55);
      expect(updated.player.mana).toBe(55);
    });

    it('does not mutate original state', () => {
      const state = createRPGState();
      addExperience(state, 100);

      expect(state.player.level).toBe(1);
      expect(state.player.experience).toBe(0);
    });
  });

  describe('addInventoryItem', () => {
    it('adds new item', () => {
      const state = createRPGState();
      const item: InventoryItem = {
        id: 'sword1',
        name: 'Iron Sword',
        quantity: 1,
        type: 'weapon',
      };

      const updated = addInventoryItem(state, item);
      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0].name).toBe('Iron Sword');
    });

    it('stacks consumable items', () => {
      const state = createRPGState();
      const potion: InventoryItem = {
        id: 'potion1',
        name: 'Health Potion',
        quantity: 1,
        type: 'consumable',
      };

      let updated = addInventoryItem(state, potion);
      updated = addInventoryItem(updated, { ...potion, quantity: 3 });

      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0].quantity).toBe(4);
    });

    it('does not stack weapons', () => {
      const state = createRPGState();
      const sword: InventoryItem = {
        id: 'sword1',
        name: 'Iron Sword',
        quantity: 1,
        type: 'weapon',
      };

      let updated = addInventoryItem(state, sword);
      updated = addInventoryItem(updated, { ...sword });

      expect(updated.inventory).toHaveLength(2);
    });

    it('does not stack armor', () => {
      const state = createRPGState();
      const armor: InventoryItem = {
        id: 'armor1',
        name: 'Leather Armor',
        quantity: 1,
        type: 'armor',
      };

      let updated = addInventoryItem(state, armor);
      updated = addInventoryItem(updated, { ...armor });

      expect(updated.inventory).toHaveLength(2);
    });

    it('does not mutate original state', () => {
      const state = createRPGState();
      const item: InventoryItem = {
        id: 'key1',
        name: 'Golden Key',
        quantity: 1,
        type: 'key',
      };

      addInventoryItem(state, item);
      expect(state.inventory).toHaveLength(0);
    });
  });

  describe('completeQuest', () => {
    it('marks quest as completed', () => {
      const state = createRPGState({
        quests: [
          {
            id: 'q1',
            name: 'Find the key',
            description: 'Find the key to the castle',
            status: 'active',
            progress: 1,
            maxProgress: 1,
          },
        ],
      });

      const updated = completeQuest(state, 'q1');
      expect(updated.quests[0].status).toBe('completed');
    });

    it('grants experience rewards', () => {
      const state = createRPGState({
        quests: [
          {
            id: 'q1',
            name: 'Test',
            description: 'Test',
            status: 'active',
            progress: 1,
            maxProgress: 1,
            rewards: { experience: 50 },
          },
        ],
      });

      const updated = completeQuest(state, 'q1');
      expect(updated.player.experience).toBe(50);
    });

    it('grants gold rewards', () => {
      const state = createRPGState({
        quests: [
          {
            id: 'q1',
            name: 'Test',
            description: 'Test',
            status: 'active',
            progress: 1,
            maxProgress: 1,
            rewards: { gold: 100 },
          },
        ],
      });

      const updated = completeQuest(state, 'q1');
      expect(updated.gold).toBe(100);
    });

    it('returns unchanged state for unknown quest', () => {
      const state = createRPGState();
      const updated = completeQuest(state, 'nonexistent');
      expect(updated).toBe(state);
    });
  });
});

describe('Puzzle State Helpers', () => {
  describe('unlockLevel', () => {
    it('unlocks a new level', () => {
      const state = createPuzzleState();
      const updated = unlockLevel(state, 2);

      expect(updated.unlockedLevels).toContain(2);
    });

    it('does not duplicate already unlocked levels', () => {
      const state = createPuzzleState();
      const updated = unlockLevel(state, 1);

      expect(updated.unlockedLevels.filter((l) => l === 1)).toHaveLength(1);
    });

    it('sorts unlocked levels', () => {
      let state = createPuzzleState();
      state = unlockLevel(state, 5);
      state = unlockLevel(state, 3);

      expect(state.unlockedLevels).toEqual([1, 3, 5]);
    });
  });
});

describe('Platformer State Helpers', () => {
  describe('collectCoin', () => {
    it('adds coins', () => {
      const state = createPlatformerState();
      const updated = collectCoin(state, 5);

      expect(updated.coins).toBe(5);
    });

    it('adds score', () => {
      const state = createPlatformerState();
      const updated = collectCoin(state, 1);

      expect(updated.score).toBe(10);
    });

    it('grants extra life at 100 coins', () => {
      const state = createPlatformerState({ coins: 99 });
      const updated = collectCoin(state, 1);

      expect(updated.lives).toBe(4); // 3 + 1
      expect(updated.coins).toBe(0); // 100 % 100
    });

    it('does not exceed max lives', () => {
      const state = createPlatformerState({ lives: 5, coins: 99 });
      const updated = collectCoin(state, 1);

      expect(updated.lives).toBe(5); // maxLives
    });
  });

  describe('loseLife', () => {
    it('decrements lives', () => {
      const state = createPlatformerState();
      const updated = loseLife(state);

      expect(updated.lives).toBe(2);
    });

    it('does not go below 0', () => {
      const state = createPlatformerState({ lives: 0 });
      const updated = loseLife(state);

      expect(updated.lives).toBe(0);
    });
  });
});

describe('Sandbox State Helpers', () => {
  describe('placeBlock', () => {
    it('adds a block', () => {
      const state = createSandboxState();
      const updated = placeBlock(state, {
        id: 'b1',
        type: 'stone',
        position: { x: 0, y: 0, z: 0 },
      });

      expect(updated.blocks).toHaveLength(1);
    });

    it('replaces block at same position', () => {
      let state = createSandboxState();
      state = placeBlock(state, {
        id: 'b1',
        type: 'stone',
        position: { x: 0, y: 0, z: 0 },
      });
      state = placeBlock(state, {
        id: 'b2',
        type: 'wood',
        position: { x: 0, y: 0, z: 0 },
      });

      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].type).toBe('wood');
    });

    it('does not replace at different position', () => {
      let state = createSandboxState();
      state = placeBlock(state, {
        id: 'b1',
        type: 'stone',
        position: { x: 0, y: 0, z: 0 },
      });
      state = placeBlock(state, {
        id: 'b2',
        type: 'wood',
        position: { x: 1, y: 0, z: 0 },
      });

      expect(state.blocks).toHaveLength(2);
    });
  });

  describe('removeBlock', () => {
    it('removes block at position', () => {
      let state = createSandboxState();
      state = placeBlock(state, {
        id: 'b1',
        type: 'stone',
        position: { x: 0, y: 0, z: 0 },
      });
      state = removeBlock(state, { x: 0, y: 0, z: 0 });

      expect(state.blocks).toHaveLength(0);
    });

    it('does nothing for empty position', () => {
      const state = createSandboxState();
      const updated = removeBlock(state, { x: 5, y: 5, z: 5 });

      expect(updated.blocks).toHaveLength(0);
    });

    it('only removes matching position', () => {
      let state = createSandboxState();
      state = placeBlock(state, {
        id: 'b1',
        type: 'stone',
        position: { x: 0, y: 0, z: 0 },
      });
      state = placeBlock(state, {
        id: 'b2',
        type: 'wood',
        position: { x: 1, y: 0, z: 0 },
      });
      state = removeBlock(state, { x: 0, y: 0, z: 0 });

      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].type).toBe('wood');
    });
  });
});
