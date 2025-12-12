/**
 * Core animation algorithms
 *
 * Pure TypeScript animation utilities including IK solvers, spring dynamics,
 * and procedural locomotion for skeletal and object-based animation.
 * @module core/animation
 */

import * as THREE from 'three';

export interface BoneChain {
    bones: THREE.Object3D[];
    lengths: number[];
    totalLength: number;
    constraints?: BoneConstraint[];
}

export interface BoneConstraint {
    boneIndex: number;
    minAngle?: number;
    maxAngle?: number;
    axis?: THREE.Vector3;
    limitType?: 'hinge' | 'ball' | 'twist';
    twistMin?: number;
    twistMax?: number;
    swingLimit?: number;
}

export interface IKSolverResult {
    positions: THREE.Vector3[];
    rotations: THREE.Quaternion[];
    reached: boolean;
    iterations: number;
    error: number;
}

export interface SpringConfig {
    stiffness: number;
    damping: number;
    mass: number;
    restLength?: number;
}

export interface SpringState {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

export interface GaitConfig {
    stepLength: number;
    stepHeight: number;
    stepDuration: number;
    bodyBob: number;
    bodySwayAmplitude: number;
    hipRotation: number;
    phaseOffset: number;
    footOvershoot: number;
}

export interface GaitState {
    phase: number;
    leftFootTarget: THREE.Vector3;
    rightFootTarget: THREE.Vector3;
    leftFootLifted: boolean;
    rightFootLifted: boolean;
    bodyOffset: THREE.Vector3;
    bodyRotation: THREE.Euler;
}

export interface LookAtConfig {
    maxAngle: number;
    speed: number;
    deadzone: number;
    smoothing: number;
    upVector?: THREE.Vector3;
    forwardVector?: THREE.Vector3;
}

export interface LookAtState {
    currentRotation: THREE.Quaternion;
    targetRotation: THREE.Quaternion;
    velocity: THREE.Vector3;
}

export function createBoneChain(bones: THREE.Object3D[]): BoneChain {
    const lengths: number[] = [];
    let totalLength = 0;

    for (let i = 0; i < bones.length - 1; i++) {
        const bonePos = new THREE.Vector3();
        const nextBonePos = new THREE.Vector3();
        bones[i].getWorldPosition(bonePos);
        bones[i + 1].getWorldPosition(nextBonePos);
        const length = bonePos.distanceTo(nextBonePos);
        lengths.push(length);
        totalLength += length;
    }

    return { bones, lengths, totalLength };
}

export function createBoneChainFromLengths(
    root: THREE.Object3D,
    boneLengths: number[],
    direction: THREE.Vector3 = new THREE.Vector3(0, -1, 0)
): BoneChain {
    const bones: THREE.Object3D[] = [root];
    const normalizedDir = direction.clone().normalize();
    let totalLength = 0;

    let parent = root;
    for (let i = 0; i < boneLengths.length; i++) {
        const bone = new THREE.Object3D();
        bone.position.copy(normalizedDir.clone().multiplyScalar(boneLengths[i]));
        parent.add(bone);
        bones.push(bone);
        totalLength += boneLengths[i];
        parent = bone;
    }

    return { bones, lengths: boneLengths, totalLength };
}

export class FABRIKSolver {
    private tolerance: number;
    private maxIterations: number;

    constructor(tolerance: number = 0.001, maxIterations: number = 20) {
        this.tolerance = tolerance;
        this.maxIterations = maxIterations;
    }

