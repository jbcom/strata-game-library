/**
 * Intelligent Camera and Viewpoint Components.
 *
 * Provides a variety of camera systems for different game genres:
 * - Follow cameras for third-person games
 * - Orbit cameras for strategy/RTS
 * - FPS cameras for first-person shooters
 * - Cinematic cameras for cutscenes
 * - Fixed perspective cameras for side-scrollers and isometric games
 * - Gyroscope cameras for mobile AR experiences
 *
 * @packageDocumentation
 * @module components/camera
 * @category Rendering Pipeline
 *
 * @example
 * ```tsx
 * import {
 *   FollowCamera,
 *   FixedPerspectiveCamera,
 *   CameraShake
 * } from '@strata-game-library/core';
 *
 * // Side-scroller camera
 * <FixedPerspectiveCamera preset="side" />
 *
 * // Third-person camera with shake
 * <FollowCamera target={playerRef} distance={10} />
 * <CameraShake intensity={0.5} />
 * ```
 */

export * from './CameraShake';
export * from './CinematicCamera';
export * from './FixedPerspectiveCamera';
export * from './FollowCamera';
export * from './FPSCamera';
export * from './GyroscopeCamera';
export * from './OrbitCamera';
export * from './types';
export * from './useCameraTransition';
