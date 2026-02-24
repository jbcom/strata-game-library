import { useEffect, useState } from 'react';
import type { ControlHints } from '../definitions.js';
import { Strata } from '../index.js';

const defaultHints: ControlHints = {
  movement: 'WASD to move',
  action: 'Click to interact',
  camera: 'Mouse to look',
};

export function useControlHints(): ControlHints {
  const [hints, setHints] = useState<ControlHints>(defaultHints);
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
  }, []);

  return hints;
}
