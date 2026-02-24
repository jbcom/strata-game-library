import { useFrame } from '@react-three/fiber';
import {
  CapsuleCollider,
  interactionGroups,
  type RapierRigidBody,
  RigidBody,
  useRapier,
} from '@react-three/rapier';
import type React from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import {
  type CharacterControllerConfig,
  CollisionLayer,
  calculateJumpImpulse,
  createDefaultCharacterConfig,
  isWalkableSlope,
} from '../../core/physics';

/**
 * Props for the CharacterController component.
 * @category Entities & Simulation
 * @interface CharacterControllerProps
 */
export interface CharacterControllerProps {
  /** Initial position in 3D space. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Configuration for movement, jumping, and physical dimensions. */
  config?: Partial<CharacterControllerConfig>;
  /** Whether to enable built-in WASD/Arrow keyboard input. Default: true. */
  enableInput?: boolean;
  /** Custom key mapping for controls. */
  inputMap?: {
    forward?: string[];
    backward?: string[];
    left?: string[];
    right?: string[];
    jump?: string[];
    sprint?: string[];
  };
  /** Speed multiplier when sprinting. Default: 1.5. */
  sprintMultiplier?: number;
  /** Callback fired when grounded state changes. */
  onGroundedChange?: (grounded: boolean) => void;
  /** Callback fired when a jump is initiated. */
  onJump?: () => void;
  /** Callback fired when landing on ground with impact velocity. */
  onLand?: (velocity: number) => void;
  /** Child components (typically the character mesh). */
  children?: React.ReactNode;
}

/**
 * Ref interface for CharacterController imperative control.
 * @category Entities & Simulation
 * @interface CharacterControllerRef
 */
export interface CharacterControllerRef {
  /** Get the underlying Rapier rigid body. */
  getRigidBody: () => RapierRigidBody | null;
  /** Get the current world position. */
  getPosition: () => THREE.Vector3;
  /** Get the current velocity vector. */
  getVelocity: () => THREE.Vector3;
  /** Manually set the character's position. */
  setPosition: (position: [number, number, number]) => void;
  /** Apply an external impulse to the character. */
  applyImpulse: (impulse: [number, number, number]) => void;
  /** Check if the character is currently on the ground. */
  isGrounded: () => boolean;
  /** Trigger a jump manually. */
  jump: () => void;
}

/**
 * Advanced Character Controller with ground detection, jumping, and locomotion.
 *
 * Provides a robust physical foundation for first-person and third-person characters.
 * Features built-in ground checking, slope limits, coyote time, and jump buffering.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <CharacterController
 *   position={[0, 2, 0]}
 *   enableInput
 *   onJump={() => playSound('jump')}
 * >
 *   <mesh>
 *     <capsuleGeometry args={[0.3, 1.2]} />
 *     <meshStandardMaterial color="blue" />
 *   </mesh>
 * </CharacterController>
 * ```
 */
