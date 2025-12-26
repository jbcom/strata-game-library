import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { LightningProps } from './types';

/**
 * Procedural Lightning Strike System.
 *
 * Generates randomized lightning bolts and screen-space ambient flashes during
 * storm events. Features automatic timing and callback support for thunder audio.
 *
 * @category World Building
 * @example
 * ```tsx
 * <Lightning
 *   active={true}
 *   frequency={0.2}
 *   onStrike={() => playThunder()}
 * />
 * ```
 */
export function Lightning({
    active = true,
    frequency = 0.1,
    boltColor = 0xccccff,
    flashColor = 0xffffff,
    flashIntensity = 2,
    onStrike,
}: LightningProps) {
    const [flash, setFlash] = useState(0);
    const [boltLine, setBoltLine] = useState<THREE.Line | null>(null);
    const lastStrike = useRef(0);
    const overlayRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const boltMaterial = useMemo(() => {
        return new THREE.LineBasicMaterial({
            color: new THREE.Color(boltColor),
            linewidth: 2,
            transparent: true,
            opacity: 1,
        });
    }, [boltColor]);

    const flashMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color(flashColor),
            transparent: true,
            opacity: 0,
            depthTest: false,
        });
    }, [flashColor]);

    const generateBolt = (
        start: THREE.Vector3,
        end: THREE.Vector3,
        segments: number = 8
    ): THREE.Vector3[] => {
        const points: THREE.Vector3[] = [start.clone()];
        const direction = end.clone().sub(start);
        const segmentLength = direction.length() / segments;
        direction.normalize();

        let current = start.clone();
        for (let i = 1; i < segments; i++) {
            current = current.clone().add(direction.clone().multiplyScalar(segmentLength));
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 5
            );
            points.push(current.clone().add(offset));
        }
        points.push(end.clone());

        return points;
    };

    useFrame((state, delta) => {
        if (!active) {
            setFlash(0);
            if (boltLine && groupRef.current) {
                groupRef.current.remove(boltLine);
                boltLine.geometry.dispose();
                setBoltLine(null);
            }
            return;
        }

        const timeSinceLastStrike = state.clock.elapsedTime - lastStrike.current;
        const strikeChance = frequency * delta;

        if (timeSinceLastStrike > 2 && Math.random() < strikeChance) {
            const startX = (Math.random() - 0.5) * 100;
            const startZ = (Math.random() - 0.5) * 100;
            const startPoint = new THREE.Vector3(startX, 50, startZ);
            const endPoint = new THREE.Vector3(
                startX + (Math.random() - 0.5) * 20,
                0,
                startZ + (Math.random() - 0.5) * 20
            );

            const boltPoints = generateBolt(startPoint, endPoint);

            if (boltLine && groupRef.current) {
                groupRef.current.remove(boltLine);
                boltLine.geometry.dispose();
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(boltPoints);
            const line = new THREE.Line(geometry, boltMaterial);
            setBoltLine(line);

            if (groupRef.current) {
                groupRef.current.add(line);
            }

            setFlash(flashIntensity);
            lastStrike.current = state.clock.elapsedTime;
            onStrike?.();
        }

        if (flash > 0) {
            setFlash((prev) => Math.max(0, prev - delta * 8));
        }

        if (boltLine && flash <= 0.1 && groupRef.current) {
            groupRef.current.remove(boltLine);
            boltLine.geometry.dispose();
            setBoltLine(null);
        }

        if (flashMaterial) {
            flashMaterial.opacity = Math.min(flash * 0.3, 0.5);
        }

        if (boltLine) {
            boltMaterial.opacity = flash / flashIntensity;
        }
    });

    useEffect(() => {
        return () => {
            boltMaterial.dispose();
            flashMaterial.dispose();
            if (boltLine) {
                boltLine.geometry.dispose();
            }
        };
    }, [boltMaterial, flashMaterial, boltLine]);

    return (
        <>
            <group ref={groupRef} />
            <mesh ref={overlayRef} renderOrder={1000}>
                <planeGeometry args={[2, 2]} />
                <primitive object={flashMaterial} attach="material" />
            </mesh>
        </>
    );
}
