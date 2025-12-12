/**
 * Spatial Audio - 3D Audio with Three.js PositionalAudio
 *
 * Wraps Three.js PositionalAudio for 3D spatial sound positioning.
 *
 * @module core/audio
 * @public
 */

import * as THREE from 'three';
import type { SpatialConfig, AudioListenerState } from './types';
import { DEFAULT_SPATIAL_CONFIG } from './types';

/**
 * Manages 3D spatial audio using Three.js PositionalAudio.
 *
 * @example
 * ```typescript
 * const listener = new THREE.AudioListener();
 * camera.add(listener);
 *
 * const spatial = createSpatialAudio(listener);
 * await spatial.load('engine', '/audio/engine.mp3', {
 *   refDistance: 5,
 *   maxDistance: 50,
 * });
 *
 * const source = spatial.getSource('engine');
 * source?.position.set(10, 0, 0);
 * spatial.play('engine');
 * ```
 */
export class SpatialAudio {
    private listener: THREE.AudioListener;
    private loader: THREE.AudioLoader;
    private sources: Map<string, THREE.PositionalAudio> = new Map();
    private buffers: Map<string, AudioBuffer> = new Map();
    private configs: Map<string, Required<SpatialConfig>> = new Map();

    constructor(listener: THREE.AudioListener) {
        this.listener = listener;
        this.loader = new THREE.AudioLoader();
    }

