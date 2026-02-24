import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  type GestureResponderEvent,
  NativeModules,
  PixelRatio,
  Platform,
  View,
} from 'react-native';

const { StrataModule, StrataReactNativePlugin } = NativeModules;
const Plugin = StrataModule || StrataReactNativePlugin;

if (!Plugin && Platform.OS !== 'web') {
  console.warn('StrataModule: Native module not found. Check your native installation.');
}

export interface DeviceProfile {
  deviceType: 'mobile' | 'tablet' | 'foldable' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  inputMode: 'touch' | 'keyboard' | 'gamepad' | 'hybrid';
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  hasGamepad: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  performanceMode: 'low' | 'medium' | 'high';
}

export interface TouchState {
  identifier: string;
  pageX: number;
  pageY: number;
  locationX: number;
  locationY: number;
  timestamp: number;
}

export interface InputSnapshot {
  timestamp: number;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
  triggers: { left: number; right: number };
  touches: TouchState[];
}

export interface HapticsOptions {
  intensity?: 'light' | 'medium' | 'heavy';
  customIntensity?: number;
  duration?: number;
  pattern?: number[];
}

/**
 * Hook to get and track device information
 */
export function useDevice(): DeviceProfile {
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>(() => {
    const { width, height } = Dimensions.get('window');
    return {
      deviceType: 'mobile',
      platform: Platform.OS as 'ios' | 'android' | 'web',
      inputMode: 'touch',
      orientation: height >= width ? 'portrait' : 'landscape',
      hasTouch: true,
      hasGamepad: false,
      screenWidth: width,
      screenHeight: height,
      pixelRatio: PixelRatio.get(),
      safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      performanceMode: 'high',
    };
  });

  useEffect(() => {
    const updateDeviceInfo = async () => {
      const { width, height } = Dimensions.get('window');

      let nativeInfo: Partial<DeviceProfile> = {
        deviceType: 'mobile',
        platform: Platform.OS as 'ios' | 'android' | 'web',
      };

      if (Plugin) {
        try {
          // Try modern getDeviceProfile first
          if (Plugin.getDeviceProfile) {
            nativeInfo = await Plugin.getDeviceProfile();
          } else {
            // Fallback to individual calls
            const [info, insets, perf] = await Promise.all([
              Plugin.getDeviceInfo ? Plugin.getDeviceInfo() : Promise.resolve({}),
              Plugin.getSafeAreaInsets ? Plugin.getSafeAreaInsets() : Promise.resolve({}),
              Plugin.getPerformanceMode ? Plugin.getPerformanceMode() : Promise.resolve({}),
            ]);
            nativeInfo = {
              ...info,
              safeAreaInsets: insets,
              performanceMode: perf.mode || perf.performanceMode,
            };
          }
        } catch (e) {
          console.error('Failed to get native device info', e);
        }
      }

      setDeviceProfile((prev) => ({
        ...prev,
        ...nativeInfo,
        deviceType: (nativeInfo.deviceType as DeviceProfile['deviceType']) || 'mobile',
        orientation: height >= width ? 'portrait' : 'landscape',
        screenWidth: width,
        screenHeight: height,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        performanceMode: (nativeInfo.performanceMode as DeviceProfile['performanceMode']) || 'high',
      }));
    };

    updateDeviceInfo();

    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  return deviceProfile;
}

/**
 * Hook to handle input state
 */
export function useInput(): InputSnapshot {
  const [input, setInput] = useState<InputSnapshot>({
    timestamp: Date.now(),
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    buttons: {},
    triggers: { left: 0, right: 0 },
    touches: [],
  });

  useEffect(() => {
    if (!Plugin || Platform.OS === 'web' || !Plugin.getInputSnapshot) return;

    const interval = setInterval(async () => {
      try {
        const snapshot = await Plugin.getInputSnapshot();
        if (snapshot) {
          setInput((prev) => ({
            ...prev,
            ...snapshot,
            touches: prev.touches, // Keep JS-side touches
          }));
        }
      } catch (_e) {
        // Silently fail polling
      }
    }, 16); // ~60fps poll for native input

    return () => clearInterval(interval);
  }, []);

  return input;
}

/**
 * A component that captures touch gestures and provides them to the game
 */
export const StrataInputProvider: React.FC<{
  children: React.ReactNode;
  onInput?: (snapshot: InputSnapshot) => void;
}> = ({ children, onInput }) => {
  const touches = useRef<Map<string, TouchState>>(new Map());

  const updateTouches = (event: GestureResponderEvent) => {
    const changedTouches = event.nativeEvent.changedTouches;
    const timestamp = event.nativeEvent.timestamp;

    changedTouches.forEach((touch) => {
      touches.current.set(touch.identifier, {
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        locationX: touch.locationX,
        locationY: touch.locationY,
        timestamp,
      });
    });

    const snapshot: InputSnapshot = {
      timestamp,
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
      buttons: {},
      triggers: { left: 0, right: 0 },
      touches: Array.from(touches.current.values()),
    };

    onInput?.(snapshot);
  };

  const removeTouches = (event: GestureResponderEvent) => {
    const changedTouches = event.nativeEvent.changedTouches;
    changedTouches.forEach((touch) => {
      touches.current.delete(touch.identifier);
    });

    const snapshot: InputSnapshot = {
      timestamp: event.nativeEvent.timestamp,
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
      buttons: {},
      triggers: { left: 0, right: 0 },
      touches: Array.from(touches.current.values()),
    };

    onInput?.(snapshot);
  };

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={updateTouches}
      onResponderMove={updateTouches}
      onResponderRelease={removeTouches}
      onResponderTerminate={removeTouches}
    >
      {children}
    </View>
  );
};

/**
 * Hook for haptic feedback
 */
export function useHaptics(): { trigger: (options: HapticsOptions) => Promise<void> } {
  const trigger = useCallback(async (options: HapticsOptions) => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(options.duration || 50);
      }
      return;
    }

    if (Plugin) {
      if (Plugin.triggerHaptics) {
        await Plugin.triggerHaptics(options.intensity || 'medium');
      } else if (Plugin.triggerHaptic) {
        await Plugin.triggerHaptic(options.intensity || 'medium');
      }
    }
  }, []);

  return { trigger };
}

/**
 * Set screen orientation
 */
export async function setOrientation(
  orientation: 'portrait' | 'landscape' | 'default'
): Promise<void> {
  if (Plugin?.setOrientation) {
    await Plugin.setOrientation(orientation);
  }
}

/**
 * Hook for control hints based on device and input
 */
export function useControlHints(): { movement: string; action: string; camera: string } {
  const { inputMode, hasGamepad } = useDevice();

  if (hasGamepad || inputMode === 'gamepad') {
    return {
      movement: 'Left Stick',
      action: 'Button A / X',
      camera: 'Right Stick',
    };
  }

  if (inputMode === 'touch') {
    return {
      movement: 'Virtual Joystick',
      action: 'Tap Screen',
      camera: 'Drag',
    };
  }

  return {
    movement: 'WASD / Left Stick',
    action: 'Space / Button A',
    camera: 'Mouse / Right Stick',
  };
}