    solve(chain: BoneChain, target: THREE.Vector3, pole?: THREE.Vector3): IKSolverResult {
        const positions = chain.bones.map((bone) => {
            const pos = new THREE.Vector3();
            bone.getWorldPosition(pos);
            return pos;
        });

        const rootPosition = positions[0].clone();
        const targetDistance = rootPosition.distanceTo(target);

        if (targetDistance > chain.totalLength) {
            const direction = target.clone().sub(rootPosition).normalize();
            for (let i = 1; i < positions.length; i++) {
                positions[i].copy(
                    positions[i - 1]
                        .clone()
                        .add(direction.clone().multiplyScalar(chain.lengths[i - 1]))
                );
            }

            const rotations = this.calculateRotations(chain, positions, pole);
            return {
                positions,
                rotations,
                reached: false,
                iterations: 1,
                error: targetDistance - chain.totalLength,
            };
        }

        let error = Infinity;
        let iterations = 0;

        while (error > this.tolerance && iterations < this.maxIterations) {
            this.backward(positions, target, chain.lengths);
            this.forward(positions, rootPosition, chain.lengths);

            error = positions[positions.length - 1].distanceTo(target);
            iterations++;
        }

        if (pole) {
            this.applyPoleConstraint(positions, pole, chain.lengths);
        }

        if (chain.constraints) {
            this.applyConstraints(positions, chain.constraints);
        }

        const rotations = this.calculateRotations(chain, positions, pole);

        return {
            positions,
            rotations,
            reached: error <= this.tolerance,
            iterations,
            error,
        };
    }

    private backward(positions: THREE.Vector3[], target: THREE.Vector3, lengths: number[]): void {
        positions[positions.length - 1].copy(target);

        for (let i = positions.length - 2; i >= 0; i--) {
            const direction = positions[i]
                .clone()
                .sub(positions[i + 1])
                .normalize();
            positions[i].copy(positions[i + 1].clone().add(direction.multiplyScalar(lengths[i])));
        }
    }

    private forward(positions: THREE.Vector3[], root: THREE.Vector3, lengths: number[]): void {
        positions[0].copy(root);

        for (let i = 1; i < positions.length; i++) {
            const direction = positions[i]
                .clone()
                .sub(positions[i - 1])
                .normalize();
            positions[i].copy(
                positions[i - 1].clone().add(direction.multiplyScalar(lengths[i - 1]))
            );
        }
    }

    private applyPoleConstraint(
        positions: THREE.Vector3[],
        pole: THREE.Vector3,
        lengths: number[]
    ): void {
        if (positions.length < 3) return;

        const rootToEnd = positions[positions.length - 1].clone().sub(positions[0]);
        const chainAxis = rootToEnd.clone().normalize();

        for (let i = 1; i < positions.length - 1; i++) {
            const rootToBone = positions[i].clone().sub(positions[0]);
            const projection = chainAxis.clone().multiplyScalar(rootToBone.dot(chainAxis));
            const projectionPoint = positions[0].clone().add(projection);

            const rootToPole = pole.clone().sub(positions[0]);
            const poleProjection = chainAxis.clone().multiplyScalar(rootToPole.dot(chainAxis));
            const polePlanePoint = pole.clone().sub(poleProjection);

            const currentDirRaw = positions[i].clone().sub(projectionPoint);
            const poleDirRaw = polePlanePoint.sub(positions[0]);

            // Check lengths before normalizing (normalize always returns length 1 for non-zero vectors)
            if (currentDirRaw.lengthSq() > 0.000001 && poleDirRaw.lengthSq() > 0.000001) {
                const currentDir = currentDirRaw.normalize();
                const poleDir = poleDirRaw.normalize();
                const currentAngle = Math.atan2(
                    currentDir.dot(new THREE.Vector3().crossVectors(chainAxis, poleDir)),
                    currentDir.dot(poleDir)
                );

                const rotationQuat = new THREE.Quaternion().setFromAxisAngle(
                    chainAxis,
                    -currentAngle
                );
                const distFromProjection = positions[i].distanceTo(projectionPoint);

                positions[i].copy(projectionPoint);
                const rotatedOffset = poleDir.clone().multiplyScalar(distFromProjection);
                rotatedOffset.applyQuaternion(rotationQuat);
                positions[i].add(rotatedOffset);
            }
        }

        for (let i = 1; i < positions.length; i++) {
            const direction = positions[i]
                .clone()
                .sub(positions[i - 1])
                .normalize();
            positions[i].copy(
                positions[i - 1].clone().add(direction.multiplyScalar(lengths[i - 1]))
            );
        }
    }

