import { useCallback } from 'react';
import { Strata } from '../index';
import type { HapticPattern } from '../definitions';

export interface UseHapticsResult {
  trigger: (pattern?: HapticPattern) => Promise<void>;
  impact: (style?: 'light' | 'medium' | 'heavy') => Promise<void>;
  notification: (type?: 'success' | 'warning' | 'error') => Promise<void>;
  selection: () => Promise<void>;
}

export function useHaptics(): UseHapticsResult {
  const trigger = useCallback(async (pattern?: HapticPattern): Promise<void> => {
    try {
      await Strata.triggerHaptic({ pattern });
    } catch (e) {
      console.warn('Haptic trigger failed:', e);
    }
  }, []);

  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
    const durationMap = { light: 10, medium: 25, heavy: 50 };
    const intensityMap = { light: 0.3, medium: 0.6, heavy: 1.0 };
    
    try {
      await Strata.triggerHaptic({
        pattern: {
          duration: durationMap[style],
          intensity: intensityMap[style]
        }
      });
    } catch (e) {
      console.warn('Haptic impact failed:', e);
    }
  }, []);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success'): Promise<void> => {
    const patterns: Record<string, HapticPattern> = {
      success: { duration: 30, intensity: 0.5 },
      warning: { duration: 50, intensity: 0.7 },
      error: { duration: 100, intensity: 1.0 }
    };
    
    try {
      await Strata.triggerHaptic({ pattern: patterns[type] });
    } catch (e) {
      console.warn('Haptic notification failed:', e);
    }
  }, []);

  const selection = useCallback(async (): Promise<void> => {
    try {
      await Strata.triggerHaptic({
        pattern: { duration: 5, intensity: 0.2 }
      });
    } catch (e) {
      console.warn('Haptic selection failed:', e);
    }
  }, []);

  return { trigger, impact, notification, selection };
}
