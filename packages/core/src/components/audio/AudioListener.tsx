/**
 * AudioListener Component
 *
 * Syncs Three.js AudioListener with the scene camera.
 * @module components/audio
 */

import { useThree } from '@react-three/fiber';
import { useAudioListener } from './context';
import type { AudioListenerProps } from './types';

/**
 * Three.js Audio Listener.
 *
 * Syncs the virtual microphone with the active scene camera. Required for
 * 3D spatial audio calculations. Automatically managed by `AudioProvider`.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * <AudioListener camera={customCamera} />
 * ```
 */
export function AudioListener({ camera: propCamera }: AudioListenerProps) {
  const { camera: defaultCamera } = useThree();
  const listener = useAudioListener();
  const camera = propCamera ?? defaultCamera;

  if (listener && listener.parent !== camera) {
    listener.parent?.remove(listener);
    camera.add(listener);
  }

  return null;
}
