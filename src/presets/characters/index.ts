/**
 * Character Preset - Articulated character system
 *
 * Provides tools for creating and animating articulated characters
 * with procedural animation support for walk cycles, idle states, etc.
 */

import * as THREE from 'three';
import { createFurSystem, type FurOptions } from '../fur';

export interface CharacterJoint {
    group: THREE.Group;
    mesh?: THREE.Mesh;
    defaultRotation?: THREE.Euler;
    defaultPosition?: THREE.Vector3;
}

export interface CharacterJoints {
    hips?: CharacterJoint;
    torso?: CharacterJoint;
    head?: CharacterJoint;
    legL?: CharacterJoint;
    legR?: CharacterJoint;
    armL?: CharacterJoint;
    armR?: CharacterJoint;
    tail?: CharacterJoint;
    [key: string]: CharacterJoint | undefined;
}

export interface CharacterOptions {
    skinColor?: THREE.ColorRepresentation;
    furOptions?: FurOptions;
    scale?: number;
}

export interface CharacterState {
    speed: number;
    maxSpeed: number;
    rotation: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

/**
 * Create an articulated character with joints
 */
export function createCharacter(options: CharacterOptions = {}): {
    root: THREE.Group;
    joints: CharacterJoints;
    state: CharacterState;
} {
    const { skinColor = 0x3e2723, furOptions = {}, scale = 1.0 } = options;

    const root = new THREE.Group();
    const joints: CharacterJoints = {};
    const state: CharacterState = {
        speed: 0,
        maxSpeed: 0.15,
        rotation: 0,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
    };

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor });

    // Helper to create furry part
    function createFurryPart(geometry: THREE.BufferGeometry, parent: THREE.Group): THREE.Mesh {
        const mesh = new THREE.Mesh(geometry, skinMat);
        mesh.castShadow = true;
        parent.add(mesh);

        // Add fur system
        const furGroup = createFurSystem(geometry, skinMat, furOptions);
        mesh.add(furGroup);

        return mesh;
    }

    // HIPS (Root of animation)
    const hips = new THREE.Group();
    hips.position.y = 0.5 * scale;
    root.add(hips);
    joints.hips = { group: hips };

    const hipMesh = createFurryPart(new THREE.SphereGeometry(0.35 * scale, 16, 16), hips);
    hipMesh.scale.set(1, 1.1, 1);
    joints.hips.mesh = hipMesh;

    // TORSO
    const torso = new THREE.Group();
    torso.position.y = 0.3 * scale;
    hips.add(torso);
    joints.torso = { group: torso };

    const torsoMesh = createFurryPart(
        new THREE.CapsuleGeometry(0.32 * scale, 0.6 * scale, 4, 8),
        torso
    );
    torsoMesh.position.y = 0.3 * scale;
    joints.torso.mesh = torsoMesh;

    // HEAD
    const head = new THREE.Group();
    head.position.y = 0.7 * scale;
    torso.add(head);
    joints.head = { group: head };

    const headMesh = createFurryPart(new THREE.SphereGeometry(0.25 * scale, 16, 16), head);
    joints.head.mesh = headMesh;

    // Muzzle & Eyes (Detail)
    const muzzle = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 * scale, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    muzzle.position.set(0, -0.05 * scale, 0.2 * scale);
    muzzle.scale.set(1, 0.8, 1.2);
    headMesh.add(muzzle);

    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.05 * scale),
        new THREE.MeshBasicMaterial({ color: 0x111 })
    );
    nose.position.set(0, 0, 0.25 * scale);
    muzzle.add(nose);

    // LEGS
    const legGeo = new THREE.CapsuleGeometry(0.12 * scale, 0.4 * scale, 4, 8);

    const legL = new THREE.Group();
    legL.position.set(0.2 * scale, 0, 0);
    hips.add(legL);
    joints.legL = { group: legL };
    const legLMesh = createFurryPart(legGeo, legL);
    legLMesh.position.y = -0.25 * scale;
    joints.legL.mesh = legLMesh;

    const legR = new THREE.Group();
    legR.position.set(-0.2 * scale, 0, 0);
    hips.add(legR);
    joints.legR = { group: legR };
    const legRMesh = createFurryPart(legGeo, legR);
    legRMesh.position.y = -0.25 * scale;
    joints.legR.mesh = legRMesh;

    // ARMS
    const armGeo = new THREE.CapsuleGeometry(0.08 * scale, 0.35 * scale, 4, 8);

    const armL = new THREE.Group();
    armL.position.set(0.3 * scale, 0.5 * scale, 0.1 * scale);
    torso.add(armL);
    joints.armL = { group: armL };
    const armLMesh = createFurryPart(armGeo, armL);
    armLMesh.position.y = -0.15 * scale;
    armLMesh.rotation.z = -0.3;
    joints.armL.mesh = armLMesh;

    const armR = new THREE.Group();
    armR.position.set(-0.3 * scale, 0.5 * scale, 0.1 * scale);
    torso.add(armR);
    joints.armR = { group: armR };
    const armRMesh = createFurryPart(armGeo, armR);
    armRMesh.position.y = -0.15 * scale;
    armRMesh.rotation.z = 0.3;
    joints.armR.mesh = armRMesh;

    // TAIL
    const tail = new THREE.Group();
    tail.position.set(0, 0, -0.3 * scale);
    hips.add(tail);
    joints.tail = { group: tail };
    const tailMesh = createFurryPart(new THREE.ConeGeometry(0.15 * scale, 0.8 * scale, 8), tail);
    tailMesh.rotation.x = -1.2;
    tailMesh.position.y = -0.2 * scale;
    joints.tail.mesh = tailMesh;

    // Store default positions/rotations
    Object.values(joints).forEach((joint) => {
        if (joint) {
            joint.defaultRotation = joint.group.rotation.clone();
            joint.defaultPosition = joint.group.position.clone();
        }
    });

    return { root, joints, state };
}

