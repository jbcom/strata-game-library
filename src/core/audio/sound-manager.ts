/**
 * Sound Manager - 2D Audio with Howler.js
 *
 * Wraps Howler.js for non-spatial audio playback with bus management.
 *
 * @module core/audio
 * @public
 */

import { Howl, Howler } from 'howler';
import type { AudioConfig, SoundConfig, AudioBus, AudioMixer } from './types';

/**
 * Default audio configuration.
 */
const DEFAULT_CONFIG: Required<AudioConfig> = {
    masterVolume: 1,
    muted: false,
    preloadSounds: [],
    autoUnlock: true,
    html5PoolSize: 5,
};

/**
 * Manages 2D audio playback using Howler.js.
 *
 * @example
 * ```typescript
 * const manager = createSoundManager({ masterVolume: 0.8 });
 *
 * await manager.load('explosion', { src: '/audio/explosion.mp3' });
 * manager.play('explosion');
 *
 * manager.setBusVolume('sfx', 0.5);
 * manager.dispose();
 * ```
 */
export class SoundManager {
    private sounds: Map<string, Howl> = new Map();
    private soundConfigs: Map<string, SoundConfig> = new Map();
    private mixer: AudioMixer;
    private config: Required<AudioConfig>;

    constructor(config: AudioConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        this.mixer = {
            buses: {
                master: { id: 'master', volume: 1, muted: false, sounds: [] },
                music: { id: 'music', volume: 1, muted: false, sounds: [] },
                sfx: { id: 'sfx', volume: 1, muted: false, sounds: [] },
                ambient: { id: 'ambient', volume: 1, muted: false, sounds: [] },
                voice: { id: 'voice', volume: 1, muted: false, sounds: [] },
            },
            masterVolume: this.config.masterVolume,
        };

        Howler.volume(this.config.masterVolume);
        if (this.config.muted) {
            Howler.mute(true);
        }
    }

    /**
     * Loads a sound into the manager.
     *
     * @param id - Unique identifier for the sound
     * @param soundConfig - Sound configuration
     * @param bus - Audio bus to assign the sound to
     * @returns Promise that resolves when loaded
     *
     * @example
     * ```typescript
     * await manager.load('bgm', {
     *   src: ['/audio/music.mp3', '/audio/music.ogg'],
     *   loop: true,
     *   volume: 0.7,
     * }, 'music');
     * ```
     */
    async load(id: string, soundConfig: SoundConfig, bus = 'sfx'): Promise<void> {
        return new Promise((resolve, reject) => {
            const howl = new Howl({
                src: Array.isArray(soundConfig.src) ? soundConfig.src : [soundConfig.src],
                volume: soundConfig.volume ?? 1,
                loop: soundConfig.loop ?? false,
                rate: soundConfig.rate ?? 1,
                sprite: soundConfig.sprite,
                preload: soundConfig.preload ?? true,
                autoplay: soundConfig.autoplay ?? false,
                mute: soundConfig.mute ?? false,
                html5: soundConfig.html5 ?? false,
                pool: soundConfig.pool ?? this.config.html5PoolSize,
                format: soundConfig.format,
                onload: () => {
                    // Only register sound after successful load to prevent inconsistent state
                    this.sounds.set(id, howl);
                    this.soundConfigs.set(id, soundConfig);
                    this.addToBus(id, bus);
                    resolve();
                },
                onloaderror: (_id, error) =>
                    reject(new Error(`Failed to load sound ${id}: ${error}`)),
            });
        });
    }

    /**
     * Plays a loaded sound.
     *
     * @param id - Sound identifier
     * @param sprite - Optional sprite name to play
     * @returns The Howl sound ID or undefined if not found
     *
     * @example
     * ```typescript
     * manager.play('explosion');
     * manager.play('footsteps', 'step1');
     * ```
     */
    play(id: string, sprite?: string): number | undefined {
        const howl = this.sounds.get(id);
        if (!howl) {
            console.warn(`Sound "${id}" not found`);
            return undefined;
        }
        return howl.play(sprite);
    }

    /**
     * Stops a sound.
     *
     * @param id - Sound identifier
     * @param soundId - Optional specific sound instance ID
     *
     * @example
     * ```typescript
     * manager.stop('bgm');
     * ```
     */
    stop(id: string, soundId?: number): void {
        const howl = this.sounds.get(id);
        if (howl) {
            howl.stop(soundId);
        }
    }

    /**
     * Pauses a sound.
     *
     * @param id - Sound identifier
     * @param soundId - Optional specific sound instance ID
     */
    pause(id: string, soundId?: number): void {
        const howl = this.sounds.get(id);
        if (howl) {
            howl.pause(soundId);
        }
    }

    /**
     * Sets volume for a specific sound.
     *
     * @param id - Sound identifier
     * @param volume - Volume level (0.0 to 1.0)
     * @param soundId - Optional specific sound instance ID
     *
     * @example
     * ```typescript
     * manager.setVolume('bgm', 0.5);
     * ```
     */
    setVolume(id: string, volume: number, soundId?: number): void {
        const howl = this.sounds.get(id);
        if (howl) {
            const clampedVolume = Math.max(0, Math.min(1, volume));
            if (soundId !== undefined) {
                howl.volume(clampedVolume, soundId);
            } else {
                howl.volume(clampedVolume);
            }
        }
    }

