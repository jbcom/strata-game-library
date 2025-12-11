/**
 * Input handling hook for React Native.
 * Provides input snapshot with context provider pattern.
 * 
 * @module react-native/hooks/useInput
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  createElement,
} from 'react';
import { Strata } from '../adapter';
import type { InputSnapshot, Vector2, TouchPoint } from '../types';
import { DEFAULT_INPUT_SNAPSHOT } from '../types';

/**
 * Input context value shape.
 */
export interface InputContextValue {
  snapshot: InputSnapshot;
  leftStick: Vector2;
  rightStick: Vector2;
  isPressed: (button: string) => boolean;
  leftTrigger: number;
  rightTrigger: number;
  touches: TouchPoint[];
}

const defaultContextValue: InputContextValue = {
  snapshot: DEFAULT_INPUT_SNAPSHOT,
  leftStick: { x: 0, y: 0 },
  rightStick: { x: 0, y: 0 },
  isPressed: () => false,
  leftTrigger: 0,
  rightTrigger: 0,
  touches: [],
};

/**
 * Context for input state data.
 */
export const InputContext = createContext<InputContextValue>(defaultContextValue);

/**
 * Props for InputProvider component.
 */
export interface InputProviderProps {
  children: ReactNode;
}

/**
 * Provider component that supplies input state to child components.
 * Automatically updates when input changes.
 * Subscribes via addListener('inputChange') for API parity with Capacitor.
 * 
 * @param props - Provider props containing children
 * 
 * @example
 * ```tsx
 * import { InputProvider } from '@strata/react-native';
 * 
 * function App() {
 *   return (
 *     <InputProvider>
 *       <GameScreen />
 *     </InputProvider>
 *   );
 * }
 * ```
 */
export function InputProvider({ children }: InputProviderProps): JSX.Element {
  const [snapshot, setSnapshot] = useState<InputSnapshot>(DEFAULT_INPUT_SNAPSHOT);

  useEffect(() => {
    let mounted = true;
    let subscription: { remove: () => void } | null = null;

    Strata.addListener('inputChange', (newSnapshot: InputSnapshot) => {
      if (mounted) {
        setSnapshot(newSnapshot);
      }
    }).then(sub => {
      subscription = sub;
    });

    return () => {
      mounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const isPressed = useCallback(
    (button: string): boolean => {
      return snapshot.buttons[button] ?? false;
    },
    [snapshot.buttons]
  );

  const value: InputContextValue = {
    snapshot,
    leftStick: snapshot.leftStick,
    rightStick: snapshot.rightStick,
    isPressed,
    leftTrigger: snapshot.triggers.left,
    rightTrigger: snapshot.triggers.right,
    touches: snapshot.touches,
  };

  return createElement(InputContext.Provider, { value }, children);
}

/**
 * Hook to access the current input state.
 * Must be used within an InputProvider.
 * 
 * @returns Current input context value
 * 
 * @example
 * ```tsx
 * import { useInput } from '@strata/react-native';
 * 
 * function PlayerController() {
 *   const { leftStick, isPressed, touches } = useInput();
 *   
 *   useEffect(() => {
 *     // Move player based on left stick
 *     movePlayer(leftStick.x, leftStick.y);
 *     
 *     // Check for jump button
 *     if (isPressed('jump')) {
 *       player.jump();
 *     }
 *   }, [leftStick, isPressed]);
 *   
 *   return <PlayerView />;
 * }
 * ```
 */
export function useInput(): InputContextValue {
  return useContext(InputContext);
}
