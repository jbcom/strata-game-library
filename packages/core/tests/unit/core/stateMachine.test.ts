/**
 * State Machine Unit Tests
 *
 * Comprehensive tests for the StateMachine class and related utilities.
 * Tests cover state transitions, history tracking, context management,
 * pause/resume functionality, and factory functions.
 *
 * @module core/stateMachine.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import {
  createDefaultAIContext,
  createState,
  createStateMachine,
  createTransition,
  StateMachine,
  type StateMachineConfig,
} from '../../../src/core/stateMachine';

// Test context type
interface TestContext {
  count: number;
  isReady: boolean;
  name: string;
}

// Helper to create a basic test config
function createTestConfig(initialState = 'idle'): StateMachineConfig<TestContext> {
  return {
    initialState,
    states: [
      { name: 'idle', callbacks: {} },
      { name: 'running', callbacks: {} },
      { name: 'paused', callbacks: {} },
    ],
    transitions: [
      { from: 'idle', to: 'running', condition: (ctx) => ctx.isReady },
      { from: 'running', to: 'paused', condition: (ctx) => ctx.count > 5 },
      { from: 'paused', to: 'idle', condition: (ctx) => ctx.count === 0 },
    ],
  };
}

// Helper to create a default test context
function createTestContext(): TestContext {
  return { count: 0, isReady: false, name: 'test' };
}

describe('StateMachine', () => {
  describe('constructor and initialization', () => {
    it('creates state machine with initial state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getCurrentState()).toBe('idle');
    });

    it('stores all states in internal map', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.hasState('idle')).toBe(true);
      expect(sm.hasState('running')).toBe(true);
      expect(sm.hasState('paused')).toBe(true);
      expect(sm.hasState('nonexistent')).toBe(false);
    });

    it('sorts transitions by priority (descending)', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'a', callbacks: {} },
          { name: 'b', callbacks: {} },
        ],
        transitions: [
          { from: 'idle', to: 'a', condition: () => true, priority: 1 },
          { from: 'idle', to: 'b', condition: () => true, priority: 10 },
        ],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Higher priority transition to 'b' should be checked first
      const available = sm.getAvailableTransitions();
      expect(available).toEqual(['b', 'a']);
    });

    it('uses default maxHistoryLength of 50 when not specified', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Perform 60 transitions to exceed default max history
      for (let i = 0; i < 60; i++) {
        sm.transitionTo(i % 2 === 0 ? 'running' : 'idle');
      }

      // History should be capped at 50
      expect(sm.getHistory().length).toBe(50);
    });

    it('respects custom maxHistoryLength', () => {
      const config: StateMachineConfig<TestContext> = {
        ...createTestConfig('idle'),
        maxHistoryLength: 5,
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      for (let i = 0; i < 10; i++) {
        sm.transitionTo(i % 2 === 0 ? 'running' : 'idle');
      }

      expect(sm.getHistory().length).toBe(5);
    });

    it('calls onEnter for initial state', () => {
      const onEnter = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onEnter } }],
        transitions: [],
      };
      const context = createTestContext();
      new StateMachine(config, context);

      expect(onEnter).toHaveBeenCalledOnce();
      expect(onEnter).toHaveBeenCalledWith(context);
    });

    it('handles non-existent initial state gracefully', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'nonexistent',
        states: [{ name: 'idle', callbacks: {} }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getCurrentState()).toBeNull();
    });
  });

  describe('state transitions', () => {
    it('transitions to valid state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const result = sm.transitionTo('running');

      expect(result).toBe(true);
      expect(sm.getCurrentState()).toBe('running');
    });

    it('returns false when transitioning to non-existent state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = sm.transitionTo('nonexistent');

      expect(result).toBe(false);
      expect(sm.getCurrentState()).toBe('idle');
      expect(consoleSpy).toHaveBeenCalledWith('StateMachine: State "nonexistent" not found');
      consoleSpy.mockRestore();
    });

    it('sets previous state after transition', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getPreviousState()).toBeNull();

      sm.transitionTo('running');

      expect(sm.getPreviousState()).toBe('idle');
      expect(sm.getCurrentState()).toBe('running');
    });

    it('calls onExit for current state during transition', () => {
      const onExit = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: { onExit } },
          { name: 'running', callbacks: {} },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');

      expect(onExit).toHaveBeenCalledOnce();
      expect(onExit).toHaveBeenCalledWith(context);
    });

    it('calls onEnter for new state during transition', () => {
      const onEnter = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'running', callbacks: { onEnter } },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');

      expect(onEnter).toHaveBeenCalledOnce();
      expect(onEnter).toHaveBeenCalledWith(context);
    });

    it('calls callbacks in correct order: onExit then onEnter', () => {
      const callOrder: string[] = [];
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          {
            name: 'idle',
            callbacks: { onExit: () => callOrder.push('idle:exit') },
          },
          {
            name: 'running',
            callbacks: { onEnter: () => callOrder.push('running:enter') },
          },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');

      expect(callOrder).toEqual(['idle:exit', 'running:enter']);
    });

    it('adds transition to history', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');

      const history = sm.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].stateName).toBe('idle');
      expect(history[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('forceTransition is alias for transitionTo', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const result = sm.forceTransition('running');

      expect(result).toBe(true);
      expect(sm.getCurrentState()).toBe('running');
    });
  });

  describe('update loop', () => {
    it('calls onUpdate for current state', () => {
      const onUpdate = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onUpdate } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.update(0.016);

      expect(onUpdate).toHaveBeenCalledOnce();
      expect(onUpdate).toHaveBeenCalledWith(context, 0.016);
    });

    it('does not update when paused', () => {
      const onUpdate = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onUpdate } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.pause();
      sm.update(0.016);

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('does not update when no current state', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'nonexistent',
        states: [],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Should not throw
      expect(() => sm.update(0.016)).not.toThrow();
    });

    it('evaluates transitions in priority order during update', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'a', callbacks: {} },
          { name: 'b', callbacks: {} },
        ],
        transitions: [
          { from: 'idle', to: 'a', condition: () => true, priority: 1 },
          { from: 'idle', to: 'b', condition: () => true, priority: 10 },
        ],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.update(0.016);

      // Higher priority transition to 'b' should be taken
      expect(sm.getCurrentState()).toBe('b');
    });

    it('executes automatic transition when condition is met', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      context.isReady = true;
      const sm = new StateMachine(config, context);

      sm.update(0.016);

      expect(sm.getCurrentState()).toBe('running');
    });

    it('does not transition when condition is not met', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      context.isReady = false;
      const sm = new StateMachine(config, context);

      sm.update(0.016);

      expect(sm.getCurrentState()).toBe('idle');
    });

    it('only executes first matching transition', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'a', callbacks: {} },
          { name: 'b', callbacks: {} },
        ],
        transitions: [
          { from: 'idle', to: 'a', condition: () => true, priority: 10 },
          { from: 'idle', to: 'b', condition: () => true, priority: 5 },
        ],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.update(0.016);

      expect(sm.getCurrentState()).toBe('a');
    });
  });

  describe('pause and resume', () => {
    it('pause() sets paused state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.isPausedState()).toBe(false);

      sm.pause();

      expect(sm.isPausedState()).toBe(true);
    });

    it('resume() clears paused state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.pause();
      sm.resume();

      expect(sm.isPausedState()).toBe(false);
    });

    it('update continues to work after resume', () => {
      const onUpdate = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onUpdate } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.pause();
      sm.update(0.016);
      expect(onUpdate).not.toHaveBeenCalled();

      sm.resume();
      sm.update(0.016);
      expect(onUpdate).toHaveBeenCalledOnce();
    });
  });

  describe('context management', () => {
    it('getContext returns the current context', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getContext()).toBe(context);
    });

    it('setContext replaces the entire context', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const newContext = { count: 10, isReady: true, name: 'new' };
      sm.setContext(newContext);

      expect(sm.getContext()).toBe(newContext);
      expect(sm.getContext().count).toBe(10);
    });

    it('updateContext merges updates into existing context', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.updateContext({ count: 5 });

      const updatedContext = sm.getContext();
      expect(updatedContext.count).toBe(5);
      expect(updatedContext.isReady).toBe(false);
      expect(updatedContext.name).toBe('test');
    });

    it('updateContext creates new context object', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.updateContext({ count: 5 });

      expect(sm.getContext()).not.toBe(context);
    });
  });

  describe('state time tracking', () => {
    it('getStateTime returns time since state started', async () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Wait a small amount (use longer delay for CI reliability)
      await new Promise((resolve) => setTimeout(resolve, 25));

      const time = sm.getStateTime();
      // Use tolerance to account for timing variations in CI
      expect(time).toBeGreaterThanOrEqual(20);
    });

    it('state time resets after transition', async () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Wait a bit in idle state (use longer delay for CI reliability)
      await new Promise((resolve) => setTimeout(resolve, 50));

      const timeBeforeTransition = sm.getStateTime();
      // Use tolerance to account for timing variations in CI
      expect(timeBeforeTransition).toBeGreaterThanOrEqual(40);

      sm.transitionTo('running');

      const timeAfterTransition = sm.getStateTime();
      expect(timeAfterTransition).toBeLessThan(timeBeforeTransition);
    });
  });

  describe('history management', () => {
    it('getHistory returns copy of history array', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      const history1 = sm.getHistory();
      const history2 = sm.getHistory();

      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });

    it('history records state name, timestamp, and duration', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');

      const history = sm.getHistory();
      expect(history[0]).toHaveProperty('stateName', 'idle');
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('duration');
      expect(typeof history[0].timestamp).toBe('number');
      expect(typeof history[0].duration).toBe('number');
    });

    it('clearHistory empties the history array', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      sm.transitionTo('paused');
      expect(sm.getHistory().length).toBe(2);

      sm.clearHistory();

      expect(sm.getHistory().length).toBe(0);
    });

    it('history trims oldest entries when exceeding maxHistoryLength', () => {
      const config: StateMachineConfig<TestContext> = {
        ...createTestConfig('idle'),
        maxHistoryLength: 3,
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      sm.transitionTo('paused');
      sm.transitionTo('idle');
      sm.transitionTo('running');

      const history = sm.getHistory();
      expect(history.length).toBe(3);
      // First entry (idle) should have been removed
      expect(history[0].stateName).toBe('running');
      expect(history[1].stateName).toBe('paused');
      expect(history[2].stateName).toBe('idle');
    });
  });

  describe('state management', () => {
    it('addState adds new state to the machine', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.hasState('newState')).toBe(false);

      sm.addState({ name: 'newState', callbacks: {} });

      expect(sm.hasState('newState')).toBe(true);
    });

    it('addState overwrites existing state with same name', () => {
      const onEnter1 = vi.fn();
      const onEnter2 = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onEnter: onEnter1 } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.addState({ name: 'idle', callbacks: { onEnter: onEnter2 } });
      sm.transitionTo('idle');

      expect(onEnter1).toHaveBeenCalledOnce(); // Initial enter
      expect(onEnter2).toHaveBeenCalledOnce(); // After adding new state
    });

    it('removeState removes existing state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.hasState('running')).toBe(true);

      const result = sm.removeState('running');

      expect(result).toBe(true);
      expect(sm.hasState('running')).toBe(false);
    });

    it('removeState returns false when removing current state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const result = sm.removeState('idle');

      expect(result).toBe(false);
      expect(sm.hasState('idle')).toBe(true);
    });

    it('removeState returns false for non-existent state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const result = sm.removeState('nonexistent');

      expect(result).toBe(false);
    });

    it('hasState returns correct boolean', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.hasState('idle')).toBe(true);
      expect(sm.hasState('running')).toBe(true);
      expect(sm.hasState('nonexistent')).toBe(false);
    });
  });

  describe('transition management', () => {
    it('addTransition adds new transition', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.addTransition({
        from: 'idle',
        to: 'paused',
        condition: () => true,
      });

      const available = sm.getAvailableTransitions();
      expect(available).toContain('paused');
    });

    it('addTransition maintains priority order', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'a', callbacks: {} },
          { name: 'b', callbacks: {} },
          { name: 'c', callbacks: {} },
        ],
        transitions: [{ from: 'idle', to: 'a', condition: () => true, priority: 5 }],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.addTransition({
        from: 'idle',
        to: 'b',
        condition: () => true,
        priority: 10,
      });
      sm.addTransition({
        from: 'idle',
        to: 'c',
        condition: () => true,
        priority: 1,
      });

      const available = sm.getAvailableTransitions();
      expect(available).toEqual(['b', 'a', 'c']);
    });

    it('removeTransition removes existing transition', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Initially has idle -> running transition
      expect(sm.getAvailableTransitions()).toContain('running');

      const result = sm.removeTransition('idle', 'running');

      expect(result).toBe(true);
      expect(sm.getAvailableTransitions()).not.toContain('running');
    });

    it('removeTransition returns false for non-existent transition', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const result = sm.removeTransition('idle', 'nonexistent');

      expect(result).toBe(false);
    });

    it('getAvailableTransitions returns transitions from current state', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          { name: 'running', callbacks: {} },
          { name: 'paused', callbacks: {} },
        ],
        transitions: [
          { from: 'idle', to: 'running', condition: () => true },
          { from: 'idle', to: 'paused', condition: () => true },
          { from: 'running', to: 'idle', condition: () => true },
        ],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getAvailableTransitions()).toEqual(['running', 'paused']);

      sm.transitionTo('running');

      expect(sm.getAvailableTransitions()).toEqual(['idle']);
    });

    it('getAvailableTransitions returns empty array when no current state', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'nonexistent',
        states: [],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(sm.getAvailableTransitions()).toEqual([]);
    });
  });

  describe('reset', () => {
    it('reset clears current state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.reset();

      expect(sm.getCurrentState()).toBeNull();
    });

    it('reset clears previous state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      sm.reset();

      expect(sm.getPreviousState()).toBeNull();
    });

    it('reset calls onExit for current state', () => {
      const onExit = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onExit } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.reset();

      expect(onExit).toHaveBeenCalledOnce();
      expect(onExit).toHaveBeenCalledWith(context);
    });

    it('reset clears history', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      sm.transitionTo('paused');
      sm.reset();

      expect(sm.getHistory().length).toBe(0);
    });

    it('reset clears paused state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.pause();
      sm.reset();

      expect(sm.isPausedState()).toBe(false);
    });

    it('reset resets state start time', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.reset();

      expect(sm.getStateTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('serialize', () => {
    it('serializes current state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('currentState', 'idle');
    });

    it('serializes previous state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('previousState', 'idle');
    });

    it('serializes null states correctly', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'nonexistent',
        states: [],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('currentState', null);
      expect(serialized).toHaveProperty('previousState', null);
    });

    it('serializes stateStartTime', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('stateStartTime');
      expect(typeof (serialized as any).stateStartTime).toBe('number');
    });

    it('serializes history', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.transitionTo('running');
      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('history');
      expect((serialized as any).history.length).toBe(1);
    });

    it('serializes isPaused state', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      sm.pause();
      const serialized = sm.serialize();

      expect(serialized).toHaveProperty('isPaused', true);
    });
  });
});

describe('Factory Functions', () => {
  describe('createStateMachine', () => {
    it('creates a new StateMachine instance', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();

      const sm = createStateMachine(config, context);

      expect(sm).toBeInstanceOf(StateMachine);
      expect(sm.getCurrentState()).toBe('idle');
    });

    it('works with generic type parameter', () => {
      interface CustomContext {
        value: number;
      }

      const config: StateMachineConfig<CustomContext> = {
        initialState: 'start',
        states: [{ name: 'start', callbacks: {} }],
        transitions: [],
      };
      const context: CustomContext = { value: 42 };

      const sm = createStateMachine<CustomContext>(config, context);

      expect(sm.getContext().value).toBe(42);
    });
  });

  describe('createState', () => {
    it('creates a state with name and callbacks', () => {
      const onEnter = vi.fn();
      const onUpdate = vi.fn();
      const onExit = vi.fn();

      const state = createState<TestContext>('test', {
        onEnter,
        onUpdate,
        onExit,
      });

      expect(state.name).toBe('test');
      expect(state.callbacks.onEnter).toBe(onEnter);
      expect(state.callbacks.onUpdate).toBe(onUpdate);
      expect(state.callbacks.onExit).toBe(onExit);
    });

    it('creates a state with empty callbacks', () => {
      const state = createState<TestContext>('empty', {});

      expect(state.name).toBe('empty');
      expect(state.callbacks).toEqual({});
    });

    it('creates a state with partial callbacks', () => {
      const onEnter = vi.fn();

      const state = createState<TestContext>('partial', { onEnter });

      expect(state.name).toBe('partial');
      expect(state.callbacks.onEnter).toBe(onEnter);
      expect(state.callbacks.onUpdate).toBeUndefined();
      expect(state.callbacks.onExit).toBeUndefined();
    });
  });

  describe('createTransition', () => {
    it('creates a transition with required parameters', () => {
      const condition = vi.fn().mockReturnValue(true);

      const transition = createTransition<TestContext>('idle', 'running', condition);

      expect(transition.from).toBe('idle');
      expect(transition.to).toBe('running');
      expect(transition.condition).toBe(condition);
      expect(transition.priority).toBe(0);
    });

    it('creates a transition with custom priority', () => {
      const condition = vi.fn().mockReturnValue(true);

      const transition = createTransition<TestContext>('idle', 'running', condition, 10);

      expect(transition.priority).toBe(10);
    });

    it('condition receives context', () => {
      const condition = vi.fn((ctx: TestContext) => ctx.isReady);
      const transition = createTransition<TestContext>('idle', 'running', condition);

      const context = createTestContext();
      context.isReady = true;

      const result = transition.condition(context);

      expect(result).toBe(true);
      expect(condition).toHaveBeenCalledWith(context);
    });
  });
});

describe('AIContext and createDefaultAIContext', () => {
  it('creates default AI context with default position', () => {
    const context = createDefaultAIContext();

    expect(context.position).toBeInstanceOf(THREE.Vector3);
    expect(context.position.x).toBe(0);
    expect(context.position.y).toBe(0);
    expect(context.position.z).toBe(0);
  });

  it('creates default AI context with custom position', () => {
    const position = new THREE.Vector3(1, 2, 3);
    const context = createDefaultAIContext(position);

    expect(context.position.x).toBe(1);
    expect(context.position.y).toBe(2);
    expect(context.position.z).toBe(3);
  });

  it('clones the provided position', () => {
    const position = new THREE.Vector3(1, 2, 3);
    const context = createDefaultAIContext(position);

    position.set(10, 20, 30);

    // Context position should not be affected
    expect(context.position.x).toBe(1);
    expect(context.position.y).toBe(2);
    expect(context.position.z).toBe(3);
  });

  it('sets homePosition to clone of position', () => {
    const position = new THREE.Vector3(5, 5, 5);
    const context = createDefaultAIContext(position);

    expect(context.homePosition.equals(position)).toBe(true);
    expect(context.homePosition).not.toBe(position);
  });

  it('initializes all numeric properties correctly', () => {
    const context = createDefaultAIContext();

    expect(context.currentWaypointIndex).toBe(0);
    expect(context.speed).toBe(0);
    expect(context.maxSpeed).toBe(5);
    expect(context.detectionRadius).toBe(10);
    expect(context.fleeRadius).toBe(15);
    expect(context.health).toBe(100);
    expect(context.stamina).toBe(100);
    expect(context.lastSeenTime).toBe(0);
    expect(context.wanderAngle).toBe(0);
    expect(context.idleTimer).toBe(0);
    expect(context.patrolPauseTimer).toBe(0);
  });

  it('initializes boolean properties correctly', () => {
    const context = createDefaultAIContext();

    expect(context.isAlerted).toBe(false);
  });

  it('initializes nullable properties to null', () => {
    const context = createDefaultAIContext();

    expect(context.target).toBeNull();
    expect(context.threat).toBeNull();
    expect(context.lastSeenTarget).toBeNull();
  });

  it('initializes empty waypoints array', () => {
    const context = createDefaultAIContext();

    expect(context.waypoints).toEqual([]);
    expect(Array.isArray(context.waypoints)).toBe(true);
  });

  it('initializes THREE.js objects correctly', () => {
    const context = createDefaultAIContext();

    expect(context.rotation).toBeInstanceOf(THREE.Euler);
    expect(context.velocity).toBeInstanceOf(THREE.Vector3);
    expect(context.lookDirection).toBeInstanceOf(THREE.Vector3);
  });

  it('sets default look direction to forward (0, 0, 1)', () => {
    const context = createDefaultAIContext();

    expect(context.lookDirection.x).toBe(0);
    expect(context.lookDirection.y).toBe(0);
    expect(context.lookDirection.z).toBe(1);
  });

  it('initializes velocity to zero vector', () => {
    const context = createDefaultAIContext();

    expect(context.velocity.x).toBe(0);
    expect(context.velocity.y).toBe(0);
    expect(context.velocity.z).toBe(0);
  });

  it('initializes rotation to default Euler', () => {
    const context = createDefaultAIContext();

    expect(context.rotation.x).toBe(0);
    expect(context.rotation.y).toBe(0);
    expect(context.rotation.z).toBe(0);
  });
});

describe('Edge Cases and Complex Scenarios', () => {
  describe('complex state machine workflow', () => {
    it('handles full workflow: idle -> running -> paused -> idle', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Start idle
      expect(sm.getCurrentState()).toBe('idle');

      // Trigger transition to running
      context.isReady = true;
      sm.update(0.016);
      expect(sm.getCurrentState()).toBe('running');
      expect(sm.getPreviousState()).toBe('idle');

      // Trigger transition to paused
      context.count = 10;
      sm.update(0.016);
      expect(sm.getCurrentState()).toBe('paused');
      expect(sm.getPreviousState()).toBe('running');

      // Trigger transition back to idle
      context.count = 0;
      sm.update(0.016);
      expect(sm.getCurrentState()).toBe('idle');
      expect(sm.getPreviousState()).toBe('paused');

      // Check history
      const history = sm.getHistory();
      expect(history.length).toBe(3);
      expect(history.map((h) => h.stateName)).toEqual(['idle', 'running', 'paused']);
    });
  });

  describe('callback error handling', () => {
    it('propagates errors from onEnter callback', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          { name: 'idle', callbacks: {} },
          {
            name: 'error',
            callbacks: {
              onEnter: () => {
                throw new Error('onEnter error');
              },
            },
          },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(() => sm.transitionTo('error')).toThrow('onEnter error');
    });

    it('propagates errors from onExit callback', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          {
            name: 'idle',
            callbacks: {
              onExit: () => {
                throw new Error('onExit error');
              },
            },
          },
          { name: 'running', callbacks: {} },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(() => sm.transitionTo('running')).toThrow('onExit error');
    });

    it('propagates errors from onUpdate callback', () => {
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          {
            name: 'idle',
            callbacks: {
              onUpdate: () => {
                throw new Error('onUpdate error');
              },
            },
          },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      expect(() => sm.update(0.016)).toThrow('onUpdate error');
    });
  });

  describe('self-transitions', () => {
    it('allows transition to same state', () => {
      const onEnter = vi.fn();
      const onExit = vi.fn();
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [{ name: 'idle', callbacks: { onEnter, onExit } }],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      // Reset mock counts after initialization
      onEnter.mockClear();
      onExit.mockClear();

      sm.transitionTo('idle');

      expect(sm.getCurrentState()).toBe('idle');
      expect(sm.getPreviousState()).toBe('idle');
      expect(onExit).toHaveBeenCalledOnce();
      expect(onEnter).toHaveBeenCalledOnce();
    });
  });

  describe('dynamic state/transition modifications', () => {
    it('allows adding states during runtime', () => {
      const config = createTestConfig('idle');
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      const onEnter = vi.fn();
      sm.addState({ name: 'dynamic', callbacks: { onEnter } });
      sm.addTransition({
        from: 'idle',
        to: 'dynamic',
        condition: () => true,
      });

      sm.update(0.016);

      expect(sm.getCurrentState()).toBe('dynamic');
      expect(onEnter).toHaveBeenCalled();
    });
  });

  describe('concurrent updates', () => {
    it('handles rapid sequential updates correctly', () => {
      const updates: number[] = [];
      const config: StateMachineConfig<TestContext> = {
        initialState: 'idle',
        states: [
          {
            name: 'idle',
            callbacks: {
              onUpdate: (_ctx, dt) => updates.push(dt),
            },
          },
        ],
        transitions: [],
      };
      const context = createTestContext();
      const sm = new StateMachine(config, context);

      for (let i = 0; i < 100; i++) {
        sm.update(0.016);
      }

      expect(updates.length).toBe(100);
      expect(updates.every((dt) => dt === 0.016)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('works with complex context types', () => {
      interface ComplexContext {
        nested: {
          value: number;
          array: string[];
        };
        map: Map<string, number>;
      }

      const config: StateMachineConfig<ComplexContext> = {
        initialState: 'start',
        states: [
          {
            name: 'start',
            callbacks: {
              onUpdate: (ctx) => {
                ctx.nested.value += 1;
              },
            },
          },
        ],
        transitions: [],
      };

      const context: ComplexContext = {
        nested: { value: 0, array: ['a', 'b'] },
        map: new Map([['key', 1]]),
      };

      const sm = createStateMachine(config, context);
      sm.update(0.016);

      expect(sm.getContext().nested.value).toBe(1);
    });
  });
});