    private applyConstraints(positions: THREE.Vector3[], constraints: BoneConstraint[]): void {
        for (const constraint of constraints) {
            const idx = constraint.boneIndex;
            if (idx <= 0 || idx >= positions.length - 1) continue;

            const parent = positions[idx - 1];
            const current = positions[idx];
            const child = positions[idx + 1];

            const parentToChild = child.clone().sub(parent).normalize();
            const parentToCurrent = current.clone().sub(parent).normalize();

            const originalAngle = Math.acos(
                Math.max(-1, Math.min(1, parentToChild.dot(parentToCurrent)))
            );
            let clampedAngle = originalAngle;

            if (constraint.minAngle !== undefined && clampedAngle < constraint.minAngle) {
                clampedAngle = constraint.minAngle;
            }
            if (constraint.maxAngle !== undefined && clampedAngle > constraint.maxAngle) {
                clampedAngle = constraint.maxAngle;
            }

            // Apply the constrained angle if it differs from the original
            if (Math.abs(clampedAngle - originalAngle) > 0.0001) {
                const axis = new THREE.Vector3().crossVectors(parentToChild, parentToCurrent);
                if (axis.lengthSq() > 0.0001) {
                    axis.normalize();
                    const angleDiff = clampedAngle - originalAngle;
                    const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angleDiff);
                    const currentOffset = current.clone().sub(parent);
                    currentOffset.applyQuaternion(rotation);
                    positions[idx].copy(parent).add(currentOffset);
                }
            }
        }
    }

    private calculateRotations(
        chain: BoneChain,
        positions: THREE.Vector3[],
        _pole?: THREE.Vector3
    ): THREE.Quaternion[] {
        const rotations: THREE.Quaternion[] = [];

        for (let i = 0; i < chain.bones.length - 1; i++) {
            const bone = chain.bones[i];
            const currentPos = positions[i];
            const nextPos = positions[i + 1];

            const direction = nextPos.clone().sub(currentPos).normalize();

            const defaultDir = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, direction);

            const worldQuat = bone.parent
                ? bone.parent
                      .getWorldQuaternion(new THREE.Quaternion())
                      .invert()
                      .multiply(quaternion)
                : quaternion;

            rotations.push(worldQuat);
        }

        rotations.push(new THREE.Quaternion());

        return rotations;
    }

    apply(chain: BoneChain, result: IKSolverResult): void {
        for (let i = 0; i < chain.bones.length; i++) {
            const bone = chain.bones[i];

            if (i < result.rotations.length) {
                bone.quaternion.copy(result.rotations[i]);
            }
        }
    }
}

export class CCDSolver {
    private tolerance: number;
    private maxIterations: number;
    private dampingFactor: number;

    constructor(
        tolerance: number = 0.001,
        maxIterations: number = 20,
        dampingFactor: number = 1.0
    ) {
        this.tolerance = tolerance;
        this.maxIterations = maxIterations;
        this.dampingFactor = dampingFactor;
    }

    solve(chain: BoneChain, target: THREE.Vector3): IKSolverResult {
        const positions = chain.bones.map((bone) => {
            const pos = new THREE.Vector3();
            bone.getWorldPosition(pos);
            return pos;
        });

        const rotations = chain.bones.map((bone) => bone.quaternion.clone());

        let error = Infinity;
        let iterations = 0;

        while (error > this.tolerance && iterations < this.maxIterations) {
            for (let i = chain.bones.length - 2; i >= 0; i--) {
                const _bone = chain.bones[i];
                const bonePos = positions[i];
                const endEffector = positions[positions.length - 1];

                const toEndRaw = endEffector.clone().sub(bonePos);
                const toTargetRaw = target.clone().sub(bonePos);

                // Check lengths before normalizing (normalize always returns length 1 for non-zero vectors)
                if (toEndRaw.lengthSq() < 0.000001 || toTargetRaw.lengthSq() < 0.000001) continue;

                const toEnd = toEndRaw.normalize();
                const toTarget = toTargetRaw.normalize();

                const rotationAxis = new THREE.Vector3().crossVectors(toEnd, toTarget);
                if (rotationAxis.length() < 0.001) continue;

                rotationAxis.normalize();
                let angle = Math.acos(Math.max(-1, Math.min(1, toEnd.dot(toTarget))));
                angle *= this.dampingFactor;

                if (chain.constraints) {
                    const constraint = chain.constraints.find((c) => c.boneIndex === i);
                    if (constraint) {
                        if (constraint.maxAngle !== undefined) {
                            angle = Math.min(angle, constraint.maxAngle);
                        }
                    }
                }

                const rotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
                rotations[i].premultiply(rotation);

                this.updatePositions(positions, rotations, chain);
            }

            error = positions[positions.length - 1].distanceTo(target);
            iterations++;
        }

        return {
            positions,
            rotations,
            reached: error <= this.tolerance,
            iterations,
            error,
        };
    }

