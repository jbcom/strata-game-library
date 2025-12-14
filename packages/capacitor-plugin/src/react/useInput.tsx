import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from 'react';
import { Strata } from '../index';
import type { InputSnapshot, Vector2 } from '../definitions';

const defaultSnapshot: InputSnapshot = {
    timestamp: 0,
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    buttons: {},
    triggers: { left: 0, right: 0 },
    touches: [],
};

interface InputContextValue {
    snapshot: InputSnapshot;
    leftStick: Vector2;
    rightStick: Vector2;
    isPressed: (button: string) => boolean;
    leftTrigger: number;
    rightTrigger: number;
    touches: InputSnapshot['touches'];
}

export const InputContext = createContext<InputContextValue>({
    snapshot: defaultSnapshot,
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    isPressed: () => false,
    leftTrigger: 0,
    rightTrigger: 0,
    touches: [],
});

export function InputProvider({ children }: { children: ReactNode }) {
    const [snapshot, setSnapshot] = useState<InputSnapshot>(defaultSnapshot);

    useEffect(() => {
        let mounted = true;
        let removeListener: (() => void) | undefined;

        Strata.addListener('inputChange', (newSnapshot: InputSnapshot) => {
            if (mounted) setSnapshot(newSnapshot);
        }).then((handle) => {
            if (mounted) {
                removeListener = handle.remove;
            } else {
                handle.remove();
            }
        });

        return () => {
            mounted = false;
            void removeListener?.();
        };
    }, []);

    const isPressed = useCallback(
        (button: string) => {
            return snapshot.buttons[button] ?? false;
        },
        [snapshot.buttons]
    );

    // Memoize value object to prevent unnecessary re-renders for context consumers
    const value = useMemo<InputContextValue>(
        () => ({
            snapshot,
            leftStick: snapshot.leftStick,
            rightStick: snapshot.rightStick,
            isPressed,
            leftTrigger: snapshot.triggers.left,
            rightTrigger: snapshot.triggers.right,
            touches: snapshot.touches,
        }),
        [snapshot, isPressed]
    );

    return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}

export function useInput(): InputContextValue {
    return useContext(InputContext);
}
