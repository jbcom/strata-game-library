/**
 * Core Input System
 *
 * Pure TypeScript input handling with unified pointer, touch, gamepad events.
 * Provides normalized axis/force outputs, haptic feedback, and drag state machine.
 */

import * as THREE from 'three';

export type DragState = 'idle' | 'pressed' | 'dragging' | 'released';

export interface InputAxis {
    x: number;
    y: number;
}

export interface InputEvent {
    type: 'activate' | 'deactivate' | 'axisChange' | 'press' | 'release';
    axis: InputAxis;
    force: number;
    worldPosition: THREE.Vector3;
    timestamp: number;
}

export interface HapticPattern {
    pattern: number[];
    intensity?: number;
}

export interface GamepadState {
    connected: boolean;
    axes: number[];
    buttons: boolean[];
    timestamp: number;
}

export interface PointerState {
    isDown: boolean;
    startPosition: THREE.Vector2;
    currentPosition: THREE.Vector2;
    delta: THREE.Vector2;
    force: number;
}

export interface InputManagerConfig {
    deadzone?: number;
    maxDistance?: number;
    hapticEnabled?: boolean;
    gamepadIndex?: number;
}

export class InputStateMachine {
    private state: DragState = 'idle';
    private stateStartTime: number = 0;
    private dragThreshold: number = 5;
    private startPosition: THREE.Vector2 = new THREE.Vector2();
    private releaseTimeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor(dragThreshold: number = 5) {
        this.dragThreshold = dragThreshold;
    }

    getState(): DragState {
        return this.state;
    }

    getStateDuration(): number {
        return Date.now() - this.stateStartTime;
    }

    press(position: THREE.Vector2): void {
        this.state = 'pressed';
        this.stateStartTime = Date.now();
        this.startPosition.copy(position);
    }

    move(position: THREE.Vector2): void {
        if (this.state === 'pressed') {
            const distance = position.distanceTo(this.startPosition);
            if (distance > this.dragThreshold) {
                this.state = 'dragging';
                this.stateStartTime = Date.now();
            }
        }
    }

    release(): void {
        // Clear any existing timeout to prevent race conditions
        if (this.releaseTimeoutId !== null) {
            clearTimeout(this.releaseTimeoutId);
        }
        this.state = 'released';
        this.stateStartTime = Date.now();
        this.releaseTimeoutId = setTimeout(() => {
            if (this.state === 'released') {
                this.state = 'idle';
                this.stateStartTime = Date.now();
            }
            this.releaseTimeoutId = null;
        }, 100);
    }

    reset(): void {
        // Clear any pending timeout on reset
        if (this.releaseTimeoutId !== null) {
            clearTimeout(this.releaseTimeoutId);
            this.releaseTimeoutId = null;
        }
        this.state = 'idle';
        this.stateStartTime = Date.now();
    }
}

export class HapticFeedback {
    private enabled: boolean = true;
    private lastVibration: number = 0;
    private minInterval: number = 50;

    constructor(enabled: boolean = true) {
        this.enabled = enabled && this.isSupported();
    }

    isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'vibrate' in navigator;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled && this.isSupported();
    }

    vibrate(pattern: number | number[]): boolean {
        if (!this.enabled) return false;

        const now = Date.now();
        if (now - this.lastVibration < this.minInterval) return false;

        this.lastVibration = now;

        try {
            return navigator.vibrate(pattern);
        } catch {
            return false;
        }
    }

    pulse(duration: number = 50): boolean {
        return this.vibrate(duration);
    }

    doublePulse(): boolean {
        return this.vibrate([30, 50, 30]);
    }

    heavyImpact(): boolean {
        return this.vibrate([100]);
    }

    lightImpact(): boolean {
        return this.vibrate([20]);
    }

    selection(): boolean {
        return this.vibrate([10]);
    }

    error(): boolean {
        return this.vibrate([50, 100, 50, 100, 50]);
    }

    success(): boolean {
        return this.vibrate([30, 80, 100]);
    }

    stop(): void {
        if (this.isSupported()) {
            navigator.vibrate(0);
        }
    }
}

export class InputManager {
    private config: Required<InputManagerConfig>;
    private stateMachine: InputStateMachine;
    private haptics: HapticFeedback;
    private pointerState: PointerState;
    private gamepadState: GamepadState;
    private listeners: Map<string, Set<(event: InputEvent) => void>>;
    private animationFrameId: number | null = null;
    private element: HTMLElement | null = null;