    private updatePositions(
        positions: THREE.Vector3[],
        rotations: THREE.Quaternion[],
        chain: BoneChain
    ): void {
        for (let i = 1; i < positions.length; i++) {
            const direction = new THREE.Vector3(0, 1, 0)
                .applyQuaternion(rotations[i - 1])
                .multiplyScalar(chain.lengths[i - 1]);
            positions[i].copy(positions[i - 1]).add(direction);
        }
    }

    apply(chain: BoneChain, result: IKSolverResult): void {
        for (let i = 0; i < chain.bones.length; i++) {
            chain.bones[i].quaternion.copy(result.rotations[i]);
        }
    }
}

export class TwoBoneIKSolver {
    solve(
        rootPos: THREE.Vector3,
        _midPos: THREE.Vector3,
        _endPos: THREE.Vector3,
        target: THREE.Vector3,
        poleTarget: THREE.Vector3,
        upperLength: number,
        lowerLength: number
    ): {
        midPosition: THREE.Vector3;
        endPosition: THREE.Vector3;
        upperRotation: THREE.Quaternion;
        lowerRotation: THREE.Quaternion;
    } {
        const totalLength = upperLength + lowerLength;
        const targetDistance = rootPos.distanceTo(target);

        const clampedDistance = Math.min(targetDistance, totalLength * 0.9999);
        const actualTarget =
            clampedDistance < targetDistance
                ? rootPos
                      .clone()
                      .add(target.clone().sub(rootPos).normalize().multiplyScalar(clampedDistance))
                : target.clone();

        const a = upperLength;
        const b = lowerLength;
        const c = clampedDistance;

        // Guard against division by zero when bone lengths or distance are zero
        const MIN_LENGTH = 0.0001;
        const safeA = Math.max(a, MIN_LENGTH);
        const safeB = Math.max(b, MIN_LENGTH);
        const safeC = Math.max(c, MIN_LENGTH);

        const cosAngleA = Math.max(
            -1,
            Math.min(1, (safeA * safeA + safeC * safeC - safeB * safeB) / (2 * safeA * safeC))
        );
        const angleA = Math.acos(cosAngleA);

        const cosAngleB = Math.max(
            -1,
            Math.min(1, (safeA * safeA + safeB * safeB - safeC * safeC) / (2 * safeA * safeB))
        );
        const _angleB = Math.acos(cosAngleB);

        const rootToTarget = actualTarget.clone().sub(rootPos).normalize();
        const rootToPole = poleTarget.clone().sub(rootPos);

        const perpendicular = new THREE.Vector3()
            .crossVectors(rootToTarget, rootToPole)
            .normalize();

        const _poleDirection = new THREE.Vector3()
            .crossVectors(perpendicular, rootToTarget)
            .normalize();

        const upperRotation = new THREE.Quaternion();
        const rotationAxis = perpendicular;
        upperRotation.setFromAxisAngle(rotationAxis, angleA);

        const midDirection = rootToTarget.clone().applyQuaternion(upperRotation);
        const midPosition = rootPos.clone().add(midDirection.multiplyScalar(upperLength));

        const midToTarget = actualTarget.clone().sub(midPosition).normalize();
        const lowerRotation = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, -1, 0),
            midToTarget
        );

        const endPosition = midPosition.clone().add(midToTarget.multiplyScalar(lowerLength));

        return {
            midPosition,
            endPosition,
            upperRotation,
            lowerRotation,
        };
    }

    solveLimb(
        root: THREE.Object3D,
        mid: THREE.Object3D,
        end: THREE.Object3D,
        target: THREE.Vector3,
        poleTarget: THREE.Vector3
    ): void {
        const rootPos = new THREE.Vector3();
        const midPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();

        root.getWorldPosition(rootPos);
        mid.getWorldPosition(midPos);
        end.getWorldPosition(endPos);

        const upperLength = rootPos.distanceTo(midPos);
        const lowerLength = midPos.distanceTo(endPos);

        const result = this.solve(
            rootPos,
            midPos,
            endPos,
            target,
            poleTarget,
            upperLength,
            lowerLength
        );

        const rootWorldQuat = root.parent
            ? root.parent.getWorldQuaternion(new THREE.Quaternion())
            : new THREE.Quaternion();

        const localUpperQuat = rootWorldQuat.clone().invert().multiply(result.upperRotation);
        root.quaternion.copy(localUpperQuat);

        root.updateMatrixWorld(true);

        const midWorldQuat = mid.parent
            ? mid.parent.getWorldQuaternion(new THREE.Quaternion())
            : new THREE.Quaternion();

        const localLowerQuat = midWorldQuat.clone().invert().multiply(result.lowerRotation);
        mid.quaternion.copy(localLowerQuat);
    }
}

