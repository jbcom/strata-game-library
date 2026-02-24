import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { CameraShake as CameraShakeCore } from '../../core/camera';
import type { CameraShakeProps, CameraShakeRef } from './types';

/**
 * Trauma-Based Camera Shake.
 *
 * Implements a robust shake system using noise patterns. Trauma decays over
 * time, creating realistic responses to impacts, explosions, or environmental stress.
 *
 * @category Player Experience
 * @example
 * ```tsx
 * const shakeRef = useRef<CameraShakeRef>(null);
 *
 * <CameraShake ref={shakeRef} intensity={1.5} />
 *
 * // Trigger shake
 * shakeRef.current?.addTrauma(0.5);
 * ```
 */
export const CameraShake = forwardRef<CameraShakeRef, CameraShakeProps>(
  (
    {
      intensity = 1,
      decay = 1.5,
      maxYaw = 0.1,
      maxPitch = 0.1,
      maxRoll = 0.1,
      yawFrequency = 25,
      pitchFrequency = 25,
      rollFrequency = 25,
    },
    ref
  ) => {
    const { camera } = useThree();
    const shakeRef = useRef<CameraShakeCore | null>(null);
    const initialRotation = useRef(new THREE.Euler());

    useEffect(() => {
      shakeRef.current = new CameraShakeCore({
        traumaDecay: decay,
        maxAngle: Math.max(maxYaw, maxPitch, maxRoll),
        maxOffset: 0,
        frequency: (yawFrequency + pitchFrequency + rollFrequency) / 3,
      });
      initialRotation.current.copy(camera.rotation);
    }, [camera, decay, maxYaw, maxPitch, maxRoll, yawFrequency, pitchFrequency, rollFrequency]);

    useImperativeHandle(ref, () => ({
      addTrauma: (amount: number) => shakeRef.current?.addTrauma(amount * intensity),
      setTrauma: (amount: number) => shakeRef.current?.setTrauma(amount * intensity),
      getTrauma: () => shakeRef.current?.getTrauma() ?? 0,
    }));

    useFrame((_, delta) => {
      if (!shakeRef.current) return;

      const { rotation } = shakeRef.current.update(delta);

      camera.rotation.x = initialRotation.current.x + rotation.x * (maxPitch / 0.1);
      camera.rotation.y = initialRotation.current.y + rotation.y * (maxYaw / 0.1);
      camera.rotation.z = initialRotation.current.z + rotation.z * (maxRoll / 0.1);
    });

    return null;
  }
);

CameraShake.displayName = 'CameraShake';