    constructor(config: InputManagerConfig = {}) {
        this.config = {
            deadzone: config.deadzone ?? 0.1,
            maxDistance: config.maxDistance ?? 100,
            hapticEnabled: config.hapticEnabled ?? true,
            gamepadIndex: config.gamepadIndex ?? 0,
        };

        this.stateMachine = new InputStateMachine();
        this.haptics = new HapticFeedback(this.config.hapticEnabled);
        this.listeners = new Map();

        this.pointerState = {
            isDown: false,
            startPosition: new THREE.Vector2(),
            currentPosition: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            force: 0,
        };

        this.gamepadState = {
            connected: false,
            axes: [0, 0, 0, 0],
            buttons: [],
            timestamp: 0,
        };
    }

    attach(element: HTMLElement): void {
        this.element = element;

        element.addEventListener('pointerdown', this.handlePointerDown);
        element.addEventListener('pointermove', this.handlePointerMove);
        element.addEventListener('pointerup', this.handlePointerUp);
        element.addEventListener('pointercancel', this.handlePointerUp);
        element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd);

        if (typeof window !== 'undefined') {
            window.addEventListener('gamepadconnected', this.handleGamepadConnected);
            window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        }

        this.startGamepadPolling();
    }

    detach(): void {
        if (this.element) {
            this.element.removeEventListener('pointerdown', this.handlePointerDown);
            this.element.removeEventListener('pointermove', this.handlePointerMove);
            this.element.removeEventListener('pointerup', this.handlePointerUp);
            this.element.removeEventListener('pointercancel', this.handlePointerUp);
            this.element.removeEventListener('touchstart', this.handleTouchStart);
            this.element.removeEventListener('touchmove', this.handleTouchMove);
            this.element.removeEventListener('touchend', this.handleTouchEnd);
            this.element = null;
        }

        if (typeof window !== 'undefined') {
            window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        }

        this.stopGamepadPolling();
    }

    on(event: string, callback: (event: InputEvent) => void): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
    }

    off(event: string, callback: (event: InputEvent) => void): void {
        this.listeners.get(event)?.delete(callback);
    }

    private emit(
        type: InputEvent['type'],
        axis: InputAxis,
        force: number,
        worldPosition: THREE.Vector3
    ): void {
        const event: InputEvent = {
            type,
            axis,
            force,
            worldPosition,
            timestamp: Date.now(),
        };

        this.listeners.get(type)?.forEach((callback) => callback(event));
        this.listeners.get('*')?.forEach((callback) => callback(event));
    }

    private handlePointerDown = (e: PointerEvent): void => {
        this.pointerState.isDown = true;
        this.pointerState.startPosition.set(e.clientX, e.clientY);
        this.pointerState.currentPosition.set(e.clientX, e.clientY);
        this.pointerState.delta.set(0, 0);
        this.pointerState.force = (e as any).pressure ?? 1;

        this.stateMachine.press(this.pointerState.startPosition);
        this.haptics.lightImpact();

        this.emit('press', { x: 0, y: 0 }, this.pointerState.force, new THREE.Vector3());
    };

    private handlePointerMove = (e: PointerEvent): void => {
        if (!this.pointerState.isDown) return;

        this.pointerState.currentPosition.set(e.clientX, e.clientY);
        this.pointerState.delta.subVectors(
            this.pointerState.currentPosition,
            this.pointerState.startPosition
        );
        this.pointerState.force = (e as any).pressure ?? 1;

        this.stateMachine.move(this.pointerState.currentPosition);

        const axis = this.normalizeAxis(this.pointerState.delta);
        this.emit('axisChange', axis, this.pointerState.force, new THREE.Vector3());
    };

    private handlePointerUp = (_e: PointerEvent): void => {
        this.pointerState.isDown = false;
        this.stateMachine.release();
        this.haptics.selection();

        this.emit('release', { x: 0, y: 0 }, 0, new THREE.Vector3());
    };

    private handleTouchStart = (e: TouchEvent): void => {
        e.preventDefault();
        const touch = e.touches[0];
        if (!touch) return;

        this.pointerState.isDown = true;
        this.pointerState.startPosition.set(touch.clientX, touch.clientY);
        this.pointerState.currentPosition.set(touch.clientX, touch.clientY);
        this.pointerState.delta.set(0, 0);
        this.pointerState.force = (touch as any).force ?? 1;

        this.stateMachine.press(this.pointerState.startPosition);
        this.haptics.lightImpact();

        this.emit('press', { x: 0, y: 0 }, this.pointerState.force, new THREE.Vector3());
    };

    private handleTouchMove = (e: TouchEvent): void => {
        e.preventDefault();
        if (!this.pointerState.isDown) return;

        const touch = e.touches[0];
        if (!touch) return;

        this.pointerState.currentPosition.set(touch.clientX, touch.clientY);
        this.pointerState.delta.subVectors(
            this.pointerState.currentPosition,
            this.pointerState.startPosition
        );
        this.pointerState.force = (touch as any).force ?? 1;

        this.stateMachine.move(this.pointerState.currentPosition);

        const axis = this.normalizeAxis(this.pointerState.delta);
        this.emit('axisChange', axis, this.pointerState.force, new THREE.Vector3());
    };

    private handleTouchEnd = (_e: TouchEvent): void => {
        this.pointerState.isDown = false;
        this.stateMachine.release();
        this.haptics.selection();

        this.emit('release', { x: 0, y: 0 }, 0, new THREE.Vector3());
    };

    private handleGamepadConnected = (e: GamepadEvent): void => {
        if (e.gamepad.index === this.config.gamepadIndex) {
            this.gamepadState.connected = true;
            this.haptics.success();
        }
    };

    private handleGamepadDisconnected = (e: GamepadEvent): void => {
        if (e.gamepad.index === this.config.gamepadIndex) {
            this.gamepadState.connected = false;
        }
    };

    private startGamepadPolling(): void {
        const poll = () => {
            this.pollGamepad();
            this.animationFrameId = requestAnimationFrame(poll);
        };
        this.animationFrameId = requestAnimationFrame(poll);
    }

    private stopGamepadPolling(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private pollGamepad(): void {
        if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.config.gamepadIndex];

        if (!gamepad) {
            this.gamepadState.connected = false;
            return;
        }

        this.gamepadState.connected = true;
        this.gamepadState.timestamp = gamepad.timestamp;

        const prevAxes = [...this.gamepadState.axes];
        this.gamepadState.axes = gamepad.axes.map((a) => this.applyDeadzone(a));
        this.gamepadState.buttons = gamepad.buttons.map((b) => b.pressed);

        const axisChanged = this.gamepadState.axes.some((a, i) => Math.abs(a - prevAxes[i]) > 0.01);

        if (axisChanged) {
            const axis: InputAxis = {
                x: this.gamepadState.axes[0] ?? 0,
                y: this.gamepadState.axes[1] ?? 0,
            };
            this.emit('axisChange', axis, 1, new THREE.Vector3());
        }
    }

    private applyDeadzone(value: number): number {
        const deadzone = this.config.deadzone;
        if (Math.abs(value) < deadzone) return 0;
        // Guard against division by zero when deadzone >= 1
        if (deadzone >= 1) return 0;
        const sign = Math.sign(value);
        return sign * ((Math.abs(value) - deadzone) / (1 - deadzone));
    }

    private normalizeAxis(delta: THREE.Vector2): InputAxis {
        const length = delta.length();
        const normalizedLength = Math.min(length / this.config.maxDistance, 1);

        if (normalizedLength < this.config.deadzone) {
            return { x: 0, y: 0 };
        }

        const normalizedDelta = delta.clone().normalize().multiplyScalar(normalizedLength);
        return {
            x: Math.max(-1, Math.min(1, normalizedDelta.x)),
            y: Math.max(-1, Math.min(1, -normalizedDelta.y)),
        };
    }

    getAxis(): InputAxis {
        if (this.gamepadState.connected) {
            return {
                x: this.gamepadState.axes[0] ?? 0,
                y: this.gamepadState.axes[1] ?? 0,
            };
        }

        if (this.pointerState.isDown) {
            return this.normalizeAxis(this.pointerState.delta);
        }

        return { x: 0, y: 0 };
    }

    getForce(): number {
        return this.pointerState.force;
    }

    getDragState(): DragState {
        return this.stateMachine.getState();
    }

    isPressed(): boolean {
        const state = this.stateMachine.getState();
        return state === 'pressed' || state === 'dragging';
    }

    getHaptics(): HapticFeedback {
        return this.haptics;
    }

    getGamepadState(): GamepadState {
        return { ...this.gamepadState };
    }
}

export function createInputManager(config?: InputManagerConfig): InputManager {
    return new InputManager(config);
}

export function normalizeAxisValue(value: number, deadzone: number = 0.1): number {
    if (Math.abs(value) < deadzone) return 0;
    // Guard against division by zero when deadzone >= 1
    if (deadzone >= 1) return 0;
    const sign = Math.sign(value);
    return sign * ((Math.abs(value) - deadzone) / (1 - deadzone));
}

export function clampAxis(axis: InputAxis): InputAxis {
    const length = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    if (length <= 1) return axis;
    return {
        x: axis.x / length,
        y: axis.y / length,
    };
}

export function axisToAngle(axis: InputAxis): number {
    return Math.atan2(axis.y, axis.x);
}

export function axisToMagnitude(axis: InputAxis): number {
    return Math.min(1, Math.sqrt(axis.x * axis.x + axis.y * axis.y));
}

export function angleToAxis(angle: number, magnitude: number = 1): InputAxis {
    return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude,
    };
}