export const CharacterController = forwardRef<CharacterControllerRef, CharacterControllerProps>(
  (
    {
      position = [0, 0, 0],
      config: configOverride,
      enableInput = true,
      inputMap = {
        forward: ['KeyW', 'ArrowUp'],
        backward: ['KeyS', 'ArrowDown'],
        left: ['KeyA', 'ArrowLeft'],
        right: ['KeyD', 'ArrowRight'],
        jump: ['Space'],
        sprint: ['ShiftLeft', 'ShiftRight'],
      },
      sprintMultiplier = 1.5,
      onGroundedChange,
      onJump,
      onLand,
      children,
    },
    ref
  ) => {
    const config = useMemo(
      () => ({
        ...createDefaultCharacterConfig(),
        ...configOverride,
      }),
      [configOverride]
    );

    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const { rapier, world } = useRapier();

    const [_grounded, setGrounded] = useState(false);
    const groundedRef = useRef(false);
    const jumpCountRef = useRef(0);
    const coyoteTimeRef = useRef(0);
    const jumpBufferRef = useRef(0);
    const wasGroundedRef = useRef(false);

    const inputRef = useRef({
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
    });

    const velocityRef = useRef(new THREE.Vector3());
    const lastGroundNormalRef = useRef(new THREE.Vector3(0, 1, 0));

    useImperativeHandle(ref, () => ({
      getRigidBody: () => rigidBodyRef.current,
      getPosition: () => {
        if (!rigidBodyRef.current) return new THREE.Vector3(...position);
        const pos = rigidBodyRef.current.translation();
        return new THREE.Vector3(pos.x, pos.y, pos.z);
      },
      getVelocity: () => velocityRef.current.clone(),
      setPosition: (newPos: [number, number, number]) => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setTranslation({ x: newPos[0], y: newPos[1], z: newPos[2] }, true);
        }
      },
      applyImpulse: (impulse: [number, number, number]) => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.applyImpulse({ x: impulse[0], y: impulse[1], z: impulse[2] }, true);
        }
      },
      isGrounded: () => groundedRef.current,
      jump: () => performJump(),
    }));

    useEffect(() => {
      if (!enableInput) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (inputMap.forward?.includes(e.code)) inputRef.current.forward = true;
        if (inputMap.backward?.includes(e.code)) inputRef.current.backward = true;
        if (inputMap.left?.includes(e.code)) inputRef.current.left = true;
        if (inputMap.right?.includes(e.code)) inputRef.current.right = true;
        if (inputMap.jump?.includes(e.code)) inputRef.current.jump = true;
        if (inputMap.sprint?.includes(e.code)) inputRef.current.sprint = true;
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (inputMap.forward?.includes(e.code)) inputRef.current.forward = false;
        if (inputMap.backward?.includes(e.code)) inputRef.current.backward = false;
        if (inputMap.left?.includes(e.code)) inputRef.current.left = false;
        if (inputMap.right?.includes(e.code)) inputRef.current.right = false;
        if (inputMap.jump?.includes(e.code)) inputRef.current.jump = false;
        if (inputMap.sprint?.includes(e.code)) inputRef.current.sprint = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [enableInput, inputMap]);

    const checkGrounded = useCallback(() => {
      if (!rigidBodyRef.current) return false;

      const pos = rigidBodyRef.current.translation();
      const rayOrigin = { x: pos.x, y: pos.y, z: pos.z };
      const rayDir = { x: 0, y: -1, z: 0 };
      const rayLength = config.capsuleHeight / 2 + config.groundCheckDistance;

      const ray = new rapier.Ray(rayOrigin, rayDir);
      const hit = world.castRay(ray, rayLength, true);

      if (hit) {
        const _hitPoint = ray.pointAt(hit.timeOfImpact);
        const normal = hit.collider.castRayAndGetNormal(ray, rayLength, true)?.normal;

        if (normal) {
          const normalVec = new THREE.Vector3(normal.x, normal.y, normal.z);
          lastGroundNormalRef.current.copy(normalVec);

          if (isWalkableSlope(normalVec, config.slopeLimit)) {
            return true;
          }
        }
      }

      return false;
    }, [config, rapier, world]);

    const performJump = useCallback(() => {
      if (!rigidBodyRef.current) return;
      if (jumpCountRef.current >= config.maxJumps) return;

      const impulse = calculateJumpImpulse(
        config.jumpForce,
        9.81 * config.gravityScale,
        config.mass
      );
      rigidBodyRef.current.applyImpulse({ x: 0, y: impulse, z: 0 }, true);

      jumpCountRef.current++;
      groundedRef.current = false;
      setGrounded(false);
      coyoteTimeRef.current = 0;
      jumpBufferRef.current = 0;

      onJump?.();
    }, [config, onJump]);

    const moveDir = useMemo(() => new THREE.Vector3(), []);
    const cameraDirection = useMemo(() => new THREE.Vector3(), []);
    const cameraRight = useMemo(() => new THREE.Vector3(), []);
    const worldMoveDir = useMemo(() => new THREE.Vector3(), []);
    const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
    const currentHorizontalVel = useMemo(() => new THREE.Vector2(), []);
    const targetHorizontalVel = useMemo(() => new THREE.Vector2(), []);

    useFrame((state, delta) => {
      if (!rigidBodyRef.current) return;

      const isGroundedNow = checkGrounded();

      if (isGroundedNow) {
        coyoteTimeRef.current = config.coyoteTime;
        jumpCountRef.current = 0;

        if (!wasGroundedRef.current) {
          const vel = rigidBodyRef.current.linvel();
          onLand?.(Math.abs(vel.y));
        }
      } else {
        coyoteTimeRef.current = Math.max(0, coyoteTimeRef.current - delta);
      }

      const effectivelyGrounded = isGroundedNow || coyoteTimeRef.current > 0;

      if (effectivelyGrounded !== groundedRef.current) {
        groundedRef.current = effectivelyGrounded;
        setGrounded(effectivelyGrounded);
        onGroundedChange?.(effectivelyGrounded);
      }

      wasGroundedRef.current = isGroundedNow;

      if (inputRef.current.jump) {
        jumpBufferRef.current = config.jumpBufferTime;
      } else {
        jumpBufferRef.current = Math.max(0, jumpBufferRef.current - delta);
      }

      if (
        jumpBufferRef.current > 0 &&
        coyoteTimeRef.current > 0 &&
        jumpCountRef.current < config.maxJumps
      ) {
        performJump();
      }

      const input = inputRef.current;
      moveDir.set(0, 0, 0);

      if (input.forward) moveDir.z -= 1;
      if (input.backward) moveDir.z += 1;
      if (input.left) moveDir.x -= 1;
      if (input.right) moveDir.x += 1;

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
      }

      const camera = state.camera;
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      cameraRight.crossVectors(upVec, cameraDirection).normalize();

      worldMoveDir
        .set(0, 0, 0)
        .addScaledVector(cameraRight, -moveDir.x)
        .addScaledVector(cameraDirection, -moveDir.z);

      if (worldMoveDir.lengthSq() > 0) {
        worldMoveDir.normalize();
      }

      const currentVel = rigidBodyRef.current.linvel();
      velocityRef.current.set(currentVel.x, currentVel.y, currentVel.z);

      const maxSpeed = config.maxSpeed * (input.sprint ? sprintMultiplier : 1);
      const accel = effectivelyGrounded
        ? config.acceleration
        : config.acceleration * config.airControl;
      const decel = effectivelyGrounded
        ? config.deceleration
        : config.deceleration * config.airControl;

      const targetVelX = worldMoveDir.x * maxSpeed;
      const targetVelZ = worldMoveDir.z * maxSpeed;

      currentHorizontalVel.set(currentVel.x, currentVel.z);
      targetHorizontalVel.set(targetVelX, targetVelZ);

      let newVelX = currentVel.x;
      let newVelZ = currentVel.z;

      if (targetHorizontalVel.lengthSq() > 0.001) {
        newVelX += (targetVelX - currentVel.x) * Math.min(1, accel * delta);
        newVelZ += (targetVelZ - currentVel.z) * Math.min(1, accel * delta);
      } else {
        newVelX *= Math.max(0, 1 - decel * delta);
        newVelZ *= Math.max(0, 1 - decel * delta);
      }

      rigidBodyRef.current.setLinvel({ x: newVelX, y: currentVel.y, z: newVelZ }, true);
    });

    return (
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        type="dynamic"
        colliders={false}
        mass={config.mass}
        lockRotations
        gravityScale={config.gravityScale}
        linearDamping={0.1}
        collisionGroups={interactionGroups(CollisionLayer.Character)}
      >
        <CapsuleCollider
          args={[config.capsuleHeight / 2 - config.capsuleRadius, config.capsuleRadius]}
          position={[0, config.capsuleHeight / 2, 0]}
        />
        {children}
      </RigidBody>
    );
  }
);

CharacterController.displayName = 'CharacterController';
