import { useEffect, useState } from 'react';
import type { DeviceInfo, SafeAreaInsets } from '../definitions.js';
import { Strata } from '../index.js';

export { useControlHints } from './useControlHints.js';
export { DeviceContext, DeviceProvider, useDevice } from './useDevice.js';
export { useHaptics } from './useHaptics.js';
export { InputContext, InputProvider, useInput } from './useInput.js';
export { useStorage } from './useStorage.js';

export function useStrata() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [safeArea, setSafeArea] = useState<SafeAreaInsets | null>(null);

  useEffect(() => {
    Strata.getDeviceInfo()
      .then(setDeviceInfo)
      .catch((error) => console.error('Failed to get device info:', error));

    Strata.getSafeAreaInsets()
      .then(setSafeArea)
      .catch((error) => console.error('Failed to get safe area insets:', error));
  }, []);

  const triggerHaptic = (
    type: 'impact' | 'notification' | 'selection',
    style?: 'light' | 'medium' | 'heavy'
  ) => {
    Strata.haptics({ type, style }).catch((error) =>
      console.error('Failed to trigger haptic:', error)
    );
  };

  return {
    deviceInfo,
    safeArea,
    triggerHaptic,
  };
}
