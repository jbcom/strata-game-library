/**
 * Advanced Game AI System for Strata.
 *
 * Integrates the Yuka game AI library with React Three Fiber to provide
 * steering behaviors, pathfinding, finite state machines, and perception.
 *
 * @packageDocumentation
 * @module components/ai/YukaEntityManager
 * @category Entities & Simulation
 *
 * ## Interactive Demos
 * - 🎮 [Live AI Demo](http://jonbogaty.com/nodejs-strata/demos/ai.html)
 * - 📦 [AI Navigation Example](https://github.com/jbcom/nodejs-strata/tree/main/examples/ai-navigation)
 *
 * ## API Documentation
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/nodejs-strata/blob/main/EXAMPLES_API_MAP.md#ai-and-navigation)
 */

import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import * as YUKA from 'yuka';
import type { YukaEntityManagerContextValue, YukaEntityManagerProps } from './types';

const YukaContext = createContext<YukaEntityManagerContextValue | null>(null);

/**
 * Hook to access the Yuka context within a YukaEntityManager.
 * Must be used inside a YukaEntityManager component tree.
 *
 * @category Entities & Simulation
 * @returns YukaEntityManagerContextValue with manager and registration functions
 * @throws Error if used outside YukaEntityManager
 */
export function useYukaContext(): YukaEntityManagerContextValue {
    const context = useContext(YukaContext);
    if (!context) {
        throw new Error('useYukaContext must be used within a YukaEntityManager');
    }
    return context;
}

/**
 * Context provider that manages Yuka AI entities and updates them each frame.
 * Must wrap all Yuka-related components in your scene.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <YukaEntityManager>
 *   <YukaVehicle maxSpeed={5}>
 *     <mesh><boxGeometry /></mesh>
 *   </YukaVehicle>
 * </YukaEntityManager>
 * ```
 */
export function YukaEntityManager({ children }: YukaEntityManagerProps): React.JSX.Element {
    const managerRef = useRef<YUKA.EntityManager>(new YUKA.EntityManager());
    const timeRef = useRef<YUKA.Time>(new YUKA.Time());

    const register = useCallback((entity: YUKA.GameEntity) => {
        managerRef.current.add(entity);
    }, []);

    const unregister = useCallback((entity: YUKA.GameEntity) => {
        managerRef.current.remove(entity);
    }, []);

    useFrame(() => {
        const delta = timeRef.current.update().getDelta();
        managerRef.current.update(delta);
    });

    const contextValue = useMemo<YukaEntityManagerContextValue>(
        () => ({
            manager: managerRef.current,
            time: timeRef.current,
            register,
            unregister,
        }),
        [register, unregister]
    );

    return <YukaContext.Provider value={contextValue}>{children}</YukaContext.Provider>;
}
