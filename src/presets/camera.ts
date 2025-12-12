/**
 * Camera presets for common game styles
 */

import * as THREE from 'three';
import type {
    CinematicCameraProps,
    FollowCameraProps,
    OrbitCameraProps,
} from '../components/Camera';

export interface ThirdPersonPreset extends Omit<FollowCameraProps, 'target'> {
    type: 'third-person';
}

export interface TopDownPreset extends Omit<OrbitCameraProps, 'target'> {
    type: 'top-down';
}

export interface SideScrollerPreset extends Omit<FollowCameraProps, 'target'> {
    type: 'side-scroller';
}

export interface CinematicPreset extends Omit<CinematicCameraProps, 'path'> {
    type: 'cinematic';
}

export type CameraPreset = ThirdPersonPreset | TopDownPreset | SideScrollerPreset | CinematicPreset;

export const thirdPersonActionPreset: ThirdPersonPreset = {
    type: 'third-person',
    offset: [0, 3, 8],
    smoothTime: 0.15,
    lookAheadDistance: 3,
    lookAheadSmoothing: 0.3,
    rotationSmoothing: 0.08,
    fov: 65,
    makeDefault: true,
};

export const thirdPersonExplorationPreset: ThirdPersonPreset = {
    type: 'third-person',
    offset: [0, 4, 12],
    smoothTime: 0.4,
    lookAheadDistance: 1,
    lookAheadSmoothing: 0.6,
    rotationSmoothing: 0.15,
    fov: 55,
    makeDefault: true,
};

export const thirdPersonCombatPreset: ThirdPersonPreset = {
    type: 'third-person',
    offset: [1.5, 2, 5],
    smoothTime: 0.1,
    lookAheadDistance: 4,
    lookAheadSmoothing: 0.2,
    rotationSmoothing: 0.05,
    fov: 70,
    makeDefault: true,
};

export const topDownRTSPreset: TopDownPreset = {
    type: 'top-down',
    minDistance: 10,
    maxDistance: 100,
    minPolarAngle: 0.3,
    maxPolarAngle: Math.PI / 3,
    autoRotate: false,
    enableDamping: true,
    dampingFactor: 0.1,
    enableZoom: true,
    enablePan: true,
    fov: 50,
    makeDefault: true,
};

export const topDownTacticalPreset: TopDownPreset = {
    type: 'top-down',
    minDistance: 5,
    maxDistance: 40,
    minPolarAngle: 0.2,
    maxPolarAngle: Math.PI / 4,
    autoRotate: false,
    enableDamping: true,
    dampingFactor: 0.08,
    enableZoom: true,
    enablePan: true,
    fov: 45,
    makeDefault: true,
};

export const topDownIsometricPreset: TopDownPreset = {
    type: 'top-down',
    minDistance: 15,
    maxDistance: 60,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: Math.PI / 6,
    autoRotate: false,
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    enablePan: true,
    fov: 35,
    makeDefault: true,
};

export const sideScrollerPreset: SideScrollerPreset = {
    type: 'side-scroller',
    offset: [0, 2, 15],
    smoothTime: 0.25,
    lookAheadDistance: 4,
    lookAheadSmoothing: 0.4,
    rotationSmoothing: 0.5,
    fov: 50,
    makeDefault: true,
};

export const sideScrollerTightPreset: SideScrollerPreset = {
    type: 'side-scroller',
    offset: [0, 1, 8],
    smoothTime: 0.15,
    lookAheadDistance: 2,
    lookAheadSmoothing: 0.3,
    rotationSmoothing: 0.3,
    fov: 55,
    makeDefault: true,
};

export const sideScrollerCinematicPreset: SideScrollerPreset = {
    type: 'side-scroller',
    offset: [0, 3, 20],
    smoothTime: 0.5,
    lookAheadDistance: 1,
    lookAheadSmoothing: 0.8,
    rotationSmoothing: 0.8,
    fov: 40,
    makeDefault: true,
};

export const cinematicCutscenePreset: CinematicPreset = {
    type: 'cinematic',
    duration: 8,
    tension: 0.5,
    closed: false,
    autoPlay: true,
    loop: false,
    fov: 35,
    makeDefault: true,
};

export const cinematicDollyPreset: CinematicPreset = {
    type: 'cinematic',
    duration: 5,
    tension: 0.3,
    closed: false,
    autoPlay: true,
    loop: false,
    fov: 50,
    makeDefault: true,
};

export const cinematicOrbitPreset: CinematicPreset = {
    type: 'cinematic',
    duration: 10,
    tension: 0.8,
    closed: true,
    autoPlay: true,
    loop: true,
    fov: 45,
    makeDefault: true,
};

export const cinematicDramaticPreset: CinematicPreset = {
    type: 'cinematic',
    duration: 6,
    tension: 0.2,
    closed: false,
    autoPlay: true,
    loop: false,
    fov: 30,
    fovKeyframes: [
        { time: 0, fov: 60 },
        { time: 0.3, fov: 35 },
        { time: 0.7, fov: 35 },
        { time: 1, fov: 45 },
    ],
    makeDefault: true,
};

export function createCircularPath(
    center: THREE.Vector3,
    radius: number,
    height: number,
    segments: number = 8
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(
            new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                center.y + height,
                center.z + Math.sin(angle) * radius
            )
        );
    }
    return points;
}

export function createDollyPath(
    start: THREE.Vector3,
    end: THREE.Vector3,
    heightCurve: number = 0,
    segments: number = 4
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const point = start.clone().lerp(end, t);
        point.y += Math.sin(t * Math.PI) * heightCurve;
        points.push(point);
    }
    return points;
}

export function createCranePath(
    base: THREE.Vector3,
    endHeight: number,
    swingDistance: number,
    segments: number = 4
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        points.push(
            new THREE.Vector3(
                base.x + Math.sin(t * Math.PI * 0.5) * swingDistance,
                base.y + t * endHeight,
                base.z
            )
        );
    }
    return points;
}

export const cameraPresets = {
    thirdPersonAction: thirdPersonActionPreset,
    thirdPersonExploration: thirdPersonExplorationPreset,
    thirdPersonCombat: thirdPersonCombatPreset,
    topDownRTS: topDownRTSPreset,
    topDownTactical: topDownTacticalPreset,
    topDownIsometric: topDownIsometricPreset,
    sideScroller: sideScrollerPreset,
    sideScrollerTight: sideScrollerTightPreset,
    sideScrollerCinematic: sideScrollerCinematicPreset,
    cinematicCutscene: cinematicCutscenePreset,
    cinematicDolly: cinematicDollyPreset,
    cinematicOrbit: cinematicOrbitPreset,
    cinematicDramatic: cinematicDramaticPreset,
} as const;

export type CameraPresetName = keyof typeof cameraPresets;
