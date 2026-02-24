import {
  BallCollider,
  CapsuleCollider,
  CuboidCollider,
  interactionGroups,
  type RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import React, {
  createRef,
  forwardRef,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CollisionLayer, createHumanoidRagdoll, type RagdollConfig } from '../../core/physics';

/**
 * Props for the Ragdoll component.
 * @category Entities & Simulation
 */
export interface RagdollProps {
  /** Initial world position. Default: [0, 0, 0]. */
  position?: [number, number, number];
  /** Configuration for body parts, masses, and joints. */
  config?: Partial<RagdollConfig>;
  /** Overall scale multiplier for the ragdoll. Default: 1.0. */
  scale?: number;
  /** Whether the ragdoll physics is currently active. Default: true. */
  active?: boolean;
  /** Initial velocity applied to all parts when activated. */
  initialVelocity?: [number, number, number];
  /** Child mesh components (shown when inactive). */
  children?: React.ReactNode;
}

/**
 * Ref interface for Ragdoll.
 * @category Entities & Simulation
 */
export interface RagdollRef {
  /** Manually activate the physics simulation. */
  activate: () => void;
  /** Deactivate physics and return to group rendering. */
  deactivate: () => void;
  /** Apply a force impulse to all body parts. */
  applyForceToAll: (force: [number, number, number]) => void;
  /** Get a specific body part's rigid body by name. */
  getBodyPart: (name: string) => RapierRigidBody | null;
}

const RagdollSphericalJoint = ({
  bodyA,
  bodyB,
  anchor1,
  anchor2,
}: {
  bodyA: RefObject<RapierRigidBody | null>;
  bodyB: RefObject<RapierRigidBody | null>;
  anchor1: [number, number, number];
  anchor2: [number, number, number];
}) => {
  useSphericalJoint(bodyA as RefObject<RapierRigidBody>, bodyB as RefObject<RapierRigidBody>, [
    anchor1,
    anchor2,
  ]);
  return null;
};

const RagdollRevoluteJoint = ({
  bodyA,
  bodyB,
  anchor1,
  anchor2,
  axis,
}: {
  bodyA: RefObject<RapierRigidBody | null>;
  bodyB: RefObject<RapierRigidBody | null>;
  anchor1: [number, number, number];
  anchor2: [number, number, number];
  axis: [number, number, number];
}) => {
  useRevoluteJoint(bodyA as RefObject<RapierRigidBody>, bodyB as RefObject<RapierRigidBody>, [
    anchor1,
    anchor2,
    axis,
  ]);
  return null;
};

/**
 * Articulated Ragdoll Physics Body.
 *
 * Creates a complex multi-part rigid body system connected with spherical
 * and revolute joints. Perfect for character deaths, impacts, or physical puppets.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <Ragdoll
 *   scale={1.2}
 *   initialVelocity={[0, 0, 5]}
 *   active={isDead}
 * >
 *   <ModelMesh />
 * </Ragdoll>
 * ```
 */
export const Ragdoll = forwardRef<RagdollRef, RagdollProps>(
  (
    {
      position = [0, 0, 0],
      config: configOverride,
      scale = 1,
      active = true,
      initialVelocity = [0, 0, 0],
      children,
    },
    ref
  ) => {
    const config = useMemo(
      () => ({
        ...createHumanoidRagdoll(scale),
        ...configOverride,
      }),
      [scale, configOverride]
    );

    const [isActive, setIsActive] = useState(active);

    const bodyPartRefs = useMemo(() => {
      const refs: Record<string, RefObject<RapierRigidBody | null>> = {};
      config.bodyParts.forEach((part) => {
        refs[part.name] = createRef<RapierRigidBody>();
      });
      return refs;
    }, [config.bodyParts]);

    const bodyPartsMapRef = useRef<Map<string, RapierRigidBody>>(new Map());

    useImperativeHandle(ref, () => ({
      activate: () => setIsActive(true),
      deactivate: () => setIsActive(false),
      applyForceToAll: (force: [number, number, number]) => {
        bodyPartsMapRef.current.forEach((body) => {
          body.applyImpulse({ x: force[0], y: force[1], z: force[2] }, true);
        });
      },
      getBodyPart: (name: string) => bodyPartsMapRef.current.get(name) || null,
    }));

    useEffect(() => {
      Object.entries(bodyPartRefs).forEach(([name, refObj]) => {
        if (refObj.current) {
          bodyPartsMapRef.current.set(name, refObj.current);
          if (initialVelocity.some((v) => v !== 0)) {
            refObj.current.setLinvel(
              { x: initialVelocity[0], y: initialVelocity[1], z: initialVelocity[2] },
              true
            );
          }
        }
      });
    }, [bodyPartRefs, initialVelocity]);

    if (!isActive) {
      return <group position={position}>{children}</group>;
    }

    return (
      <group position={position}>
        {config.bodyParts.map((part) => {
          const partPos: [number, number, number] = [
            part.position[0],
            part.position[1],
            part.position[2],
          ];

          return (
            <RigidBody
              key={part.name}
              ref={bodyPartRefs[part.name]}
              position={partPos}
              type="dynamic"
              colliders={false}
              mass={part.mass}
              linearDamping={config.linearDamping}
              angularDamping={config.angularDamping}
              collisionGroups={interactionGroups(CollisionLayer.Character)}
            >
              {part.type === 'sphere' && (
                <>
                  <BallCollider args={[(part.size as [number])[0]]} />
                  <mesh castShadow>
                    <sphereGeometry args={[(part.size as [number])[0]]} />
                    <meshStandardMaterial color="#e0b0a0" />
                  </mesh>
                </>
              )}
              {part.type === 'capsule' && (
                <>
                  <CapsuleCollider
                    args={[
                      (part.size as [number, number])[1] / 2,
                      (part.size as [number, number])[0],
                    ]}
                  />
                  <mesh castShadow rotation={part.rotation || [0, 0, 0]}>
                    <capsuleGeometry
                      args={[
                        (part.size as [number, number])[0],
                        (part.size as [number, number])[1],
                      ]}
                    />
                    <meshStandardMaterial color="#e0b0a0" />
                  </mesh>
                </>
              )}
              {part.type === 'box' && (
                <>
                  <CuboidCollider
                    args={[
                      (part.size as [number, number, number])[0] / 2,
                      (part.size as [number, number, number])[1] / 2,
                      (part.size as [number, number, number])[2] / 2,
                    ]}
                  />
                  <mesh castShadow>
                    <boxGeometry args={part.size as [number, number, number]} />
                    <meshStandardMaterial color="#e0b0a0" />
                  </mesh>
                </>
              )}
            </RigidBody>
          );
        })}

        {config.joints.map((joint, index) => {
          const parentRef = bodyPartRefs[joint.parent];
          const childRef = bodyPartRefs[joint.child];

          if (!parentRef || !childRef) return null;

          if (joint.type === 'spherical') {
            return (
              <RagdollSphericalJoint
                key={`joint-${index}-${joint.parent}-${joint.child}`}
                bodyA={parentRef}
                bodyB={childRef}
                anchor1={joint.anchor1}
                anchor2={joint.anchor2}
              />
            );
          }

          if (joint.type === 'revolute' && joint.axis) {
            return (
              <RagdollRevoluteJoint
                key={`joint-${index}-${joint.parent}-${joint.child}`}
                bodyA={parentRef}
                bodyB={childRef}
                anchor1={joint.anchor1}
                anchor2={joint.anchor2}
                axis={joint.axis}
              />
            );
          }

          return null;
        })}
      </group>
    );
  }
);

Ragdoll.displayName = 'Ragdoll';
