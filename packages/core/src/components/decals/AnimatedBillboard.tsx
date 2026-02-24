import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  applySpriteSheetFrame,
  createSpriteSheetAnimation,
  type SpriteAnimationState,
  type SpriteSheetConfig,
  updateSpriteSheetAnimation,
} from '../../core/decals';
import type { AnimatedBillboardProps, AnimatedBillboardRef } from './types';

/**
 * Animated Sprite Sheet Billboard.
 *
 * Efficiently renders and animates sprite sheets on a camera-facing plane.
 * Features automated playback, looping, and ping-pong modes for effects and 2D characters.
 *
 * @category World Building
 * @example
 * ```tsx
 * <AnimatedBillboard
 *   texture={explosionSheet}
 *   columns={8}
 *   rows={8}
 *   frameRate={30}
 *   loop={false}
 * />
 * ```
 */
export const AnimatedBillboard = forwardRef<AnimatedBillboardRef, AnimatedBillboardProps>(
  (
    {
      texture,
      columns,
      rows,
      frameCount,
      frameRate = 10,
      loop = true,
      pingPong = false,
      autoPlay = true,
      onAnimationComplete,
      position = [0, 0, 0],
      size = 1,
      color = 0xffffff,
      opacity = 1,
      transparent = true,
      alphaTest = 0.1,
      lockY: _lockY = false,
      depthWrite = false,
      renderOrder = 0,
    },
    ref
  ) => {
    const spriteRef = useRef<THREE.Sprite>(null);
    const materialRef = useRef<THREE.SpriteMaterial>(null);

    const animState = useRef<SpriteAnimationState>(
      createSpriteSheetAnimation({
        columns,
        rows,
        frameCount,
        frameRate,
        loop,
        pingPong,
      })
    );

    const config: SpriteSheetConfig = useMemo(
      () => ({
        columns,
        rows,
        frameCount,
        frameRate,
        loop,
        pingPong,
      }),
      [columns, rows, frameCount, frameRate, loop, pingPong]
    );

    const pos = useMemo(
      () => (position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)),
      [position]
    );

    const billboardSize = useMemo(() => {
      if (typeof size === 'number') {
        return [size, size] as [number, number];
      }
      return size;
    }, [size]);

    const clonedTexture = useMemo(() => {
      const t = texture.clone();
      t.repeat.set(1 / columns, 1 / rows);
      t.needsUpdate = true;
      return t;
    }, [texture, columns, rows]);

    useEffect(() => {
      animState.current.isPlaying = autoPlay;
    }, [autoPlay]);

    useImperativeHandle(
      ref,
      () => ({
        mesh: null,
        sprite: spriteRef.current,
        play: () => {
          animState.current.isPlaying = true;
        },
        pause: () => {
          animState.current.isPlaying = false;
        },
        reset: () => {
          animState.current.currentFrame = 0;
          animState.current.elapsedTime = 0;
          animState.current.direction = 1;
          animState.current.isPlaying = autoPlay;
          applySpriteSheetFrame(clonedTexture, 0, config);
        },
        setFrame: (frame: number) => {
          animState.current.currentFrame = frame;
          applySpriteSheetFrame(clonedTexture, frame, config);
        },
        get currentFrame() {
          return animState.current.currentFrame;
        },
      }),
      [autoPlay, clonedTexture, config]
    );

    useFrame((_, delta) => {
      const prevFrame = animState.current.currentFrame;
      const wasPlaying = animState.current.isPlaying;

      animState.current = updateSpriteSheetAnimation(animState.current, config, delta);

      if (animState.current.currentFrame !== prevFrame) {
        applySpriteSheetFrame(clonedTexture, animState.current.currentFrame, config);
      }

      if (wasPlaying && !animState.current.isPlaying && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    useEffect(() => {
      return () => {
        clonedTexture.dispose();
      };
    }, [clonedTexture]);

    return (
      <sprite
        ref={spriteRef}
        position={pos}
        renderOrder={renderOrder}
        scale={[billboardSize[0], billboardSize[1], 1]}
      >
        <spriteMaterial
          ref={materialRef}
          map={clonedTexture}
          color={color}
          transparent={transparent}
          opacity={opacity}
          alphaTest={alphaTest}
          depthWrite={depthWrite}
        />
      </sprite>
    );
  }
);

AnimatedBillboard.displayName = 'AnimatedBillboard';
