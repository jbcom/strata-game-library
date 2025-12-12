/**
 * Tests for animation state machine preset factories.
 *
 * Covers locomotion and combat machine creation.
 */

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { createCombatMachine, createLocomotionMachine } from '../presets';

describe('createLocomotionMachine', () => {
    it('creates locomotion machine with all states', () => {
        const machine = createLocomotionMachine({
            idle: 'Idle',
            walk: 'Walk',
            run: 'Run',
            jump: 'Jump',
        });

        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().value).toBe('idle');

        actor.send({ type: 'MOVE' });
        expect(actor.getSnapshot().value).toBe('walk');

        actor.send({ type: 'SPRINT' });
        expect(actor.getSnapshot().value).toBe('run');

        actor.send({ type: 'JUMP' });
        expect(actor.getSnapshot().value).toBe('jump');
    });

    it('creates minimal locomotion machine', () => {
        const machine = createLocomotionMachine({
            idle: 'Idle',
        });

        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('handles fall and land states', () => {
        const machine = createLocomotionMachine({
            idle: 'Idle',
            jump: 'Jump',
            fall: 'Fall',
            land: 'Land',
        });

        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'JUMP' });
        expect(actor.getSnapshot().value).toBe('jump');

        actor.send({ type: 'ANIMATION_COMPLETE' });
        expect(actor.getSnapshot().value).toBe('fall');

        actor.send({ type: 'GROUND' });
        expect(actor.getSnapshot().value).toBe('land');

        actor.send({ type: 'ANIMATION_COMPLETE' });
        expect(actor.getSnapshot().value).toBe('idle');
    });
});

describe('createCombatMachine', () => {
    it('creates combat machine with attack states', () => {
        const machine = createCombatMachine({
            idle: 'CombatIdle',
            attack: 'Attack',
            hit: 'TakeDamage',
            death: 'Death',
        });

        const actor = createActor(machine);
        actor.start();

        expect(actor.getSnapshot().value).toBe('idle');

        actor.send({ type: 'ATTACK' });
        expect(actor.getSnapshot().value).toBe('attack');

        actor.send({ type: 'ANIMATION_COMPLETE' });
        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('handles death from any state', () => {
        const machine = createCombatMachine({
            idle: 'CombatIdle',
            attack: 'Attack',
            death: 'Death',
        });

        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'ATTACK' });
        actor.send({ type: 'DIE' });
        expect(actor.getSnapshot().value).toBe('death');
    });

    it('handles hit interrupts', () => {
        const machine = createCombatMachine({
            idle: 'CombatIdle',
            attack: 'Attack',
            hit: 'TakeDamage',
        });

        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'ATTACK' });
        actor.send({ type: 'HIT' });
        expect(actor.getSnapshot().value).toBe('hit');
    });

    it('handles dodge and block states', () => {
        const machine = createCombatMachine({
            idle: 'CombatIdle',
            dodge: 'Dodge',
            block: 'Block',
        });

        const actor = createActor(machine);
        actor.start();

        actor.send({ type: 'DODGE' });
        expect(actor.getSnapshot().value).toBe('dodge');

        actor.send({ type: 'ANIMATION_COMPLETE' });
        expect(actor.getSnapshot().value).toBe('idle');

        actor.send({ type: 'BLOCK' });
        expect(actor.getSnapshot().value).toBe('block');

        actor.send({ type: 'RELEASE' });
        expect(actor.getSnapshot().value).toBe('idle');
    });
});
