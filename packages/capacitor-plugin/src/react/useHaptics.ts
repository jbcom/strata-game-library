import { useCallback } from 'react';
import { Strata } from '../index';
import type { HapticsOptions } from '../definitions';

interface UseHapticsReturn {
  trigger: (options: HapticsOptions) => Promise<void>;
  light: () => Promise<void>;
  medium: () => Promise<void>;
  heavy: () => Promise<void>;
  vibrate: (duration?: number) => Promise<void>;
}

export function useHaptics(): UseHapticsReturn {
  const trigger = useCallback(async (options: HapticsOptions) => {
    await Strata.triggerHaptics(options);
  }, []);

  const light = useCallback(async () => {
    await Strata.triggerHaptics({ intensity: 'light' });
  }, []);

  const medium = useCallback(async () => {
    await Strata.triggerHaptics({ intensity: 'medium' });
  }, []);

  const heavy = useCallback(async () => {
    await Strata.triggerHaptics({ intensity: 'heavy' });
  }, []);

  const vibrate = useCallback(async (duration?: number) => {
    await Strata.vibrate({ duration });
  }, []);

  return {
    trigger,
    light,
    medium,
    heavy,
    vibrate,
  };
}
