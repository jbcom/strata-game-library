/**
 * Core camera utilities
 *
 * Pure TypeScript camera math functions and classes for smooth camera control.
 */

import * as THREE from 'three';

export interface CameraShakeConfig {
    trauma: number;
    traumaDecay: number;
    maxAngle: number;
    maxOffset: number;
    frequency: number;
}

export interface FOVTransitionConfig {
    startFOV: number;
    endFOV: number;
    duration: number;
    easing?: (t: number) => number;
}

export interface CameraPath {
    points: THREE.Vector3[];
    duration: number;
    tension?: number;
    closed?: boolean;
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function lerpVector3(
    a: THREE.Vector3,
    b: THREE.Vector3,
    t: number,
    out?: THREE.Vector3
): THREE.Vector3 {
    const result = out ?? new THREE.Vector3();
    const clampedT = Math.max(0, Math.min(1, t));
    return result.set(
        a.x + (b.x - a.x) * clampedT,
        a.y + (b.y - a.y) * clampedT,
        a.z + (b.z - a.z) * clampedT
    );
}

export function slerp(
    qa: THREE.Quaternion,
    qb: THREE.Quaternion,
    t: number,
    out?: THREE.Quaternion
): THREE.Quaternion {
    const result = out ?? new THREE.Quaternion();
    return result.copy(qa).slerp(qb, Math.max(0, Math.min(1, t)));
}

export function smoothDamp(
    current: number,
    target: number,
    velocity: { value: number },
    smoothTime: number,
    deltaTime: number,
    maxSpeed: number = Infinity
): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change = current - target;
    const maxChange = maxSpeed * smoothTime;
    change = Math.max(-maxChange, Math.min(maxChange, change));

    const originalTarget = target;
    target = current - change;

    const temp = (velocity.value + omega * change) * deltaTime;
    velocity.value = (velocity.value - omega * temp) * exp;

    let result = target + (change + temp) * exp;

    if (originalTarget - current > 0 === result > originalTarget) {
        result = originalTarget;
        velocity.value = (result - originalTarget) / deltaTime;
    }

    return result;
}

export function smoothDampVector3(
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    smoothTime: number,
    deltaTime: number,
    maxSpeed: number = Infinity,
    out?: THREE.Vector3
): THREE.Vector3 {
    const result = out ?? new THREE.Vector3();

    const velX = { value: velocity.x };
    const velY = { value: velocity.y };
    const velZ = { value: velocity.z };

    result.x = smoothDamp(current.x, target.x, velX, smoothTime, deltaTime, maxSpeed);
    result.y = smoothDamp(current.y, target.y, velY, smoothTime, deltaTime, maxSpeed);
    result.z = smoothDamp(current.z, target.z, velZ, smoothTime, deltaTime, maxSpeed);

    velocity.set(velX.value, velY.value, velZ.value);

    return result;
}

export class CameraShake {
    private trauma: number = 0;
    private traumaDecay: number;
    private maxAngle: number;
    private maxOffset: number;
    private frequency: number;
    private seed: number;
    private time: number = 0;

    constructor(config: Partial<CameraShakeConfig> = {}) {
        this.traumaDecay = config.traumaDecay ?? 1.5;
        this.maxAngle = config.maxAngle ?? 0.1;
        this.maxOffset = config.maxOffset ?? 0.5;
        this.frequency = config.frequency ?? 25;
        this.seed = Math.random() * 1000;
    }

    addTrauma(amount: number): void {
        this.trauma = Math.min(1, this.trauma + amount);
    }

    setTrauma(amount: number): void {
        this.trauma = Math.max(0, Math.min(1, amount));
    }

    getTrauma(): number {
        return this.trauma;
    }

    update(deltaTime: number): { offset: THREE.Vector3; rotation: THREE.Euler } {
        this.time += deltaTime;

        const shake = this.trauma * this.trauma;

        const noiseX = this.perlinNoise(this.seed, this.time * this.frequency);
        const noiseY = this.perlinNoise(this.seed + 1, this.time * this.frequency);
        const noiseZ = this.perlinNoise(this.seed + 2, this.time * this.frequency);
        const noiseRoll = this.perlinNoise(this.seed + 3, this.time * this.frequency);
        const noisePitch = this.perlinNoise(this.seed + 4, this.time * this.frequency);
        const noiseYaw = this.perlinNoise(this.seed + 5, this.time * this.frequency);

        const offset = new THREE.Vector3(
            shake * this.maxOffset * noiseX,
            shake * this.maxOffset * noiseY,
            shake * this.maxOffset * noiseZ * 0.5
        );

        const rotation = new THREE.Euler(
            shake * this.maxAngle * noisePitch,
            shake * this.maxAngle * noiseYaw,
            shake * this.maxAngle * noiseRoll
        );

        this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime);