/**
 * Animate character based on state
 */
export function animateCharacter(
    character: { root: THREE.Group; joints: CharacterJoints; state: CharacterState },
    time: number,
    _deltaTime: number = 0.016
): void {
    const { joints, state } = character;
    const speed = state.speed / state.maxSpeed; // 0 to 1
    const walkCycle = time * 10;

    if (speed > 0.1) {
        // Walk/Run animation
        if (joints.legL?.group) {
            joints.legL.group.rotation.x = Math.sin(walkCycle) * 0.8 * speed;
        }
        if (joints.legR?.group) {
            joints.legR.group.rotation.x = Math.sin(walkCycle + Math.PI) * 0.8 * speed;
        }

        // Arms counter-swing
        if (joints.armL?.group) {
            joints.armL.group.rotation.x = Math.sin(walkCycle + Math.PI) * 0.6 * speed;
        }
        if (joints.armR?.group) {
            joints.armR.group.rotation.x = Math.sin(walkCycle) * 0.6 * speed;
        }

        // Spine Bob
        if (joints.hips?.group) {
            joints.hips.group.position.y = 0.5 + Math.sin(walkCycle * 2) * 0.05 * speed;
        }
        if (joints.torso?.group) {
            joints.torso.group.rotation.y = Math.sin(walkCycle) * 0.1 * speed;
        }

        // Tail Sway
        if (joints.tail?.group) {
            joints.tail.group.rotation.y = Math.cos(walkCycle) * 0.4 * speed;
        }
    } else {
        // Idle Breathing
        const breath = Math.sin(time * 2);
        if (joints.hips?.group) {
            joints.hips.group.position.y = 0.5 + breath * 0.005;
        }
        if (joints.torso?.group) {
            joints.torso.group.rotation.x = breath * 0.02;
        }

        // Lerp to default positions
        const lerpSpeed = 0.1;
        if (joints.armL?.group) {
            joints.armL.group.rotation.x = THREE.MathUtils.lerp(
                joints.armL.group.rotation.x,
                0,
                lerpSpeed
            );
        }
        if (joints.armR?.group) {
            joints.armR.group.rotation.x = THREE.MathUtils.lerp(
                joints.armR.group.rotation.x,
                0,
                lerpSpeed
            );
        }
        if (joints.legL?.group) {
            joints.legL.group.rotation.x = THREE.MathUtils.lerp(
                joints.legL.group.rotation.x,
                0,
                lerpSpeed
            );
        }
        if (joints.legR?.group) {
            joints.legR.group.rotation.x = THREE.MathUtils.lerp(
                joints.legR.group.rotation.x,
                0,
                lerpSpeed
            );
        }
    }
}
