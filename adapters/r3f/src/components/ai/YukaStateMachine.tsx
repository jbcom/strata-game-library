import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as YUKA from 'yuka';
import type { StateConfig, YukaStateMachineProps, YukaStateMachineRef } from './types';

class YukaState extends YUKA.State<YUKA.GameEntity> {
  name: string;
  private _onEnter?: (entity: YUKA.GameEntity) => void;
  private _onExecute?: (entity: YUKA.GameEntity) => void;
  private _onExit?: (entity: YUKA.GameEntity) => void;

  constructor(config: StateConfig) {
    super();
    this.name = config.name;
    this._onEnter = config.onEnter;
    this._onExecute = config.onExecute;
    this._onExit = config.onExit;
  }

  override enter(entity: YUKA.GameEntity): void {
    if (this._onEnter) this._onEnter(entity);
  }

  override execute(entity: YUKA.GameEntity): void {
    if (this._onExecute) this._onExecute(entity);
  }

  override exit(entity: YUKA.GameEntity): void {
    if (this._onExit) this._onExit(entity);
  }
}

/**
 * Finite State Machine component for AI behavior control.
 * Manages state transitions with enter/execute/exit callbacks.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <YukaStateMachine
 *   states={[
 *     { name: 'idle', onEnter: () => console.log('Idle') },
 *     { name: 'patrol', onEnter: () => console.log('Patrol') }
 *   ]}
 *   initialState="idle"
 * />
 * ```
 */
export const YukaStateMachine = forwardRef<YukaStateMachineRef, YukaStateMachineProps>(
  function YukaStateMachine({ entity, states, initialState, globalState }, ref) {
    const stateMachineRef = useRef<YUKA.StateMachine<YUKA.GameEntity> | null>(null);
    const statesMapRef = useRef<Map<string, YukaState>>(new Map());
    const dummyEntityRef = useRef<YUKA.GameEntity>(new YUKA.GameEntity());

    useEffect(() => {
      const targetEntity = entity || dummyEntityRef.current;
      const sm = new YUKA.StateMachine(targetEntity);
      stateMachineRef.current = sm;
      statesMapRef.current.clear();

      for (const config of states) {
        const state = new YukaState(config);
        statesMapRef.current.set(config.name, state);
      }

      if (globalState) {
        sm.globalState = new YukaState(globalState);
      }

      const initial = statesMapRef.current.get(initialState);
      if (initial) {
        sm.currentState = initial;
        initial.enter(targetEntity);
      }

      return () => {
        stateMachineRef.current = null;
      };
    }, [entity, states, initialState, globalState]);

    useFrame(() => {
      if (stateMachineRef.current) {
        stateMachineRef.current.update();
      }
    });

    useImperativeHandle(
      ref,
      () => ({
        get stateMachine() {
          if (!stateMachineRef.current) {
            throw new Error('StateMachine not initialized');
          }
          return stateMachineRef.current;
        },
        changeTo: (stateName: string) => {
          const sm = stateMachineRef.current;
          if (sm && statesMapRef.current.has(stateName)) {
            sm.changeTo(stateName);
          }
        },
        revert: () => {
          stateMachineRef.current?.revert();
        },
        getCurrentState: () => {
          const current = stateMachineRef.current?.currentState;
          if (current && current instanceof YukaState) {
            return current.name;
          }
          return null;
        },
      }),
      []
    );

    return null;
  }
);
