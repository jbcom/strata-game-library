/**
 * Parallax Layer Component.
 *
 * A single layer within a parallax background system.
 * Supports infinite scrolling, depth-based movement, and day/night effects.
 *
 * @packageDocumentation
 * @module components/parallax/ParallaxLayer
 * @category Rendering Pipeline
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useParallaxContext } from './ParallaxBackground';
import type { ParallaxElement, ParallaxLayerProps } from './types';

/**
 * Renders a single parallax element.
 */
export function ParallaxElementRenderer({
  element,
  tint,
  opacity,
}: {
  element: ParallaxElement;
  tint?: THREE.Color;
  opacity: number;
}) {
  const { type, x, y, width, height, shapeData, gradientData, animation } = element;
  const meshRef = useRef<THREE.Mesh>(null);

  // Apply animation
  useFrame(({ clock }) => {
    if (!meshRef.current || !animation) return;
    const t = clock.getElapsedTime() * animation.frequency + (animation.phase ?? 0);
    const val = Math.sin(t) * animation.amplitude;

    if (animation.type === 'sway') {
      meshRef.current.rotation.z = val * 0.1;
    } else if (animation.type === 'float') {
      meshRef.current.position.y = y + val;
    } else if (animation.type === 'pulse') {
      const s = 1 + val * 0.1;
      meshRef.current.scale.set(s, s, s);
    }
  });

  const color = useMemo(() => {
    const baseColor = shapeData?.color ?? 0xffffff;
    const c = new THREE.Color(baseColor);
    if (tint) c.multiply(tint);
    return c;
  }, [shapeData?.color, tint]);

  if (type === 'shape') {
    if (shapeData?.shape === 'rect') {
      return (
        <mesh ref={meshRef} position={[x + width / 2, y + height / 2, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      );
    }
    if (shapeData?.shape === 'triangle') {
      const shape = new THREE.Shape();
      shape.moveTo(width / 2, 0);
      shape.lineTo(0, height);
      shape.lineTo(width, height);
      shape.closePath();
      return (
        <mesh ref={meshRef} position={[x, y, 0]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      );
    }
    if (shapeData?.shape === 'ellipse') {
      return (
        <mesh ref={meshRef} position={[x + width / 2, y + height / 2, 0]}>
          <circleGeometry args={[width / 2, 32]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      );
    }
    if (shapeData?.shape === 'polygon' && shapeData.points) {
      const shape = new THREE.Shape();
      shape.moveTo(shapeData.points[0][0], shapeData.points[0][1]);
      for (let i = 1; i < shapeData.points.length; i++) {
        shape.lineTo(shapeData.points[i][0], shapeData.points[i][1]);
      }
      shape.closePath();
      return (
        <mesh ref={meshRef} position={[x, y, 0]}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      );
    }
  }

  if (type === 'particles') {
    // Basic particle placeholder - would normally use a particle system
    return (
      <group position={[x, y, 0]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={`${element.type}-${i}`}
            position={[Math.random() * width, Math.random() * height, 0]}
          >
            <circleGeometry args={[1, 8]} />
            <meshBasicMaterial color={color} transparent opacity={opacity * 0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'gradient' && gradientData) {
    // Simple gradient placeholder - full implementation would use a custom shader
    return (
      <mesh position={[x + width / 2, y + height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color={new THREE.Color(gradientData.stops[0].color)}
          transparent
          opacity={opacity}
        />
      </mesh>
    );
  }

  return null;
}

/**
 * A single parallax layer that moves at a different speed based on depth.
 *
 * Layers are positioned in 3D space with their Z position determined by depth.
 * Deeper layers (higher depth values) appear further away and scroll slower,
 * creating a parallax effect.
 *
 * @category Rendering Pipeline
 *
 * @param props - Layer configuration and children
 * @returns A Three.js group containing the layer content
 *
 * @example
 * ```tsx
 * // Basic layer with horizontal scrolling
 * <ParallaxLayer
 *   id="mountains"
 *   depth={8}
 *   scrollSpeed={0.2}
 *   repeatX
 *   contentWidth={512}
 * >
 *   <MountainMesh />
 * </ParallaxLayer>
 * ```
 */
export function ParallaxLayer({
  id,
  depth,
  scrollSpeed = 0.5,
  verticalScrollSpeed = 0.2,
  repeatX = false,
  repeatY = false,
  contentWidth = 100,
  contentHeight = 100,
  opacity: baseOpacity = 1,
  tint,
  affectedByDayNight = false,
  dayNightColors,
  elements,
  children,
}: ParallaxLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const context = useParallaxContext();
  const { viewport } = useThree();

  // Calculate Z position from depth (further back = more negative)
  const zPosition = -depth;

  // Memoize tint color
  const tintColor = useMemo(() => {
    if (!tint) return null;
    if (tint instanceof THREE.Color) return tint;
    return new THREE.Color(tint);
  }, [tint]);

  // Calculate time-of-day tint
  const dayNightTint = useMemo(() => {
    if (!affectedByDayNight || !dayNightColors || !context) return null;

    const { day, night, dawn, dusk } = dayNightColors;
    const t = context.timeOfDay;

    if (t < 5 || t >= 21) {
      return new THREE.Color(night);
    } else if (t < 7) {
      const blend = (t - 5) / 2;
      return new THREE.Color(dawn).lerp(new THREE.Color(day), blend);
    } else if (t < 17) {
      return new THREE.Color(day);
    } else if (t < 19) {
      const blend = (t - 17) / 2;
      return new THREE.Color(day).lerp(new THREE.Color(dusk), blend);
    } else {
      const blend = (t - 19) / 2;
      return new THREE.Color(dusk).lerp(new THREE.Color(night), blend);
    }
  }, [affectedByDayNight, dayNightColors, context]);

  // Effective tint
  const effectiveTint = useMemo(() => {
    const color = new THREE.Color(0xffffff);
    if (tintColor) color.multiply(tintColor);
    if (dayNightTint) color.multiply(dayNightTint);
    return color;
  }, [tintColor, dayNightTint]);

  // Calculate opacity with fog
  const opacity = useMemo(() => {
    let o = baseOpacity;
    if (context?.enableDepthFog) {
      const fogAmount = 1 - Math.exp(-depth * context.fogDensity);
      o *= 1 - Math.min(fogAmount, 0.8);
    }
    return o;
  }, [depth, baseOpacity, context?.enableDepthFog, context?.fogDensity]);

  // Update layer position each frame
  useFrame((state) => {
    if (!groupRef.current) return;

    // Get scroll position from context or camera
    const scrollX = context ? context.scrollX : state.camera.position.x;
    const scrollY = context ? context.scrollY : state.camera.position.y;

    // Calculate parallax offset
    const parallaxX = scrollX * scrollSpeed;
    const parallaxY = scrollY * verticalScrollSpeed;

    // Handle infinite scrolling for repeatX
    if (repeatX && contentWidth > 0) {
      // Wrap position for seamless repeat
      const wrappedX = ((parallaxX % contentWidth) + contentWidth) % contentWidth;
      groupRef.current.position.x = -wrappedX;
    } else {
      groupRef.current.position.x = -parallaxX;
    }

    // Handle vertical parallax
    if (repeatY && contentHeight > 0) {
      const wrappedY = ((parallaxY % contentHeight) + contentHeight) % contentHeight;
      groupRef.current.position.y = -wrappedY;
    } else {
      groupRef.current.position.y = -parallaxY;
    }
  });

  // Calculate repeat instances
  const repeatInstances = useMemo(() => {
    if (!repeatX || contentWidth <= 0) return [0];
    const count = Math.ceil(viewport.width / contentWidth) + 2;
    return Array.from({ length: count }, (_, i) => i);
  }, [repeatX, contentWidth, viewport.width]);

  return (
    <group ref={groupRef} position={[0, 0, zPosition]}>
      {repeatInstances.map((i) => (
        <group
          key={`${id}-repeat-${i}`}
          position={[i * contentWidth, 0, 0]}
          userData={{
            layerId: id,
            depth,
            scrollSpeed,
            opacity,
            tint: effectiveTint.getHex(),
          }}
        >
          {children}
          {elements?.map((el, index) => (
            <ParallaxElementRenderer
              key={`${el.type}-${index}`}
              element={el}
              tint={effectiveTint}
              opacity={opacity}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Props for InfiniteRepeater component.
 */
export interface InfiniteRepeaterProps {
  /** Content to repeat */
  children: React.ReactNode;
  /** Width of a single content unit */
  contentWidth: number;
  /** Viewport width to fill */
  viewportWidth: number;
  /** Current scroll position */
  scrollX: number;
  /** Direction of repeat */
  direction?: 'horizontal' | 'vertical' | 'both';
}

/**
 * Repeats children infinitely to fill viewport.
 *
 * @category Rendering Pipeline
 * @example
 * ```tsx
 * <InfiniteRepeater
 *   contentWidth={256}
 *   viewportWidth={1920}
 *   scrollX={playerX}
 * >
 *   <TreesSegment />
 * </InfiniteRepeater>
 * ```
 */
export function InfiniteRepeater({
  children,
  contentWidth,
  viewportWidth,
  scrollX,
  direction = 'horizontal',
}: InfiniteRepeaterProps) {
  // Calculate how many copies we need
  const { instances, offset } = useMemo(() => {
    if (contentWidth <= 0) return { instances: [0], offset: 0 };

    const count = Math.ceil(viewportWidth / contentWidth) + 2;
    const normalizedScroll = ((scrollX % contentWidth) + contentWidth) % contentWidth;

    return {
      instances: Array.from({ length: count }, (_, i) => i),
      offset: -normalizedScroll - contentWidth,
    };
  }, [contentWidth, viewportWidth, scrollX]);

  return (
    <group>
      {instances.map((i) => (
        <group
          key={i}
          position={
            direction === 'horizontal'
              ? [offset + i * contentWidth, 0, 0]
              : direction === 'vertical'
                ? [0, offset + i * contentWidth, 0]
                : [offset + i * contentWidth, offset + i * contentWidth, 0]
          }
        >
          {children}
        </group>
      ))}
    </group>
  );
}
