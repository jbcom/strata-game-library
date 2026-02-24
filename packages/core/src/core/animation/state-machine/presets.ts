/**
 * Preset animation state machine factories.
 *
 * Provides pre-configured machines for common game animation patterns
 * like locomotion and combat.
 *
 * @module core/animation/state-machine
 */

import { createAnimationMachine } from './factory';
import type { AnimationMachineConfig, AnimationStateName } from './types';

/**
 * Creates a locomotion animation machine with standard movement states.
 *
 * @param animations - Map of state names to animation clip names
 * @returns Configured animation machine for locomotion
 *
 * @example
 * ```typescript
 * const locomotion = createLocomotionMachine({
 *   idle: 'Character_Idle',
 *   walk: 'Character_Walk',
 *   run: 'Character_Run',
 *   jump: 'Character_Jump'
 * });
 * ```
 */
export function createLocomotionMachine(
  animations: Partial<Record<'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land', string>>
) {
  const states: AnimationMachineConfig['states'] = {};
  const transitions: AnimationMachineConfig['transitions'] = [];

  if (animations.idle) {
    states.idle = { animation: animations.idle, loop: true };
    if (animations.walk) {
      transitions.push({ from: 'idle', to: 'walk', event: 'MOVE' });
    }
    if (animations.jump) {
      transitions.push({ from: 'idle', to: 'jump', event: 'JUMP' });
    }
  }

  if (animations.walk) {
    states.walk = { animation: animations.walk, loop: true };
    if (animations.idle) {
      transitions.push({ from: 'walk', to: 'idle', event: 'STOP' });
    }
    if (animations.run) {
      transitions.push({ from: 'walk', to: 'run', event: 'SPRINT' });
    }
    if (animations.jump) {
      transitions.push({ from: 'walk', to: 'jump', event: 'JUMP' });
    }
  }

  if (animations.run) {
    states.run = { animation: animations.run, loop: true };
    if (animations.walk) {
      transitions.push({ from: 'run', to: 'walk', event: 'WALK' });
    }
    if (animations.idle) {
      transitions.push({ from: 'run', to: 'idle', event: 'STOP' });
    }
    if (animations.jump) {
      transitions.push({ from: 'run', to: 'jump', event: 'JUMP' });
    }
  }

  if (animations.jump) {
    states.jump = { animation: animations.jump, loop: false };
    if (animations.fall) {
      transitions.push({ from: 'jump', to: 'fall', event: 'ANIMATION_COMPLETE' });
    } else if (animations.land) {
      transitions.push({ from: 'jump', to: 'land', event: 'ANIMATION_COMPLETE' });
    } else if (animations.idle) {
      transitions.push({ from: 'jump', to: 'idle', event: 'ANIMATION_COMPLETE' });
    }
  }

  if (animations.fall) {
    states.fall = { animation: animations.fall, loop: true };
    if (animations.land) {
      transitions.push({ from: 'fall', to: 'land', event: 'GROUND' });
    } else if (animations.idle) {
      transitions.push({ from: 'fall', to: 'idle', event: 'GROUND' });
    }
  }

  if (animations.land) {
    states.land = { animation: animations.land, loop: false };
    if (animations.idle) {
      transitions.push({ from: 'land', to: 'idle', event: 'ANIMATION_COMPLETE' });
    }
  }

  const initial = animations.idle ? 'idle' : Object.keys(states)[0];

  return createAnimationMachine({
    id: 'locomotion',
    initial: initial as AnimationStateName,
    states,
    transitions,
    defaultCrossFadeDuration: 0.2,
  });
}

/**
 * Creates a combat animation machine with attack and damage states.
 *
 * @param animations - Map of combat state names to animation clips
 * @returns Configured animation machine for combat
 *
 * @example
 * ```typescript
 * const combat = createCombatMachine({
 *   idle: 'Combat_Idle',
 *   attack: 'Attack_Slash',
 *   hit: 'Take_Damage',
 *   death: 'Death'
 * });
 * ```
 */
export function createCombatMachine(
  animations: Partial<Record<'idle' | 'attack' | 'hit' | 'death' | 'dodge' | 'block', string>>
) {
  const states: AnimationMachineConfig['states'] = {};
  const transitions: AnimationMachineConfig['transitions'] = [];

  if (animations.idle) {
    states.idle = { animation: animations.idle, loop: true };
  }

  if (animations.attack) {
    states.attack = { animation: animations.attack, loop: false, crossFadeDuration: 0.1 };
    if (animations.idle) {
      transitions.push({ from: 'idle', to: 'attack', event: 'ATTACK' });
      transitions.push({ from: 'attack', to: 'idle', event: 'ANIMATION_COMPLETE' });
    }
  }

  if (animations.hit) {
    states.hit = { animation: animations.hit, loop: false, crossFadeDuration: 0.05 };
    transitions.push({ from: '*', to: 'hit', event: 'HIT' });
    if (animations.idle) {
      transitions.push({ from: 'hit', to: 'idle', event: 'ANIMATION_COMPLETE' });
    }
  }

  if (animations.death) {
    states.death = { animation: animations.death, loop: false };
    transitions.push({ from: '*', to: 'death', event: 'DIE' });
  }

  if (animations.dodge) {
    states.dodge = { animation: animations.dodge, loop: false, crossFadeDuration: 0.1 };
    if (animations.idle) {
      transitions.push({ from: 'idle', to: 'dodge', event: 'DODGE' });
      transitions.push({ from: 'dodge', to: 'idle', event: 'ANIMATION_COMPLETE' });
    }
  }

  if (animations.block) {
    states.block = { animation: animations.block, loop: true };
    if (animations.idle) {
      transitions.push({ from: 'idle', to: 'block', event: 'BLOCK' });
      transitions.push({ from: 'block', to: 'idle', event: 'RELEASE' });
    }
  }

  const initial = animations.idle ? 'idle' : Object.keys(states)[0];

  return createAnimationMachine({
    id: 'combat',
    initial: initial as AnimationStateName,
    states,
    transitions,
    defaultCrossFadeDuration: 0.15,
  });
}
