import { interactionGroups, type RapierRigidBody, RigidBody } from '@react-three/rapier';
import type React from 'react';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CollisionLayer,
  createDefaultDestructibleConfig,
  type DestructibleConfig,
  generateDebrisVelocity,
} from '@strata-game-library/core';

/**
 * Props for the Destructible component.
 * @category Entities & Simulation
 * @interface DestructibleProps
 */
export interface DestructibleProps {
  /** Initial position. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Overall size of the destructible object. Default: [1, 1, 1]. */
  size?: [number, number, number];
  /** Configuration for health, debris count, and explosion forces. */
  config?: Partial<DestructibleConfig>;
  /** Callback fired when the object is fully destroyed. */
  onBreak?: () => void;
  /** Callback fired whenever the object takes damage. */
  onDamage?: (remainingHealth: number) => void;
  /** Child components (the visual representation of the intact object). */
  children?: React.ReactNode;
}

/**
 * Ref interface for Destructible imperative control.
 * @category Entities & Simulation
 * @interface DestructibleRef
 */
export interface DestructibleRef {
  /** Get the underlying Rapier rigid body. */
  getRigidBody: () => RapierRigidBody | null;
  /** Apply damage to the object. */
  damage: (amount: number) => void;
  /** Instantly destroy the object. */
  destroy: () => void;
  /** Get current health points. */
  getHealth: () => number;
}

/**
 * Breakable physics object that shatters into dynamic debris.
 *
 * Simulates a destructible entity with health. When health reaches zero,
 * the intact mesh is replaced with several smaller debris rigid bodies.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <Destructible
 *   position={[0, 2, 0]}
 *   size={[1, 1, 1]}
 *   config={{ health: 50, shardCount: 12 }}
 *   onBreak={() => console.log('Crate shattered!')}
 * >
 *   <mesh>
 *     <boxGeometry args={[1, 1, 1]} />
 *     <meshStandardMaterial color="#8B4513" />
 *   </mesh>
 * </Destructible>
 * ```
 */
export const Destructible = forwardRef<DestructibleRef, DestructibleProps>(
  (
    { position = [0, 0, 0], size = [1, 1, 1], config: configOverride, onBreak, onDamage, children },
    ref
  ) => {
    const config = useMemo(
      () => ({
        ...createDefaultDestructibleConfig(),
        ...configOverride,
      }),
      [configOverride]
    );

    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const [health, setHealth] = useState(config.health);
    const [destroyed, setDestroyed] = useState(false);
    const [shards, setShards] = useState<
      {
        position: [number, number, number];
        velocity: THREE.Vector3;
        scale: [number, number, number];
        id: number;
      }[]
    >([]);

    const createShards = useCallback(() => {
      if (!rigidBodyRef.current) return;

      const pos = rigidBodyRef.current.translation();
      const center = new THREE.Vector3(pos.x, pos.y, pos.z);

      const newShards = [];
      for (let i = 0; i < config.shardCount; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * size[0],
          (Math.random() - 0.5) * size[1],
          (Math.random() - 0.5) * size[2]
        );

        const shardPos = center.clone().add(offset);
        const velocity = generateDebrisVelocity(center, shardPos, config.explosionForce);

        newShards.push({
          position: [shardPos.x, shardPos.y, shardPos.z] as [number, number, number],
          velocity,
          scale: [
            config.shardScale[0] * (0.5 + Math.random() * 0.5),
            config.shardScale[1] * (0.5 + Math.random() * 0.5),
            config.shardScale[2] * (0.5 + Math.random() * 0.5),
          ] as [number, number, number],
          id: i,
        });
      }

      setShards(newShards);

      setTimeout(() => {
        setShards([]);
      }, config.shardLifetime * 1000);
    }, [config, size]);

    const damage = useCallback(
      (amount: number) => {
        setHealth((prev: number) => {
          const newHealth = Math.max(0, prev - amount);
          onDamage?.(newHealth);

          if (newHealth <= 0 && !destroyed) {
            setDestroyed(true);
            createShards();
            onBreak?.();
          }

          return newHealth;
        });
      },
      [destroyed, onDamage, onBreak, createShards]
    );

    const destroy = useCallback(() => {
      if (!destroyed) {
        damage(health);
      }
    }, [destroyed, damage, health]);

    useImperativeHandle(ref, () => ({
      getRigidBody: () => rigidBodyRef.current,
      damage,
      destroy,
      getHealth: () => health,
    }));

    if (destroyed) {
      return (
        <>
          {shards.map((shard) => (
            <RigidBody
              key={shard.id}
              position={shard.position}
              type="dynamic"
              colliders="cuboid"
              mass={config.shardMass}
              linearDamping={0.5}
              angularDamping={0.5}
              collisionGroups={interactionGroups(CollisionLayer.Debris)}
            >
              <mesh scale={shard.scale} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </RigidBody>
          ))}
        </>
      );
    }

    return (
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        type="dynamic"
        colliders="cuboid"
        collisionGroups={interactionGroups(CollisionLayer.Dynamic)}
        onCollisionEnter={() => {
          damage(config.breakForce + 1);
        }}
      >
        {children}
      </RigidBody>
    );
  }
);

Destructible.displayName = 'Destructible';
