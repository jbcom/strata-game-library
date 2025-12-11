/**
 * Device detection hook for React Native.
 * Provides device profile with context provider pattern.
 * 
 * @module react-native/hooks/useDevice
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  createElement,
} from 'react';
import { Strata } from '../adapter';
import type { DeviceProfile } from '../types';
import { DEFAULT_DEVICE_PROFILE } from '../types';

/**
 * Context for device profile data.
 */
export const DeviceContext = createContext<DeviceProfile>(DEFAULT_DEVICE_PROFILE);

/**
 * Props for DeviceProvider component.
 */
export interface DeviceProviderProps {
  children: ReactNode;
}

/**
 * Provider component that supplies device profile to child components.
 * Automatically updates when device characteristics change (e.g., orientation).
 * Subscribes via addListener('deviceChange') for API parity with Capacitor.
 * 
 * @param props - Provider props containing children
 * 
 * @example
 * ```tsx
 * import { DeviceProvider } from '@strata/react-native';
 * 
 * function App() {
 *   return (
 *     <DeviceProvider>
 *       <GameScreen />
 *     </DeviceProvider>
 *   );
 * }
 * ```
 */
export function DeviceProvider({ children }: DeviceProviderProps): JSX.Element {
  const [profile, setProfile] = useState<DeviceProfile>(DEFAULT_DEVICE_PROFILE);

  useEffect(() => {
    let mounted = true;
    let subscription: { remove: () => void } | null = null;

    Strata.getDeviceProfile().then(deviceProfile => {
      if (mounted) {
        setProfile(deviceProfile);
      }
    });

    Strata.addListener('deviceChange', (newProfile: DeviceProfile) => {
      if (mounted) {
        setProfile(newProfile);
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

  return createElement(DeviceContext.Provider, { value: profile }, children);
}

/**
 * Hook to access the current device profile.
 * Must be used within a DeviceProvider.
 * 
 * @returns Current device profile
 * 
 * @example
 * ```tsx
 * import { useDevice } from '@strata/react-native';
 * 
 * function GameScreen() {
 *   const device = useDevice();
 *   
 *   return (
 *     <View>
 *       <Text>Device: {device.deviceType}</Text>
 *       <Text>Platform: {device.platform}</Text>
 *       <Text>Orientation: {device.orientation}</Text>
 *       {device.isMobile && <TouchControls />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useDevice(): DeviceProfile {
  return useContext(DeviceContext);
}
