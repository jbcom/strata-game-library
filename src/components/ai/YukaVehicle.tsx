import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import type { YukaVehicleProps, YukaVehicleRef } from './types';
import { syncYukaToThree } from './utils';
import { useYukaContext } from './YukaEntityManager';

/**
 * Autonomous vehicle agent with steering behaviors.
 * Syncs Yuka AI transforms to Three.js objects automatically.
 *
 * @category Entities & Simulation
 * @example
 * ```tsx
 * <YukaVehicle
 *   maxSpeed={3}
 *   position={[0, 0, 0]}
 * >
 *   <mesh><boxGeometry /></mesh>
 * </YukaVehicle>
 * ```
 */
export const YukaVehicle = forwardRef<YukaVehicleRef, YukaVehicleProps>(function YukaVehicle(
    {
        maxSpeed = 5,
        maxForce = 10,
        mass = 1,
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        children,
        onUpdate,
    },
    ref
) {
    const { register, unregister } = useYukaContext();
    const groupRef = useRef<THREE.Group>(null);
    const vehicleRef = useRef<YUKA.Vehicle>(new YUKA.Vehicle());

    useEffect(() => {
        const vehicle = vehicleRef.current;
        vehicle.maxSpeed = maxSpeed;
        vehicle.maxForce = maxForce;
        vehicle.mass = mass;
        vehicle.position.set(position[0], position[1], position[2]);

        const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
        const quaternion = new THREE.Quaternion().setFromEuler(euler);
        vehicle.rotation.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

        register(vehicle);

        return () => {
            unregister(vehicle);
        };
    }, [register, unregister, maxSpeed, maxForce, mass, position, rotation]);

    useFrame((_, delta) => {
        const vehicle = vehicleRef.current;
        const group = groupRef.current;

        if (group) {
            syncYukaToThree(vehicle, group);
        }

        if (onUpdate) {
            onUpdate(vehicle, delta);
        }
    });

    useImperativeHandle(
        ref,
        () => ({
            vehicle: vehicleRef.current,
            addBehavior: (behavior: YUKA.SteeringBehavior) => {
                vehicleRef.current.steering.add(behavior);
            },
            removeBehavior: (behavior: YUKA.SteeringBehavior) => {
                vehicleRef.current.steering.remove(behavior);
            },
            clearBehaviors: () => {
                vehicleRef.current.steering.clear();
            },
        }),
        []
    );

    return <group ref={groupRef}>{children}</group>;
});
