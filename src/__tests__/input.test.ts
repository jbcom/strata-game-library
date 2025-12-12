import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
    InputManager,
    InputStateMachine,
    HapticFeedback,
    DragState,
    InputAxis,
    createInputManager,
    normalizeAxisValue,
    clampAxis,
    axisToAngle,
    axisToMagnitude,
    angleToAxis,
} from '../core/input';

describe('InputManager', () => {
    describe('instantiation', () => {
        it('should create InputManager with defaults', () => {
            const manager = new InputManager();
            expect(manager).toBeDefined();
        });

        it('should create InputManager with custom deadzone', () => {
            const manager = new InputManager({ deadzone: 0.2 });
            expect(manager).toBeDefined();
        });

        it('should create InputManager with custom max distance', () => {
            const manager = new InputManager({ maxDistance: 200 });
            expect(manager).toBeDefined();
        });

        it('should create InputManager with haptic disabled', () => {
            const manager = new InputManager({ hapticEnabled: false });
            expect(manager).toBeDefined();
        });
    });

    describe('axis and state', () => {
        it('should return axis values', () => {
            const manager = new InputManager();
            const axis = manager.getAxis();
            expect(axis).toHaveProperty('x');
            expect(axis).toHaveProperty('y');
        });

        it('should return force value', () => {
            const manager = new InputManager();
            const force = manager.getForce();
            expect(typeof force).toBe('number');
        });

        it('should return drag state', () => {
            const manager = new InputManager();
            const state = manager.getDragState();
            expect(['idle', 'pressed', 'dragging', 'released']).toContain(state);
        });

        it('should check if pressed', () => {
            const manager = new InputManager();
            const pressed = manager.isPressed();
            expect(typeof pressed).toBe('boolean');
        });

        it('should return gamepad state', () => {
            const manager = new InputManager();
            const state = manager.getGamepadState();
            expect(state).toHaveProperty('connected');
            expect(state).toHaveProperty('axes');
            expect(state).toHaveProperty('buttons');
        });
    });

    describe('event handling', () => {
        it('should add event listener', () => {
            const manager = new InputManager();
            const callback = vi.fn();
            expect(() => manager.on('press', callback)).not.toThrow();
        });

        it('should remove event listener', () => {
            const manager = new InputManager();
            const callback = vi.fn();
            manager.on('press', callback);
            expect(() => manager.off('press', callback)).not.toThrow();
        });
    });

    describe('haptics', () => {
        it('should return haptics instance', () => {
            const manager = new InputManager();
            const haptics = manager.getHaptics();
            expect(haptics).toBeInstanceOf(HapticFeedback);
        });
    });

    describe('attach/detach', () => {
        it('should attach to element when available', () => {
            const manager = new InputManager();
        });

        it('should detach from element', () => {
            const manager = new InputManager();
            expect(() => manager.detach()).not.toThrow();
        });
    });
});

describe('InputStateMachine', () => {
    it('should create state machine with initial idle state', () => {
        const machine = new InputStateMachine();
        expect(machine.getState()).toBe('idle');
    });

    it('should create state machine with custom drag threshold', () => {
        const machine = new InputStateMachine(10);
        expect(machine).toBeDefined();
    });

    it('should transition to pressed on press', () => {
        const machine = new InputStateMachine();
        machine.press(new THREE.Vector2(0, 0));
        expect(machine.getState()).toBe('pressed');
    });

    it('should transition to dragging when moved beyond threshold', () => {
        const machine = new InputStateMachine(5);
        machine.press(new THREE.Vector2(0, 0));
        machine.move(new THREE.Vector2(10, 0));
        expect(machine.getState()).toBe('dragging');
    });

    it('should remain pressed when moved within threshold', () => {
        const machine = new InputStateMachine(10);
        machine.press(new THREE.Vector2(0, 0));
        machine.move(new THREE.Vector2(3, 0));
        expect(machine.getState()).toBe('pressed');
    });

    it('should transition to released on release', () => {
        const machine = new InputStateMachine();
        machine.press(new THREE.Vector2(0, 0));
        machine.release();
        expect(machine.getState()).toBe('released');
    });

    it('should reset to idle', () => {
        const machine = new InputStateMachine();
        machine.press(new THREE.Vector2(0, 0));
        machine.reset();
        expect(machine.getState()).toBe('idle');
    });

    it('should track state duration', () => {
        const machine = new InputStateMachine();
        const duration = machine.getStateDuration();
        expect(typeof duration).toBe('number');
    });
});

