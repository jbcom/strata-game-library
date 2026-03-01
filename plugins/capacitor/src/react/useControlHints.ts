/**
 * React hook for adaptive control hints based on the current input mode.
 *
 * Queries the Strata plugin for context-appropriate control hints (e.g.,
 * "WASD to move" for keyboard, "Drag to move" for touch) and updates
 * automatically when the input mode changes.
 *
 * @module useControlHints
 * @category Player Experience
 */

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
