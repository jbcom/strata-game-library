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
 * Audio listener that syncs with the camera for 3D spatial audio.
 * The listener is automatically attached to the camera in AudioProvider.
 *
 * @example
 * ```tsx
 * <AudioListener />
 *
 * <AudioListener camera={customCameraRef.current} />
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