export class LookAtController {
    private config: LookAtConfig;
    private currentQuat: THREE.Quaternion;
    private velocity: THREE.Vector3;

    constructor(config: Partial<LookAtConfig> = {}) {
        this.config = {
            maxAngle: config.maxAngle ?? Math.PI / 2,
            speed: config.speed ?? 5,
            deadzone: config.deadzone ?? 0.01,
            smoothing: config.smoothing ?? 0.1,
            upVector: config.upVector ?? new THREE.Vector3(0, 1, 0),
            forwardVector: config.forwardVector ?? new THREE.Vector3(0, 0, 1),
        };
        this.currentQuat = new THREE.Quaternion();
        this.velocity = new THREE.Vector3();
    }

    update(object: THREE.Object3D, target: THREE.Vector3, deltaTime: number): THREE.Quaternion {
        const objectPos = new THREE.Vector3();
        object.getWorldPosition(objectPos);

        const direction = target.clone().sub(objectPos);
        const distance = direction.length();

        if (distance < this.config.deadzone) {
            return this.currentQuat;
        }

        direction.normalize();

        const forward = this.config.forwardVector?.clone() ?? new THREE.Vector3(0, 0, 1);
        const worldQuat = object.parent
            ? object.parent.getWorldQuaternion(new THREE.Quaternion())
            : new THREE.Quaternion();
        forward.applyQuaternion(worldQuat);

        const angle = Math.acos(Math.max(-1, Math.min(1, forward.dot(direction))));
        if (angle > this.config.maxAngle) {
            const axis = new THREE.Vector3().crossVectors(forward, direction);
            // Handle parallel/anti-parallel vectors where cross product is zero
            if (axis.lengthSq() > 0.000001) {
                axis.normalize();
                direction.copy(forward).applyAxisAngle(axis, this.config.maxAngle);
            } else if (angle > Math.PI / 2) {
                // Vectors are anti-parallel, use an arbitrary perpendicular axis
                const perpAxis =
                    Math.abs(forward.x) < 0.9
                        ? new THREE.Vector3(1, 0, 0).cross(forward).normalize()
                        : new THREE.Vector3(0, 1, 0).cross(forward).normalize();
                direction.copy(forward).applyAxisAngle(perpAxis, this.config.maxAngle);
            }
            // If vectors are parallel and within maxAngle, no change needed
        }

        const targetQuat = new THREE.Quaternion();
        const lookMatrix = new THREE.Matrix4();
        lookMatrix.lookAt(new THREE.Vector3(), direction, this.config.upVector!);
        targetQuat.setFromRotationMatrix(lookMatrix);

        const localTargetQuat = worldQuat.clone().invert().multiply(targetQuat);

        const t = 1 - Math.exp(-this.config.speed * deltaTime);
        this.currentQuat.slerp(localTargetQuat, t);

        return this.currentQuat;
    }

