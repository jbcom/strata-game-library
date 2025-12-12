import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
    lerp,
    lerpVector3,
    slerp,
    smoothDamp,
    smoothDampVector3,
    CameraShake,
    FOVTransition,
    evaluateCatmullRom,
    calculateLookAhead,
    calculateHeadBob,
    calculateScreenShakeIntensity,
    easeInOutCubic,
    easeOutCubic,
    easeInCubic,
    easeOutElastic,
} from '../core/camera';

describe('lerp utility', () => {
    it('should return start value at t=0', () => {
        expect(lerp(0, 10, 0)).toBe(0);
    });

    it('should return end value at t=1', () => {
        expect(lerp(0, 10, 1)).toBe(10);
    });

    it('should return midpoint at t=0.5', () => {
        expect(lerp(0, 10, 0.5)).toBe(5);
    });

    it('should handle negative values', () => {
        expect(lerp(-10, 10, 0.5)).toBe(0);
    });

    it('should clamp t below 0', () => {
        expect(lerp(0, 10, -0.5)).toBe(0);
    });

    it('should clamp t above 1', () => {
        expect(lerp(0, 10, 1.5)).toBe(10);
    });
});

describe('lerpVector3', () => {
    it('should interpolate vectors at t=0', () => {
        const a = new THREE.Vector3(0, 0, 0);
        const b = new THREE.Vector3(10, 10, 10);
        const result = lerpVector3(a, b, 0);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.z).toBe(0);
    });

    it('should interpolate vectors at t=1', () => {
        const a = new THREE.Vector3(0, 0, 0);
        const b = new THREE.Vector3(10, 10, 10);
        const result = lerpVector3(a, b, 1);
        expect(result.x).toBe(10);
        expect(result.y).toBe(10);
        expect(result.z).toBe(10);
    });

    it('should interpolate vectors at t=0.5', () => {
        const a = new THREE.Vector3(0, 0, 0);
        const b = new THREE.Vector3(10, 10, 10);
        const result = lerpVector3(a, b, 0.5);
        expect(result.x).toBe(5);
    });

    it('should use output vector if provided', () => {
        const a = new THREE.Vector3(0, 0, 0);
        const b = new THREE.Vector3(10, 10, 10);
        const out = new THREE.Vector3();
        const result = lerpVector3(a, b, 0.5, out);
        expect(result).toBe(out);
        expect(out.x).toBe(5);
    });
});

describe('slerp utility', () => {
    it('should return start quaternion at t=0', () => {
        const q1 = new THREE.Quaternion();
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        const result = slerp(q1, q2, 0);
        expect(result.x).toBeCloseTo(q1.x, 5);
        expect(result.w).toBeCloseTo(q1.w, 5);
    });

    it('should return end quaternion at t=1', () => {
        const q1 = new THREE.Quaternion();
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        const result = slerp(q1, q2, 1);
        expect(result.x).toBeCloseTo(q2.x, 5);
        expect(result.y).toBeCloseTo(q2.y, 5);
    });

    it('should interpolate at midpoint', () => {
        const q1 = new THREE.Quaternion();
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        const result = slerp(q1, q2, 0.5);
        expect(result).toBeInstanceOf(THREE.Quaternion);
    });

    it('should maintain unit length', () => {
        const q1 = new THREE.Quaternion();
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        const result = slerp(q1, q2, 0.5);
        expect(result.length()).toBeCloseTo(1.0, 5);
    });
});

describe('smoothDamp', () => {
    it('should approach target value', () => {
        const velocity = { value: 0 };
        const result = smoothDamp(0, 10, velocity, 0.5, 0.1);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(10);
    });

    it('should update velocity', () => {
        const velocity = { value: 0 };
        smoothDamp(0, 10, velocity, 0.5, 0.1);
        expect(velocity.value).not.toBe(0);
    });

    it('should respect max speed', () => {
        const velocity = { value: 0 };
        smoothDamp(0, 100, velocity, 0.1, 0.1, 5);
        expect(Math.abs(velocity.value)).toBeLessThanOrEqual(5);
    });
});

describe('smoothDampVector3', () => {
    it('should approach target vector', () => {
        const current = new THREE.Vector3(0, 0, 0);
        const target = new THREE.Vector3(10, 10, 10);
        const velocity = new THREE.Vector3(0, 0, 0);
        const result = smoothDampVector3(current, target, velocity, 0.5, 0.1);
        expect(result.x).toBeGreaterThan(0);
    });
});

describe('CameraShake', () => {
    it('should create CameraShake with defaults', () => {
        const shake = new CameraShake();
        expect(shake).toBeDefined();
    });

    it('should create CameraShake with custom config', () => {
        const shake = new CameraShake({
            traumaDecay: 2.0,
            maxAngle: 0.2,
            maxOffset: 1.0,
            frequency: 30,
        });
        expect(shake).toBeDefined();
    });

    it('should add trauma', () => {
        const shake = new CameraShake();
        shake.addTrauma(0.5);
        expect(shake.getTrauma()).toBe(0.5);
    });

    it('should set trauma', () => {
        const shake = new CameraShake();
        shake.setTrauma(0.7);
        expect(shake.getTrauma()).toBe(0.7);
    });

    it('should clamp trauma to 1', () => {
        const shake = new CameraShake();
        shake.addTrauma(2.0);
        expect(shake.getTrauma()).toBe(1);
    });

    it('should update and return offset/rotation', () => {
        const shake = new CameraShake();
        shake.addTrauma(0.5);
        const result = shake.update(0.016);
        expect(result.offset).toBeInstanceOf(THREE.Vector3);
        expect(result.rotation).toBeInstanceOf(THREE.Euler);
    });

    it('should decay trauma over time', () => {
        const shake = new CameraShake({ traumaDecay: 2.0 });
        shake.setTrauma(1.0);
        shake.update(0.5);
        expect(shake.getTrauma()).toBeLessThan(1.0);
    });
});

