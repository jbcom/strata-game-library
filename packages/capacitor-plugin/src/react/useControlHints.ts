import { useState, useEffect } from 'react';
import { Strata } from '../index';
import type { ControlHints } from '../definitions';
import { useDevice } from './useDevice';

const defaultHints: ControlHints = {
    movement: 'WASD to move',
    action: 'Click to interact',
    camera: 'Mouse to look',
};

export function useControlHints(): ControlHints {
    const [hints, setHints] = useState<ControlHints>(defaultHints);
    const device = useDevice();

    useEffect(() => {
        let mounted = true;

        Strata.getControlHints()
            .then((newHints) => {
                if (mounted) {
                    setHints(newHints);
                }
            })
            .catch((error) => {
                console.warn('Failed to get control hints:', error);
            });

        return () => {
            mounted = false;
        };
    }, [device.inputMode]);

    return hints;
}