    apply(object: THREE.Object3D): void {
        object.quaternion.copy(this.currentQuat);
    }

    reset(): void {
        this.currentQuat.identity();
        this.velocity.set(0, 0, 0);
    }
}

export class SpringDynamics {
    private config: SpringConfig;
    private position: THREE.Vector3;
    private velocity: THREE.Vector3;
    private restPosition: THREE.Vector3;

    constructor(config: Partial<SpringConfig> = {}, initialPosition?: THREE.Vector3) {
        this.config = {
            stiffness: config.stiffness ?? 100,
            damping: config.damping ?? 10,
            mass: config.mass ?? 1,
            restLength: config.restLength,
        };
        this.position = initialPosition?.clone() ?? new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.restPosition = this.position.clone();
    }

    update(targetPosition: THREE.Vector3, deltaTime: number): THREE.Vector3 {
        const displacement = this.position.clone().sub(targetPosition);

        if (this.config.restLength !== undefined) {
            const direction = displacement.clone().normalize();
            const currentLength = displacement.length();
            displacement.copy(direction.multiplyScalar(currentLength - this.config.restLength));
        }

        const springForce = displacement.clone().multiplyScalar(-this.config.stiffness);
        const dampingForce = this.velocity.clone().multiplyScalar(-this.config.damping);
        const totalForce = springForce.add(dampingForce);
        const acceleration = totalForce.divideScalar(this.config.mass);

        this.velocity.add(acceleration.clone().multiplyScalar(deltaTime));
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        return this.position.clone();
    }

    getPosition(): THREE.Vector3 {
        return this.position.clone();
    }

    getVelocity(): THREE.Vector3 {
        return this.velocity.clone();
    }

    setPosition(position: THREE.Vector3): void {
        this.position.copy(position);
    }

    setVelocity(velocity: THREE.Vector3): void {
        this.velocity.copy(velocity);
    }

    reset(position?: THREE.Vector3): void {
        this.position.copy(position ?? this.restPosition);
        this.velocity.set(0, 0, 0);
    }
}

export class SpringChain {
    private springs: SpringDynamics[];
    private restLengths: number[];

    constructor(nodeCount: number, config: Partial<SpringConfig> = {}, restLength: number = 0.5) {
        this.springs = [];
        this.restLengths = [];

        for (let i = 0; i < nodeCount; i++) {
            this.springs.push(
                new SpringDynamics({
                    ...config,
                    stiffness: (config.stiffness ?? 100) * (1 - (i / nodeCount) * 0.5),
                    damping: (config.damping ?? 10) * (1 + (i / nodeCount) * 0.3),
                })
            );
            this.restLengths.push(restLength);
        }
    }

    update(
        rootPosition: THREE.Vector3,
        rootRotation: THREE.Quaternion,
        deltaTime: number,
        gravity: THREE.Vector3 = new THREE.Vector3(0, -9.8, 0)
    ): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [rootPosition.clone()];

        const direction = new THREE.Vector3(0, -1, 0).applyQuaternion(rootRotation);

        for (let i = 0; i < this.springs.length; i++) {
            const parentPos = positions[i];
            const spring = this.springs[i];

            const idealPos = parentPos
                .clone()
                .add(direction.clone().multiplyScalar(this.restLengths[i]));

            const gravityInfluence = gravity.clone().multiplyScalar(0.01 * (i + 1));
            const target = idealPos.add(gravityInfluence);

            let pos = spring.update(target, deltaTime);

            const toParent = pos.clone().sub(parentPos);
            const distance = toParent.length();
            if (distance > this.restLengths[i] * 1.5) {
                toParent.normalize().multiplyScalar(this.restLengths[i] * 1.5);
                pos = parentPos.clone().add(toParent);
                spring.setPosition(pos);
            } else if (distance < this.restLengths[i] * 0.5) {
                toParent.normalize().multiplyScalar(this.restLengths[i] * 0.5);
                pos = parentPos.clone().add(toParent);
                spring.setPosition(pos);
            }

            positions.push(pos);
        }

