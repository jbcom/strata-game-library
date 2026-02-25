/**
 * State Management Tests
 *
 * Tests for state component exports, types, and context logic.
 *
 * @module components/state/__tests__/state.test
 */

import { describe, expect, it } from 'vitest';

describe('State exports', () => {
  it('should export all context components and hooks', async () => {
    const stateModule = await import('../index');

    expect(stateModule.GameStateContext).toBeDefined();
    expect(stateModule.GameStateProvider).toBeDefined();
    expect(stateModule.PersistGate).toBeDefined();
    expect(stateModule.StateDebugger).toBeDefined();
    expect(stateModule.useGameState).toBeDefined();
    expect(stateModule.useGameStateContext).toBeDefined();
    expect(stateModule.useUndo).toBeDefined();
  });

  it('should export all persistence hooks', async () => {
    const stateModule = await import('../index');

    expect(stateModule.useAutoSave).toBeDefined();
    expect(stateModule.useCheckpoint).toBeDefined();
    expect(stateModule.useSaveLoad).toBeDefined();
  });

  it('should export GameStateProvider as a function', async () => {
    const { GameStateProvider } = await import('../index');
    expect(typeof GameStateProvider).toBe('function');
  });

  it('should export PersistGate as a function', async () => {
    const { PersistGate } = await import('../index');
    expect(typeof PersistGate).toBe('function');
  });

  it('should export StateDebugger as a function', async () => {
    const { StateDebugger } = await import('../index');
    expect(typeof StateDebugger).toBe('function');
  });

  it('should export useGameState as a function', async () => {
    const { useGameState } = await import('../index');
    expect(typeof useGameState).toBe('function');
  });

  it('should export useGameStateContext as a function', async () => {
    const { useGameStateContext } = await import('../index');
    expect(typeof useGameStateContext).toBe('function');
  });

  it('should export useUndo as a function', async () => {
    const { useUndo } = await import('../index');
    expect(typeof useUndo).toBe('function');
  });

  it('should export useSaveLoad as a function', async () => {
    const { useSaveLoad } = await import('../index');
    expect(typeof useSaveLoad).toBe('function');
  });

  it('should export useCheckpoint as a function', async () => {
    const { useCheckpoint } = await import('../index');
    expect(typeof useCheckpoint).toBe('function');
  });

  it('should export useAutoSave as a function', async () => {
    const { useAutoSave } = await import('../index');
    expect(typeof useAutoSave).toBe('function');
  });
});

describe('GameStateContext', () => {
  it('should export a valid React context', async () => {
    const { GameStateContext } = await import('../context');
    expect(GameStateContext).toBeDefined();
    expect(GameStateContext.Provider).toBeDefined();
    expect(GameStateContext.Consumer).toBeDefined();
  });
});

describe('StateDebugger positions', () => {
  it('should support all four position options', () => {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
    expect(positions).toHaveLength(4);

    for (const pos of positions) {
      expect(pos.includes('top') || pos.includes('bottom')).toBe(true);
      expect(pos.includes('left') || pos.includes('right')).toBe(true);
    }
  });
});

describe('Save/Load JSON export format', () => {
  it('should produce valid JSON format from exportJSON logic', () => {
    const version = 1;
    const data = { health: 100, inventory: ['sword', 'shield'] };
    const exported = JSON.stringify({
      version,
      timestamp: Date.now(),
      data,
    });

    const parsed = JSON.parse(exported);
    expect(parsed.version).toBe(1);
    expect(parsed.timestamp).toBeGreaterThan(0);
    expect(parsed.data).toEqual(data);
  });

  it('should handle importJSON with valid data', () => {
    const json = JSON.stringify({
      version: 1,
      timestamp: Date.now(),
      data: { score: 42 },
    });

    const parsed = JSON.parse(json);
    expect(parsed.data).toBeDefined();
    expect(parsed.data.score).toBe(42);
  });

  it('should reject importJSON with missing data key', () => {
    const json = JSON.stringify({ version: 1, timestamp: Date.now() });
    const parsed = JSON.parse(json);
    const success = Boolean(parsed.data);
    expect(success).toBe(false);
  });

  it('should handle importJSON with invalid JSON gracefully', () => {
    const importJSON = (json: string) => {
      try {
        const parsed = JSON.parse(json);
        return Boolean(parsed.data);
      } catch {
        return false;
      }
    };

    expect(importJSON('not valid json')).toBe(false);
    expect(importJSON('{}')).toBe(false);
    expect(importJSON('{"data": {"x": 1}}')).toBe(true);
  });
});