    /**
     * Loads and creates a spatial audio source.
     *
     * @param id - Unique identifier for the audio source
     * @param url - URL to the audio file
     * @param config - Spatial configuration options
     * @returns Promise resolving to the PositionalAudio instance
     *
     * @example
     * ```typescript
     * const source = await spatial.load('footsteps', '/audio/steps.mp3', {
     *   refDistance: 2,
     *   maxDistance: 20,
     *   rolloffFactor: 1.5,
     * });
     * source.position.set(5, 0, 3);
     * ```
     */
    async load(
        id: string,
        url: string,
        config: SpatialConfig = {}
    ): Promise<THREE.PositionalAudio> {
        const fullConfig: Required<SpatialConfig> = { ...DEFAULT_SPATIAL_CONFIG, ...config };

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (buffer) => {
                    this.buffers.set(id, buffer);

                    const audio = new THREE.PositionalAudio(this.listener);
                    audio.setBuffer(buffer);
                    audio.setRefDistance(fullConfig.refDistance);
                    audio.setMaxDistance(fullConfig.maxDistance);
                    audio.setRolloffFactor(fullConfig.rolloffFactor);
                    audio.setDistanceModel(fullConfig.distanceModel);
                    audio.setDirectionalCone(
                        fullConfig.coneInnerAngle,
                        fullConfig.coneOuterAngle,
                        fullConfig.coneOuterGain
                    );

                    this.sources.set(id, audio);
                    this.configs.set(id, fullConfig);
                    resolve(audio);
                },
                undefined,
                (error) => reject(new Error(`Failed to load spatial audio ${id}: ${error}`))
            );
        });
    }

    /**
     * Creates a spatial audio source from an existing buffer.
     *
     * @param id - Unique identifier
     * @param bufferId - ID of a previously loaded buffer
     * @param config - Spatial configuration
     * @returns The created PositionalAudio or undefined
     *
     * @example
     * ```typescript
     * await spatial.load('step', '/audio/step.mp3');
     * const instance = spatial.createFromBuffer('step-2', 'step');
     * ```
     */
    createFromBuffer(
        id: string,
        bufferId: string,
        config: SpatialConfig = {}
    ): THREE.PositionalAudio | undefined {
        const buffer = this.buffers.get(bufferId);
        if (!buffer) return undefined;

        const fullConfig: Required<SpatialConfig> = { ...DEFAULT_SPATIAL_CONFIG, ...config };

        const audio = new THREE.PositionalAudio(this.listener);
        audio.setBuffer(buffer);
        audio.setRefDistance(fullConfig.refDistance);
        audio.setMaxDistance(fullConfig.maxDistance);
        audio.setRolloffFactor(fullConfig.rolloffFactor);
        audio.setDistanceModel(fullConfig.distanceModel);
        audio.setDirectionalCone(
            fullConfig.coneInnerAngle,
            fullConfig.coneOuterAngle,
            fullConfig.coneOuterGain
        );

        this.sources.set(id, audio);
        this.configs.set(id, fullConfig);
        return audio;
    }

    /**
     * Gets a spatial audio source by ID.
     *
     * @param id - Source identifier
     * @returns The PositionalAudio instance or undefined
     */
    getSource(id: string): THREE.PositionalAudio | undefined {
        return this.sources.get(id);
    }

    /**
     * Plays a spatial audio source.
     *
     * @param id - Source identifier
     * @param loop - Whether to loop the audio
     *
     * @example
     * ```typescript
     * spatial.play('engine', true);
     * ```
     */
    play(id: string, loop = false): void {
        const audio = this.sources.get(id);
        if (audio && !audio.isPlaying) {
            audio.setLoop(loop);
            audio.play();
        }
    }

    /**
     * Stops a spatial audio source.
     *
     * @param id - Source identifier
     */
    stop(id: string): void {
        const audio = this.sources.get(id);
        if (audio?.isPlaying) {
            audio.stop();
        }
    }

    /**
     * Pauses a spatial audio source.
     *
     * @param id - Source identifier
     */
    pause(id: string): void {
        const audio = this.sources.get(id);
        if (audio?.isPlaying) {
            audio.pause();
        }
    }

    /**
     * Sets the volume of a spatial audio source.
     *
     * @param id - Source identifier
     * @param volume - Volume level (0.0 to 1.0)
     */
    setVolume(id: string, volume: number): void {
        const audio = this.sources.get(id);
        if (audio) {
            audio.setVolume(Math.max(0, Math.min(1, volume)));
        }
    }

    /**
     * Updates the position of a spatial audio source.
     *
     * @param id - Source identifier
     * @param x - X position
     * @param y - Y position
     * @param z - Z position
     *
     * @example
     * ```typescript
     * spatial.setPosition('enemy', 10, 0, 5);
     * ```
     */
    setPosition(id: string, x: number, y: number, z: number): void {
        const audio = this.sources.get(id);
        if (audio) {
            audio.position.set(x, y, z);
        }
    }

    /**
     * Updates the position of a spatial audio source using a Vector3.
     *
     * @param id - Source identifier
     * @param position - Position vector
     */
    setPositionFromVector(id: string, position: THREE.Vector3): void {
        const audio = this.sources.get(id);
        if (audio) {
            audio.position.copy(position);
        }
    }

    /**
     * Gets the current listener state (position and orientation).
     *
     * @returns The listener's current state
     */
    getListenerState(): AudioListenerState {
        const position = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const up = new THREE.Vector3();

        this.listener.getWorldPosition(position);
        this.listener.getWorldDirection(forward);
        up.set(0, 1, 0).applyQuaternion(this.listener.quaternion);

        return { position, forward, up };
    }

    /**
     * Checks if a spatial audio source is playing.
     *
     * @param id - Source identifier
     * @returns True if playing
     */
    isPlaying(id: string): boolean {
        return this.sources.get(id)?.isPlaying ?? false;
    }

    /**
     * Removes a spatial audio source.
     *
     * @param id - Source identifier
     */
    remove(id: string): void {
        const audio = this.sources.get(id);
        if (audio) {
            if (audio.isPlaying) audio.stop();
            audio.disconnect();
            this.sources.delete(id);
            this.configs.delete(id);
        }
    }

    /**
     * Stops all spatial audio sources.
     */
    stopAll(): void {
        for (const audio of this.sources.values()) {
            if (audio.isPlaying) audio.stop();
        }
    }

    /**
     * Disposes all resources and cleans up.
     */
    dispose(): void {
        this.stopAll();
        for (const audio of this.sources.values()) {
            audio.disconnect();
        }
        this.sources.clear();
        this.buffers.clear();
        this.configs.clear();
    }
}

/**
 * Factory function to create a SpatialAudio instance.
 *
 * @param listener - Three.js AudioListener attached to the camera
 * @returns A new SpatialAudio instance
 *
 * @example
 * ```typescript
 * const listener = new THREE.AudioListener();
 * camera.add(listener);
 *
 * const spatialAudio = createSpatialAudio(listener);
 * await spatialAudio.load('ambient', '/audio/forest.mp3');
 * spatialAudio.play('ambient', true);
 * ```
 */
export function createSpatialAudio(listener: THREE.AudioListener): SpatialAudio {
    return new SpatialAudio(listener);
}
