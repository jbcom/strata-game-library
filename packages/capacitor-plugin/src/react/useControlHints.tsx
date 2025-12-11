import { useState, useEffect, useMemo } from 'react';
import { Strata } from '../index';
import type { DeviceProfile, InputMapping } from '../definitions';

export interface ControlHint {
  action: string;
  label: string;
  icon?: string;
}

export interface UseControlHintsResult {
  hints: ControlHint[];
  deviceType: string;
  hasGamepad: boolean;
}

const DEFAULT_KEYBOARD_HINTS: ControlHint[] = [
  { action: 'move', label: 'WASD / Arrows', icon: 'keyboard' },
  { action: 'jump', label: 'Space', icon: 'keyboard' },
  { action: 'action', label: 'E', icon: 'keyboard' },
  { action: 'cancel', label: 'Esc', icon: 'keyboard' }
];

const DEFAULT_GAMEPAD_HINTS: ControlHint[] = [
  { action: 'move', label: 'Left Stick', icon: 'gamepad' },
  { action: 'jump', label: 'A Button', icon: 'gamepad' },
  { action: 'action', label: 'X Button', icon: 'gamepad' },
  { action: 'cancel', label: 'B Button', icon: 'gamepad' }
];

const DEFAULT_TOUCH_HINTS: ControlHint[] = [
  { action: 'move', label: 'Drag to move', icon: 'touch' },
  { action: 'jump', label: 'Tap to jump', icon: 'touch' },
  { action: 'action', label: 'Hold to interact', icon: 'touch' },
  { action: 'cancel', label: 'Swipe back', icon: 'touch' }
];

export interface UseControlHintsOptions {
  customMapping?: InputMapping;
  keyboardHints?: ControlHint[];
  gamepadHints?: ControlHint[];
  touchHints?: ControlHint[];
}

export function useControlHints(options: UseControlHintsOptions = {}): UseControlHintsResult {
  const [device, setDevice] = useState<DeviceProfile | null>(null);
  const [hasGamepad, setHasGamepad] = useState(false);

  useEffect(() => {
    let mounted = true;
    let removeDeviceListener: (() => void) | null = null;
    
    Strata.getDeviceProfile().then(result => {
      if (mounted) {
        setDevice(result);
      }
    });

    Strata.addListener('deviceChange', (profile: DeviceProfile) => {
      if (mounted) {
        setDevice(profile);
        setHasGamepad(profile.hasGamepad);
      }
    }).then(handle => {
      removeDeviceListener = handle.remove;
    });

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads?.() || [];
      const connected = Array.from(gamepads).some(gp => gp !== null);
      if (mounted) {
        setHasGamepad(connected);
      }
    };

    checkGamepad();
    
    const handleGamepadConnected = () => checkGamepad();
    const handleGamepadDisconnected = () => checkGamepad();
    
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      mounted = false;
      removeDeviceListener?.();
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  const hints = useMemo((): ControlHint[] => {
    if (!device) return [];

    if (hasGamepad) {
      return options.gamepadHints || DEFAULT_GAMEPAD_HINTS;
    }

    if (device.isMobile || device.isTablet) {
      return options.touchHints || DEFAULT_TOUCH_HINTS;
    }

    return options.keyboardHints || DEFAULT_KEYBOARD_HINTS;
  }, [device, hasGamepad, options.keyboardHints, options.gamepadHints, options.touchHints]);

  return {
    hints,
    deviceType: hasGamepad ? 'gamepad' : (device?.isMobile || device?.isTablet ? 'touch' : 'keyboard'),
    hasGamepad
  };
}