    /**
     * Gets the volume of a sound.
     *
     * @param id - Sound identifier
     * @returns Volume level or undefined if not found
     */
    getVolume(id: string): number | undefined {
        const howl = this.sounds.get(id);
        return howl?.volume();
    }

    /**
     * Mutes or unmutes a sound.
     *
     * @param id - Sound identifier
     * @param muted - Whether to mute
     */
    setMute(id: string, muted: boolean): void {
        const howl = this.sounds.get(id);
        if (howl) {
            howl.mute(muted);
        }
    }

    /**
     * Creates a new audio bus.
     *
     * @param busId - Unique bus identifier
     * @param volume - Initial volume (0.0 to 1.0)
     *
     * @example
     * ```typescript
     * manager.createBus('ui', 0.8);
     * ```
     */
    createBus(busId: string, volume = 1): void {
        if (!this.mixer.buses[busId]) {
            this.mixer.buses[busId] = {
                id: busId,
                volume: Math.max(0, Math.min(1, volume)),
                muted: false,
                sounds: [],
            };
        }
    }

    /**
     * Sets volume for an audio bus, affecting all sounds in the bus.
     *
     * @param busId - Bus identifier
     * @param volume - Volume level (0.0 to 1.0)
     *
     * @example
     * ```typescript
     * manager.setBusVolume('music', 0.3);
     * ```
     */
    setBusVolume(busId: string, volume: number): void {
        const bus = this.mixer.buses[busId];
        if (!bus) return;

        bus.volume = Math.max(0, Math.min(1, volume));
        this.updateBusSounds(bus);
    }

    /**
     * Gets the volume of an audio bus.
     *
     * @param busId - Bus identifier
     * @returns Volume level or undefined if bus not found
     */
    getBusVolume(busId: string): number | undefined {
        return this.mixer.buses[busId]?.volume;
    }

    /**
     * Mutes or unmutes an audio bus.
     *
     * @param busId - Bus identifier
     * @param muted - Whether to mute
     */
    setBusMute(busId: string, muted: boolean): void {
        const bus = this.mixer.buses[busId];
        if (!bus) return;

        bus.muted = muted;
        for (const soundId of bus.sounds) {
            const howl = this.sounds.get(soundId);
            if (howl) {
                howl.mute(muted);
            }
        }
    }

    /**
     * Sets the master volume for all audio.
     *
     * @param volume - Volume level (0.0 to 1.0)
     */
    setMasterVolume(volume: number): void {
        this.mixer.masterVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(this.mixer.masterVolume);
    }

    /**
     * Gets the master volume.
     *
     * @returns Master volume level
     */
    getMasterVolume(): number {
        return this.mixer.masterVolume;
    }

    /**
     * Mutes or unmutes all audio globally.
     *
     * @param muted - Whether to mute
     */
    setGlobalMute(muted: boolean): void {
        Howler.mute(muted);
    }

    /**
     * Checks if a sound is currently playing.
     *
     * @param id - Sound identifier
     * @returns True if playing
     */
    isPlaying(id: string): boolean {
        const howl = this.sounds.get(id);
        return howl?.playing() ?? false;
    }

    /**
     * Unloads a sound from memory.
     *
     * @param id - Sound identifier
     */
    unload(id: string): void {
        const howl = this.sounds.get(id);
        if (howl) {
            howl.unload();
            this.sounds.delete(id);
            this.soundConfigs.delete(id);
            this.removeFromAllBuses(id);
        }
    }

    /**
     * Stops all sounds.
     */
    stopAll(): void {
        Howler.stop();
    }

    /**
     * Disposes the sound manager and releases all resources.
     */
    dispose(): void {
        for (const howl of this.sounds.values()) {
            howl.unload();
        }
        this.sounds.clear();
        this.soundConfigs.clear();
        Howler.unload();
    }

    private addToBus(soundId: string, busId: string): void {
        const bus = this.mixer.buses[busId];
        if (bus && !bus.sounds.includes(soundId)) {
            bus.sounds.push(soundId);
        }
    }

    private removeFromAllBuses(soundId: string): void {
        for (const bus of Object.values(this.mixer.buses)) {
            const index = bus.sounds.indexOf(soundId);
            if (index !== -1) {
                bus.sounds.splice(index, 1);
            }
        }
    }

    private updateBusSounds(bus: AudioBus): void {
        for (const soundId of bus.sounds) {
            const howl = this.sounds.get(soundId);
            const config = this.soundConfigs.get(soundId);
            if (howl && config) {
                const baseVolume = config.volume ?? 1;
                howl.volume(baseVolume * bus.volume);
            }
        }
    }
}

/**
 * Factory function to create a SoundManager instance.
 *
 * @param config - Audio configuration options
 * @returns A new SoundManager instance
 *
 * @example
 * ```typescript
 * const soundManager = createSoundManager({
 *   masterVolume: 0.8,
 *   muted: false,
 * });
 *
 * await soundManager.load('jump', { src: '/audio/jump.mp3' });
 * soundManager.play('jump');
 * ```
 */
export function createSoundManager(config?: AudioConfig): SoundManager {
    return new SoundManager(config);
}