describe('HapticFeedback', () => {
    it('should create HapticFeedback', () => {
        const haptic = new HapticFeedback();
        expect(haptic).toBeDefined();
    });

    it('should create HapticFeedback with enabled flag', () => {
        const haptic = new HapticFeedback(false);
        expect(haptic).toBeDefined();
    });

    it('should check if supported', () => {
        const haptic = new HapticFeedback();
        const supported = haptic.isSupported();
        expect(typeof supported).toBe('boolean');
    });

    it('should enable/disable haptics', () => {
        const haptic = new HapticFeedback();
        expect(() => haptic.setEnabled(false)).not.toThrow();
    });

    it('should vibrate with duration', () => {
        const haptic = new HapticFeedback();
        const result = haptic.vibrate(100);
        expect(typeof result).toBe('boolean');
    });

    it('should vibrate with pattern', () => {
        const haptic = new HapticFeedback();
        const result = haptic.vibrate([100, 50, 100]);
        expect(typeof result).toBe('boolean');
    });

    it('should pulse', () => {
        const haptic = new HapticFeedback();
        const result = haptic.pulse();
        expect(typeof result).toBe('boolean');
    });

    it('should double pulse', () => {
        const haptic = new HapticFeedback();
        const result = haptic.doublePulse();
        expect(typeof result).toBe('boolean');
    });

    it('should heavy impact', () => {
        const haptic = new HapticFeedback();
        const result = haptic.heavyImpact();
        expect(typeof result).toBe('boolean');
    });

    it('should light impact', () => {
        const haptic = new HapticFeedback();
        const result = haptic.lightImpact();
        expect(typeof result).toBe('boolean');
    });

    it('should selection feedback', () => {
        const haptic = new HapticFeedback();
        const result = haptic.selection();
        expect(typeof result).toBe('boolean');
    });

    it('should error feedback', () => {
        const haptic = new HapticFeedback();
        const result = haptic.error();
        expect(typeof result).toBe('boolean');
    });

    it('should success feedback', () => {
        const haptic = new HapticFeedback();
        const result = haptic.success();
        expect(typeof result).toBe('boolean');
    });

    it('should stop vibration', () => {
        const haptic = new HapticFeedback();
        expect(() => haptic.stop()).not.toThrow();
    });
});

describe('normalizeAxisValue', () => {
    it('should return 0 within deadzone', () => {
        expect(normalizeAxisValue(0.05, 0.1)).toBe(0);
    });

    it('should return normalized value outside deadzone', () => {
        const result = normalizeAxisValue(0.5, 0.1);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle negative values', () => {
        const result = normalizeAxisValue(-0.5, 0.1);
        expect(result).toBeLessThan(0);
        expect(result).toBeGreaterThanOrEqual(-1);
    });

    it('should use default deadzone', () => {
        expect(normalizeAxisValue(0.05)).toBe(0);
    });
});

describe('clampAxis', () => {
    it('should return axis if magnitude <= 1', () => {
        const axis: InputAxis = { x: 0.5, y: 0.5 };
        const result = clampAxis(axis);
        expect(result.x).toBe(0.5);
        expect(result.y).toBe(0.5);
    });

    it('should clamp axis if magnitude > 1', () => {
        const axis: InputAxis = { x: 1, y: 1 };
        const result = clampAxis(axis);
        const magnitude = Math.sqrt(result.x * result.x + result.y * result.y);
        expect(magnitude).toBeCloseTo(1, 5);
    });
});

describe('axisToAngle', () => {
    it('should convert axis to angle', () => {
        const angle = axisToAngle({ x: 1, y: 0 });
        expect(angle).toBeCloseTo(0, 5);
    });

    it('should return correct angle for up direction', () => {
        const angle = axisToAngle({ x: 0, y: 1 });
        expect(angle).toBeCloseTo(Math.PI / 2, 5);
    });
});

describe('axisToMagnitude', () => {
    it('should return magnitude of axis', () => {
        const magnitude = axisToMagnitude({ x: 0.6, y: 0.8 });
        expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should clamp to 1', () => {
        const magnitude = axisToMagnitude({ x: 1, y: 1 });
        expect(magnitude).toBe(1);
    });
});

describe('angleToAxis', () => {
    it('should convert angle to axis', () => {
        const axis = angleToAxis(0);
        expect(axis.x).toBeCloseTo(1, 5);
        expect(axis.y).toBeCloseTo(0, 5);
    });

    it('should apply magnitude', () => {
        const axis = angleToAxis(0, 0.5);
        expect(axis.x).toBeCloseTo(0.5, 5);
    });
});

describe('createInputManager', () => {
    it('should create manager with factory function', () => {
        const manager = createInputManager({
            deadzone: 0.15,
        });
        expect(manager).toBeInstanceOf(InputManager);
    });

    it('should create manager without config', () => {
        const manager = createInputManager();
        expect(manager).toBeInstanceOf(InputManager);
    });
});

describe('DragState type', () => {
    it('should accept idle state', () => {
        const state: DragState = 'idle';
        expect(state).toBe('idle');
    });

    it('should accept pressed state', () => {
        const state: DragState = 'pressed';
        expect(state).toBe('pressed');
    });

    it('should accept dragging state', () => {
        const state: DragState = 'dragging';
        expect(state).toBe('dragging');
    });

    it('should accept released state', () => {
        const state: DragState = 'released';
        expect(state).toBe('released');
    });
});

describe('InputAxis interface', () => {
    it('should create axis with x and y', () => {
        const axis: InputAxis = { x: 0.5, y: -0.3 };
        expect(axis.x).toBe(0.5);
        expect(axis.y).toBe(-0.3);
    });
});