        return { offset, rotation };
    }

    private perlinNoise(seed: number, t: number): number {
        const x = t + seed;
        return Math.sin(x * 1.0) * 0.5 + Math.sin(x * 2.3) * 0.3 + Math.sin(x * 5.7) * 0.2;
    }
}

export class FOVTransition {
    private startFOV: number;
    private endFOV: number;
    private duration: number;
    private elapsed: number = 0;
    private easing: (t: number) => number;
    private isComplete: boolean = false;

    constructor(config: FOVTransitionConfig) {
        this.startFOV = config.startFOV;
        this.endFOV = config.endFOV;
        this.duration = config.duration;
        this.easing = config.easing ?? easeInOutCubic;
    }

    update(deltaTime: number): number {
        if (this.isComplete) {
            return this.endFOV;
        }

        this.elapsed += deltaTime;
        const t = Math.min(1, this.elapsed / this.duration);
        const easedT = this.easing(t);

        if (t >= 1) {
            this.isComplete = true;
            return this.endFOV;
        }

        return lerp(this.startFOV, this.endFOV, easedT);
    }

    reset(): void {
        this.elapsed = 0;
        this.isComplete = false;
    }

    complete(): boolean {
        return this.isComplete;
    }
}

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function easeOutCubic(t: number): number {
    return 1 - (1 - t) ** 3;
}

export function easeInCubic(t: number): number {
    return t * t * t;
}

export function easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function evaluateCatmullRom(
    points: THREE.Vector3[],
    t: number,
    tension: number = 0.5,
    closed: boolean = false
): THREE.Vector3 {
    const n = points.length;
    if (n < 2) {
        return points[0]?.clone() ?? new THREE.Vector3();
    }

    const totalSegments = closed ? n : n - 1;
    const segment = Math.floor(t * totalSegments);
    const localT = t * totalSegments - segment;

    const getPoint = (i: number): THREE.Vector3 => {
        if (closed) {
            return points[((i % n) + n) % n];
        }
        return points[Math.max(0, Math.min(n - 1, i))];
    };

    const p0 = getPoint(segment - 1);
    const p1 = getPoint(segment);
    const p2 = getPoint(segment + 1);
    const p3 = getPoint(segment + 2);

    const t2 = localT * localT;
    const t3 = t2 * localT;

    const s = (1 - tension) / 2;

    const result = new THREE.Vector3();

    result.x =
        s *
        (2 * p1.x +
            (-p0.x + p2.x) * localT +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    result.y =
        s *
        (2 * p1.y +
            (-p0.y + p2.y) * localT +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    result.z =
        s *
        (2 * p1.z +
            (-p0.z + p2.z) * localT +
            (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
            (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);

    return result;
}

export function calculateLookAhead(
    velocity: THREE.Vector3,
    lookAheadDistance: number,
    lookAheadSmoothing: number,
    currentLookAhead: THREE.Vector3,
    deltaTime: number
): THREE.Vector3 {
    const speed = velocity.length();
    if (speed < 0.01) {
        return lerpVector3(currentLookAhead, new THREE.Vector3(), deltaTime / lookAheadSmoothing);
    }

    const targetLookAhead = velocity.clone().normalize().multiplyScalar(lookAheadDistance);
    return lerpVector3(currentLookAhead, targetLookAhead, deltaTime / lookAheadSmoothing);
}

export function calculateHeadBob(
    time: number,
    speed: number,
    bobFrequency: number = 10,
    bobAmplitude: number = 0.05
): THREE.Vector3 {
    const normalizedSpeed = Math.min(1, speed / 5);
    const amplitude = bobAmplitude * normalizedSpeed;

    return new THREE.Vector3(
        Math.sin(time * bobFrequency * 0.5) * amplitude * 0.5,
        Math.abs(Math.sin(time * bobFrequency)) * amplitude,
        0
    );
}

export interface ScreenShakeIntensity {
    trauma: number;
    maxOffsetX: number;
    maxOffsetY: number;
    maxRotation: number;
}

export function calculateScreenShakeIntensity(
    impactForce: number,
    distance: number,
    falloffStart: number = 5,
    falloffEnd: number = 50
): ScreenShakeIntensity {
    let distanceFactor = 1;
    if (distance > falloffStart) {
        distanceFactor = 1 - Math.min(1, (distance - falloffStart) / (falloffEnd - falloffStart));
    }

    const trauma = Math.min(1, impactForce * distanceFactor);

    return {
        trauma,
        maxOffsetX: trauma * 20,
        maxOffsetY: trauma * 20,
        maxRotation: trauma * 0.05,
    };
}
