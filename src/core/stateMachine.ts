import * as THREE from 'three';

export interface StateCallbacks<T = any> {
    onEnter?: (context: T) => void;
    onUpdate?: (context: T, deltaTime: number) => void;
    onExit?: (context: T) => void;
}

export interface State<T = any> {
    name: string;
    callbacks: StateCallbacks<T>;
}

export interface TransitionCondition<T = any> {
    from: string;
    to: string;
    condition: (context: T) => boolean;
    priority?: number;
}

export interface StateHistoryEntry {
    stateName: string;
    timestamp: number;
    duration: number;
}

export interface StateMachineConfig<T = any> {
    initialState: string;
    states: State<T>[];
    transitions: TransitionCondition<T>[];
    maxHistoryLength?: number;
}

export class StateMachine<T = any> {
    private states: Map<string, State<T>> = new Map();
    private transitions: TransitionCondition<T>[] = [];
    private currentState: State<T> | null = null;
    private previousState: State<T> | null = null;
    private stateStartTime: number = 0;
    private history: StateHistoryEntry[] = [];
    private maxHistoryLength: number;
    private isPaused: boolean = false;
    private context: T;

    constructor(config: StateMachineConfig<T>, context: T) {
        this.context = context;
        this.maxHistoryLength = config.maxHistoryLength ?? 50;

        for (const state of config.states) {
            this.states.set(state.name, state);
        }

        this.transitions = [...config.transitions].sort(
            (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
        );

        const initialState = this.states.get(config.initialState);
        if (initialState) {
            this.transitionTo(config.initialState);
        }
    }

    getCurrentState(): string | null {
        return this.currentState?.name ?? null;
    }

    getPreviousState(): string | null {
        return this.previousState?.name ?? null;
    }

    getStateTime(): number {
        return Date.now() - this.stateStartTime;
    }

    getHistory(): StateHistoryEntry[] {
        return [...this.history];
    }

    getContext(): T {
        return this.context;
    }

    setContext(context: T): void {
        this.context = context;
    }

    updateContext(updates: Partial<T>): void {
        this.context = { ...this.context, ...updates };
    }

    pause(): void {
        this.isPaused = true;
    }

    resume(): void {
        this.isPaused = false;
    }

    isPausedState(): boolean {
        return this.isPaused;
    }

    update(deltaTime: number): void {
        if (this.isPaused || !this.currentState) return;

        for (const transition of this.transitions) {
            if (transition.from === this.currentState.name && transition.condition(this.context)) {
                this.transitionTo(transition.to);
                break;
            }
        }

        this.currentState.callbacks.onUpdate?.(this.context, deltaTime);
    }

    transitionTo(stateName: string): boolean {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.warn(`StateMachine: State "${stateName}" not found`);
            return false;
        }

        if (this.currentState) {
            const duration = Date.now() - this.stateStartTime;
            this.addToHistory(this.currentState.name, this.stateStartTime, duration);
            this.currentState.callbacks.onExit?.(this.context);
            this.previousState = this.currentState;
        }

        this.currentState = newState;
        this.stateStartTime = Date.now();
        this.currentState.callbacks.onEnter?.(this.context);

        return true;
    }

    forceTransition(stateName: string): boolean {
        return this.transitionTo(stateName);
    }

    addState(state: State<T>): void {
        this.states.set(state.name, state);
    }

    removeState(stateName: string): boolean {
        if (this.currentState?.name === stateName) {
            return false;
        }
        return this.states.delete(stateName);
    }

    addTransition(transition: TransitionCondition<T>): void {
        this.transitions.push(transition);
        this.transitions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    removeTransition(from: string, to: string): boolean {
        const index = this.transitions.findIndex((t) => t.from === from && t.to === to);
        if (index !== -1) {
            this.transitions.splice(index, 1);
            return true;
        }
        return false;
    }

    hasState(stateName: string): boolean {
        return this.states.has(stateName);
    }

    getAvailableTransitions(): string[] {
        if (!this.currentState) return [];
        return this.transitions.filter((t) => t.from === this.currentState?.name).map((t) => t.to);
    }

    private addToHistory(stateName: string, timestamp: number, duration: number): void {
        this.history.push({ stateName, timestamp, duration });
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    clearHistory(): void {
        this.history = [];
    }

    reset(): void {
        if (this.currentState) {
            this.currentState.callbacks.onExit?.(this.context);
        }
        this.currentState = null;
        this.previousState = null;
        this.stateStartTime = 0;
        this.clearHistory();
        this.isPaused = false;
    }

    serialize(): object {
        return {
            currentState: this.currentState?.name ?? null,
            previousState: this.previousState?.name ?? null,
            stateStartTime: this.stateStartTime,
            history: this.history,
            isPaused: this.isPaused,
        };
    }
}

export interface AIContext {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    velocity: THREE.Vector3;
    target: THREE.Vector3 | null;
    threat: THREE.Vector3 | null;
    waypoints: THREE.Vector3[];
    currentWaypointIndex: number;
    speed: number;
    maxSpeed: number;
    detectionRadius: number;
    fleeRadius: number;
    health: number;
    stamina: number;
    isAlerted: boolean;
    lastSeenTarget: THREE.Vector3 | null;
    lastSeenTime: number;
    homePosition: THREE.Vector3;
    wanderAngle: number;
    lookDirection: THREE.Vector3;
    idleTimer: number;
    patrolPauseTimer: number;
}

export function createDefaultAIContext(position: THREE.Vector3 = new THREE.Vector3()): AIContext {
    return {
        position: position.clone(),
        rotation: new THREE.Euler(),
        velocity: new THREE.Vector3(),
        target: null,
        threat: null,
        waypoints: [],
        currentWaypointIndex: 0,
        speed: 0,
        maxSpeed: 5,
        detectionRadius: 10,
        fleeRadius: 15,
        health: 100,
        stamina: 100,
        isAlerted: false,
        lastSeenTarget: null,
        lastSeenTime: 0,
        homePosition: position.clone(),
        wanderAngle: 0,
        lookDirection: new THREE.Vector3(0, 0, 1),
        idleTimer: 0,
        patrolPauseTimer: 0,
    };
}

export function createStateMachine<T>(config: StateMachineConfig<T>, context: T): StateMachine<T> {
    return new StateMachine(config, context);
}

export function createState<T>(name: string, callbacks: StateCallbacks<T>): State<T> {
    return { name, callbacks };
}

export function createTransition<T>(
    from: string,
    to: string,
    condition: (context: T) => boolean,
    priority: number = 0
): TransitionCondition<T> {
    return { from, to, condition, priority };
}