        return positions;
    }

    reset(positions: THREE.Vector3[]): void {
        for (let i = 0; i < this.springs.length && i < positions.length - 1; i++) {
            this.springs[i].reset(positions[i + 1]);
        }
    }

    getPositions(): THREE.Vector3[] {
        return this.springs.map((s) => s.getPosition());
    }
}

export class ProceduralGait {
    private config: GaitConfig;
    private phase: number = 0;
    private leftFootGrounded: THREE.Vector3;
    private rightFootGrounded: THREE.Vector3;
    private lastBodyPosition: THREE.Vector3;

    constructor(config: Partial<GaitConfig> = {}) {
        this.config = {
            stepLength: config.stepLength ?? 0.8,
            stepHeight: config.stepHeight ?? 0.15,
            stepDuration: config.stepDuration ?? 0.4,
            bodyBob: config.bodyBob ?? 0.05,
            bodySwayAmplitude: config.bodySwayAmplitude ?? 0.02,
            hipRotation: config.hipRotation ?? 0.1,
            phaseOffset: config.phaseOffset ?? 0.5,
            footOvershoot: config.footOvershoot ?? 0.1,
        };
        this.leftFootGrounded = new THREE.Vector3();
        this.rightFootGrounded = new THREE.Vector3();
        this.lastBodyPosition = new THREE.Vector3();
    }

    update(
        bodyPosition: THREE.Vector3,
        bodyForward: THREE.Vector3,
        velocity: THREE.Vector3,
        deltaTime: number
    ): GaitState {
        const speed = velocity.length();

        if (speed < 0.01) {
            return {
                phase: this.phase,
                leftFootTarget: this.leftFootGrounded.clone(),
                rightFootTarget: this.rightFootGrounded.clone(),
                leftFootLifted: false,
                rightFootLifted: false,
                bodyOffset: new THREE.Vector3(),
                bodyRotation: new THREE.Euler(),
            };
        }

        const stepSpeed = speed / this.config.stepLength;
        this.phase += stepSpeed * deltaTime;
        this.phase = this.phase % 1;

        const hipOffset = bodyForward
            .clone()
            .cross(new THREE.Vector3(0, 1, 0))
            .normalize()
            .multiplyScalar(0.15);

        const leftPhase = this.phase;
        const rightPhase = (this.phase + this.config.phaseOffset) % 1;

        const leftFootLifted = leftPhase < 0.5;
        const rightFootLifted = rightPhase < 0.5;

        const leftFootTarget = this.calculateFootTarget(
            bodyPosition,
            bodyForward,
            velocity,
            hipOffset.clone().multiplyScalar(-1),
            leftPhase,
            leftFootLifted
        );

        const rightFootTarget = this.calculateFootTarget(
            bodyPosition,
            bodyForward,
            velocity,
            hipOffset,
            rightPhase,
            rightFootLifted
        );

        if (!leftFootLifted) this.leftFootGrounded.copy(leftFootTarget);
        if (!rightFootLifted) this.rightFootGrounded.copy(rightFootTarget);

        const bodyBob = Math.sin(this.phase * Math.PI * 2) * this.config.bodyBob;
        const bodySway = Math.sin(this.phase * Math.PI * 2) * this.config.bodySwayAmplitude;
        const bodyOffset = new THREE.Vector3(bodySway, bodyBob, 0);

        const hipRotationAngle = Math.sin(this.phase * Math.PI * 2) * this.config.hipRotation;
        const bodyRotation = new THREE.Euler(0, hipRotationAngle, 0);

        this.lastBodyPosition.copy(bodyPosition);

        return {
            phase: this.phase,
            leftFootTarget,
            rightFootTarget,
            leftFootLifted,
            rightFootLifted,
            bodyOffset,
            bodyRotation,
        };
    }