describe('FOVTransition', () => {
    it('should create FOVTransition with config', () => {
        const fov = new FOVTransition({
            startFOV: 60,
            endFOV: 90,
            duration: 1.0,
        });
        expect(fov).toBeDefined();
    });

    it('should update FOV over time', () => {
        const fov = new FOVTransition({
            startFOV: 60,
            endFOV: 90,
            duration: 1.0,
        });
        const currentFOV = fov.update(0.5);
        expect(currentFOV).toBeGreaterThan(60);
        expect(currentFOV).toBeLessThan(90);
    });

    it('should complete transition', () => {
        const fov = new FOVTransition({
            startFOV: 60,
            endFOV: 90,
            duration: 0.5,
        });
        fov.update(0.5);
        expect(fov.complete()).toBe(true);
    });

    it('should reset transition', () => {
        const fov = new FOVTransition({
            startFOV: 60,
            endFOV: 90,
            duration: 0.5,
        });
        fov.update(0.5);
        fov.reset();
        expect(fov.complete()).toBe(false);
    });

    it('should use custom easing', () => {
        const fov = new FOVTransition({
            startFOV: 60,
            endFOV: 90,
            duration: 1.0,
            easing: (t) => t * t,
        });
        expect(fov).toBeDefined();
    });
});

describe('evaluateCatmullRom', () => {
    it('should return first point at t=0', () => {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(3, 0, 0),
        ];
        const result = evaluateCatmullRom(points, 0);
        expect(result.x).toBeCloseTo(0, 1);
    });

    it('should return point along spline at t=1', () => {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(3, 0, 0),
        ];
        const result = evaluateCatmullRom(points, 1);
        expect(result.x).toBeGreaterThan(0);
    });

    it('should interpolate at midpoint', () => {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(3, 0, 0),
        ];
        const result = evaluateCatmullRom(points, 0.5);
        expect(result.x).toBeGreaterThan(0);
        expect(result.x).toBeLessThan(3);
    });

    it('should handle closed path', () => {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(0, 1, 0),
        ];
        const result = evaluateCatmullRom(points, 0.5, 0.5, true);
        expect(result).toBeDefined();
    });
});

describe('calculateLookAhead', () => {
    it('should return look ahead vector', () => {
        const velocity = new THREE.Vector3(1, 0, 0);
        const current = new THREE.Vector3(0, 0, 0);
        const result = calculateLookAhead(velocity, 5.0, 0.5, current, 0.1);
        expect(result).toBeInstanceOf(THREE.Vector3);
    });

    it('should return zero for zero velocity', () => {
        const velocity = new THREE.Vector3(0, 0, 0);
        const current = new THREE.Vector3(1, 0, 0);
        const result = calculateLookAhead(velocity, 5.0, 0.5, current, 0.1);
        expect(result.length()).toBeLessThan(1);
    });
});

describe('calculateHeadBob', () => {
    it('should return head bob offset', () => {
        const result = calculateHeadBob(1.0, 5.0);
        expect(result).toBeInstanceOf(THREE.Vector3);
    });

    it('should vary with time', () => {
        const result1 = calculateHeadBob(0, 5.0);
        const result2 = calculateHeadBob(0.5, 5.0);
        expect(result1.equals(result2)).toBe(false);
    });

    it('should scale with speed', () => {
        const slow = calculateHeadBob(1.0, 1.0);
        const fast = calculateHeadBob(1.0, 5.0);
        expect(fast.length()).toBeGreaterThan(slow.length());
    });
});

describe('calculateScreenShakeIntensity', () => {
    it('should return shake intensity', () => {
        const result = calculateScreenShakeIntensity(1.0, 0);
        expect(result.trauma).toBeGreaterThan(0);
    });

    it('should decrease with distance', () => {
        const near = calculateScreenShakeIntensity(1.0, 0);
        const far = calculateScreenShakeIntensity(1.0, 30);
        expect(far.trauma).toBeLessThan(near.trauma);
    });

    it('should return max offsets', () => {
        const result = calculateScreenShakeIntensity(1.0, 0);
        expect(result.maxOffsetX).toBeDefined();
        expect(result.maxOffsetY).toBeDefined();
        expect(result.maxRotation).toBeDefined();
    });
});

describe('easing functions', () => {
    it('easeInOutCubic should return 0 at t=0', () => {
        expect(easeInOutCubic(0)).toBe(0);
    });

    it('easeInOutCubic should return 1 at t=1', () => {
        expect(easeInOutCubic(1)).toBe(1);
    });

    it('easeOutCubic should return 0 at t=0', () => {
        expect(easeOutCubic(0)).toBe(0);
    });

    it('easeInCubic should return 0 at t=0', () => {
        expect(easeInCubic(0)).toBe(0);
    });

    it('easeOutElastic should return 0 at t=0', () => {
        expect(easeOutElastic(0)).toBe(0);
    });

    it('easeOutElastic should return 1 at t=1', () => {
        expect(easeOutElastic(1)).toBe(1);
    });
});