    private calculateFootTarget(
        bodyPosition: THREE.Vector3,
        _bodyForward: THREE.Vector3,
        velocity: THREE.Vector3,
        hipOffset: THREE.Vector3,
        phase: number,
        isLifted: boolean
    ): THREE.Vector3 {
        const basePosition = bodyPosition.clone().add(hipOffset);
        basePosition.y = 0;

        if (!isLifted) {
            return basePosition;
        }

        const liftPhase = phase * 2;
        const strideOffset = velocity
            .clone()
            .normalize()
            .multiplyScalar(
                this.config.stepLength * (1 + this.config.footOvershoot) * (1 - liftPhase)
            );

        const height = Math.sin(liftPhase * Math.PI) * this.config.stepHeight;

        return basePosition.clone().add(strideOffset).setY(height);
    }

    reset(): void {
        this.phase = 0;
        this.leftFootGrounded.set(0, 0, 0);
        this.rightFootGrounded.set(0, 0, 0);
    }

    getPhase(): number {
        return this.phase;
    }

    setPhase(phase: number): void {
        this.phase = phase % 1;
    }
}

export function clampAngle(angle: number, min: number, max: number): number {
    if (angle < -Math.PI) angle += Math.PI * 2;
    if (angle > Math.PI) angle -= Math.PI * 2;
    return Math.max(min, Math.min(max, angle));
}

export function dampedSpring(
    current: number,
    target: number,
    velocity: { value: number },
    stiffness: number,
    damping: number,
    deltaTime: number
): number {
    const springForce = (target - current) * stiffness;
    const dampingForce = velocity.value * damping;
    const acceleration = springForce - dampingForce;

    velocity.value += acceleration * deltaTime;
    return current + velocity.value * deltaTime;
}

export function dampedSpringVector3(
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    stiffness: number,
    damping: number,
    deltaTime: number,
    out?: THREE.Vector3
): THREE.Vector3 {
    const result = out ?? new THREE.Vector3();

    const springForce = target.clone().sub(current).multiplyScalar(stiffness);
    const dampingForce = velocity.clone().multiplyScalar(damping);
    const acceleration = springForce.sub(dampingForce);

    velocity.add(acceleration.multiplyScalar(deltaTime));
    result.copy(current).add(velocity.clone().multiplyScalar(deltaTime));

    return result;
}

export function hermiteInterpolate(
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    m0: THREE.Vector3,
    m1: THREE.Vector3,
    t: number
): THREE.Vector3 {
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return new THREE.Vector3()
        .addScaledVector(p0, h00)
        .addScaledVector(m0, h10)
        .addScaledVector(p1, h01)
        .addScaledVector(m1, h11);
}

export function sampleCurve(
    points: THREE.Vector3[],
    t: number,
    tension: number = 0.5
): THREE.Vector3 {
    if (points.length < 2) return points[0]?.clone() ?? new THREE.Vector3();

    const segments = points.length - 1;
    const segment = Math.min(Math.floor(t * segments), segments - 1);
    const localT = t * segments - segment;

    const p0 = points[Math.max(0, segment - 1)];
    const p1 = points[segment];
    const p2 = points[segment + 1];
    const p3 = points[Math.min(points.length - 1, segment + 2)];

    const m0 = p2.clone().sub(p0).multiplyScalar(tension);
    const m1 = p3.clone().sub(p1).multiplyScalar(tension);

    return hermiteInterpolate(p1, p2, m0, m1, localT);
}

export function calculateBoneRotation(
    boneStart: THREE.Vector3,
    boneEnd: THREE.Vector3,
    upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
    const direction = boneEnd.clone().sub(boneStart).normalize();

    const quaternion = new THREE.Quaternion();
    const matrix = new THREE.Matrix4();

    if (Math.abs(direction.dot(upVector)) > 0.999) {
        const altUp = new THREE.Vector3(1, 0, 0);
        matrix.lookAt(new THREE.Vector3(), direction, altUp);
    } else {
        matrix.lookAt(new THREE.Vector3(), direction, upVector);
    }

    quaternion.setFromRotationMatrix(matrix);
    return quaternion;
}
